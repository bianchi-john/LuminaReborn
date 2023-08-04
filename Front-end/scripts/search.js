
// Funzione per ottenere il valore selezionato per il primo form di date
function getAmbitoStoricoDa() {
  // Ottieni i riferimenti agli elementi dei radio button
  const radioAvantiDa = document.getElementById('avanti_da');
  const radioDopoDa = document.getElementById('dopo_da');
  const radioAvantiA = document.getElementById('avanti_a');
  const radioDopoA = document.getElementById('dopo_a');

  if (radioAvantiDa.checked) {
    return radioAvantiDa.value;
  } else if (radioDopoDa.checked) {
    return radioDopoDa.value;
  }
}

// Funzione per ottenere il valore selezionato per il secondo form di date
function getAmbitoStoricoA() {
  // Ottieni i riferimenti agli elementi dei radio button
  const radioAvantiDa = document.getElementById('avanti_da');
  const radioDopoDa = document.getElementById('dopo_da');
  const radioAvantiA = document.getElementById('avanti_a');
  const radioDopoA = document.getElementById('dopo_a');

  if (radioAvantiA.checked) {
    return radioAvantiA.value;
  } else if (radioDopoA.checked) {
    return radioDopoA.value;
  }
}



function scrollToResults() {
  // Ottenere l'elemento della sezione dei risultati per cui scrollare
  var resultsSection = document.getElementById("result");

  // Eseguire lo scroll alla sezione dei risultati
  resultsSection.scrollIntoView({ behavior: "smooth" });
}

