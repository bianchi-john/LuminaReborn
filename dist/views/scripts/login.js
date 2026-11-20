document.addEventListener('DOMContentLoaded', function () {
  $("#errorMessage").hide();

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
      } else if (response.status === 401 || response.status === 403) {
        showError("Nome utente o password errati. Controllate maiuscole e minuscole e riprovate.");
      } else {
        showError("Il servizio di accesso non risponde. Riprovate tra qualche minuto.");
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      showError("Il sito non risponde. Controllate la connessione e riprovate.");
    }
  });

  function showError(message) {
    $("#errorMessage").show();
    $("#errorMessage").html(message);
  }


});
