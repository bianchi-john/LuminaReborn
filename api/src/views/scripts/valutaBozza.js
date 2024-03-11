var modal = document.getElementById("myModal");
var slideIndex = 1;


function closePopup() {
    var modal = $("#myModal");
    modal.style.display = "none";
}

function plusSlides(n) {
    showSlides((slideIndex += n));
}

function currentSlide(n) {
    showSlides((slideIndex = n));
}

function showSlides(n) {
    var i;
    var slides = $(".mySlides");
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    if (n == 1) {
        slideIndex = 1
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";

    }
    slides[slideIndex - 1].style.display = "contents";
}

function loadImages() {
    $(".close").on("click", function () {
        var modal = document.getElementById("myModal");
        modal.style.display = "none";
    });

    $(".prev").on("click", function () {
        showSlides((slideIndex += -1));
    });

    $(".next").on("click", function () {
        showSlides((slideIndex += +1));
    });


    $(".image").on("click", function () {
        var modal = document.getElementById("myModal");
        var modalImg = document.getElementById("img01");
        var captionText = document.getElementById("caption");
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    });

    showSlides(slideIndex);

}

function callAPI(apiUrl, callback) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('An error occurred during the request:', error);
        });
}

function populateWebPage(data) {

    if (data.data.scheda[0].titolo_opera) {
        document.getElementById('classificazione').innerHTML = data.data.scheda[0].classificazione;
        $('.classificazione').removeClass('classificazione');
    }
    if (data.data.scheda[0].corpo_scheda) {
        $('.corpo_scheda').removeClass('corpo_scheda');
        document.getElementById('corpo_scheda').innerHTML = data.data.scheda[0].corpo_scheda;
    }
    if (data.data.scheda[0].titolo_opera) {
        document.getElementById('titolo').innerHTML = data.data.scheda[0].titolo_opera;
        $('.title').removeClass('title');
    }
    if (data.data.scheda[0].descrizione_sintetica) {
        document.getElementById('descrizione_sintetica').innerHTML = data.data.scheda[0].descrizione_sintetica;
        $('.descrizione_sintetica').removeClass('descrizione_sintetica');
    }
    if (data.data.scheda[0].iscrizioni) {
        document.getElementById('iscrizioni').innerHTML = data.data.scheda[0].iscrizioni;
        $('.iscrizioni').removeClass('iscrizioni');
    }
    if (data.data.scheda[0].storia_espositiva) {
        document.getElementById('storia_espositiva').innerHTML = data.data.scheda[0].storia_espositiva;
        $('.storia_espositiva').removeClass('storia_espositiva');
    }


    for (i = 0; i < data.data.autori.length; i++) {
        if (data.data.autori[i].formula_precedente) { document.getElementById('autori').innerHTML += data.data.autori[i].formula_precedente + ", "; }
        if (data.data.autori[i].formula_successiva) { document.getElementById('autori').innerHTML += data.data.autori[i].formula_successiva + ", "; }
        if (data.data.autori[i].nome) { document.getElementById('autori').innerHTML += data.data.autori[i].nome + ", "; }
        if (data.data.autori[i].categoria) { document.getElementById('autori').innerHTML += data.data.autori[i].categoria + " <br>"; }
        $('.autori').removeClass('autori');
    }

    for (i = 0; i < data.data.schedatori.length; i++) {
        if (data.data.schedatori[i].first_name) { document.getElementById('schedatore').innerHTML += data.data.schedatori[i].first_name + " "; }
        if (data.data.schedatori[i].last_name) { document.getElementById('schedatore').innerHTML += data.data.schedatori[i].last_name; }
        $('.schedatore').removeClass('schedatore');
    }



    for (i = 0; i < data.data.cronologie.length; i++) {
        if (data.data.cronologie[i].etichetta_data) { document.getElementById('cronologie').innerHTML += data.data.cronologie[i].etichetta_data }
        $('.cronologie').removeClass('cronologie');
    }

    for (i = 0; i < data.data.cronologie.length; i++) {
        if (data.data.cronologie[i].ambito_storico) {
            document.getElementById('ambito').innerHTML += data.data.cronologie[i].ambito_storico
            $('.ambito').removeClass('ambito');
        }
    }


    for (i = 0; i < data.data.ubicazioni.length; i++) {
        document.getElementById('ubicazioni').innerHTML += data.data.ubicazioni[i].ubicazione + ", ";
        document.getElementById('ubicazioni').innerHTML += data.data.ubicazioni[i].descrizione + " <br>";
        $('.ubicazioni').removeClass('ubicazioni');

    }

    for (i = 0; i < data.data.inventari.length; i++) {
        var nomeInventario = data.data.inventari[i].nome_inventario;
        var numeroInventario = data.data.inventari[i].numero_inventario;
        var descrizione = data.data.inventari[i].descrizione;

        // Verifica se le stringhe sono vuote e, se non lo sono, le stampa
        document.getElementById('inventari').innerHTML += (nomeInventario !== "" ? nomeInventario : "");
        document.getElementById('inventari').innerHTML += (numeroInventario !== "" ? numeroInventario : "");
        document.getElementById('giuridica').innerHTML += (descrizione !== "" ? descrizione : "");

        if (nomeInventario || numeroInventario) {
            $('.inventari').removeClass('inventari');
        }
        if (descrizione) {
            $('.giuridica').removeClass('giuridica');
        }
    }



    for (i = 0; i < data.data.materiali.length; i++) {
        document.getElementById('materiali').innerHTML += data.data.materiali[i].nome_materiale;
        if (data.data.materiali[i].descrizione) { document.getElementById('materiali').innerHTML += + ", " + data.data.materiali[i].descrizione + " <br>"; }
        $('.materiali').removeClass('materiali');
    }

    for (i = 0; i < data.data.tecniche.length; i++) {
        document.getElementById('tecniche').innerHTML += data.data.tecniche[i].nome_tecnica
        if (data.data.tecniche[i].descrizione) { document.getElementById('tecniche').innerHTML += ", " + data.data.tecniche[i].descrizione + " <br>"; }
        $('.tecniche').removeClass('tecniche');
    }

    for (i = 0; i < data.data.provenienze.length; i++) {
        var provenienza = data.data.provenienze[i].provenienza;
        var note = data.data.provenienze[i].note;
        var descrizione = data.data.provenienze[i].descrizione;

        // Verifica se le proprietà esistono e non sono vuote prima di stamparle
        if (provenienza && provenienza.trim() !== "") {
            document.getElementById('provenienze').innerHTML += provenienza + " ";
        }

        if (note && note.trim() !== "") {
            document.getElementById('provenienze').innerHTML += note + " ";
        }

        if (descrizione && descrizione.trim() !== "") {
            document.getElementById('provenienze').innerHTML += descrizione + " <br>";
        }

        $('.provenienze').removeClass('provenienze');
    }

    for (i = 0; i < data.data.mostre.length; i++) {
        var titoloMostra = data.data.mostre[i].titolo_mostra;
        var curatore = data.data.mostre[i].curatore;
        var dataMostra = data.data.mostre[i].data_mostra;
        var luogoMostra = data.data.mostre[i].luogo_mostra;
        var descrizione = data.data.mostre[i].descrizione;

        // Verifica se le proprietà esistono e non sono vuote prima di stamparle
        if (titoloMostra && titoloMostra.trim() !== "") {
            document.getElementById('mostre').innerHTML += titoloMostra + ", ";
        }

        if (curatore && curatore.trim() !== "") {
            document.getElementById('mostre').innerHTML += curatore + ", ";
        }

        if (dataMostra && dataMostra.trim() !== "") {
            document.getElementById('mostre').innerHTML += dataMostra + ", ";
        }

        if (luogoMostra && luogoMostra.trim() !== "") {
            document.getElementById('mostre').innerHTML += luogoMostra + ", ";
        }

        if (descrizione && descrizione.trim() !== "") {
            document.getElementById('mostre').innerHTML += descrizione + "<br>";
        }

        $('.mostre').removeClass('mostre');
    }

    for (i = 0; i < data.data.bibliografie.length; i++) {
        document.getElementById('bibliografie').innerHTML += data.data.bibliografie[i].riferimento_bibliografico + "<br>";
        $('.bibliografie').removeClass('bibliografie');

    }

    for (i = 0; i < data.data.altreBibliografie.length; i++) {
        document.getElementById('altreBibliografie').innerHTML += data.data.altreBibliografie[i].riferimento_bibliografico + "<br>";
        $('.altreBibliografie').removeClass('altreBibliografie');

    }
    for (i = 0; i < data.data.documentazioniFotografiche.length; i++) {
        document.getElementById('documentazioneFotografica').innerHTML += data.data.documentazioniFotografiche[i].riferimento_bibliografico + "<br>";
        $('.documentazioneFotografica').removeClass('documentazioneFotografica');

    }

    function creaElementoLista(elemento) {
        var li = document.createElement("li");
        li.textContent = " " + elemento.direzione + " " + elemento.tipo + " " + elemento.valore + " " + elemento.unita_di_misura;
        return li;
    }

    var raggruppamenti = {};
    data.data.misure.forEach(function (elemento) {
        if (raggruppamenti.hasOwnProperty(elemento.id_gruppo_misure)) {
            raggruppamenti[elemento.id_gruppo_misure].push(elemento);
            $('.misure').removeClass('misure');
        } else {
            raggruppamenti[elemento.id_gruppo_misure] = [elemento];
            $('.misure').removeClass('misure');

        }
    });

    Object.keys(raggruppamenti).forEach(function (gruppo) {
        $('.misureContent').append('<ol id="lista' + gruppo + '"></ol>');
        var lista = document.getElementById("lista" + gruppo);
        lista.append(raggruppamenti[gruppo][0].intero_parziale + ' ' + raggruppamenti[gruppo][0].titolo_gruppo_misure)
        raggruppamenti[gruppo].forEach(function (elemento) {
            var li = creaElementoLista(elemento);
            lista.appendChild(li);
        });
    });
    if (data.data.immagini.length > 0) {
        $('.slideshow-container').append('<a class="prev">&#10094;</a>');

        for (i = 0; i < data.data.immagini.length; i++) {
            if (i == 0) {
                var div = $('<div>').addClass('mySlides fade one');
            }
            else {
                var div = $('<div>').addClass('mySlides fade')
                    .attr('num', i + 1 + '/' + (data.data.immagini.length));

            }
            var img = $('<img>').attr('src', data.data.immagini[i].data)
                .addClass('image').attr('alt', data.data.immagini[i].didascalia)
                .on('contextmenu', function () { return false; })

            div.append(img);
            $('.slideshow-container').append(div);
        }
        $('.slideshow-container').append('<a class="next">&#10095;</a>');
        loadImages();
    }
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

// INVIA
function sendPostRequest() {
    const urlParams = new URLSearchParams(window.location.search);
    const schedaId = urlParams.get('id');

    fetch("http://172.22.0.6:3000/admin?schedaId=" + schedaId, {
        method: "POST",
        body: JSON.stringify({ schedaId: schedaId })
    })
        .then(response => {
            if (response.ok) {
                console.log("Bozza accettata'");
                showModal("Bozza accettata. Disponibile per tutti gli utenti");
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
function deleteScheda() {
    const urlParams = new URLSearchParams(window.location.search);
    const schedaId = urlParams.get('id');

    fetch("http://172.22.0.6:3000/admin?schedaId=" + schedaId, {
        method: "DELETE",
        body: JSON.stringify({ schedaId: schedaId })
    })
        .then(response => {
            if (response.ok) {
                console.log("Bozza rifiutata");
                showModal("Bozza rifiutata");
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


$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id'); // Estrae il valore del parametro 'id' dalla query string
    if (id) {
        const apiUrl = `http://172.22.0.6:3000/admin/${id}`;
        callAPI(apiUrl, populateWebPage);
    } else {
        console.log("Parametro 'id' non presente nella query string dell'URL.");
    }
    // Evento click per gestire l'invio quando si preme il bottone "Invia"
    $(".container").on("click", ".btn-success", function () {
        sendPostRequest();
    });

    // Evento click per gestire l'eliminazione quando si preme il bottone "Elimina"
    $(".container").on("click", ".btn-danger", function () {
        deleteScheda();
    });
});