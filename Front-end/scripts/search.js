function toggleAdvancedSearch() {
  var advancedSearchFields = document.getElementById("advancedSearchFields");
  var generalSearchBar = document.getElementById("generalSearch");
  var toggleButton = document.getElementById('toggleSearchFunctions');

  if (advancedSearchFields.style.display === "none") {
    toggleButton.innerText = 'Hide advanced search functions';
    advancedSearchFields.style.display = "block";
    generalSearchBar.style.display = "none";
    toggleButton.style.backgroundColor = "#2e1273";
    toggleButton.style.borderColor = "#2e1273";



  } else {

    toggleButton.innerText = 'Show advanced search functions';
    advancedSearchFields.style.display = "none";
    generalSearchBar.style.display = "block";
    toggleButton.style.backgroundColor = "#007bff";
    toggleButton.style.borderColor = "#007bff";

  }
}

function handleSearch() {

  if (advancedSearchFields.style.display === "none") {
    console.log('ricerca generica')
  }
  else {
    console.log('ricerca avanzata')

    // Ottieni i valori inseriti nei campi di ricerca
    var title = document.getElementById('titleSearchBar').value;
    var author = document.getElementById('authorSearchBar').value;
    var date = document.getElementById('dateSearchBar').value;
    var location = document.getElementById('locationSearchBar').value;
    var inventory = document.getElementById('inventorySearchBar').value;
    var legal = document.getElementById('legalSearchBar').value;
    var classification = document.getElementById('classificationSearchBar').value;
    var material = document.getElementById('materialSearchBar').value;
    var technique = document.getElementById('techniqueSearchBar').value;
    var size = document.getElementById('sizeSearchBar').value;
    var origin = document.getElementById('originSearchBar').value;
    var inscription = document.getElementById('inscriptionSearchBar').value;
    var exhibitionHistory = document.getElementById('exhibitionHistorySearchBar').value;
    var corpoScheda = document.getElementById('corpo_schedaSearchBar').value;
    var mostre = document.getElementById('mostreSearchBar').value;
    var descrizioneSintetica = document.getElementById('descrizione_sinteticaSearchBar').value;
    var bibliografie = document.getElementById('bibliografieSearchBar').value;
    var altreBibliografie = document.getElementById('altreBibliografieSearchBar').value;
    var documentazioneFotografica = document.getElementById('documentazioneFotograficaSearchBar').value;

    // Crea l'URL per la chiamata GET
    var url = 'http://0.0.0.0:3000/search/?';
    var queries = [];

    if (title.trim() !== '') {
      queries.push('title=' + encodeURIComponent(title));
    }
    if (author.trim() !== '') {
      queries.push('author=' + encodeURIComponent(author));
    }
    if (date.trim() !== '') {
      queries.push('date=' + encodeURIComponent(date));
    }
    if (location.trim() !== '') {
      queries.push('location=' + encodeURIComponent(location));
    }
    if (inventory.trim() !== '') {
      queries.push('inventory=' + encodeURIComponent(inventory));
    }
    if (legal.trim() !== '') {
      queries.push('legal=' + encodeURIComponent(legal));
    }
    if (classification.trim() !== '') {
      queries.push('classification=' + encodeURIComponent(classification));
    }
    if (material.trim() !== '') {
      queries.push('material=' + encodeURIComponent(material));
    }
    if (technique.trim() !== '') {
      queries.push('technique=' + encodeURIComponent(technique));
    }
    if (size.trim() !== '') {
      queries.push('size=' + encodeURIComponent(size));
    }
    if (origin.trim() !== '') {
      queries.push('origin=' + encodeURIComponent(origin));
    }
    if (inscription.trim() !== '') {
      queries.push('inscription=' + encodeURIComponent(inscription));
    }
    if (exhibitionHistory.trim() !== '') {
      queries.push('exhibitionHistory=' + encodeURIComponent(exhibitionHistory));
    }
    if (corpoScheda.trim() !== '') {
      queries.push('corpoScheda=' + encodeURIComponent(corpoScheda));
    }
    if (mostre.trim() !== '') {
      queries.push('mostre=' + encodeURIComponent(mostre));
    }
    if (descrizioneSintetica.trim() !== '') {
      queries.push('descrizioneSintetica=' + encodeURIComponent(descrizioneSintetica));
    }
    if (bibliografie.trim() !== '') {
      queries.push('bibliografie=' + encodeURIComponent(bibliografie));
    }
    if (altreBibliografie.trim() !== '') {
      queries.push('altreBibliografie=' + encodeURIComponent(altreBibliografie));
    }
    if (documentazioneFotografica.trim() !== '') {
      queries.push('documentazioneFotografica=' + encodeURIComponent(documentazioneFotografica));
    }

    url += queries.join('&');

    // Controlla se non ci sono query da inviare
    if (queries.length === 0) {
      console.log('Nessuna query inserita.');
      return;
    }

    // Effettua la chiamata GET
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function () {
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

}


$(document).ready(function () {
  var toggleSearchFunctions = document.getElementById("toggleSearchFunctions");
  toggleSearchFunctions.addEventListener("click", toggleAdvancedSearch);
  var searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', handleSearch);

});



