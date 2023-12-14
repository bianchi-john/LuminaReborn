async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessageDiv = document.getElementById('errorMessage');
  errorMessageDiv.style.display = 'none';

  const data = {
      username: username,
      password: password
  };

  try {
    const response = await fetch('http://172.22.0.2/proxy/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const result = await response.json();
        // Salva il token JWT in un cookie
        document.cookie = `jwt=${result.jwt}; path=/`;
        
        // Salva il nome utente in un cookie
        document.cookie = `username=${username}; path=/`;

        window.location.href = 'index.html';

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
}

function showError(message) {
  const errorMessageDiv = document.getElementById('errorMessage');
  errorMessageDiv.innerText = message;
  errorMessageDiv.style.display = 'block';
}
