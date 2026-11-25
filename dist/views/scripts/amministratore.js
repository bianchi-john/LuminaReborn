// Pagina dell'amministratore: schede da valutare e schede pubblicate (eliminabili)

// Titolo senza tag HTML (<i>...</i>). DOMParser non esegue script né carica immagini.
function testoSemplice(html) {
  return new DOMParser().parseFromString(html || "", "text/html").body.textContent.trim() || "(senza titolo)";
}

function caricaElenco(url, contenitore, crea, vuoto) {
  fetch(window.location.origin + url)
    .then(function (risposta) { return risposta.json(); })
    .then(function (dati) {
      var c = $(contenitore).empty();
      if (dati.data && dati.data.length > 0) {
        c.append(crea(dati.data));
      } else {
        c.append($("<p>").addClass("text-muted").text(vuoto));
      }
    })
    .catch(function (errore) {
      console.error("Errore nel caricamento di " + url, errore);
      $(contenitore).empty().append($("<p>").addClass("text-danger").text("Impossibile caricare l'elenco: ricaricate la pagina."));
    });
}

function tabella(intestazioni) {
  var table = $("<table>").addClass("table");
  var riga = $("<tr>").appendTo($("<thead>").appendTo(table));
  intestazioni.forEach(function (t) { $("<th>").text(t).appendTo(riga); });
  $("<tbody>").appendTo(table);
  return table;
}

// Schede inviate dagli schedatori, in attesa di approvazione
function tabellaDaValutare(schede) {
  var table = tabella(["ID", "Titolo Opera", "Azioni"]);
  schede.forEach(function (scheda) {
    var riga = $("<tr>").appendTo(table.find("tbody"));
    $("<td>").text(scheda.id).appendTo(riga);
    $("<td>").text(testoSemplice(scheda.titolo_opera)).appendTo(riga);
    // Link diretto: con href="#" e un gestore di click il cambio di pagina veniva annullato
    $("<a>").attr("href", "/valutaBozza?id=" + encodeURIComponent(scheda.id))
      .addClass("btn btn-primary").text("Visualizza")
      .appendTo($("<td>").appendTo(riga));
  });
  return table;
}

// Schede già approvate: si possono aprire o eliminare
function tabellaPubblicate(schede) {
  var table = tabella(["ID", "Titolo Opera", "Schedatore", "Azioni"]);
  schede.forEach(function (scheda) {
    var titolo = testoSemplice(scheda.titolo_opera);
    var riga = $("<tr>").appendTo(table.find("tbody"));
    $("<td>").text(scheda.id).appendTo(riga);
    $("<td>").text(titolo).appendTo(riga);
    $("<td>").text(scheda.schedatore || "").appendTo(riga);
    var azioni = $("<td>").addClass("text-nowrap").appendTo(riga);
    $("<a>").attr("href", "/scheda?id=" + encodeURIComponent(scheda.id)).attr("target", "_blank")
      .addClass("btn btn-outline-primary mr-1").text("Visualizza").appendTo(azioni);
    $("<button>").attr("type", "button").addClass("btn btn-danger").text("Elimina")
      .on("click", function () { chiediConferma(scheda.id, titolo); })
      .appendTo(azioni);
  });
  return table;
}

var schedaDaEliminare = null;

function chiediConferma(id, titolo) {
  schedaDaEliminare = id;
  $("#eliminaTitolo").text(titolo);
  $("#eliminaModal").modal("show");
}

function mostraMessaggio(testo) {
  $("#messaggioTesto").text(testo);
  $("#messaggioModal").modal("show");
  setTimeout(function () { $("#messaggioModal").modal("hide"); }, 2500);
}

function eliminaConfermata() {
  var id = schedaDaEliminare;
  schedaDaEliminare = null;
  $("#eliminaModal").modal("hide");
  if (id === null) return;
  fetch(window.location.origin + "/admin/pubblicate?schedaId=" + encodeURIComponent(id), { method: "DELETE" })
    .then(function (risposta) {
      return risposta.json().catch(function () { return {}; }).then(function (dati) {
        mostraMessaggio(risposta.ok ? "Scheda eliminata." : (dati.message || "Non è stato possibile eliminare la scheda."));
        caricaPubblicate();
      });
    })
    .catch(function () { mostraMessaggio("Il sito non risponde: riprovate tra poco."); });
}

function caricaPubblicate() {
  caricaElenco("/admin/pubblicate", "#pubblicate", tabellaPubblicate, "Nessuna scheda pubblicata.");
}

$(document).ready(function () {
  caricaElenco("/admin", "#daValutare", tabellaDaValutare, "Nessuna scheda da valutare.");
  caricaPubblicate();
  $("#eliminaConferma").on("click", eliminaConfermata);
});
