document.addEventListener('DOMContentLoaded', checkLoginStatus);

async function checkLoginStatus() {
  const jwtCookie = getCookie('jwt');
  const loginDiv = document.querySelector('.loginDiv');

  if (jwtCookie) {
    // Effettua la chiamata GET per verificare il ruolo dell'utente
    const response = await fetch('http://172.22.0.2/proxy/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtCookie}`
      }
    });

    if (response.ok) {
      // L'utente è autenticato e ha un ruolo di amministratore
      loginDiv.innerHTML = '<a href="#" class="btn btn-primary logout-btn" onclick="logout()">Logout</a>';
      
      // Aggiungi il bottone "Schedatore"
      const schedatoreButton = document.createElement('a');
      schedatoreButton.href = 'schedatore.html';
      schedatoreButton.className = 'btn btn-primary schedatore';
      schedatoreButton.innerText = 'Schedatore';
      loginDiv.appendChild(schedatoreButton);

      // Verifica se l'utente è un amministratore
      const userData = await response.json();
      if (userData) {
        // L'utente è un amministratore, aggiungi il bottone "Admin"
        const adminButton = document.createElement('a');
        adminButton.href = 'admin.html';
        adminButton.className = 'btn btn-primary admin';
        adminButton.innerText = 'Admin';
        loginDiv.appendChild(adminButton);
      }
    } else {
      // L'utente potrebbe non essere autenticato o non avere il ruolo di amministratore
      loginDiv.innerHTML = '<a href="#" class="btn btn-primary logout-btn" onclick="logout()">Logout</a>';
      
      // Aggiungi solo il bottone "Schedatore"
      const schedatoreButton = document.createElement('a');
      schedatoreButton.href = 'schedatore.html';
      schedatoreButton.className = 'btn btn-primary schedatore';
      schedatoreButton.innerText = 'Schedatore';
      loginDiv.appendChild(schedatoreButton);
    }
  }
}

async function logout() {
  // Elimina il cookie jwt
  document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  
  // Ricarica la pagina
  location.reload();
}

// Funzione per ottenere il valore di un cookie per nome
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}


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

