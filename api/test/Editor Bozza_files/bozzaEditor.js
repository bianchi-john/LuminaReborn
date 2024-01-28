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
        inputHtml += `<p>${id.replace(/_/g, ' ')}</p>
        <input type="text" id="${id}${numeroFigli}" name="${id}${numeroFigli}">`;
    });

    nuovoGruppo.innerHTML = inputHtml;
    document.getElementById(containerId).appendChild(nuovoGruppo);

    // Controllo se c'è una select
    if ($('#' + containerId + ' select').length > 0) {
        // Se c'è, prendi l'elemento <select> e mettilo in una variabile
        var selectElement = $('#' + containerId + ' select');
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
    // Aggiungi il nuovo codice all'elemento
    container.innerHTML += nuovoCodiceHTML;

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
                        <option value="" selected>---</option>
                        <option value="Direzione${id}1">Lista di tutte le direzioni</option>
                    </select>
                    <p>Tipo</p>
                    <select name="Tipo" id="Tipo${id}1">
                        <option value="" selected>---</option>
                        <option value="Tipo${id}1">Lista di tutte i tipi</option>
                    </select>
                    <p>Valore</p>
                    <input type="text" id="Valore${id}1" name="Valore">
                    <p>Unità</p>
                    <select name="Unita" id="Unita${id}1">
                        <option value="" selected>---</option>
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


    // Creo un nuovo gruppo con gli id corretti
    var nuovoCodiceHTML = generaCodiceMisure(numeroGruppo, numeroMisure +1);
    var primoElemento = document.getElementById(containerId).getElementsByClassName('field')[0];

    // Aggiungo il nuovo codice HTML al fondo del primo elemento
    primoElemento.innerHTML += nuovoCodiceHTML;


    bottoneRimuovi = document.getElementById('removeButtonMisure');
    bottoneRimuovi.style.display = 'inline';

}

function rimuoviMisura(containerId) {

    // Ottieni l'elemento padre (gruppoMisure1)
    var gruppoMisureElement = document.getElementById(containerId);
    bottoneRimuovi = document.getElementById('removeButtonGruppiMisure');
    bottoneRimuovi.style.display = 'none';

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
        bottoneRimuovi = document.getElementById('removeButtonMisure');
        bottoneRimuovi.style.display = 'none';
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
                    <option value="" selected>---</option>
                    <option value="Direzione${numeroGruppo}${numeroMisure}">Lista di tutte le direzioni</option>
                </select>
                <p>Tipo</p>
                <select name="Tipo" id="Tipo${numeroGruppo}${numeroMisure}">
                    <option value="" selected>---</option>
                    <option value="Tipo${numeroGruppo}${numeroMisure}">Lista di tutte i tipi</option>
                </select>
                <p>Valore</p>
                <input type="text" id="Valore${numeroGruppo}${numeroMisure}" name="Valore">
                <p>Unità</p>
                <select name="Unita" id="Unita${numeroGruppo}${numeroMisure}">
                    <option value="" selected>---</option>
                    <option value="Unita${numeroGruppo}${numeroMisure}">Lista di tutte le unità</option>
                </select>
                </br>
                </div>
        `;
    return code;

    
}