// Funzione per creare la card di Bootstrap
function createCard(data) {
  var cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  var cardBodyDiv = document.createElement("div");
  cardBodyDiv.classList.add("card-body");

  var titleElement = document.createElement("h5");
  titleElement.classList.add("card-title", "mb-2", "text-muted");
  titleElement.textContent = data.titolo_opera;

  var corpoSchedaElement = document.createElement("p");
  corpoSchedaElement.classList.add("card-text");
  corpoSchedaElement.textContent = data.corpo_scheda;

  var iscrizioniElement = document.createElement("p");
  iscrizioniElement.classList.add("card-text");
  iscrizioniElement.textContent = data.iscrizioni;

  var descrizioneSinteticaElement = document.createElement("p");
  descrizioneSinteticaElement.classList.add("card-text");
  descrizioneSinteticaElement.textContent = data.descrizione_sintetica;

  var storiaEspositivaElement = document.createElement("p");
  storiaEspositivaElement.classList.add("card-text");
  storiaEspositivaElement.textContent = data.storia_espositiva;

  var classificazioneElement = document.createElement("p");
  classificazioneElement.classList.add("card-text");
  classificazioneElement.textContent = data.classificazione;

  // cardBodyDiv.appendChild(titleElement);
  cardBodyDiv.appendChild(titleElement);
  cardBodyDiv.appendChild(corpoSchedaElement);
  cardBodyDiv.appendChild(iscrizioniElement);
  cardBodyDiv.appendChild(descrizioneSinteticaElement);
  cardBodyDiv.appendChild(storiaEspositivaElement);
  cardBodyDiv.appendChild(classificazioneElement);

  // Crea il link intorno alla card e imposta l'URL desiderato con il parametro "id"
  var cardLink = document.createElement("a");
  cardLink.href = "scheda.html?id=" + data.id;
  cardLink.appendChild(cardBodyDiv);

  cardDiv.appendChild(cardLink);

  return cardDiv;
}


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
  // Esempio di come puoi utilizzare le funzioni per ottenere i valori selezionati
  const ambitoStoricoDaValue = getAmbitoStoricoDa();
  const ambitoStoricoAValue = getAmbitoStoricoA();



  // Svuoto il contenuto del div dei risultati
  document.getElementById('result').innerHTML = '';

  if (advancedSearchFields.style.display === "none") {
    console.log('ricerca generica')
  }
  else {
    console.log('ricerca avanzata')

    // Ottieni i valori inseriti nei campi di ricerca
    const titoloOpera = document.getElementById('titolo_opera').value;
    const corpoScheda = document.getElementById('corpo_scheda').value;
    const iscrizioni = document.getElementById('iscrizioni').value;
    const descrizioneSintetica = document.getElementById('descrizione_sintetica').value;
    const storiaEspositiva = document.getElementById('storia_espositiva').value;
    const classificazione = document.getElementById('classificazione').value;
    const formulaPrecedente = document.getElementById('formula_precedente').value;
    const formulaSuccessiva = document.getElementById('formula_successiva').value;
    const categoria = document.getElementById('categoria').value;
    const nomeAutore = document.getElementById('nome').value;
    const ambitoStorico = document.getElementById('ambito_storico').value;
    const dataDadataA = (document.getElementById('data_da').value).toString() + ' ' + (document.getElementById('data_a').value).toString()  + ' ' + ambitoStoricoDaValue  + ' ' + ambitoStoricoAValue;
    const nomeMateriale = document.getElementById('nome_materiale').value;
    const descrizioneMateriale = document.getElementById('descrizione_materiale').value;
    const nomeTecnica = document.getElementById('nome_tecnica').value;
    const descrizioneTecnica = document.getElementById('descrizione_tecnica').value;
    const ubicazione = document.getElementById('ubicazione').value;
    const descrizioneUbicazione = document.getElementById('descrizione_ubicazione').value;
    const nomeInventario = document.getElementById('nome_inventario').value;
    const nomeProvenienza = document.getElementById('nome_provenienza').value;
    const descrizioneProvenienza = document.getElementById('descrizione_provenienza').value;
    const curatore = document.getElementById('curatore').value;
    const titoloMostra = document.getElementById('titolo_mostra').value;
    const dataInizioMostradataFineMostra = document.getElementById('data_inizio_mostra').value + ' ' + document.getElementById('data_fine_mostra').value;
    const luogoMostra = document.getElementById('luogo_mostra').value;
    const descrizioneMostra = document.getElementById('descrizione_mostra').value;
    const riferimentoBibliografico = document.getElementById('riferimento_bibliografico').value;
    const altroRiferimentoBibliografico = document.getElementById('altro_riferimento_bibliografico').value;
    const documentazioniFotografiche = document.getElementById('documentazioniFotografiche').value;


    // Crea l'URL per la chiamata GET
    var url = 'http://10.180.53.210:5000/search/?';
    var queries = [];

    queries.push('titoloOpera=' + encodeURIComponent(titoloOpera));
    queries.push('corpoScheda=' + encodeURIComponent(corpoScheda));
    queries.push('iscrizioni=' + encodeURIComponent(iscrizioni));
    queries.push('descrizioneSintetica=' + encodeURIComponent(descrizioneSintetica));
    queries.push('storiaEspositiva=' + encodeURIComponent(storiaEspositiva));
    queries.push('classificazione=' + encodeURIComponent(classificazione));
    queries.push('formulaPrecedente=' + encodeURIComponent(formulaPrecedente));
    queries.push('formulaSuccessiva=' + encodeURIComponent(formulaSuccessiva));
    queries.push('categoria=' + encodeURIComponent(categoria));
    queries.push('nomeAutore=' + encodeURIComponent(nomeAutore));
    queries.push('ambitoStorico=' + encodeURIComponent(ambitoStorico));
    queries.push('dataDadataA=' + encodeURIComponent(dataDadataA));
    queries.push('nomeMateriale=' + encodeURIComponent(nomeMateriale));
    queries.push('descrizioneMateriale=' + encodeURIComponent(descrizioneMateriale));
    queries.push('nomeTecnica=' + encodeURIComponent(nomeTecnica));
    queries.push('descrizioneTecnica=' + encodeURIComponent(descrizioneTecnica));
    queries.push('ubicazione=' + encodeURIComponent(ubicazione));
    queries.push('descrizioneUbicazione=' + encodeURIComponent(descrizioneUbicazione));
    queries.push('nomeInventario=' + encodeURIComponent(nomeInventario));
    queries.push('nomeProvenienza=' + encodeURIComponent(nomeProvenienza));
    queries.push('descrizioneProvenienza=' + encodeURIComponent(descrizioneProvenienza));
    queries.push('curatore=' + encodeURIComponent(curatore));
    queries.push('titoloMostra=' + encodeURIComponent(titoloMostra));
    queries.push('dataInizioMostradataFineMostra=' + encodeURIComponent(dataInizioMostradataFineMostra));
    queries.push('luogoMostra=' + encodeURIComponent(luogoMostra));
    queries.push('descrizioneMostra=' + encodeURIComponent(descrizioneMostra));
    queries.push('riferimentoBibliografico=' + encodeURIComponent(riferimentoBibliografico));
    queries.push('altroRiferimentoBibliografico=' + encodeURIComponent(altroRiferimentoBibliografico));
    queries.push('documentazioniFotografiche=' + encodeURIComponent(documentazioniFotografiche));

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
        var response = JSON.parse(xhr.responseText);
        if (response.data[0].length == 0) {
          document.getElementById('result').innerHTML = '<p>Nessun risultato trovato</p>'
        }
        else {
          for (var j = 0; j < response.data[0].length; j++) {
            document.getElementById('result').appendChild(createCard(response.data[0][j]));
          }
          // Scrolla alla sezione dei risultati
          scrollToResults();
        }
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



