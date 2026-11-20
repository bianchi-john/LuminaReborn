function getBozzeOnPageLoad() {
  fetch(window.location.origin + "/admin")
    .then(response => response.json())
    .then(data => {
      console.log("Chiamata GET riuscita:", data);
      if (data.data.length > 0) {
        createTable(data.data);
      }
    })
    .catch(error => {
      console.error("Errore nella chiamata GET:", error);
    });
};


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
    // Link diretto alla pagina di valutazione: con href="#" e un gestore di click
    // il browser annullava il cambio di pagina e il bottone sembrava non fare nulla
    $("<a>")
      .attr("href", "/valutaBozza?id=" + encodeURIComponent(scheda.id))
      .addClass("btn btn-primary")
      .text("Visualizza")
      .appendTo(actions);
  });

  // Aggiungi la tabella al container
  container.prepend(table);
}



$(document).ready(function () {
  // Chiamata GET al caricamento della pagina
  getBozzeOnPageLoad();

});
