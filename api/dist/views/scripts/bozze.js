// Aggiungi questa parte di script per effettuare la chiamata GET al caricamento della pagina
$(document).ready(function () {
  $.ajax({
    url: "http://172.22.0.6:3000/manageBozze",
    type: "GET",
    success: function (data) {
      console.log("Chiamata GET riuscita:", data);
      if (data.data.length > 0) {
        createTable(data.data)
      }
    },
    error: function (error) {
      console.error("Errore nella chiamata GET:", error);
    }
  });

});

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
    $("<td>").text(scheda.id).appendTo(row);
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

$(document).ready(function () {
  // ... il codice per la chiamata GET rimane invariato ...

  // Funzione per gestire l'eliminazione di una scheda
  function deleteScheda(id) {
    $.ajax({
      url: "http://172.22.0.6:3000/manageBozze?id=" + id, // Assumi che ci sia un endpoint per eliminare la scheda con l'id specificato
      type: "DELETE",
      success: function () {
        console.log("Chiamata DELETE riuscita");
        // Ricarica la pagina
        location.reload();
        // Mostra la finestra modale di successo
        showModal("Operazione avvenuta con successo");
      },
      error: function (error) {
        console.error("Errore nella chiamata DELETE:", error);
      }
    });
  }

  // Funzione per mostrare la finestra modale
  function showModal(message) {
    // Crea il markup per la finestra modale
    var modal = $("<div>").addClass("modal");
    var modalContent = $("<div>").addClass("modal-content").appendTo(modal);
    $("<p>").text(message).appendTo(modalContent);

    // Aggiungi la finestra modale al corpo del documento
    $("body").append(modal);

    // Mostra la finestra modale
    modal.show();

    // Nascondi la finestra modale dopo 3 secondi (puoi modificare questo valore)
    setTimeout(function () {
      modal.hide();
    }, 3000);
  }

  // Evento click per gestire l'eliminazione quando si preme il bottone "Elimina"
  $(".container").on("click", ".btn-danger", function () {
    var schedaId = $(this).closest("tr").find("td:first").text(); // Assume che l'ID sia nella prima colonna della riga
    deleteScheda(schedaId);
  });
});

