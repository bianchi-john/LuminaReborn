import { api } from './lib/api.js';

const form = document.getElementById('login-form');
const errore = document.getElementById('login-errore');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errore.classList.add('d-none');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await api('POST', '/api/auth/login', {
      username: form.username.value.trim(),
      password: form.password.value,
    });
    window.location.href = form.dataset.next || '/area';
  } catch (error) {
    errore.textContent = error.message;
    errore.classList.remove('d-none');
    form.password.value = '';
    form.password.focus();
    button.disabled = false;
  }
});
