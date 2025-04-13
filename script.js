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
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Thank you for your message! I\'ll get back to you soon.');
    
    // Reset form
    contactForm.reset();
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