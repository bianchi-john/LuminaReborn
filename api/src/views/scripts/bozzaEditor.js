
///////////////////////
///////////////////////

// LOGIA PER IL REPERIMENTO DEI SUGGERIMENTI E DEGLI ELEMENTI GIÀ PRESENTI

///////////////////////
///////////////////////
function getSuggestions() {
    // Creazione dell'oggetto XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Definizione della funzione da eseguire quando la richiesta è completata
    xhr.onreadystatechange = function () {
        // Controllo dello stato della richiesta
        if (xhr.readyState === XMLHttpRequest.DONE) {
            // Controllo dello stato della risposta
            if (xhr.status === 200) {
                // Successo: la risposta è stata ricevuta correttamente
                var response = JSON.parse(xhr.responseText);
                var autori = response.data[0].autori;
                var materiali = response.data[0].materiali;
                var tecniche = response.data[0].tecniche;
                var misure = response.data[0].misure;

                // Popolare select per autori
                populateSelect(autori, 'autoriSelect1');

                // Popolare select per materiali
                populateSelect(materiali, 'materialiSelect1');

                // Popolare select per tecniche
                populateSelect(tecniche, 'tecnicheSelect1');

                // Aggiungi suggerimenti per campi di input misure
                addInputSuggestions(misure);


            } else {
                // Errore: la richiesta non è stata completata correttamente
                console.error('Si è verificato un errore durante la richiesta:', xhr.status);
            }
        }
    };

    // Apertura della richiesta GET verso l'URL specificato
    xhr.open('GET', 'http://172.22.0.6:3000/suggestions', true);

    // Invio della richiesta
    xhr.send();
}

function populateSelect(data, selectId) {
    // Ottieni la select HTML
    var select = document.getElementById(selectId);

    // Rimuovi tutte le opzioni esistenti dalla select
    select.innerHTML = '';

    // Aggiungi un'opzione vuota
    var emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '---';
    select.appendChild(emptyOption);

    // Aggiungi una nuova opzione per ogni elemento di data
    data.forEach(function (item) {
        // Verifica se almeno una chiave (ad eccezione di "id") ha un valore non vuoto
        var hasNonEmptyValue = Object.keys(item).some(function (key) {
            return key !== "id" && item[key] !== "";
        });

        if (hasNonEmptyValue) {
            var option = document.createElement('option');
            option.value = JSON.stringify(item); // Imposta il valore come stringa JSON
            // Creare un array con tutti i valori tranne l'id
            var itemValues = Object.keys(item).filter(function (key) {
                return key !== "id" && item[key] !== ""; // Escludi l'id e i valori vuoti
            }).map(function (key) {
                return item[key];
            });
            var itemText = itemValues.join(" "); // Concatena i valori con uno spazio
            option.textContent = itemText;
            select.appendChild(option);
        }
    });
}

function addInputSuggestions(misure) {
    // Itera su ogni elemento misura
    misure.forEach(function (misura) {
        // Ottieni gli elementi del DOM relativi alla misura
        var direzioneInput = document.getElementById('Direzione11');
        var tipoInput = document.getElementById('Tipo11');
        var valoreInput = document.getElementById('Valore11');
        var unitaInput = document.getElementById('Unita11');

        // Aggiungi event listener per mostrare i suggerimenti
        direzioneInput.addEventListener('focus', function () {
            showSuggestionsTooltip(direzioneInput, 'Suggerimento per direzione');
        });
        tipoInput.addEventListener('focus', function () {
            showSuggestionsTooltip(tipoInput, 'Suggerimento per tipo');
        });
        valoreInput.addEventListener('focus', function () {
            showSuggestionsTooltip(valoreInput, 'Suggerimento per valore');
        });
        unitaInput.addEventListener('focus', function () {
            showSuggestionsTooltip(unitaInput, 'Suggerimento per unità');
        });
    });
}


function showSuggestionsTooltip(inputElement, suggestionText) {
    // Creare un elemento per il tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = suggestionText;

    // Posizionare il tooltip vicino all'input
    var inputRect = inputElement.getBoundingClientRect();
    tooltip.style.top = (inputRect.top + inputElement.offsetHeight) + 'px';
    tooltip.style.left = inputRect.left + 'px';

    // Aggiungere il tooltip al DOM
    document.body.appendChild(tooltip);

    // Rimuovere il tooltip quando l'utente clicca al di fuori
    document.addEventListener('click', function (event) {
        if (event.target !== inputElement) {
            tooltip.remove();
        }
    });
}



///////////////////////
///////////////////////

// LOGICA PER LA GESTIONE DELLE DATE

///////////////////////
///////////////////////


