var oDoc, sDefTxt;

function initDoc(textArea) {
  oDoc = textArea;
  sDefTxt = oDoc.innerHTML;

  // Trova la checkbox più vicina all'area di testo attuale
  var switchModeCheckbox = oDoc.closest("form").querySelector(".switchMode");
  if (switchModeCheckbox && switchModeCheckbox.checked) { 
    setDocMode(true); 
  }
}



function formatDoc(sCmd, sValue) {
  if (validateMode()) { document.execCommand(sCmd, false, sValue); oDoc.focus(); }
}

function validateMode() {
  var switchModeCheckbox = oDoc.closest(".card-body").querySelector(".switchMode");
  if (!switchModeCheckbox || !switchModeCheckbox.checked) { 
    return true;
  }
  alert("Uncheck \"Show HTML\".");
  oDoc.focus();
  return false;
}

function setDocMode(bToSource) {
  var oContent;
  if (bToSource) {
    oContent = document.createTextNode(oDoc.innerHTML);
    oDoc.innerHTML = "";
    var oPre = document.createElement("pre");
    oDoc.contentEditable = false;
    oPre.className = "sourceText";
    oPre.contentEditable = true;
    oPre.appendChild(oContent);
    oDoc.appendChild(oPre);
    document.execCommand("defaultParagraphSeparator", false, "p");
  } else {
    if (document.all) {
      oDoc.innerHTML = oDoc.innerText;
    } else {
      oContent = document.createRange();
      oContent.selectNodeContents(oDoc.firstChild);
      oDoc.innerHTML = oContent.toString();
    }
    oDoc.contentEditable = true;
  }
  oDoc.focus();
}

function printDoc() {
  if (!validateMode()) { return; }
  var oPrntWin = window.open("","_blank","width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
  oPrntWin.document.open();
  oPrntWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + oDoc.innerHTML + "<\/body><\/html>");
  oPrntWin.document.close();
}

window.onload = function() {
  // Trova tutte le textarea con la classe "textBox" e assegna la funzione initDoc a ciascuna
  var textAreas = document.querySelectorAll(".textBox");
  textAreas.forEach(function(textArea) {
    // Assegna la funzione initDoc direttamente all'evento di ciascuna textarea
    textArea.addEventListener('input', function() {
      initDoc(textArea);
    });
  });
};
