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
    if ($('#' + groupId + ' select').length > 0) {
        // Se c'è, prendi l'elemento <select> e mettilo in una variabile
        var selectElement = $('#group1 select');
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
        nuovoParagrafo.textContent = "Cerca elemento preesistente";
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
    var parentDiv = selectElement.closest('.card-body');
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



$(document).ready(function () {
    $(".aggiungiBtn").on("click", function () {
        aggiungiGruppo();
    });

    $(".rimuoviBtn").on("click", function () {
        rimuoviGruppo();
    });
});
