// Aggiungi questa parte di script per effettuare la chiamata GET al caricamento della pagina
$(document).ready(function () {
  $.ajax({
    url: "http://172.22.0.6:3000/schedatore",
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
