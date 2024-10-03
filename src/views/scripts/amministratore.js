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
    var visualizzaButton = $("<a>")
      .attr("href", "#")
      .addClass("btn btn-primary")
      .text("Visualizza")
      .appendTo(actions);
      
    // Aggiungi un evento di click al bottone "Visualizza"
    visualizzaButton[0].addEventListener('click', function() {
      window.location.href = window.location.origin + "/valutaBozza?id=" + scheda.id;
    });
  });

  // Aggiungi la tabella al container
  container.prepend(table);
}



$(document).ready(function () {
  // Chiamata GET al caricamento della pagina
  getBozzeOnPageLoad();

});
