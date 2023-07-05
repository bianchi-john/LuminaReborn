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
        document.getElementById('autori').innerHTML += data.data.autori[i].formula_precedente + ", ";
        document.getElementById('autori').innerHTML += data.data.autori[i].formula_successiva + ", ";
        document.getElementById('autori').innerHTML += data.data.autori[i].nome + ", ";
        document.getElementById('autori').innerHTML += data.data.autori[i].categoria + " <br>";
        $('.autori').removeClass('autori');
    }

    for (i = 0; i < data.data.cronologie.length; i++) {
        document.getElementById('cronologie').innerHTML += data.data.cronologie[i].ambito_storico + ", ";
        document.getElementById('cronologie').innerHTML += data.data.cronologie[i].etichetta_data + " <br>";
        $('.cronologie').removeClass('cronologie');

    }

    for (i = 0; i < data.data.ubicazioni.length; i++) {
        document.getElementById('ubicazioni').innerHTML += data.data.ubicazioni[i].ubicazione + ", ";
        document.getElementById('ubicazioni').innerHTML += data.data.ubicazioni[i].descrizione + " <br>";
        $('.ubicazioni').removeClass('ubicazioni');

    }

    for (i = 0; i < data.data.inventari.length; i++) {
        document.getElementById('inventari').innerHTML += data.data.inventari[i].nome_inventario;
        document.getElementById('giuridica').innerHTML += data.data.inventari[i].descrizione;
        $('.inventari').removeClass('hiinventaridden');
        $('.giuridica').removeClass('giuridica');
    }

    for (i = 0; i < data.data.materiali.length; i++) {
        document.getElementById('materiali').innerHTML += data.data.materiali[i].nome_materiale + ", ";
        document.getElementById('materiali').innerHTML += data.data.materiali[i].descrizione + " <br>";
        $('.materiali').removeClass('materiali');
    }

    for (i = 0; i < data.data.tecniche.length; i++) {
        document.getElementById('tecniche').innerHTML += data.data.tecniche[i].nome_tecnica + ", ";
        document.getElementById('tecniche').innerHTML += data.data.tecniche[i].descrizione + " <br>";
        $('.tecniche').removeClass('tecniche');
    }

    for (i = 0; i < data.data.provenienze.length; i++) {
        document.getElementById('provenienze').innerHTML += data.data.provenienze[i].provenienza + ", ";
        document.getElementById('provenienze').innerHTML += data.data.provenienze[i].note + ", ";
        document.getElementById('provenienze').innerHTML += data.data.provenienze[i].descrizione + " <br>";
        $('.provenienze').removeClass('provenienze');
    }

    for (i = 0; i < data.data.mostre.length; i++) {
        document.getElementById('mostre').innerHTML += data.data.mostre[i].titolo_mostra + ", ";
        document.getElementById('mostre').innerHTML += data.data.mostre[i].curatore + ", ";
        document.getElementById('mostre').innerHTML += data.data.mostre[i].data_mostra + ", ";
        document.getElementById('mostre').innerHTML += data.data.mostre[i].luogo_mostra + ", ";
        document.getElementById('mostre').innerHTML += data.data.mostre[i].descrizione + "<br>";
        $('.mostre').removeClass('mostre');

    }

    for (i = 0; i < data.data.bibliografie.length; i++) {
        document.getElementById('bibliografie').innerHTML += data.data.bibliografie[i].riferimento_bibliografico + "<br>";
        $('.bibliografie').removeClass('bibliografie');

    }

    for (i = 0; i < data.data.altreBibliografie.length; i++) {
        document.getElementById('altreBibliografie').innerHTML += data.data.bibliografie[i].riferimento_bibliografico + "<br>";
        $('.altreBibliografie').removeClass('altreBibliografie');

    }

    for (i = 0; i < data.data.documentazioniFotografiche.length; i++) {
        document.getElementById('documentazioneFotografica').innerHTML += data.data.bibliografie[i].riferimento_bibliografico + "<br>";
        $('.documentazioneFotografica').removeClass('documentazioneFotografica');

    }

    function creaElementoLista(elemento) {
        var li = document.createElement("li");
        li.textContent = "Direzione: " + elemento.direzione + ", Tipo: " + elemento.tipo + ", Valore: " + elemento.valore + " " + elemento.unita_di_misura;
        return li;
    }

    var raggruppamenti = {};
    data.data.misure.forEach(function (elemento) {
        if (raggruppamenti.hasOwnProperty(elemento.id_gruppo_misure)) {
            raggruppamenti[elemento.id_gruppo_misure].push(elemento);
            $('.misure').removeClass('misure');
        } else {
            raggruppamenti[elemento.id_gruppo_misure] = [elemento];
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

    $('.slideshow-container').append('<a class="prev">&#10094;</a>');

    for (i = 0; i < data.data.immagini.length; i++) {
        if (i == 0) {
            var div = $('<div>').addClass('mySlides fade one');
        }
        else {
            var div = $('<div>').addClass('mySlides fade')
                .attr('num', i + 1 + '/' + (data.data.immagini.length));

        }
        var img = $('<img>').attr('src', data.data.immagini[i].path)
            .addClass('image').attr('alt', data.data.immagini[i].didascalia)
            .on('contextmenu', function () { return false; })

        div.append(img);
        $('.slideshow-container').append(div);
    }
    $('.slideshow-container').append('<a class="next">&#10095;</a>');
    loadImages();
}

$(document).ready(function () {
    callAPI('http://0.0.0.0:3000/schede/1', populateWebPage);    
});