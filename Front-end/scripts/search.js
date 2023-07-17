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
    const dataDa = document.getElementById('data_da').value;
    const dataA = document.getElementById('data_a').value;
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
    const dataInizioMostra = document.getElementById('data_inizio_mostra').value;
    const dataFineMostra = document.getElementById('data_fine_mostra').value;
    const luogoMostra = document.getElementById('luogo_mostra').value;
    const descrizioneMostra = document.getElementById('descrizione_mostra').value;
    const riferimentoBibliografico = document.getElementById('riferimento_bibliografico').value;
    const altroRiferimentoBibliografico = document.getElementById('altro_riferimento_bibliografico').value;
    const documentazioniFotografiche = document.getElementById('documentazioniFotografiche').value;
    

    // Crea l'URL per la chiamata GET
    var url = 'http://0.0.0.0:3000/search/?';
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
      queries.push('dataDa=' + encodeURIComponent(dataDa));
      queries.push('dataA=' + encodeURIComponent(dataA));
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
      queries.push('dataInizioMostra=' + encodeURIComponent(dataInizioMostra));
      queries.push('dataFineMostra=' + encodeURIComponent(dataFineMostra));
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



