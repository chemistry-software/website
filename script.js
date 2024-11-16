const toggle = document.getElementById('toggle');

toggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});

document.querySelector('.hamburger').addEventListener('click', function () {
    document.querySelector('.navbar').classList.toggle('active');
  });
  