// Funzione che aggiunge i suggerimenti alle textbox
function addSuggestion(suggestionId, suggestionTextBox, suggestions) {
  const inputElement = document.getElementById(suggestionId);
  const datalistElement = document.getElementById(suggestionTextBox);

  inputElement.addEventListener("input", function () {
    const inputText = inputElement.value.trim().toLowerCase();

    // Filtra le classificazioni che iniziano con il testo inserito
    const suggerimenti = suggestions.filter(classificazione =>
      classificazione.toLowerCase().startsWith(inputText)
    );

    // Svuota il datalist e aggiungi le nuove opzioni
    datalistElement.innerHTML = suggerimenti
      .map(suggerimento => `<option value="${suggerimento}">`)
      .join("");
  });
}

// Funzione per trovare e generare i suggerimenti per le searchbox di: Classificazione opera, Materiali, Tecniche
function retrieveSuggestion() {


  const categoriaSelect = document.getElementById('categoria');
  const classificazioneSelect = document.getElementById('classificazione');

  const opzioniCategoria = [
    'Dipinti',
    'Mosaici',
    'Sculture e frammenti lapidei',
    'Piccola plastica',
    'Elementi architettonici',
    'Disegni, stampe e matrici',
    'Fotografie',
    'Libri e riviste',
    'Manoscritti',
    'Armi e armature',
    'Tessuti e moda',
    'Gioielleria e ornamenti',
    'Paramenti sacri, oggetti liturgici e devozionali',
    'Utensili e strumenti di lavoro',
    'Materiali organici, fossili e resti umani',
    'Tarsie',
    'Arredi e mobili',
    'Medaglie, monete e gemme',
    'Calchi',
    'Lapidi e cippi funerari',
    'Urne, sarcofagi e casse tombali',
    'Vasellame ceramico',
    'Vasellame metallico',
    'Vetri',
    'Sigilli e impronte di sigilli',
    'Strumenti musicali',
    'Giocattoli',
    'Altro'
  ];

  const opzioniClassificazione = [
    'Opera firmata',
    'Opera attribuita',
    'Opera documentata'
  ];


  opzioniCategoria.forEach(opzione => {
    let optionElement = document.createElement('option');
    optionElement.value = opzione; // Assegna il valore all'opzione
    optionElement.textContent = opzione; // Testo visibile all'utente
    categoriaSelect.appendChild(optionElement);
  });

  opzioniClassificazione.forEach(opzione => {
    let optionElement = document.createElement('option');
    optionElement.value = opzione; // Assegna il valore all'opzione
    optionElement.textContent = opzione; // Testo visibile all'utente
    classificazioneSelect.appendChild(optionElement);
  });

  const urls = [
    "http://0.0.0.0:3000/materiali",
    "http://0.0.0.0:3000/tecniche"
  ];

  const risultati = {};

  Promise.all(
    urls.map(url =>
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const nomeDizionario = url.split("/").pop(); // Estrae l'ultima parte dell'URL come nome del dizionario
          risultati[nomeDizionario] = data;
        })
    )
  )
    .then(() => {

      // Liste per i campi estratti
      const listaMateriali = [];
      const listaDescrizioni = [];

      // Estrarre i dati da "materiali"
      risultati.materiali.data.forEach(materiale => {
        listaMateriali.push(materiale.nome_materiale);
      });

      risultati.tecniche.data.forEach(tecniche => {
        listaDescrizioni.push(tecniche.nome_tecnica);
      });
      // Stampa delle liste

      const listaMaterialiClean = new Set(listaMateriali);
      const listaDescrizioniClean = new Set(listaDescrizioni);

      const arrayListaMateriali = Array.from(listaMaterialiClean);
      const arrayListaDescrizioni = Array.from(listaDescrizioniClean);
      addSuggestion('nome_materiale', 'nome_materialeSuggerimenti', arrayListaMateriali)
      addSuggestion('nome_tecnica', 'nome_tecnicaSuggerimenti', arrayListaDescrizioni)

    })


    .catch(error => {
      console.error("Si è verificato un errore:", error);
    });
}



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
function createCard(data, index) {
  var cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  var cardBodyDiv = document.createElement("div");
  cardBodyDiv.classList.add("card-body");

  var titleElement = document.createElement("h5");
  titleElement.classList.add("card-title", "mb-2", "text-muted");
  titleElement.textContent = data.titolo_opera;

  var autoreElement = document.createElement("p");
  autoreElement.classList.add("card-text");
  autoreElement.textContent = data.nome;

  var categoriaElement = document.createElement("p");
  categoriaElement.classList.add("card-text");
  categoriaElement.textContent = data.categoria;

  var ambito_storicoElement = document.createElement("p");
  ambito_storicoElement.classList.add("card-text");
  ambito_storicoElement.textContent = data.ambito_storico;

  var nome_tecnicaElement = document.createElement("p");
  nome_tecnicaElement.classList.add("card-text");
  nome_tecnicaElement.textContent = data.nome_tecnica;

  var nome_materialeElement = document.createElement("p");
  nome_materialeElement.classList.add("card-text");
  nome_materialeElement.textContent = data.nome_materiale;

  var ubicazioneElement = document.createElement("p");
  ubicazioneElement.classList.add("card-text");
  ubicazioneElement.textContent = data.ubicazione;

  var nome_inventarioElement = document.createElement("p");
  nome_inventarioElement.classList.add("card-text");
  nome_inventarioElement.textContent = data.nome_inventario;

  var pathElement = document.createElement("p");
  pathElement.classList.add("card-text");
  pathElement.textContent = data.path;

  if (data.path) {
    var imgElement = document.createElement("img");
    imgElement.src = data.path;
    var imageContainer = document.createElement("div");
    imgElement.classList.add("card-image");
    imageContainer.classList.add("image-container");
    imageContainer.appendChild(imgElement);
    cardBodyDiv.appendChild(imageContainer);

  }



  // cardBodyDiv.appendChild(titleElement);
  cardBodyDiv.appendChild(titleElement);
  cardBodyDiv.appendChild(autoreElement);
  cardBodyDiv.appendChild(categoriaElement);
  cardBodyDiv.appendChild(ambito_storicoElement);
  cardBodyDiv.appendChild(nome_tecnicaElement);
  cardBodyDiv.appendChild(nome_materialeElement);
  cardBodyDiv.appendChild(ubicazioneElement);
  cardBodyDiv.appendChild(nome_inventarioElement);



  // Crea il link intorno alla card e imposta l'URL desiderato con il parametro "id"
  var cardLink = document.createElement("a");
  cardLink.href = "scheda.html?id=" + index;
  cardLink.appendChild(cardBodyDiv);

  cardDiv.appendChild(cardLink);

  return cardDiv;
}