function retrieveSuggestion() {
  const categoriaSelect = document.getElementById('categoria');
  const classificazioneSelect = document.getElementById('classificazione');

  const opzioniClassificazione = [
    'Dipinti', 'Mosaici', 'Sculture e frammenti lapidei', 'Piccola plastica',
    'Elementi architettonici', 'Disegni, stampe e matrici', 'Fotografie',
    'Libri e riviste', 'Manoscritti', 'Armi e armature', 'Tessuti e moda',
    'Gioielleria e ornamenti', 'Paramenti sacri, oggetti liturgici e devozionali',
    'Utensili e strumenti di lavoro', 'Materiali organici, fossili e resti umani',
    'Tarsie', 'Arredi e mobili', 'Medaglie, monete e gemme', 'Calchi',
    'Lapidi e cippi funerari', 'Urne, sarcofagi e casse tombali',
    'Vasellame ceramico', 'Vasellame metallico', 'Vetri',
    'Sigilli e impronte di sigilli', 'Strumenti musicali', 'Giocattoli', 'Altro'
  ];

  const opzioniCategoria = ['Opera firmata', 'Opera attribuita', 'Opera documentata'];

  function createOptionElement(value) {
    const optionElement = document.createElement('option');
    optionElement.value = value;
    optionElement.textContent = value;
    return optionElement;
  }

  opzioniCategoria.forEach(opzione => {
    const optionElement = createOptionElement(opzione);
    categoriaSelect.appendChild(optionElement);
  });

  opzioniClassificazione.forEach(opzione => {
    const optionElement = createOptionElement(opzione);
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
          const nomeDizionario = url.split("/").pop();
          risultati[nomeDizionario] = data;
        })
    )
  )
    .then(() => {
      const listaMateriali = new Set(risultati.materiali.data.map(materiale => materiale.nome_materiale));
      const listaDescrizioni = new Set(risultati.tecniche.data.map(tecniche => tecniche.nome_tecnica));

      const arrayListaMateriali = Array.from(listaMateriali);
      const arrayListaDescrizioni = Array.from(listaDescrizioni);

      addSuggestion('nome_materiale', 'nome_materialeSuggerimenti', arrayListaMateriali);
      addSuggestion('nome_tecnica', 'nome_tecnicaSuggerimenti', arrayListaDescrizioni);
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

  if (radioAvantiDa.checked) {
    return radioAvantiDa.value;
  } else if (radioDopoDa.checked) {
    return radioDopoDa.value;
  }
}

// Funzione per ottenere il valore selezionato per il secondo form di date
function getAmbitoStoricoA() {
  // Ottieni i riferimenti agli elementi dei radio button
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

  var textInformations = document.createElement("div");
  textInformations.classList.add("text_informations");

  var titleElement = document.createElement("h5");
  titleElement.classList.add("card-title", "mb-2", "text-muted");
  titleElement.innerHTML =  data.titolo_opera ;
  

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

  var numero_inventarioElement = document.createElement("p");
  numero_inventarioElement.classList.add("card-text");
  numero_inventarioElement.textContent = data.numero_inventario;


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

  textInformations.appendChild(titleElement);
  textInformations.appendChild(autoreElement);
  textInformations.appendChild(categoriaElement);
  textInformations.appendChild(ambito_storicoElement);
  textInformations.appendChild(nome_tecnicaElement);
  textInformations.appendChild(nome_materialeElement);
  textInformations.appendChild(ubicazioneElement);
  textInformations.appendChild(nome_inventarioElement);
  textInformations.appendChild(numero_inventarioElement);
  cardBodyDiv.appendChild(textInformations);

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
      giorno_da_mostra = '01'
    }
    if (!document.getElementById('mese_da_mostra').value) {
      document.getElementById('mese_da_mostra').value = '01';
      mese_da_mostra = '01'
    }
  }
  if (anno_a_mostra) {
    if (!document.getElementById('giorno_a_mostra').value) {
      document.getElementById('giorno_a_mostra').value = '01';
      giorno_a_mostra = '01'

    }
    if (!document.getElementById('mese_a_mostra').value) {
      document.getElementById('mese_a_mostra').value = '01';
      mese_a_mostra = '01'

    }
  }
  if (anno_da) {
    if (!document.getElementById('giorno_da').value) {
      document.getElementById('giorno_da').value = '01';
      giorno_da = '01'
    }
    if (!document.getElementById('mese_da').value) {
      document.getElementById('mese_da').value = '01';
      mese_da = '01'
    }
  }
  if (anno_a) {
    if (!document.getElementById('giorno_a').value) {
      document.getElementById('giorno_a').value = '01';
      giorno_a = '01'
    }
    if (!document.getElementById('mese_a').value) {
      document.getElementById('mese_a').value = '01';
      mese_a = '01'
    }
  }
  
  if (anno_a) {
    var data_da = anno_da + '-' + mese_da + '-' + giorno_da;
    var data_a = anno_a + '-' + mese_a + '-' + giorno_a;
  }
  if (anno_a_mostra) {
    var data_da_mostra = giorno_da_mostra + '-' + mese_da_mostra + '-' + anno_da_mostra;
    var data_a_mostra = giorno_a_mostra + '-' + mese_a_mostra + '-' + anno_a_mostra;
  }

  document.getElementById('result').innerHTML = '';

  var url = 'http://0.0.0.0:3000/search/?';
  var queries = [];

  if (advancedSearchFields.style.display === "none") {
    console.log('ricerca generica')
    const queryGenerica = document.getElementById('generalSearchBar').value;
    queries.push('queryGenerica=' + encodeURIComponent(queryGenerica));
  }

  else {
    console.log('ricerca avanzata')
    const titoloOpera = document.getElementById('titolo_opera').value;
    const corpoScheda = document.getElementById('corpo_scheda').value;
    const iscrizioni = document.getElementById('iscrizioni').value;
    const descrizioneSintetica = document.getElementById('descrizione_sintetica').value;
    const storiaEspositiva = document.getElementById('storia_espositiva').value;
    const classificazione = document.getElementById('classificazione').value;
    const categoria = document.getElementById('categoria').value;
    const nomeAutore = document.getElementById('nome').value;
    const ambitoStorico = document.getElementById('ambito_storico').value;
    var dataDadataA = '';
    if (anno_a && anno_da) {
      dataDadataA = data_da + ' ' + data_a + ' ' + ambitoStoricoDaValue + ' ' + ambitoStoricoAValue;
    }
    const nomeMateriale = document.getElementById('nome_materiale').value;
    const nomeTecnica = document.getElementById('nome_tecnica').value;
    const ubicazione = document.getElementById('ubicazione').value;
    const nomeInventario = document.getElementById('nome_inventario').value;
    const numeroInventario = document.getElementById('numero_inventario').value;
    const nomeProvenienza = document.getElementById('nome_provenienza').value;
    const curatore = document.getElementById('curatore').value;
    const titoloMostra = document.getElementById('titolo_mostra').value;
    var dataInizioMostradataFineMostra = '';
    if (anno_a_mostra && anno_da_mostra) {
      dataInizioMostradataFineMostra = data_da_mostra + ' ' + data_a_mostra;
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
    queries.push('numeroInventario=' + encodeURIComponent(numeroInventario));
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

  if (queries[0] == "queryGenerica=") {
    document.getElementById('result').innerHTML = '<p>Nessun dato inserito</p>'
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.data.length == 0) {
        document.getElementById('result').innerHTML = '<p>Nessun risultato trovato</p>'
      }
      else {
        for (var j = 0; j < response.data.length; j = j + 2) {
          document.getElementById('result').appendChild(createCard(response.data[j][0], response.data[j + 1]));
        }
        scrollToResults();
      }
    } else {
      console.error('Errore nella chiamata GET: ' + xhr.status);
    }
  };
  xhr.send();
}

