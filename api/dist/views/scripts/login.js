document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          showError("The data entered does not match any user within the site");
        } else {
          showError("An error occurred. Please try again later.");
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      showError("An error occurred. Please try again later.");
    }
  });

  function showError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.innerHTML = message;
  }
});