function toggleAdvancedSearch() {
  var advancedSearchFields = document.getElementById("advancedSearchFields");
  var generalSearchBar = document.getElementById("generalSearch");
  var toggleButton = document.getElementById('toggleSearchFunctions');
  var searchButton = document.getElementById('searchButton');

  if (advancedSearchFields.style.display === "none") {
    toggleButton.innerText = 'Mostra le funzionalità di ricerca veloce';
    advancedSearchFields.style.display = "block";
    generalSearchBar.style.display = "none";
    searchButton.textContent = 'Ricerca avanzata';
    searchButton.title = 'Mostra i risultati della ricerca avanzata';
    $(".custom-tooltip-content").removeClass("show");
    var tooltipMessage = 'Ricerca all\'interno di uno o più campi specifici della scheda';
    $(".custom-tooltip-content").text(tooltipMessage)
  }

  else {
    $(".custom-tooltip-content").removeClass("show");
    var tooltipMessage = 'Ricerca all\'interno dei capi di: titolo, autore, classificazione, corpo scheda, descrizione, ubicazione, provenienza, storia collezionistica';
    $(".custom-tooltip-content").text(tooltipMessage)
    toggleButton.innerText = 'Mostra le funzionalità di ricerca avanzata';
    advancedSearchFields.style.display = "none";
    generalSearchBar.style.display = "block";
    searchButton.textContent = 'Ricerca veloce';

  }
}

