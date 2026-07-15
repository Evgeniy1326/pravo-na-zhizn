const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const note = document.getElementById('form-note');
  note.hidden = false;
  e.target.reset();
  setTimeout(() => {
    note.hidden = true;
  }, 5000);
});

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(26, 92, 58, 0.1)'
    : 'none';
});
