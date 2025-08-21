package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type Config struct {
	Port             string
	TelegramBotToken string
	TelegramChatID   string
}

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

var (
	mu                 sync.Mutex
	lastSubmissionTime = make(map[string]time.Time)
	submissionCooldown = 2 * time.Minute
)

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if idx := strings.Index(xff, ","); idx != -1 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	if idx := strings.LastIndex(r.RemoteAddr, ":"); idx != -1 {
		return r.RemoteAddr[:idx]
	}
	return r.RemoteAddr
}

func escapeMarkdown(text string) string {
	if text == "" {
		return "N/A"
	}
	replacer := strings.NewReplacer(
		"*", "\\*",
		"_", "\\_",
		"`", "\\`",
		"[", "\\[",
		"]", "\\]",
		"(", "\\(",
		")", "\\)",
		"~", "\\~",
		">", "\\>",
		"#", "\\#",
		"+", "\\+",
		"-", "\\-",
		"=", "\\=",
		"|", "\\|",
		"{", "\\{",
		"}", "\\}",
		".", "\\.",
		"!", "\\!",
	)
	return replacer.Replace(text)
}

func sendToTelegram(cfg Config, payload contactRequest) error {
	if cfg.TelegramBotToken == "" || cfg.TelegramChatID == "" {
		return nil
	}
	message := fmt.Sprintf(
		"📨 New contact request\n\n"+
			"👤 *Name:* %s\n"+
			"📧 *Email:* %s\n"+
			"📝 *Subject:* %s\n\n"+
			"💬 *Message:*\n%s",
		escapeMarkdown(payload.Name),
		escapeMarkdown(payload.Email),
		escapeMarkdown(payload.Subject),
		escapeMarkdown(payload.Message),
	)

	telegramURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", cfg.TelegramBotToken)
	body := map[string]any{
		"chat_id":    cfg.TelegramChatID,
		"text":       message,
		"parse_mode": "Markdown",
	}
	data, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("marshal telegram body: %w", err)
	}
	resp, err := http.Post(telegramURL, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("telegram post failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram api error: status=%d body=%s", resp.StatusCode, string(b))
	}
	return nil
}

func contactHandler(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ip := getClientIP(r)
		mu.Lock()
		if last, ok := lastSubmissionTime[ip]; ok {
			if time.Since(last) < submissionCooldown {
				mu.Unlock()
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_ = json.NewEncoder(w).Encode(map[string]any{
					"ok":      false,
					"message": "Please wait a few minutes before sending another message.",
				})
				return
			}
		}
		mu.Unlock()

		var req contactRequest
		ct := r.Header.Get("Content-Type")
		if strings.HasPrefix(ct, "application/json") {
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
		} else {
			if err := r.ParseForm(); err != nil {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			req = contactRequest{
				Name:    strings.TrimSpace(r.FormValue("name")),
				Email:   strings.TrimSpace(r.FormValue("email")),
				Subject: strings.TrimSpace(r.FormValue("subject")),
				Message: strings.TrimSpace(r.FormValue("message")),
			}
		}

		if req.Name == "" || req.Email == "" || req.Subject == "" || req.Message == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"ok":      false,
				"message": "Missing required fields.",
			})
			return
		}

		if err := sendToTelegram(cfg, req); err != nil {
			log.Printf("telegram send failed: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			_ = json.NewEncoder(w).Encode(map[string]any{
				"ok":      false,
				"message": "Failed to send message. Please try again later.",
			})
			return
		}

		mu.Lock()
		lastSubmissionTime[ip] = time.Now()
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      true,
			"message": "Thank you for your message!",
		})
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"healthy","service":"chemistrysoftware"}`))
}

func main() {
	cfg := Config{
		Port:             ":" + getEnv("PORT", "8080"),
		TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
		TelegramChatID:   getEnv("TELEGRAM_CHAT_ID", ""),
	}

	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/contact", contactHandler(cfg))
	mux.HandleFunc("/health", healthHandler)

	// Static assets
	staticFS := http.FileServer(http.Dir("static"))
	mux.Handle("/static/", http.StripPrefix("/static/", staticFS))

	// Root page
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			http.ServeFile(w, r, "static/index.html")
			return
		}
		http.NotFound(w, r)
	})

	log.Printf("Server starting on %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Port, mux))
}