function handleSearch() {


  // Esempio di come puoi utilizzare le funzioni per ottenere i valori selezionati
  const ambitoStoricoDaValue = getAmbitoStoricoDa();
  const ambitoStoricoAValue = getAmbitoStoricoA();

  var anno_da_mostra = document.getElementById('anno_da_mostra').value ? document.getElementById('anno_da_mostra').value : '';
  var anno_a_mostra = document.getElementById('anno_a_mostra').value ? document.getElementById('anno_a_mostra').value : '';
  var anno_da = document.getElementById('anno_da').value ? document.getElementById('anno_da').value : '';
  var anno_a = document.getElementById('anno_a').value ? document.getElementById('anno_a').value : '';
  
  var mese_da_mostra = document.getElementById('mese_da_mostra').value ? document.getElementById('mese_da_mostra').value : '';
  var mese_a_mostra = document.getElementById('mese_a_mostra').value ? document.getElementById('mese_a_mostra').value : '';
  var mese_da = document.getElementById('mese_da').value ? document.getElementById('mese_da').value : '';
  var mese_a = document.getElementById('mese_a').value ? document.getElementById('mese_a').value : '';

  var giorno_da_mostra = document.getElementById('giorno_da_mostra').value ? document.getElementById('giorno_da_mostra').value : '';
  var giorno_a_mostra = document.getElementById('giorno_a_mostra').value ? document.getElementById('giorno_a_mostra').value : '';
  var giorno_da = document.getElementById('giorno_da').value ? document.getElementById('giorno_da').value : '';
  var giorno_a = document.getElementById('giorno_a').value ? document.getElementById('giorno_a').value : '';


  if (anno_da_mostra) {
    if (!document.getElementById('giorno_da_mostra').value) {
      document.getElementById('giorno_da_mostra').value = '01';
    }
    if (!document.getElementById('mese_da_mostra').value) {
      document.getElementById('mese_da_mostra').value = '01';
    }
  }
  if (anno_a_mostra) {
    if (!document.getElementById('giorno_a_mostra').value) {
      document.getElementById('giorno_a_mostra').value = '01';
    }
    if (!document.getElementById('mese_a_mostra').value) {
      document.getElementById('mese_a_mostra').value = '01';
    }
  }
  if (anno_da) {
    if (!document.getElementById('giorno_da').value) {
      document.getElementById('giorno_da').value = '01';
    }
    if (!document.getElementById('mese_da').value) {
      document.getElementById('mese_da').value = '01';
    }
  }
  if (anno_a) {
    if (!document.getElementById('giorno_a').value) {
      document.getElementById('giorno_a').value = '01';
      if (!document.getElementById('mese_a').value) {
        document.getElementById('mese_a').value = '01';
      }
    }
  }
  if (anno_a) {
    var data_da = giorno_da + '/' + mese_da + '/' + anno_da;
    var data_a = giorno_a + '/' + mese_a + '/' + anno_a;
  }
  if (anno_a_mostra){
    var data_da_mostra = giorno_da_mostra + '/' + mese_da_mostra + '/' + anno_da_mostra;
    var data_a_mostra = giorno_a_mostra + '/' + mese_a_mostra + '/' + anno_a_mostra;
  }

    // Svuoto il contenuto del div dei risultati
    document.getElementById('result').innerHTML = '';

    // Crea l'URL per la chiamata GET
    var url = 'http://0.0.0.0:3000/search/?';
    var queries = [];


    // Ricerca generica
    if (advancedSearchFields.style.display === "none") {
      console.log('ricerca generica')
      const queryGenerica = document.getElementById('generalSearchBar').value;
      queries.push('queryGenerica=' + encodeURIComponent(queryGenerica));
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
      const categoria = document.getElementById('categoria').value;
      const nomeAutore = document.getElementById('nome').value;
      const ambitoStorico = document.getElementById('ambito_storico').value;
      let dataDadataA = '';
      // Entrambe le date selezionate
      if (anno_a && anno_da) {
        dataDadataA = data_da + ' ' + data_a + ' ' + ambitoStoricoDaValue + ' ' + ambitoStoricoAValue;
      }
      const nomeMateriale = document.getElementById('nome_materiale').value;
      const nomeTecnica = document.getElementById('nome_tecnica').value;
      const ubicazione = document.getElementById('ubicazione').value;
      const nomeInventario = document.getElementById('nome_inventario').value;
      const nomeProvenienza = document.getElementById('nome_provenienza').value;
      const curatore = document.getElementById('curatore').value;
      const titoloMostra = document.getElementById('titolo_mostra').value;
      let dataInizioMostradataFineMostra = '';
      if (anno_a_mostra && anno_da_mostra) {
        dataInizioMostradataFineMostra = doanno_da_mostra + ' ' + anno_a_mostra;
      }
      const luogoMostra = document.getElementById('luogo_mostra').value;
      const riferimentoBibliografico = document.getElementById('riferimento_bibliografico').value;
      const altroRiferimentoBibliografico = document.getElementById('altro_riferimento_bibliografico').value;
      const documentazioniFotografiche = document.getElementById('documentazioniFotografiche').value;

      queries.push('titoloOpera=' + encodeURIComponent(titoloOpera));
      queries.push('corpoScheda=' + encodeURIComponent(corpoScheda));
      queries.push('iscrizioni=' + encodeURIComponent(iscrizioni));
      queries.push('descrizioneSintetica=' + encodeURIComponent(descrizioneSintetica));
      queries.push('storiaEspositiva=' + encodeURIComponent(storiaEspositiva));
      queries.push('classificazione=' + encodeURIComponent(classificazione));
      queries.push('categoria=' + encodeURIComponent(categoria));
      queries.push('nomeAutore=' + encodeURIComponent(nomeAutore));
      queries.push('ambitoStorico=' + encodeURIComponent(ambitoStorico));
      queries.push('dataDadataA=' + encodeURIComponent(dataDadataA));
      queries.push('nomeMateriale=' + encodeURIComponent(nomeMateriale));
      queries.push('nomeTecnica=' + encodeURIComponent(nomeTecnica));
      queries.push('ubicazione=' + encodeURIComponent(ubicazione));
      queries.push('nomeInventario=' + encodeURIComponent(nomeInventario));
      queries.push('nomeProvenienza=' + encodeURIComponent(nomeProvenienza));
      queries.push('curatore=' + encodeURIComponent(curatore));
      queries.push('titoloMostra=' + encodeURIComponent(titoloMostra));
      queries.push('dataInizioMostradataFineMostra=' + encodeURIComponent(dataInizioMostradataFineMostra));
      queries.push('luogoMostra=' + encodeURIComponent(luogoMostra));
      queries.push('riferimentoBibliografico=' + encodeURIComponent(riferimentoBibliografico));
      queries.push('altroRiferimentoBibliografico=' + encodeURIComponent(altroRiferimentoBibliografico));
      queries.push('documentazioniFotografiche=' + encodeURIComponent(documentazioniFotografiche));
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
        var response = JSON.parse(xhr.responseText);
        if (response.data[0].length == 0) {
          document.getElementById('result').innerHTML = '<p>Nessun risultato trovato</p>'
        }
        else {
          for (var j = 0; j < response.data.length; j = j + 2) {
            document.getElementById('result').appendChild(createCard(response.data[j][0], response.data[j + 1]));
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

  function initInputValidation() {
    const inputs = document.querySelectorAll('.form-control');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (!/^\d*$/.test(input.value)) {
          input.value = input.value.replace(/[^\d]/g, '');
        }

        if (input.id === 'giorno_da' || input.id === 'giorno_a' || input.id === 'mese_da' || input.id === 'mese_a') {
          if (input.value > 31) {
            input.value = '31';
          }
        }

        if (input.id === 'mese_da' || input.id === 'mese_a') {
          if (input.value > 12) {
            input.value = '12';
          }
        }

        if (input.id === 'anno_da' || input.id === 'anno_a') {
          if (input.value.length > 4) {
            input.value = input.value.slice(0, 4);
          }
        }
        if (!/^\d*$/.test(input.value)) {
          input.value = input.value.replace(/[^\d]/g, '');
        }

        if (input.id === 'giorno_da_mostra' || input.id === 'giorno_a_mostra' || input.id === 'mese_da_mostra' || input.id === 'mese_a_mostra') {
          if (input.value > 31) {
            input.value = '31';
          }
        }

        if (input.id === 'mese_da_mostra' || input.id === 'mese_a_mostra') {
          if (input.value > 12) {
            input.value = '12';
          }
        }

        if (input.id === 'anno_da_mostra' || input.id === 'anno_a_mostra') {
          if (input.value.length > 4) {
            input.value = input.value.slice(0, 4);
          }
        }
      });
    });
  }


  $(document).ready(function () {
    retrieveSuggestion();
    var toggleSearchFunctions = document.getElementById("toggleSearchFunctions");
    toggleSearchFunctions.addEventListener("click", toggleAdvancedSearch);
    var searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', handleSearch);
    var tooltipMessage = 'Ricerca all\'interno dei capi di: titolo, autore, classificazione, corpo scheda, descrizione, ubicazione, provenienza, storia collezionistica';
    $(".custom-tooltip-content").text(tooltipMessage)
    $("#custom-tooltip").click(function () {
      $(".custom-tooltip-content").toggleClass("show");
    });
    initInputValidation();


  });



