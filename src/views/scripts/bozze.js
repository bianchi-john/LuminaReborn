// OTTIENI LISTA
function getBozzeOnPageLoad() {
  fetch(window.location.origin + "/manageBozze")
    .then(response => response.json())
    .then(data => {
      console.log("Chiamata GET riuscita:", data);
      if (data.data.length > 0) {
        createTable(data.data)
      }
    })
    .catch(error => {
      showModal("Errore nella chiamata GET");
      console.error("Errore nella chiamata GET:", error);
    });
}

// INVIA
function sendPostRequest(schedaId) {
  fetch(window.location.origin + "/manageBozze?schedaId=" + schedaId, {
    method: "POST",
    body: JSON.stringify({ schedaId: schedaId })
  })
    .then(response => {
      if (response.ok) {
        console.log("Bozza inviata all'amministratore'");
        showModal("Bozza inviata all'amministratore");
      } else {
        showModal("Errore nella chiamata POST");
        console.error("Errore nella chiamata POST:", response.statusText);
      }
    })
    .catch(error => {
      showModal("Errore nella chiamata POST");
      console.error("Errore nella chiamata POST:", error);
    });
}


// ELIMINA
function deleteScheda(schedaId) {
  fetch(window.location.origin + "/manageBozze?schedaId=" + schedaId, {
    method: "DELETE",
    body: JSON.stringify({ schedaId: schedaId })
  })
    .then(response => {
      if (response.ok) {
        console.log("Bozza eliminata");
        showModal("Bozza eliminata");
      } else {
        showModal("Errore nella chiamata DELETE");
        console.error("Errore nella chiamata DELETE:", response.statusText);
      }
    })
    .catch(error => {
      showModal("Errore nella chiamata DELETE");
      console.error("Errore nella chiamata DELETE:", error);
    });
}

// Funzione per creare la tabella dinamicamente
function createTable(data) {
  // Seleziona il container
  var container = $(".container");

  // Crea la tabella
  var table = $("<table>").addClass("table");
  var thead = $("<thead>").appendTo(table);
  var tbody = $("<tbody>").appendTo(table);

  // Aggiungi l'intestazione della tabella
  var headerRow = $("<tr>").appendTo(thead);
  $("<th>").text("ID").appendTo(headerRow);
  $("<th>").text("Titolo Opera").appendTo(headerRow);
  $("<th>").text("Azioni").appendTo(headerRow);

  // Aggiungi le righe della tabella con i dati
  data.forEach(function (scheda) {
    var row = $("<tr>").appendTo(tbody);
    $("<td class='" + scheda.id + "'>").text(scheda.id).appendTo(row);
    $("<td>").text(scheda.titolo_opera).appendTo(row);

    // Aggiungi i bottoni con le azioni
    var actions = $("<td>").appendTo(row);
    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-danger")
      .text("Elimina")
      .appendTo(actions);

    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-warning")
      .text("Modifica")
      .appendTo(actions);

    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-primary")
      .text("Invia")
      .appendTo(actions);
  });

  // Aggiungi la tabella al container
  container.prepend(table);
}

// Funzione per mostrare la finestra modale
function showModal(testo) {
  // Crea il markup per la finestra modale
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

  // Nascondi la finestra modale dopo 3 secondi (puoi modificare questo valore)
  setTimeout(function () {
    modal.modal('hide');
    location.reload(); // Ricarica la pagina dopo 3 secondi
  }, 3000);
}

function handleEliminaButtonClick(button) {
  var schedaId = button.closest("tr").find("td:first").text();
  mostraModaleConfermaEliminazione(schedaId);
}
function handleInviaButtonClick(button) {
  var schedaId = button.closest("tr").find("td:first").text();
  mostraModaleConfermaInvio(schedaId);
}

function mostraModaleConfermaEliminazione(schedaId) {
  // Mostra la modale di conferma
  $('#deleteModal').modal('show');

  // Chiudi la modale quando viene cliccato "Annulla" o il pulsante di chiusura ('x')
  $('#deleteModal').on('hidden.bs.modal', function (e) {
    // Rimuovi il gestore dell'evento una volta che la modale è stata chiusa
    $(this).off('hidden.bs.modal');
  });

  // Se viene cliccato il pulsante "Conferma" nella modale di conferma, procedi con l'invio
  $('#deleteModal').on('click', '.btn-conferma', function () {
    $('#deleteModal').modal('hide');
    deleteScheda(schedaId);
  });
}
function mostraModaleConfermaInvio(schedaId) {
  // Mostra la modale di conferma
  $('#confermaModal').modal('show');

  // Chiudi la modale quando viene cliccato "Annulla" o il pulsante di chiusura ('x')
  $('#confermaModal').on('hidden.bs.modal', function (e) {
    // Rimuovi il gestore dell'evento una volta che la modale è stata chiusa
    $(this).off('hidden.bs.modal');
  });

  // Se viene cliccato il pulsante "Conferma" nella modale di conferma, procedi con l'eliminazione
  $('#confermaModal').on('click', '.btn-conferma', function () {
    $('#confermaModal').modal('hide');
    sendPostRequest(schedaId);
  });
}

$(document).ready(function () {
  // Chiamata GET al caricamento della pagina
  getBozzeOnPageLoad();

  // Evento click per gestire l'invio quando si preme il bottone "Invia"
  $(".container").on("click", ".btn-primary", function () {
    handleInviaButtonClick($(this));
    // var schedaId = $(this).closest("tr").find("td:first").text(); // Assume che l'ID sia nella prima colonna della riga
    // sendPostRequest(schedaId);
  });

  // Evento click per gestire l'eliminazione quando si preme il bottone "Elimina"
  $(".container").on("click", ".btn-danger", function () {
    handleEliminaButtonClick($(this));
  });


});

