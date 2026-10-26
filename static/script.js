// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    document.body.classList.toggle('mobile-menu-open');
  });

  // Close mobile menu when clicking on a link
  const mobileNavLinks = mobileNav.querySelectorAll('.nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
    });
  });
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or use system preference
const getThemePreference = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply the theme
const setTheme = (theme) => {
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
};

// Initialize theme
setTheme(getThemePreference());

// Toggle theme when button is clicked
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const capWidget = document.getElementById('cap-widget');
  let capToken = '';

  if (capWidget) {
    capWidget.addEventListener('solve', (e) => {
      capToken = e.detail.token;
    });
    capWidget.addEventListener('reset', () => {
      capToken = '';
    });
    capWidget.addEventListener('error', (e) => {
      console.error('Human verification error:', e.detail && e.detail.message);
    });
  }

  const resetCapWidget = () => {
    capToken = '';
    if (capWidget && typeof capWidget.reset === 'function') {
      capWidget.reset();
    }
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Fall back to the hidden field the widget injects into the form
    const hiddenTokenInput = contactForm.querySelector('input[name="cap-token"]');
    const token = capToken || (hiddenTokenInput ? hiddenTokenInput.value : '');
    if (!token) {
      alert('Please complete the human verification before sending your message.');
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
      capToken: token
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({ ok: false, message: 'Unexpected response' }));
      if (!res.ok || data.ok === false) {
        alert(data.message || 'Failed to send message. Please try again later.');
        resetCapWidget();
      } else {
        alert('Thank you for your message! I\'ll get back to you soon.');
        contactForm.reset();
        resetCapWidget();
      }
    } catch (err) {
      alert('Network error. Please try again later.');
      resetCapWidget();
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

// Add animation to chemistry elements
document.addEventListener('DOMContentLoaded', () => {
  // Add subtle animations to some hexagons and circles
  const animateElements = () => {
    const elements = document.querySelectorAll('.hexagon, .circle');
    elements.forEach((el, index) => {
      // Add random subtle movements
      if (index % 3 === 0) { // Only animate every third element
        el.style.animation = `pulse ${10 + index}s infinite`;
      }
    });
  };
  
  animateElements();
});

// Portfolio item hover effects
const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach(item => {
  const overlay = item.querySelector('.portfolio-overlay');
  const image = item.querySelector('.portfolio-image');
  
  item.addEventListener('mouseenter', () => {
    overlay.style.opacity = '1';
    image.style.transform = 'scale(1.05)';
  });
  
  item.addEventListener('mouseleave', () => {
    overlay.style.opacity = '0';
    image.style.transform = 'scale(1)';
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});