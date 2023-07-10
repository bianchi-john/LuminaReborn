function toggleAdvancedSearch() {
    var advancedSearchFields = document.getElementById("advancedSearchFields");
    var generalSearchBar = document.getElementById("generalSearch");
    var advancedSearchButton = document.getElementById("advancedSearchButton");

    if (advancedSearchFields.style.display === "none") {
        advancedSearchFields.style.display = "block";
        generalSearchBar.style.display = "none";
        advancedSearchButton.innerText = "General Search";
        advancedSearchButton.style.backgroundColor = "#2e1273"; 
        advancedSearchButton.style.borderColor = "#2e1273"; 


    } else {
        advancedSearchFields.style.display = "none";
        generalSearchBar.style.display = "block";
        advancedSearchButton.innerText = "Advanced Search";
        advancedSearchButton.style.backgroundColor = "#007bff"; 
        advancedSearchButton.style.borderColor = "#007bff"; 
    }
}
function handleSearch() {
    // Ottieni il valore inserito nell'input di ricerca
    var query = document.getElementById('generalSearchBar').value;
    
    // Controlla se la stringa di ricerca è vuota
    if (query.trim() === '') {
      // La stringa di ricerca è vuota, non effettuare la chiamata GET
      console.log('La stringa di ricerca è vuota.');
      return;
    }
    
    // Crea l'URL per la chiamata GET
    var url = 'http://0.0.0.0:3000/search/?queryString=' + encodeURIComponent(query);
    
    // Effettua la chiamata GET
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        // La chiamata ha avuto successo, visualizza il risultato nella pagina
        var response = xhr.responseText;
        // Fai qualcosa con la risposta, ad esempio:
        document.getElementById('result').innerHTML = response;
      } else {
        // La chiamata non è riuscita, gestisci l'errore di conseguenza
        console.error('Errore nella chiamata GET: ' + xhr.status);
      }
    };
    
    xhr.send();
  }

$(document).ready(function () {
    var button = document.getElementById("advancedSearchButton");
    button.addEventListener("click", toggleAdvancedSearch);
    var generalSearchButton = document.getElementById('generalSearchButton');
    generalSearchButton.addEventListener('click', handleSearch);
});



