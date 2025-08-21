# chemistry.software website

## For editing the website (No Go, Docker or Coolify knowledge needed)

All the web pages, styles, and JavaScript live in the `static/` folder:

- `static/index.html` – the website page to edit
- `static/styles.css` – the visual styling (colors, layout, fonts)
- `static/script.js` – small behaviors like dark mode and the contact form

You can just edit this and view index.html as you usually would. Contact form just does not submit unless you have the server running.
When the site is deployed, the server will automatically serve everything from `/static` and handle the contact form submission.


## For deployment 

- Backend is a small Go server (`main.go`) that serves:
  - `GET /` → serves `static/index.html`
  - `GET /static/*` → serves files from `static/`
  - `POST /api/contact` → sends messages to Telegram
- Env variables:
  - `PORT` (default `8080`)
  - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (optional locally)
- Dockerfile supports Coolify deployment (multi-stage build)


## Running the server locally

If you for some reason do need to run the server (Go required but not Docker), you can simply do:

```
go run .
```
or to run with the environment vars for the Telegram bot to work:
```
TELEGRAM_BOT_TOKEN=7890948543:AAHJoSZZU4l-jrWmqLcVCh0R74R9U_bn5ZE \
TELEGRAM_CHAT_ID=126131628 \
go run .
```

Or if you want to run the entire Docker image (Docker required but not Go):
```docker build -t chemistrysoftware-site .
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e TELEGRAM_BOT_TOKEN=7890948543:AAHJoSZZU4l-jrWmqLcVCh0R74R9U_bn5ZE \
  -e TELEGRAM_CHAT_ID=126131628 \
  chemistrysoftware-site```