function initInputValidation() {
  const dateInputIds = [
    'giorno_da', 'giorno_a', 'mese_da', 'mese_a',
    'mese_da_mostra', 'mese_a_mostra', 'anno_da', 'anno_a',
    'anno_da_mostra', 'anno_a_mostra'
  ];

  const inputs = document.querySelectorAll('.date-form');

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const isNumericInput = /^\d*$/.test(input.value);
      const isDayInput = input.id.includes('giorno');
      const isMonthInput = input.id.includes('mese');
      const isYearInput = input.id.includes('anno');

      if (!isNumericInput) {
        input.value = input.value.replace(/[^\d]/g, '');
      }

      if ((isDayInput || isMonthInput) && input.value > 31) {
        input.value = '31';
      }

      if (isMonthInput && input.value > 12) {
        input.value = '12';
      }

      if (isYearInput && input.value.length > 4) {
        input.value = input.value.slice(0, 4);
      }
    });
  });
}

function setupTooltip() {
  const tooltipMessage = 'Ricerca all\'interno dei capi di: titolo, autore, classificazione, corpo scheda, descrizione, ubicazione, provenienza, storia collezionistica';
  $(".custom-tooltip-content").text(tooltipMessage);

  $("#custom-tooltip").click(function () {
    $(".custom-tooltip-content").toggleClass("show");
  });
}


$(document).ready(function () {
  initializeUI();

  function initializeUI() {
    retrieveSuggestion();
    addEventListeners();
    setupTooltip();
    initInputValidation();
  }

  function addEventListeners() {
    $("#toggleSearchFunctions").on("click", toggleAdvancedSearch);
    $("#searchButton").on("click", handleSearch);
    $(window).on("keydown", function(event) {
      if (event.which === 13) { // 13 è il codice del tasto "Invio"
        handleSearch();
      }
    });
    
  }

});

