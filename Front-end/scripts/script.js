function callAPI(apiUrl, divId, callback) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            callback(data, divId);
        })
        .catch(error => {
            console.error('Si è verificato un errore durante la richiesta:', error);
        });
}

function popolaContenutoDiv(data, divId) {
    const divElement = document.getElementById(divId);
    divElement.innerHTML = data;
}

document.addEventListener('DOMContentLoaded', function() {
    callAPI('http://0.0.0.0:3000/cronologie/1', 'cronologia', popolaContenutoDiv);
    callAPI('http://0.0.0.0:3000/ubicazioni/1', 'ubicazione', popolaContenutoDiv);
});