function initInputValidation() {


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


let count = 1;

function aggiungiGruppo(containerId, groupId, ...inputIds) {
    count++;
    let nuovoGruppo = document.createElement('div');
    nuovoGruppo.className = 'form-group';
    let container = document.getElementById(containerId);
    let numeroFigli = container.childElementCount;
    numeroFigli = numeroFigli + 1
    nuovoGruppo.id = groupId + numeroFigli;
    let inputHtml = '';


    inputIds.forEach((id, index) => {
        elemento = document.getElementById(id + '1');
        nome = elemento.getAttribute("name");
        inputHtml += `<p>${nome}</p>
        <input type="text" id="${id}${numeroFigli}" name="${id}${numeroFigli}">`;
    });

    nuovoGruppo.innerHTML = inputHtml;
    document.getElementById(containerId).appendChild(nuovoGruppo);

    // Controllo se c'è una select
    if ($('#' + containerId + ' select').length > 0) {
        // Se c'è, prendi l'elemento <select> e mettilo in una variabile
        // var selectElement = $('#' + containerId + ' select');
        var selectElement = document.querySelectorAll('#' + containerId + ' select');
        var selectElement = selectElement[selectElement.length - 1].id;
        selectElement = $('#' + selectElement);
        var newSelectElement = selectElement.clone();
        // Ottieni l'attuale id
        var currentId = newSelectElement.attr('id');
        // Estrai il numero dall'id corrente
        var currentNumber = currentId.match(/\d+/)[0];
        // Calcola il nuovo numero incrementato di 1
        var newNumber = parseInt(currentNumber) + 1;
        var newId = currentId.replace(/\d+/, newNumber);
        // Imposta il nuovo id
        newSelectElement.prop('id', newId);
        newSelectElement.prop('name', newId);
        var nuovoParagrafo = document.createElement("p");
        // Aggiungi il testo al paragrafo
        nuovoParagrafo.textContent = "Seleziona preesistente";
        document.getElementById(nuovoGruppo.id).append(nuovoParagrafo);
        document.getElementById(nuovoGruppo.id).append(newSelectElement[0]);
    }
    if (numeroFigli > 1) {
        var bottoneRimuovi = document.querySelector(`button[onclick="rimuoviGruppo('${containerId}')"]`);
        bottoneRimuovi.style.display = 'inline';
    }
}



function rimuoviGruppo(containerId) {
    let container = document.getElementById(containerId);
    var gruppi = container.getElementsByClassName('form-group');
    // Verifica se ci sono gruppi da rimuovere
    if (gruppi.length > 0) {
        container.removeChild(gruppi[gruppi.length - 1]);
    }
    let numeroFigli = container.childElementCount;
    if (numeroFigli == 1) {
        var bottoneRimuovi = document.querySelector(`button[onclick="rimuoviGruppo('${containerId}')"]`);
        bottoneRimuovi.style.display = 'none';
    }
}

function handleSelectChange(selectElement) {
    // Ottieni il div padre
    var parentDiv = selectElement.closest('.form-group');
    // Seleziona tutti gli elementi di tipo input all'interno del div padre
    var inputElements = parentDiv.querySelectorAll('input');
    // Verifica se l'opzione selezionata non è la prima
    if (selectElement.value !== "") {
        // Per ogni input, cancella il testo e disabilita
        inputElements.forEach(function (input) {
            input.value = "";
            input.disabled = true;
        });
    } else {
        // Per ogni input, riabilita
        inputElements.forEach(function (input) {
            input.disabled = false;
        });
    }
}

///////////////////////
///////////////////////

// LOGICA PER LE MISURE

///////////////////////
///////////////////////





function aggiungiGruppoMisure(containerId) {
    // Ottengo il numero di gruppi di misure nella pagina
    const container = document.getElementById('textboxContainerMisure');
    const numeroGruppiMisure = (container.getElementsByClassName('gruppoMisure')).length;

    // Creo un nuovo gruppo con gli id corretti
    var nuovoCodiceHTML = generaCodiceGruppoMisure(numeroGruppiMisure + 1);

    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento nel container
    container.insertAdjacentHTML('beforeend', nuovoCodiceHTML);

    bottoneRimuovi = document.getElementById('removeButtonGruppiMisure');
    bottoneRimuovi.style.display = 'inline';
}


function rimuoviGruppoMisure(containerId) {
    // Ottieni il contenitore delle misure
    var textboxContainer = document.getElementById(containerId);

    // Trova tutti gli elementi con classe "gruppoMisure"
    var gruppoMisureElements = textboxContainer.getElementsByClassName('gruppoMisure');

    // Verifica se ci sono elementi da rimuovere
    if (gruppoMisureElements.length > 2) {
        // Ottieni l'ultimo elemento e rimuovilo
        var ultimoElemento = gruppoMisureElements[gruppoMisureElements.length - 1];
        ultimoElemento.parentNode.removeChild(ultimoElemento);
    }
    if (gruppoMisureElements.length == 2) {
        var ultimoElemento = gruppoMisureElements[gruppoMisureElements.length - 1];
        ultimoElemento.parentNode.removeChild(ultimoElemento);
        bottoneRimuovi = document.getElementById('removeButtonGruppiMisure');
        bottoneRimuovi.style.display = 'none';
    }
    else {
        console.log('errore during removing gruppo misure stuff')
    }
}


function generaCodiceGruppoMisure(id) {
    // Codice HTML con segnaposto § e ç
    var nuovoCodice = `
        <div class="form-group gruppoMisure" id="gruppoMisure${id}">
            <p>Titolo Gruppo Misure</p>
                <input type="text" id="Titolo${id}" name="Titolo">
            <p>Intero/Parziale</p>
            <input type="text" id="Intero-Parziale${id}" name="Intero-Parziale">
            </br>
            </br>
            <p>Misure</p>
            <div class="field">
                <div class="form-group misure" id="misureGroup${id}1">
                    <p>Direzione</p>
                    <select name="Direzione" id="Direzione${id}1">
                        <option value="" selected></option>
                        <option value="Direzione${id}1">Lista di tutte le direzioni</option>
                    </select>
                    <p>Tipo</p>
                    <select name="Tipo" id="Tipo${id}1">
                        <option value="" selected></option>
                        <option value="Tipo${id}1">Lista di tutte i tipi</option>
                    </select>
                    <p>Valore</p>
                    <input type="text" id="Valore${id}1" name="Valore">
                    <p>Unità</p>
                    <select name="Unita" id="Unita${id}1">
                        <option value="" selected></option>
                        <option value="Unita${id}1">Lista di tutte le unità</option>
                    </select>
                    </br>
                    </div>
                </div>
            <button onclick="aggiungiMisura('gruppoMisure${id}')">Aggiungi misura</button>
            <button onclick="rimuoviMisura('gruppoMisure${id}')" class='removeButtonMisure'>Rimuovi</button>
        </div>
    `;
    return nuovoCodice;
}


function aggiungiMisura(containerId) {
    // Ottengo il numero del gruppo misure corrente
    var numeroGruppo = containerId.match(/\d+/g).map(Number);
    // Ottengo il numero delle misure nel div corrente
    var numeroMisure = document.getElementById(containerId).getElementsByClassName('misure').length;
    numeroMisure = numeroMisure + 1;

    // Ottieni l'elemento "misureGroup11" da clonare
    var templateElement = document.getElementById("misureGroup11");

    // Clona l'elemento
    var nuovoElemento = templateElement.cloneNode(true);

    // Modifica gli id e altri attributi in base ai parametri
    nuovoElemento.id = "misureGroup" + numeroGruppo + numeroMisure;
    nuovoElemento.querySelector("[name='Direzione']").id = "Direzione" + numeroGruppo + numeroMisure;
    nuovoElemento.querySelector("[name='Tipo']").id = "Tipo" + numeroGruppo + numeroMisure;
    nuovoElemento.querySelector("[name='Valore']").id = "Valore" + numeroGruppo + numeroMisure;
    nuovoElemento.querySelector("[name='Unita']").id = "Unita" + numeroGruppo + numeroMisure;

    var primoElemento = document.getElementById(containerId).getElementsByClassName('field')[0];

    if (numeroMisure > 1) {
        // Risali alla gerarchia DOM per trovare il genitore comune
        var genitoreComune = primoElemento.closest('.gruppoMisure');

        // Trova l'elemento con classe "removeButtonMisure" all'interno di genitoreComune
        var removeButton = genitoreComune.querySelector('.removeButtonMisure');

        // Modifica la visibilità dell'elemento removeButton
        removeButton.style.display = 'inline';
    }

    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento
    primoElemento.insertAdjacentHTML('beforeend', nuovoElemento.outerHTML);
    return nuovoElemento.outerHTML;
}


function rimuoviMisura(containerId) {

    // Ottieni l'elemento padre (gruppoMisure1)
    var gruppoMisureElement = document.getElementById(containerId);

    // Trova tutti gli elementi con le classi "form-group" e "misure" all'interno di gruppoMisure1
    var misuraElements = gruppoMisureElement.querySelectorAll('.form-group.misure');

    // Verifica se ci sono elementi da rimuovere
    if (misuraElements.length > 2) {
        // Ottieni l'ultimo elemento e rimuovilo
        var ultimoMisuraElement = misuraElements[misuraElements.length - 1];
        ultimoMisuraElement.parentNode.removeChild(ultimoMisuraElement);

    }
    if (misuraElements.length == 2) {
        var ultimoMisuraElement = misuraElements[misuraElements.length - 1];
        ultimoMisuraElement.parentNode.removeChild(ultimoMisuraElement);
        bottoneRimuovi = gruppoMisureElement.getElementsByClassName('removeButtonMisure');
        bottoneRimuovi[0].style.display = 'none';
    }
    else {
        console.log("Nessun elemento con le classi 'form-group' e 'misure' da rimuovere.");
    }
}


function generaCodiceMisure(numeroGruppo, numeroMisure) {
    var code = `
            <div class="form-group misure" id="misureGroup${numeroGruppo}${numeroMisure}">
                <p>Direzione</p>
                <select name="Direzione" id="Direzione${numeroGruppo}${numeroMisure}">
                    <option value="" selected></option>
                    <option value="Direzione${numeroGruppo}${numeroMisure}">Lista di tutte le direzioni</option>
                </select>
                <p>Tipo</p>
                <select name="Tipo" id="Tipo${numeroGruppo}${numeroMisure}">
                    <option value="" selected></option>
                    <option value="Tipo${numeroGruppo}${numeroMisure}">Lista di tutte i tipi</option>
                </select>
                <p>Valore</p>
                <input type="text" id="Valore${numeroGruppo}${numeroMisure}" name="Valore">
                <p>Unità</p>
                <select name="Unita" id="Unita${numeroGruppo}${numeroMisure}">
                    <option value="" selected></option>
                    <option value="Unita${numeroGruppo}${numeroMisure}">Lista di tutte le unità</option>
                </select>
                </br>
                </div>
        `;
    return code;
}



///////////////////////
///////////////////////

// LOGICA PER LE MOSTRE

///////////////////////
///////////////////////


function aggiungiGruppoMostre() {
    var numero = document.getElementById('mostre').getElementsByClassName('form-group').length;
    numero = numero + 1;


    var codice = `

    <div class="form-group" id="mostre-group${numero}">

    <form name="compForm">
        <input type="hidden" name="myDoc">
        <div class="toolBar1">
        <select onchange="formatDoc('formatblock',this[this.selectedIndex].value);this.selectedIndex=0;">
        <option selected>- formatting -</option>
        <option value="h1">Title 1 &lt;h1&gt;</option>
        <option value="h2">Title 2 &lt;h2&gt;</option>
        <option value="h3">Title 3 &lt;h3&gt;</option>
        <option value="h4">Title 4 &lt;h4&gt;</option>
        <option value="h5">Title 5 &lt;h5&gt;</option>
        <option value="h6">Subtitle &lt;h6&gt;</option>
        <option value="p">Paragraph &lt;p&gt;</option>
        <option value="pre">Preformatted &lt;pre&gt;</option>
        </select>
        <select onchange="formatDoc('fontname',this[this.selectedIndex].value);this.selectedIndex=0;">
        <option class="heading" selected>- font -</option>
        <option>Arial</option>
        <option>Arial Black</option>
        <option>Courier New</option>
        <option>Times New Roman</option>
        </select>
        <select onchange="formatDoc('fontsize',this[this.selectedIndex].value);this.selectedIndex=0;">
        <option class="heading" selected>- size -</option>
        <option value="1">Very small</option>
        <option value="2">A bit small</option>
        <option value="3">Normal</option>
        <option value="4">Medium-large</option>
        <option value="5">Big</option>
        <option value="6">Very big</option>
        <option value="7">Maximum</option>
        </select>
        <select onchange="formatDoc('forecolor',this[this.selectedIndex].value);this.selectedIndex=0;">
        <option class="heading" selected>- color -</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="black">Black</option>
        </select>
        <select onchange="formatDoc('backcolor',this[this.selectedIndex].value);this.selectedIndex=0;">
        <option class="heading" selected>- background -</option>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="black">Black</option>
        </select>
        </div>
        <div class="toolBar2">
        <img class="intLink" title="Clean" onclick="if(validateMode()&&confirm('Are you sure?')){oDoc.innerHTML=sDefTxt};" src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7" />
        <img class="intLink" title="Print" onclick="printDoc();" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oEBxcZFmGboiwAAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUOMvtlUtsjFEUx//n3nn0YdpBh1abRpt4LFqtqkc3jRKkNEIsiIRIBBEhJJpKlIVo4m1RRMKKjQiRMJRUqUdKPT71qpIpiRKPaqdF55tv5vvusZjQTjOlseUkd3Xu/3dPzusC/22wtu2wRn+jG5So/OCDh8ycMJDflehMlkJkVK7KUYN+ufzA/RttH76zaVocDptRxzQtNi3mRWuPc+6cKtlXZ/sddP2uu9uXlmYXZ6Qm8v4Tz8lhF1H+zDQXt7S8oLMXtbF4e8QaFHjj3kbP2MzkktHpiTjp9VH6iHiA+whtAsX5brpwueMGdONdf/2A4M7ukDs1JW662+XkqTkeUoqjKtOjm2h53YFL15pSJ04Zc94wdtibr26fXlC2mzRvBccEbz2kiRFD414tKMlEZbVGT33+qCoHgha81SWYsew0r1uzfNylmtpx80pngQQ91LwVk2JGvGnfvZG6YcYRAT16GFtW5kKKfo1EQLtfh5Q2etT0BIWF+aitq4fDbk+ImYo1OxvGF03waFJQvBCkvDffRyEtxQiFFYgAZTHS0zwAGD7fG5TNnYNTp8/FzvGwJOfmgG7GOx0SAKKgQgDMgKBI0NJGMEImpGDk5+WACEwEd0ywblhGUZ4Hw5OdUekRBLT7DTgdEgxACsIznx8zpmWh7k4rkpJcuHDxCul6MDsmmBXDlWCH2+XozSgBnzsNCEE4euYV4pwCpsWYPW0UHDYBKSWu1NYjENDReqtKjwn2+zvtTc1vMSTB/mvev/WEYSlASsLimcOhOBJxw+N3aP/SjefNL5GePZmpu4kG7OPr1+tOfPyUu3BecWYKcwQcDFmwFKAUo90fhKDInBCAmvqnyMgqUEagQwCoHBDc1rjv9pIlD8IbVkz6qYViIBQGTJPx4k0XpIgEZoRN1Da0cij4VfR0ta3WvBXH/rjdCufv6R2zPgPH/e4pxSBCpeatqPrjNiso203/5s/zA171Mv8+w1LOAAAAAElFTkSuQmCC">
        <img class="intLink" title="Undo" onclick="formatDoc('undo');" src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=" />
        <img class="intLink" title="Redo" onclick="formatDoc('redo');" src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==" />
        <img class="intLink" title="Remove formatting" onclick="formatDoc('removeFormat')" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg==">
        <img class="intLink" title="Bold" onclick="formatDoc('bold');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" />
        <img class="intLink" title="Italic" onclick="formatDoc('italic');" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" />
        <img class="intLink" title="Underline" onclick="formatDoc('underline');" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" />
        <img class="intLink" title="Left align" onclick="formatDoc('justifyleft');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==" />
        <img class="intLink" title="Center align" onclick="formatDoc('justifycenter');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7" />
        <img class="intLink" title="Right align" onclick="formatDoc('justifyright');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==" />
        <img class="intLink" title="Numbered list" onclick="formatDoc('insertorderedlist');" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAADljwliE35GjuaezxtHa7P///////yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKSespwjoRFvggCBUBoTFBeq6QIAysQnRHaEOzyaZ07Lu9lUBnC0UGQU1K52s6n5oEADs=" />
        <img class="intLink" title="Dotted list" onclick="formatDoc('insertunorderedlist');" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAAB1ChF9vj1iE33mOrqezxv///////yH5BAEAAAcALAAAAAAWABYAAAMyeLrc/jDKSesppNhGRlBAKIZRERBbqm6YtnbfMY7lud64UwiuKnigGQliQuWOyKQykgAAOw==" />
        <img class="intLink" title="Quote" onclick="formatDoc('formatblock','blockquote');" src="data:image/gif;base64,R0lGODlhFgAWAIQXAC1NqjFRjkBgmT9nqUJnsk9xrFJ7u2R9qmKBt1iGzHmOrm6Sz4OXw3Odz4Cl2ZSnw6KxyqO306K63bG70bTB0rDI3bvI4P///////////////////////////////////yH5BAEKAB8ALAAAAAAWABYAAAVP4CeOZGmeaKqubEs2CekkErvEI1zZuOgYFlakECEZFi0GgTGKEBATFmJAVXweVOoKEQgABB9IQDCmrLpjETrQQlhHjINrTq/b7/i8fp8PAQA7" />
        <img class="intLink" title="Delete indentation" onclick="formatDoc('outdent');" src="data:image/gif;base64,R0lGODlhFgAWAMIHAAAAADljwliE35GjuaezxtDV3NHa7P///yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKCQG9F2i7u8agQgyK1z2EIBil+TWqEMxhMczsYVJ3e4ahk+sFnAgtxSQDqWw6n5cEADs=" />
        <img class="intLink" title="Add indentation" onclick="formatDoc('indent');" src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==" />
        <img class="intLink" title="Hyperlink" onclick="var sLnk=prompt('Write the URL here','http:\/\/');if(sLnk&&sLnk!=''&&sLnk!='http://'){formatDoc('createlink',sLnk)}" src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7" />
        <img class="intLink" title="Cut" onclick="formatDoc('cut');" src="data:image/gif;base64,R0lGODlhFgAWAIQSAB1ChBFNsRJTySJYwjljwkxwl19vj1dusYODhl6MnHmOrpqbmpGjuaezxrCztcDCxL/I18rL1P///////////////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAVu4CeOZGmeaKqubDs6TNnEbGNApNG0kbGMi5trwcA9GArXh+FAfBAw5UexUDAQESkRsfhJPwaH4YsEGAAJGisRGAQY7UCC9ZAXBB+74LGCRxIEHwAHdWooDgGJcwpxDisQBQRjIgkDCVlfmZqbmiEAOw==" />
        <img class="intLink" title="Copy" onclick="formatDoc('copy');" src="data:image/gif;base64,R0lGODlhFgAWAIQcAB1ChBFNsTRLYyJYwjljwl9vj1iE31iGzF6MnHWX9HOdz5GjuYCl2YKl8ZOt4qezxqK63aK/9KPD+7DI3b/I17LM/MrL1MLY9NHa7OPs++bx/Pv8/f///////////////yH5BAEAAB8ALAAAAAAWABYAAAWG4CeOZGmeaKqubOum1SQ/kPVOW749BeVSus2CgrCxHptLBbOQxCSNCCaF1GUqwQbBd0JGJAyGJJiobE+LnCaDcXAaEoxhQACgNw0FQx9kP+wmaRgYFBQNeAoGihCAJQsCkJAKOhgXEw8BLQYciooHf5o7EA+kC40qBKkAAAGrpy+wsbKzIiEAOw==" />
        <img class="intLink" title="Paste" onclick="formatDoc('paste');" src="data:image/gif;base64,R0lGODlhFgAWAIQUAD04KTRLY2tXQF9vj414WZWIbXmOrpqbmpGjudClFaezxsa0cb/I1+3YitHa7PrkIPHvbuPs+/fvrvv8/f///////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAWN4CeOZGmeaKqubGsusPvBSyFJjVDs6nJLB0khR4AkBCmfsCGBQAoCwjF5gwquVykSFbwZE+AwIBV0GhFog2EwIDchjwRiQo9E2Fx4XD5R+B0DDAEnBXBhBhN2DgwDAQFjJYVhCQYRfgoIDGiQJAWTCQMRiwwMfgicnVcAAAMOaK+bLAOrtLUyt7i5uiUhADs=" />
        </div>
        <div class="textBox" id="titoloMostra${numero}" contenteditable="true"></div>
        <p class="editMode"><input type="checkbox" name="switchMode" class="switchBox" onchange="setDocMode(this.checked);" /> <label for="switchBox">Show HTML</label></p>
    </form>
    <p>Curatore</p>
    <input type="text" id="Curatore${numero}" name="Curatore">
    <div class="gruppo_giorni date-form">
        <p>Giorno inizo</p>
        <input type="text" class="form-control date-form" id="giornoDataInizioMostra${numero}" placeholder="Giorno (1-31)">
        <p>Mese inizo</p>
        <input type="text" class="form-control date-form" id="meseDataInizioMostra${numero}" placeholder="Mese (1-12)">
        <p>Anno inizo</p>
        <input type="text" class="form-control date-form" id="annoDataInizioMostra${numero}" placeholder="Anno (es. 2023)">
        <p>Giorno fine</p>
        <input type="text" class="form-control date-form" id="giornoDataFineMostra${numero}" placeholder="Giorno (1-31)">
        <p>Mese fine</p>
        <input type="text" class="form-control date-form" id="meseDataFineMostra${numero}" placeholder="Mese (1-12)">
        <p>Anno fine</p>
        <input type="text" class="form-control date-form" id="annoDataFineMostra${numero}" placeholder="Anno (es. 2023)">
    </div>
    <p>Logo</p>
    <input type="text" id="luogoMostra${numero}" name="Logo mostra">
    <p>Descizione</p>
    <input type="text" id="descrizioneMostra${numero}" name="Descizione mostra">
    </form>
    </div>

    `;
    var contenitore = document.getElementById('mostre');
    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento
    contenitore.insertAdjacentHTML('beforeend', codice);

    bottoneRimuovi = document.getElementById('rimuoviMostre');
    bottoneRimuovi.style.display = 'inline';

    var textAreas = document.querySelectorAll(".textBox");
    textAreas.forEach(function (textArea) {
        // Assegna la funzione initDoc direttamente all'evento di ciascuna textarea
        textArea.addEventListener('input', function () {
            initDoc(textArea);
        });
    });
    initInputValidation();

}




function rimuoviGruppoMostre() {
    var contenitore = document.getElementById('mostre');
    var formGroups = contenitore.getElementsByClassName('form-group');
    // Verifica se ci sono elementi con la classe 'form-group'
    if (formGroups.length > 0) {
        // Ottieni l'ultimo elemento con la classe 'form-group'
        var ultimoFormGroup = formGroups[formGroups.length - 1];
        // Rimuovi l'elemento dal suo genitore
        ultimoFormGroup.parentNode.removeChild(ultimoFormGroup);

        if (formGroups.length == 1) {
            // Ottieni l'ultimo elemento e rimuovilo
            bottoneRimuovi = document.getElementById('rimuoviMostre');
            bottoneRimuovi.style.display = 'none';
        }
    }
    else {
        console.log("Nessun elemento con la classe 'form-group' trovato.");
    }
}



///////////////////////
///////////////////////

// LOGICA PER LE BIBLIOGRAFIE

///////////////////////
///////////////////////



function aggiungiGruppoBibliografie() {
    var numero = document.getElementById('bibliografie').getElementsByClassName('formBibliografia').length;
    numero = numero + 1;


    var codice = `
    
        <form name="compForm" class="formBibliografia">
        <input type="hidden" name="myDoc">
        <div class="toolBar1">
            <select
                onchange="formatDoc('formatblock',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option selected>- formatting -</option>
                <option value="h1">Title 1 &lt;h1&gt;</option>
                <option value="h2">Title 2 &lt;h2&gt;</option>
                <option value="h3">Title 3 &lt;h3&gt;</option>
                <option value="h4">Title 4 &lt;h4&gt;</option>
                <option value="h5">Title 5 &lt;h5&gt;</option>
                <option value="h6">Subtitle &lt;h6&gt;</option>
                <option value="p">Paragraph &lt;p&gt;</option>
                <option value="pre">Preformatted &lt;pre&gt;</option>
            </select>
            <select
                onchange="formatDoc('fontname',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- font -</option>
                <option>Arial</option>
                <option>Arial Black</option>
                <option>Courier New</option>
                <option>Times New Roman</option>
            </select>
            <select
                onchange="formatDoc('fontsize',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- size -</option>
                <option value="1">Very small</option>
                <option value="2">A bit small</option>
                <option value="3">Normal</option>
                <option value="4">Medium-large</option>
                <option value="5">Big</option>
                <option value="6">Very big</option>
                <option value="7">Maximum</option>
            </select>
            <select
                onchange="formatDoc('forecolor',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- color -</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="black">Black</option>
            </select>
            <select
                onchange="formatDoc('backcolor',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- background -</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="black">Black</option>
            </select>
        </div>
        <div class="toolBar2">
            <img class="intLink" title="Clean"
                onclick="if(validateMode()&&confirm('Are you sure?')){oDoc.innerHTML=sDefTxt};"
                src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7" />
            <img class="intLink" title="Print" onclick="printDoc();"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oEBxcZFmGboiwAAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUOMvtlUtsjFEUx//n3nn0YdpBh1abRpt4LFqtqkc3jRKkNEIsiIRIBBEhJJpKlIVo4m1RRMKKjQiRMJRUqUdKPT71qpIpiRKPaqdF55tv5vvusZjQTjOlseUkd3Xu/3dPzusC/22wtu2wRn+jG5So/OCDh8ycMJDflehMlkJkVK7KUYN+ufzA/RttH76zaVocDptRxzQtNi3mRWuPc+6cKtlXZ/sddP2uu9uXlmYXZ6Qm8v4Tz8lhF1H+zDQXt7S8oLMXtbF4e8QaFHjj3kbP2MzkktHpiTjp9VH6iHiA+whtAsX5brpwueMGdONdf/2A4M7ukDs1JW662+XkqTkeUoqjKtOjm2h53YFL15pSJ04Zc94wdtibr26fXlC2mzRvBccEbz2kiRFD414tKMlEZbVGT33+qCoHgha81SWYsew0r1uzfNylmtpx80pngQQ91LwVk2JGvGnfvZG6YcYRAT16GFtW5kKKfo1EQLtfh5Q2etT0BIWF+aitq4fDbk+ImYo1OxvGF03waFJQvBCkvDffRyEtxQiFFYgAZTHS0zwAGD7fG5TNnYNTp8/FzvGwJOfmgG7GOx0SAKKgQgDMgKBI0NJGMEImpGDk5+WACEwEd0ywblhGUZ4Hw5OdUekRBLT7DTgdEgxACsIznx8zpmWh7k4rkpJcuHDxCul6MDsmmBXDlWCH2+XozSgBnzsNCEE4euYV4pwCpsWYPW0UHDYBKSWu1NYjENDReqtKjwn2+zvtTc1vMSTB/mvev/WEYSlASsLimcOhOBJxw+N3aP/SjefNL5GePZmpu4kG7OPr1+tOfPyUu3BecWYKcwQcDFmwFKAUo90fhKDInBCAmvqnyMgqUEagQwCoHBDc1rjv9pIlD8IbVkz6qYViIBQGTJPx4k0XpIgEZoRN1Da0cij4VfR0ta3WvBXH/rjdCufv6R2zPgPH/e4pxSBCpeatqPrjNiso203/5s/zA171Mv8+w1LOAAAAAElFTkSuQmCC">
            <img class="intLink" title="Undo" onclick="formatDoc('undo');"
                src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=" />
            <img class="intLink" title="Redo" onclick="formatDoc('redo');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==" />
            <img class="intLink" title="Remove formatting" onclick="formatDoc('removeFormat')"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg==">
            <img class="intLink" title="Bold" onclick="formatDoc('bold');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" />
            <img class="intLink" title="Italic" onclick="formatDoc('italic');"
                src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" />
            <img class="intLink" title="Underline" onclick="formatDoc('underline');"
                src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" />
            <img class="intLink" title="Left align" onclick="formatDoc('justifyleft');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==" />
            <img class="intLink" title="Center align" onclick="formatDoc('justifycenter');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7" />
            <img class="intLink" title="Right align" onclick="formatDoc('justifyright');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==" />
            <img class="intLink" title="Numbered list" onclick="formatDoc('insertorderedlist');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAADljwliE35GjuaezxtHa7P///////yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKSespwjoRFvggCBUBoTFBeq6QIAysQnRHaEOzyaZ07Lu9lUBnC0UGQU1K52s6n5oEADs=" />
            <img class="intLink" title="Dotted list" onclick="formatDoc('insertunorderedlist');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAAB1ChF9vj1iE33mOrqezxv///////yH5BAEAAAcALAAAAAAWABYAAAMyeLrc/jDKSesppNhGRlBAKIZRERBbqm6YtnbfMY7lud64UwiuKnigGQliQuWOyKQykgAAOw==" />
            <img class="intLink" title="Quote" onclick="formatDoc('formatblock','blockquote');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQXAC1NqjFRjkBgmT9nqUJnsk9xrFJ7u2R9qmKBt1iGzHmOrm6Sz4OXw3Odz4Cl2ZSnw6KxyqO306K63bG70bTB0rDI3bvI4P///////////////////////////////////yH5BAEKAB8ALAAAAAAWABYAAAVP4CeOZGmeaKqubEs2CekkErvEI1zZuOgYFlakECEZFi0GgTGKEBATFmJAVXweVOoKEQgABB9IQDCmrLpjETrQQlhHjINrTq/b7/i8fp8PAQA7" />
            <img class="intLink" title="Delete indentation" onclick="formatDoc('outdent');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIHAAAAADljwliE35GjuaezxtDV3NHa7P///yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKCQG9F2i7u8agQgyK1z2EIBil+TWqEMxhMczsYVJ3e4ahk+sFnAgtxSQDqWw6n5cEADs=" />
            <img class="intLink" title="Add indentation" onclick="formatDoc('indent');"
                src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==" />
            <img class="intLink" title="Hyperlink"
                onclick="var sLnk=prompt('Write the URL here','http:\/\/');if(sLnk&&sLnk!=''&&sLnk!='http://'){formatDoc('createlink',sLnk)}"
                src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7" />
            <img class="intLink" title="Cut" onclick="formatDoc('cut');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQSAB1ChBFNsRJTySJYwjljwkxwl19vj1dusYODhl6MnHmOrpqbmpGjuaezxrCztcDCxL/I18rL1P///////////////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAVu4CeOZGmeaKqubDs6TNnEbGNApNG0kbGMi5trwcA9GArXh+FAfBAw5UexUDAQESkRsfhJPwaH4YsEGAAJGisRGAQY7UCC9ZAXBB+74LGCRxIEHwAHdWooDgGJcwpxDisQBQRjIgkDCVlfmZqbmiEAOw==" />
            <img class="intLink" title="Copy" onclick="formatDoc('copy');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQcAB1ChBFNsTRLYyJYwjljwl9vj1iE31iGzF6MnHWX9HOdz5GjuYCl2YKl8ZOt4qezxqK63aK/9KPD+7DI3b/I17LM/MrL1MLY9NHa7OPs++bx/Pv8/f///////////////yH5BAEAAB8ALAAAAAAWABYAAAWG4CeOZGmeaKqubOum1SQ/kPVOW749BeVSus2CgrCxHptLBbOQxCSNCCaF1GUqwQbBd0JGJAyGJJiobE+LnCaDcXAaEoxhQACgNw0FQx9kP+wmaRgYFBQNeAoGihCAJQsCkJAKOhgXEw8BLQYciooHf5o7EA+kC40qBKkAAAGrpy+wsbKzIiEAOw==" />
            <img class="intLink" title="Paste" onclick="formatDoc('paste');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQUAD04KTRLY2tXQF9vj414WZWIbXmOrpqbmpGjudClFaezxsa0cb/I1+3YitHa7PrkIPHvbuPs+/fvrvv8/f///////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAWN4CeOZGmeaKqubGsusPvBSyFJjVDs6nJLB0khR4AkBCmfsCGBQAoCwjF5gwquVykSFbwZE+AwIBV0GhFog2EwIDchjwRiQo9E2Fx4XD5R+B0DDAEnBXBhBhN2DgwDAQFjJYVhCQYRfgoIDGiQJAWTCQMRiwwMfgicnVcAAAMOaK+bLAOrtLUyt7i5uiUhADs=" />
        </div>
        <div class="textBox" id="bibliografia${numero}" contenteditable="true"></div>
        <p class="editMode"><input type="checkbox" name="switchMode" class="switchBox"
                onchange="setDocMode(this.checked);" /> <label for="switchBox">Show HTML</label>
        </p>
    </form>
`;

    var contenitore = document.getElementById('bibliografie');
    // Aggiungo il nuovo codice HTML al fondo del primo elemento
    contenitore.insertAdjacentHTML('beforeend', codice);

    bottoneRimuovi = document.getElementById('rimuoviBibliografie');
    bottoneRimuovi.style.display = 'inline';

    var textAreas = document.querySelectorAll(".textBox");
    textAreas.forEach(function (textArea) {
        // Assegna la funzione initDoc direttamente all'evento di ciascuna textarea
        textArea.addEventListener('input', function () {
            initDoc(textArea);
        });
    });


}




function rimuoviGruppoBibliografie() {
    var contenitore = document.getElementById('bibliografie');
    var formGroups = contenitore.getElementsByClassName('formBibliografia');
    // Verifica se ci sono elementi con la classe 'form-group'
    if (formGroups.length > 0) {
        // Ottieni l'ultimo elemento con la classe 'form-group'
        var ultimoFormGroup = formGroups[formGroups.length - 1];
        // Rimuovi l'elemento dal suo genitore
        ultimoFormGroup.parentNode.removeChild(ultimoFormGroup);
        if (formGroups.length == 1) {
            // Ottieni l'ultimo elemento e rimuovilo
            bottoneRimuovi = document.getElementById('rimuoviBibliografie');
            bottoneRimuovi.style.display = 'none';
        }
    }
    else {
        console.log("Nessun elemento con la classe 'form-group' trovato.");
    }
}






///////////////////////
///////////////////////

// LOGICA PER LE ALTRE BIBLIOGRAFIE

///////////////////////
///////////////////////



function aggiungiGruppoAltreBibliografie() {
    var numero = document.getElementById('altreBibliografie').getElementsByClassName('formAltraBibliografia').length;
    numero = numero + 1;


    var codice = `
    
        <form name="compForm" class="formAltraBibliografia">
        <input type="hidden" name="myDoc">
        <div class="toolBar1">
            <select
                onchange="formatDoc('formatblock',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option selected>- formatting -</option>
                <option value="h1">Title 1 &lt;h1&gt;</option>
                <option value="h2">Title 2 &lt;h2&gt;</option>
                <option value="h3">Title 3 &lt;h3&gt;</option>
                <option value="h4">Title 4 &lt;h4&gt;</option>
                <option value="h5">Title 5 &lt;h5&gt;</option>
                <option value="h6">Subtitle &lt;h6&gt;</option>
                <option value="p">Paragraph &lt;p&gt;</option>
                <option value="pre">Preformatted &lt;pre&gt;</option>
            </select>
            <select
                onchange="formatDoc('fontname',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- font -</option>
                <option>Arial</option>
                <option>Arial Black</option>
                <option>Courier New</option>
                <option>Times New Roman</option>
            </select>
            <select
                onchange="formatDoc('fontsize',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- size -</option>
                <option value="1">Very small</option>
                <option value="2">A bit small</option>
                <option value="3">Normal</option>
                <option value="4">Medium-large</option>
                <option value="5">Big</option>
                <option value="6">Very big</option>
                <option value="7">Maximum</option>
            </select>
            <select
                onchange="formatDoc('forecolor',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- color -</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="black">Black</option>
            </select>
            <select
                onchange="formatDoc('backcolor',this[this.selectedIndex].value);this.selectedIndex=0;">
                <option class="heading" selected>- background -</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="black">Black</option>
            </select>
        </div>
        <div class="toolBar2">
            <img class="intLink" title="Clean"
                onclick="if(validateMode()&&confirm('Are you sure?')){oDoc.innerHTML=sDefTxt};"
                src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7" />
            <img class="intLink" title="Print" onclick="printDoc();"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oEBxcZFmGboiwAAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUOMvtlUtsjFEUx//n3nn0YdpBh1abRpt4LFqtqkc3jRKkNEIsiIRIBBEhJJpKlIVo4m1RRMKKjQiRMJRUqUdKPT71qpIpiRKPaqdF55tv5vvusZjQTjOlseUkd3Xu/3dPzusC/22wtu2wRn+jG5So/OCDh8ycMJDflehMlkJkVK7KUYN+ufzA/RttH76zaVocDptRxzQtNi3mRWuPc+6cKtlXZ/sddP2uu9uXlmYXZ6Qm8v4Tz8lhF1H+zDQXt7S8oLMXtbF4e8QaFHjj3kbP2MzkktHpiTjp9VH6iHiA+whtAsX5brpwueMGdONdf/2A4M7ukDs1JW662+XkqTkeUoqjKtOjm2h53YFL15pSJ04Zc94wdtibr26fXlC2mzRvBccEbz2kiRFD414tKMlEZbVGT33+qCoHgha81SWYsew0r1uzfNylmtpx80pngQQ91LwVk2JGvGnfvZG6YcYRAT16GFtW5kKKfo1EQLtfh5Q2etT0BIWF+aitq4fDbk+ImYo1OxvGF03waFJQvBCkvDffRyEtxQiFFYgAZTHS0zwAGD7fG5TNnYNTp8/FzvGwJOfmgG7GOx0SAKKgQgDMgKBI0NJGMEImpGDk5+WACEwEd0ywblhGUZ4Hw5OdUekRBLT7DTgdEgxACsIznx8zpmWh7k4rkpJcuHDxCul6MDsmmBXDlWCH2+XozSgBnzsNCEE4euYV4pwCpsWYPW0UHDYBKSWu1NYjENDReqtKjwn2+zvtTc1vMSTB/mvev/WEYSlASsLimcOhOBJxw+N3aP/SjefNL5GePZmpu4kG7OPr1+tOfPyUu3BecWYKcwQcDFmwFKAUo90fhKDInBCAmvqnyMgqUEagQwCoHBDc1rjv9pIlD8IbVkz6qYViIBQGTJPx4k0XpIgEZoRN1Da0cij4VfR0ta3WvBXH/rjdCufv6R2zPgPH/e4pxSBCpeatqPrjNiso203/5s/zA171Mv8+w1LOAAAAAElFTkSuQmCC">
            <img class="intLink" title="Undo" onclick="formatDoc('undo');"
                src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=" />
            <img class="intLink" title="Redo" onclick="formatDoc('redo');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==" />
            <img class="intLink" title="Remove formatting" onclick="formatDoc('removeFormat')"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg==">
            <img class="intLink" title="Bold" onclick="formatDoc('bold');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" />
            <img class="intLink" title="Italic" onclick="formatDoc('italic');"
                src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" />
            <img class="intLink" title="Underline" onclick="formatDoc('underline');"
                src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" />
            <img class="intLink" title="Left align" onclick="formatDoc('justifyleft');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==" />
            <img class="intLink" title="Center align" onclick="formatDoc('justifycenter');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7" />
            <img class="intLink" title="Right align" onclick="formatDoc('justifyright');"
                src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==" />
            <img class="intLink" title="Numbered list" onclick="formatDoc('insertorderedlist');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAADljwliE35GjuaezxtHa7P///////yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKSespwjoRFvggCBUBoTFBeq6QIAysQnRHaEOzyaZ07Lu9lUBnC0UGQU1K52s6n5oEADs=" />
            <img class="intLink" title="Dotted list" onclick="formatDoc('insertunorderedlist');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAAB1ChF9vj1iE33mOrqezxv///////yH5BAEAAAcALAAAAAAWABYAAAMyeLrc/jDKSesppNhGRlBAKIZRERBbqm6YtnbfMY7lud64UwiuKnigGQliQuWOyKQykgAAOw==" />
            <img class="intLink" title="Quote" onclick="formatDoc('formatblock','blockquote');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQXAC1NqjFRjkBgmT9nqUJnsk9xrFJ7u2R9qmKBt1iGzHmOrm6Sz4OXw3Odz4Cl2ZSnw6KxyqO306K63bG70bTB0rDI3bvI4P///////////////////////////////////yH5BAEKAB8ALAAAAAAWABYAAAVP4CeOZGmeaKqubEs2CekkErvEI1zZuOgYFlakECEZFi0GgTGKEBATFmJAVXweVOoKEQgABB9IQDCmrLpjETrQQlhHjINrTq/b7/i8fp8PAQA7" />
            <img class="intLink" title="Delete indentation" onclick="formatDoc('outdent');"
                src="data:image/gif;base64,R0lGODlhFgAWAMIHAAAAADljwliE35GjuaezxtDV3NHa7P///yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKCQG9F2i7u8agQgyK1z2EIBil+TWqEMxhMczsYVJ3e4ahk+sFnAgtxSQDqWw6n5cEADs=" />
            <img class="intLink" title="Add indentation" onclick="formatDoc('indent');"
                src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==" />
            <img class="intLink" title="Hyperlink"
                onclick="var sLnk=prompt('Write the URL here','http:\/\/');if(sLnk&&sLnk!=''&&sLnk!='http://'){formatDoc('createlink',sLnk)}"
                src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7" />
            <img class="intLink" title="Cut" onclick="formatDoc('cut');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQSAB1ChBFNsRJTySJYwjljwkxwl19vj1dusYODhl6MnHmOrpqbmpGjuaezxrCztcDCxL/I18rL1P///////////////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAVu4CeOZGmeaKqubDs6TNnEbGNApNG0kbGMi5trwcA9GArXh+FAfBAw5UexUDAQESkRsfhJPwaH4YsEGAAJGisRGAQY7UCC9ZAXBB+74LGCRxIEHwAHdWooDgGJcwpxDisQBQRjIgkDCVlfmZqbmiEAOw==" />
            <img class="intLink" title="Copy" onclick="formatDoc('copy');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQcAB1ChBFNsTRLYyJYwjljwl9vj1iE31iGzF6MnHWX9HOdz5GjuYCl2YKl8ZOt4qezxqK63aK/9KPD+7DI3b/I17LM/MrL1MLY9NHa7OPs++bx/Pv8/f///////////////yH5BAEAAB8ALAAAAAAWABYAAAWG4CeOZGmeaKqubOum1SQ/kPVOW749BeVSus2CgrCxHptLBbOQxCSNCCaF1GUqwQbBd0JGJAyGJJiobE+LnCaDcXAaEoxhQACgNw0FQx9kP+wmaRgYFBQNeAoGihCAJQsCkJAKOhgXEw8BLQYciooHf5o7EA+kC40qBKkAAAGrpy+wsbKzIiEAOw==" />
            <img class="intLink" title="Paste" onclick="formatDoc('paste');"
                src="data:image/gif;base64,R0lGODlhFgAWAIQUAD04KTRLY2tXQF9vj414WZWIbXmOrpqbmpGjudClFaezxsa0cb/I1+3YitHa7PrkIPHvbuPs+/fvrvv8/f///////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAWN4CeOZGmeaKqubGsusPvBSyFJjVDs6nJLB0khR4AkBCmfsCGBQAoCwjF5gwquVykSFbwZE+AwIBV0GhFog2EwIDchjwRiQo9E2Fx4XD5R+B0DDAEnBXBhBhN2DgwDAQFjJYVhCQYRfgoIDGiQJAWTCQMRiwwMfgicnVcAAAMOaK+bLAOrtLUyt7i5uiUhADs=" />
        </div>
        <div class="textBox" id="altrabibliografia${numero}" contenteditable="true"></div>
        <p class="editMode"><input type="checkbox" name="switchMode" class="switchBox"
                onchange="setDocMode(this.checked);" /> <label for="switchBox">Show HTML</label>
        </p>
    </form>
`;

    var contenitore = document.getElementById('altreBibliografie');
    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento
    contenitore.insertAdjacentHTML('beforeend', codice);

    bottoneRimuovi = document.getElementById('rimuoviAltreBibliografie');
    bottoneRimuovi.style.display = 'inline';

    var textAreas = document.querySelectorAll(".textBox");
    textAreas.forEach(function (textArea) {
        // Assegna la funzione initDoc direttamente all'evento di ciascuna textarea
        textArea.addEventListener('input', function () {
            initDoc(textArea);
        });
    });


}




function rimuoviGruppoAltreBibliografie() {
    var contenitore = document.getElementById('altreBibliografie');
    var formGroups = contenitore.getElementsByClassName('formAltraBibliografia');
    // Verifica se ci sono elementi con la classe 'form-group'
    if (formGroups.length > 0) {
        // Ottieni l'ultimo elemento con la classe 'form-group'
        var ultimoFormGroup = formGroups[formGroups.length - 1];
        // Rimuovi l'elemento dal suo genitore
        ultimoFormGroup.parentNode.removeChild(ultimoFormGroup);
        if (formGroups.length == 1) {
            // Ottieni l'ultimo elemento e rimuovilo
            bottoneRimuovi = document.getElementById('rimuoviAltreBibliografie');
            bottoneRimuovi.style.display = 'none';
        }
    }
    else {
        console.log("Nessun elemento con la classe 'form-group' trovato.");
    }
}


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// LOGICA PER LE IMMAGINI

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////


function aggiungiGruppoImmagini() {
    var numero = document.getElementById('immagini').getElementsByClassName('form-group').length;
    numero = numero + 1;


    var codice = `
    
        <div class="form-group">
        <p>Didascalia</p>
        <input type="text" id="immaginiInput${numero}" name="immagini">
        <br><br>
        <p>Immagine</p>
        <form id='immaginiFoto${numero}'>
            <input type="file" id="img" name="img" accept="image/*">
        </form>
        </div>
        `;
    var contenitore = document.getElementById('immagini');
    var bottoneRimuovi = document.getElementById('rimuoviImmagini');

    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento
    contenitore.insertAdjacentHTML('beforeend', codice);

    // Visualizzo il bottone di rimozione
    bottoneRimuovi.style.display = 'inline';

}




function rimuoviGruppoImmagini() {
    var contenitore = document.getElementById('immagini');
    var formGroups = contenitore.getElementsByClassName('form-group');
    // Verifica se ci sono elementi con la classe 'form-group'
    if (formGroups.length > 0) {
        // Ottieni l'ultimo elemento con la classe 'form-group'
        var ultimoFormGroup = formGroups[formGroups.length - 1];
        // Rimuovi l'elemento dal suo genitore
        ultimoFormGroup.parentNode.removeChild(ultimoFormGroup);
        if (formGroups.length == 1) {
            // Ottieni l'ultimo elemento e rimuovilo
            bottoneRimuovi = document.getElementById('rimuoviImmagini');
            bottoneRimuovi.style.display = 'none';
        }
    }
    else {
        console.log("Nessun elemento con la classe 'form-group' trovato.");
    }
}


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

// LOGICA PER AUTORI

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////





function aggiungiGruppoAutori() {
    var numero = document.getElementById('textboxContainerAutori').getElementsByClassName('form-group').length;
    numero = numero + 1;


    var codice = `
    <div class="form-group" id="groupAutori${numero}">
        <p>Nome</p>
        <input type="text" id="Nome${numero}" name="Nome">
        <p>Formula precedente</p>
        <input type="text" id="Formula_precedente${numero}" name="Formula precedente">
        <p>Formula successiva</p>
        <input type="text" id="Formula_successiva${numero}" name="Formula successiva">
        <p>Categoria</p>
        <select name="Categoria" id="Categoria${numero}">
            <option></option>
            <option value="Opera firmata">Opera firmata</option>
            <option value="Opera attribuita">Opera attribuita</option>
            <option value="Opera documentata">Opera documentata</option>
        </select>
        <p>Seleziona preesistente</p>
        <select name="autoriSelect${numero}" id="autoriSelect${numero}" onchange="handleSelectChange(this)">
            ${document.getElementById("autoriSelect1").innerHTML}
        </select>
    </div>
`;
    var contenitore = document.getElementById('textboxContainerAutori');
    var bottoneRimuovi = document.getElementById('rimuoviAutori');

    // Aggiungo il nuovo codice HTML dopo l'ultimo elemento
    contenitore.insertAdjacentHTML('beforeend', codice);

    // Visualizzo il bottone di rimozione
    bottoneRimuovi.style.display = 'inline';

}



function rimuoviGruppoAutori() {
    var contenitore = document.getElementById('textboxContainerAutori');
    var formGroups = contenitore.getElementsByClassName('form-group');
    // Verifica se ci sono elementi con la classe 'form-group'
    if (formGroups.length > 0) {
        // Ottieni l'ultimo elemento con la classe 'form-group'
        var ultimoFormGroup = formGroups[formGroups.length - 1];
        // Rimuovi l'elemento dal suo genitore
        ultimoFormGroup.parentNode.removeChild(ultimoFormGroup);
        if (formGroups.length == 1) {
            // Ottieni l'ultimo elemento e rimuovilo
            bottoneRimuovi = document.getElementById('rimuoviAutori');
            bottoneRimuovi.style.display = 'none';
        }
    }
    else {
        console.log("Nessun elemento con la classe 'form-group' trovato.");
    }
}



/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////



/////////// LOGICA PER L'INVIO DEI DATI (CHIAMATA POST) /////////////



/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////



async function gatherData() {
    try {
        var formData = {};

        // Itera attraverso i form degli autori
        var numAutoriForms = document.querySelectorAll('[id^="groupAutori"]').length;
        for (var i = 1; i <= numAutoriForms; i++) {
            var nome = document.getElementById("Nome" + i).value ? document.getElementById("Nome" + i).value : "";
            var formulaPrecedente = document.getElementById("Formula_precedente" + i).value ? document.getElementById("Formula_precedente" + i).value : "";
            var formulaSuccessiva = document.getElementById("Formula_successiva" + i).value ? document.getElementById("Formula_successiva" + i).value : "";
            var categoria = document.getElementById("Categoria" + i).value ? document.getElementById("Categoria" + i).value : "";
            var autoriSelect = document.getElementById("autoriSelect" + i).value;


            // Aggiungi dati del form degli autori all'oggetto formData
            formData["NomeAutore" + i] = nome;
            formData["Formula_precedente" + i] = formulaPrecedente;
            formData["Formula_successiva" + i] = formulaSuccessiva;
            formData["Categoria" + i] = categoria;
            formData["AutorePreesistente" + i] = autoriSelect
            // Controlla se autoriSelect è un oggetto JSON valido
            if (autoriSelect.length > 0) {
                try {
                    var autoriData = JSON.parse(autoriSelect);

                    // Sovrascrivi i campi del formData se autoriData contiene valori validi
                    if (autoriData && typeof autoriData === 'object') {
                        formData["NomeAutore" + i] = autoriData.nome ? autoriData.nome : '';
                        formData["Formula_precedente" + i] = autoriData.formula_precedente ? autoriData.formula_precedente : '';
                        formData["Formula_successiva" + i] = autoriData.formula_successiva ? autoriData.formula_successiva : '';
                        formData["Categoria" + i] = autoriData.categoria ? autoriData.categoria : '';
                    }
                } catch (error) {
                    // Gestisci l'errore se l'analisi JSON fallisce
                    console.error("Errore nell'analisi JSON di autori: " + error);
                }
            }
        }

        // Itera attraverso i form dei materiali
        var numMaterialiForms = document.querySelectorAll('[id^="materiali-group"]').length;
        for (var i = 1; i <= numMaterialiForms; i++) {
            var materiale = document.getElementById("materiale" + i).value ? document.getElementById("materiale" + i).value : "";
            var materialiSelect = document.getElementById("materialiSelect" + i).value;;
            if (materialiSelect.length > 0) {
                formData["Materiale" + i] = materialiSelect
            }
        }

        // Itera attraverso i form delle tecniche
        var numTecnicheForms = document.querySelectorAll('[id^="tecniche-group"]').length;
        for (var i = 1; i <= numTecnicheForms; i++) {
            var tecnica = document.getElementById("Tecnica" + i).value ? document.getElementById("Tecnica" + i).value : "";
            var tecnicaSelect = document.getElementById("tecnicheSelect" + i).value;
            formData["Tecnica" + i] = tecnica
            if( tecnicaSelect.length > 0 ) {
                formData["Tecnica" + i] = tecnica
            }
        }

        // Itera attraverso i form delle misure
        var numGruppoMisure = document.querySelectorAll('[id^="gruppoMisure"]').length;
        for (var i = 1; i <= numGruppoMisure; i++) {
            var titoloMisure = document.getElementById("Titolo" + i).value ? document.getElementById("Titolo" + i).value : "";
            var interoParziale = document.getElementById("Intero-Parziale" + i).value ? document.getElementById("Intero-Parziale" + i).value : "";

            // Aggiungi dati del form delle misure all'oggetto formData
            formData["TitoloMisure" + i] = titoloMisure;
            formData["InteroParziale" + i] = interoParziale;

            // Itera attraverso i form delle singole misure all'interno del gruppo
            var numMisureForms = document.querySelectorAll('[id^="misureGroup' + i + '"]').length;
            for (var j = 1; j <= numMisureForms; j++) {
                var direzione = document.getElementById("Direzione" + i + j).value;
                var tipo = document.getElementById("Tipo" + i + j).value;
                var valore = document.getElementById("Valore" + i + j).value ? document.getElementById("Valore" + i + j).value : "";
                var unita = document.getElementById("Unita" + i + j).value;

                // Aggiungi dati della misura all'oggetto formData
                formData["Direzione" + i + j] = direzione;
                formData["Tipo" + i + j] = tipo;
                formData["Valore" + i + j] = valore;
                formData["Unita" + i + j] = unita;
            }
        }

        // Itera attraverso i form delle provenienze
        var numProvenienzeForms = document.querySelectorAll('[id^="provenienze-group"]').length;
        for (var i = 1; i <= numProvenienzeForms; i++) {
            var provenienza = document.getElementById("Provenienza" + i).value ? document.getElementById("Provenienza" + i).value : "";
            var descrizioneProvenienza = document.getElementById("DescrizioneProvenienza" + i).value ? document.getElementById("DescrizioneProvenienza" + i).value : "";
            var noteProvenienza = document.getElementById("NoteProvenienza" + i).value ? document.getElementById("NoteProvenienza" + i).value : "";

            // Aggiungi dati del form delle provenienze all'oggetto formData
            formData["Provenienza" + i] = provenienza;
            formData["DescrizioneProvenienza" + i] = descrizioneProvenienza;
            formData["NoteProvenienza" + i] = noteProvenienza;
        }

        formData["iscrizioni"] = document.getElementById("iscrizioni").innerHTML ? document.getElementById("iscrizioni").innerHTML : "";
        formData["storia_espositiva"] = document.getElementById("storia_espositiva").innerHTML ? document.getElementById("storia_espositiva").innerHTML : "";
        formData["descrizione_sintetica"] = document.getElementById("descrizione_sintetica").innerHTML ? document.getElementById("descrizione_sintetica").innerHTML : "";
        formData["corpo_scheda"] = document.getElementById("corpo_scheda").innerHTML ? document.getElementById("corpo_scheda").innerHTML : "";



        // Itera attraverso i form delle mostre
        var numMostreForms = document.querySelectorAll('[id^="mostre-group"]').length;
        for (var i = 1; i <= numMostreForms; i++) {
            // Ottieni i dati del contenuto modificabile (HTML)
            var titoloMostra = document.getElementById("titoloMostra" + i).innerHTML;

            // Aggiungi dati del contenuto HTML del form delle mostre all'oggetto formData
            formData["TitoloMostra" + i] = titoloMostra;

            // Altri dati delle mostre
            var curatore = document.getElementById("Curatore" + i).value ? document.getElementById("Curatore" + i).value : "";
            var giornoInizio = document.getElementById("giornoDataInizioMostra" + i).value ? document.getElementById("giornoDataInizioMostra" + i).value : "";
            var meseInizio = document.getElementById("meseDataInizioMostra" + i).value ? document.getElementById("meseDataInizioMostra" + i).value : "";
            var annoInizio = document.getElementById("annoDataInizioMostra" + i).value ? document.getElementById("annoDataInizioMostra" + i).value : "";
            var giornoFine = document.getElementById("giornoDataFineMostra" + i).value ? document.getElementById("giornoDataFineMostra" + i).value : "";
            var meseFine = document.getElementById("meseDataFineMostra" + i).value ? document.getElementById("meseDataFineMostra" + i).value : "";
            var annoFine = document.getElementById("annoDataFineMostra" + i).value ? document.getElementById("annoDataFineMostra" + i).value : "";
            var luogoMostra = document.getElementById("luogoMostra" + i).value ? document.getElementById("luogoMostra" + i).value : "";
            var descrizioneMostra = document.getElementById("descrizioneMostra" + i).value ? document.getElementById("descrizioneMostra" + i).value : "";

            // Aggiungi altri dati delle mostre all'oggetto formData
            formData["Curatore" + i] = curatore;
            formData["GiornoInizioMostra" + i] = giornoInizio;
            formData["MeseInizioMostra" + i] = meseInizio;
            formData["AnnoInizioMostra" + i] = annoInizio;
            formData["GiornoFineMostra" + i] = giornoFine;
            formData["MeseFineMostra" + i] = meseFine;
            formData["AnnoFineMostra" + i] = annoFine;
            formData["LuogoMostra" + i] = luogoMostra;
            formData["DescrizioneMostra" + i] = descrizioneMostra;
        }

        var numGruppoBibliografie = document.querySelectorAll('.formBibliografia').length;
        for (var i = 1; i <= numGruppoBibliografie; i++) {
            var bibliografiaContent = document.getElementById("bibliografia" + i).innerHTML;

            // Aggiungi dati del form della bibliografia all'oggetto formData
            formData["bibliografia" + i] = bibliografiaContent;
        }

        var numGruppoAltreBibliografie = document.querySelectorAll('.altreBibliografie').length;
        for (var i = 1; i <= numGruppoAltreBibliografie; i++) {
            var altraBibliografiaContent = document.getElementById("altrabibliografia" + i).innerHTML ? document.getElementById("altrabibliografia" + i).innerHTML : "";

            // Aggiungi dati del form della bibliografia all'oggetto formData
            formData["altraBibliografia" + i] = altraBibliografiaContent;
        }



        formData["titolo_opera"] = document.getElementById("titolo").innerText ? document.getElementById("titolo").innerText : "";
        formData["etichetta_data"] = document.getElementById('etichetta_data').value ? document.getElementById("etichetta_data").value : "";
        formData["giorno_data_da"] = document.getElementById('giorno_data_da').value ? document.getElementById("giorno_data_da").value : "";
        formData["mese_data_da"] = document.getElementById('mese_data_da').value ? document.getElementById("mese_data_da").value : "";
        formData["giorno_data_a"] = document.getElementById('giorno_data_a').value ? document.getElementById("giorno_data_a").value : "";
        formData["mese_data_a"] = document.getElementById('mese_data_a').value ? document.getElementById("mese_data_a").value : "";
        formData["anno_data_a"] = document.getElementById('anno_data_a').value ? document.getElementById("anno_data_a").value : "";
        formData["anno_data_da"] = document.getElementById('anno_data_da').value ? document.getElementById("anno_data_da").value : "";

        // Verifica che anno_data_a esista e non sia una stringa vuota prima di applicare l'ambito_storico
        if (formData["anno_data_a"]) {
            // Verifica l'ambito_storico per l'anno_data_a
            if (document.getElementById('avanti_a').checked) {
                formData["anno_data_a"] = "-" + formData["anno_data_a"];
            }
        }

        // Verifica che anno_data_da esista e non sia una stringa vuota prima di applicare l'ambito_storico
        if (formData["anno_data_da"]) {
            // Verifica l'ambito_storico per l'anno_data_da
            if (document.getElementById('avanti_data_da').checked) {
                formData["anno_data_da"] = "-" + formData["anno_data_da"];
            }
        }


        formData["ambito"] = document.getElementById('ambitoInput').value ? document.getElementById("ambitoInput").value : "";

        formData["ubicazione"] = document.getElementById('ubicazione').value ? document.getElementById("ubicazione").value : "";
        formData["descrizione"] = document.getElementById('descrizione').value ? document.getElementById("descrizione").value : "";

        formData["inventario"] = document.getElementById('inventariInput').value ? document.getElementById("inventariInput").value : "";

        formData["giuridica"] = document.getElementById('giuridicaInput').value ? document.getElementById("giuridicaInput").value : "";

        var classificazione = document.getElementById("classificazione");
        formData['classificazione'] = classificazione.selectedIndex !== 0 ? classificazione.value : '';

        formData["commento"] = document.getElementById("commentoInput").value ? document.getElementById("commentoInput").value : "";
        formData["documentazioneFotografica"] = document.getElementById("documentazioneFotografica").innerHTML ? document.getElementById("documentazioneFotografica").innerHTML : "";




        // Logica pre prendere le fotoo
        const formGroupsFoto = document.querySelectorAll('#immagini .form-group');

        // Per ogni elemento con classe "form-group"
        for (let i = 0; i < formGroupsFoto.length; i++) {
            const formGroup = formGroupsFoto[i];
            // Ottieni la descrizione dall'input di testo all'interno dell'elemento
            const description = formGroup.querySelector('input[type="text"]').value;

            // Ottieni l'immagine dall'elemento form all'interno dell'elemento
            const imageInput = formGroup.querySelector('form input[type="file"]');
            const imageFile = imageInput.files[0];
            if (imageFile) {
                const reader = new FileReader();
                const base64data = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
                formData["immagine" + i] = base64data;
                formData["didascalia_immagine" + i] = description;
            }
        }

        // Tolgo i campi vuoti dai dati che invio
        const cleanObject = {};

        Object.keys(formData).forEach(key => {
            const value = formData[key];
            if (value !== "") {
                cleanObject[key] = value;
            }
        });

        return cleanObject;
    } catch (error) {
        console.error('Errore durante la raccolta dei dati:', error.message);
        throw error;
    }
}


function uploadData() {
    $("#uploadData").click(async function (e) {
        try {
            const data = await gatherData();
            await sendData(data);
        } catch (error) {
            console.error('Errore durante la raccolta e l\'invio dei dati:', error.message);
            mostraModale(`Errore di compilazione: ${error.message}`);
        }
    })
}

async function sendData(data) {
    try {
        // Esegui la richiesta POST
        const response = await fetch('http://172.22.0.6:3000/schede', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            // Se lo status della risposta non è OK (ad esempio 400 - Bad Request)
            const errorMessage = await response.json();
            throw new Error(errorMessage.message);
        }

        const responseData = await response.json();
        console.log('Risposta dal server:', responseData);
        mostraModale(`Scheda creata con successo. Attendi qualche secondo per poterla visualizzare nella pagina dedicata`);
    } catch (error) {
        // Se la richiesta fallisce o il server restituisce un 400
        console.error('Errore durante la richiesta POST:', error.message);
        mostraModale(`Errore di compilazione: ${error.message}`);
    }
}


// Funzione per mostrare la modale
function mostraModale(testo) {
    // Creare la modale
    var modal = $('<div class="modal fade modal-static" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">\
                        <div class="modal-dialog" role="document">\
                            <div class="modal-content">\
                                <div class="modal-header">\
                                    <h5 class="modal-title" id="exampleModalLabel">Messaggio</h5>\
                                </div>\
                                <div class="modal-body">' + testo + '</div>\
                            </div>\
                        </div>\
                    </div>');

    // Aggiungi la modale al documento
    $('body').append(modal);

    // Mostra la modale
    modal.modal('show');

    // Chiudi la modale dopo 3 secondi
    setTimeout(function () {
        modal.modal('hide');
    }, 3000);

    // Gestisci l'evento click sullo sfondo della modale per evitare la chiusura
    modal.on('click', function (event) {
        if ($(event.target).hasClass('modal')) {
            event.stopPropagation();
        }
    });
    // Gestisci l'evento hidden.bs.modal per reindirizzare l'utente
    modal.on('hidden.bs.modal', function () {
        window.location.href = 'http://172.22.0.6:3000/bozze';
    });

}

function regret() {
    const annullaBtn = document.getElementById("regret");
    annullaBtn.addEventListener("click", function () {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Annullamento lavoro</h5>
            </div>
            <div class="modal-body">
              Sei sicuro di voler annullare il lavoro?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continua l'inserimento</button>
              <button type="button" class="btn btn-danger" onclick="window.location.href = 'http://172.22.0.6:3000/bozze'">Conferma</button>
            </div>
          </div>
        </div>
      `;

        document.body.appendChild(modal);
        $(modal).modal("show");

        // Logica per chiudere la modale
        $(".btn-secondary, .btn-close").click(function () {
            $(modal).modal("hide");
        });
    });
}


$(document).ready(function () {
    getSuggestions();
    initInputValidation();
    regret();
    uploadData();
})