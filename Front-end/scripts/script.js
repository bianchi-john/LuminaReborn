function callBaseAPI(apiUrl, callback) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.error('Si è verificato un errore durante la richiesta:', error);
        });
}

function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nella chiamata API");
            }
            return response.json();
        })
        .catch(error => {
            console.error("Errore nella chiamata API:", error);
            throw error;
        });
}

async function callTDSAPI(tdsUrl, name, routeUrl, callback) {
    try {
        const numeri = await fetchData(tdsUrl);
        const risultati = [];
        for (let i = 0; i < numeri.data.length; i++) {
            const numero = numeri.data[i][name];
            const risultato = await fetchData(routeUrl + numero);
            risultati.push(risultato);
        }
        callback(risultati)
        console.log("Risultati:", "200");
    } catch (error) {
        console.error("Errore nella chiamata:", error );
    }
}

function populateSchede(data) {
    document.getElementById('classificazione').innerHTML = data.data[0].classificazione;
    document.getElementById('corpo_scheda').innerHTML = data.data[0].corpo_scheda;
    document.getElementById('descrizione_sintetica').innerHTML = data.data[0].descrizione_sintetica;
    document.getElementById('iscrizioni').innerHTML = data.data[0].iscrizioni;
    document.getElementById('storia_espositiva').innerHTML = data.data[0].storia_espositiva;
    document.getElementById('titolo').innerHTML = data.data[0].titolo_opera;
}

function populateAutori(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('autori').innerHTML += data[i].data[0].formula_precedente + ", ";
        document.getElementById('autori').innerHTML += data[i].data[0].formula_successiva + ", ";
        document.getElementById('autori').innerHTML += data[i].data[0].categoria + " <br>";
    }
}

function populateCronologie(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('cronologie').innerHTML += data[i].data[0].ambito_storico + ", ";
        document.getElementById('cronologie').innerHTML += data[i].data[0].etichetta_data + " <br>";
    }
}

function populateUbicazioni(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('ubicazioni').innerHTML += data[i].data[0].ubicazione + ", ";
        document.getElementById('ubicazioni').innerHTML += data[i].data[0].descrizione + " <br>";
    }
}

function populateInventari(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('inventari').innerHTML += data[i].data[0].nome_inventario;
        document.getElementById('giuridica').innerHTML += data[i].data[0].descrizione;
    }
}

function populateMateriali(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('materiali').innerHTML += data[i].data[0].nome_materiale + ", ";
        document.getElementById('materiali').innerHTML += data[i].data[0].descrizione + " <br>";
    }
}

function populatetecniche(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('tecniche').innerHTML += data[i].data[0].nome_tecnica + ", ";
        document.getElementById('tecniche').innerHTML += data[i].data[0].descrizione + " <br>";
    }
}

function populateTds_schede_gruppo_misure(data) {
    for (i = 0; i < data.length; i++) {
        let misura = $("<div></div>");
        misura.attr("id", "misura_" + data[i].data[0].id);
        misura.appendTo("#misure");
        document.getElementById('misura_' + data[i].data[0].id).innerHTML += data[i].data[0].titolo_gruppo_misure + ", ";
        document.getElementById('misura_' + data[i].data[0].id).innerHTML += data[i].data[0].intero_parziale + "<br>";
        callTDSAPI('http://0.0.0.0:3000/tds_schede_gruppo_misure/1', 'id_gruppo_misure', 'http://0.0.0.0:3000/misure/'+ data[i].data[0].id, populateMisure);
        
    }
}

function populateMisure(data) {
     for (i = 0; i < data[0].data.length; i++) {
        document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += "- ";
        document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += data[0].data[i].direzione + ", ";
        document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += data[0].data[i].tipo + ", ";
        document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += data[0].data[i].unita_di_misura + ", ";
        document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += data[0].data[i].valore + "<br>";
        if (i + 1 == data[0].data.length) {
            document.getElementById('misura_' + data[0].data[i].id_gruppo_misure).innerHTML += "<br>";
        }
    }
}

function populateProvenienze(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('provenienze').innerHTML += data[i].data[0].provenienza + ", ";
        document.getElementById('provenienze').innerHTML += data[i].data[0].descrizione + ", ";
        document.getElementById('provenienze').innerHTML += data[i].data[0].note + " <br>";
    }
}

function populateMostre(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('mostre').innerHTML += data[i].data[0].titolo_mostra + ", ";
        document.getElementById('mostre').innerHTML += data[i].data[0].curatore + ", ";
        document.getElementById('mostre').innerHTML += data[i].data[0].data_mostra + ", ";
        document.getElementById('mostre').innerHTML += data[i].data[0].luogo_mostra + ", ";
        document.getElementById('mostre').innerHTML += data[i].data[0].descrizione + " <br>";
    }
}

function populateBibliografie(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('bibliografie').innerHTML += data[i].data[0].riferimento_bibliografico + " <br>";
    }
}

function populateAltreBibliografie(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('altreBibliografie').innerHTML += data[i].data[0].riferimento_bibliografico + " <br>";
    }
}

function populateAltreBibliografie(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('altreBibliografie').innerHTML += data[i].data[0].riferimento_bibliografico + " <br>";
    }
}

function populateDocumentazioneFotografica(data) {
    for (i = 0; i < data.length; i++) {
        document.getElementById('documentazioneFotografica').innerHTML += data[i].data[0].riferimento_bibliografico + " <br>";
    }
}

function populateImmagini(data) {
    $('.slideshow-container').append('<a class="prev">&#10094;</a>');
    for (i = 0; i < data.length; i++) {
        if (i == 0) {
            var div = $('<div>').addClass('mySlides fade one');
        }
        else {
            var div = $('<div>').addClass('mySlides fade');
        }
        var numberText = $('<div>').addClass('numbertext').text(i + 1 + '/' + (data.length));
        var img = $('<img>').attr('src', data[i].data[0].path)
                              .addClass('image').attr('alt', data[i].data[0].didascalia)
                              .on('contextmenu', function() { return false; });
        
        div.append(numberText, img);
        $('.slideshow-container').append(div);
    }
    $('.slideshow-container').append('<a class="next">&#10095;</a>');

    loadImages();
}

$(document).ready(function () { 
    callBaseAPI('http://0.0.0.0:3000/schede/1', populateSchede);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_misure/1', 'id_gruppo_misure', 'http://0.0.0.0:3000/tds_schede_gruppo_misure/', populateTds_schede_gruppo_misure);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_autori/1', 'id_autore', 'http://0.0.0.0:3000/autori/', populateAutori);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_cronologie/1', 'id_cronologia', 'http://0.0.0.0:3000/cronologie/', populateCronologie);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_ubicazioni/1', 'id_ubicazione', 'http://0.0.0.0:3000/ubicazioni/', populateUbicazioni);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_inventari/1', 'id_inventario', 'http://0.0.0.0:3000/inventari/', populateInventari);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_materiali/1', 'id_materiale', 'http://0.0.0.0:3000/materiali/', populateMateriali);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_tecniche/1', 'id_tecnica', 'http://0.0.0.0:3000/tecniche/', populatetecniche);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_provenienze/1', 'id_provenienza', 'http://0.0.0.0:3000/provenienze/', populateProvenienze);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_mostre/1', 'id_mostra', 'http://0.0.0.0:3000/mostre/', populateMostre);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_bibliografie/1', 'id_bibliografia', 'http://0.0.0.0:3000/bibliografie/', populateBibliografie);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_altreBibliografie/1', 'id_altreBibliografie', 'http://0.0.0.0:3000/altreBibliografie/', populateAltreBibliografie);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_documentazioniFotografiche/1', 'id_documentazioneFotografica', 'http://0.0.0.0:3000/documentazioniFotografiche/', populateDocumentazioneFotografica);
    callTDSAPI('http://0.0.0.0:3000/tds_schede_immagini/1', 'id_immagine', 'http://0.0.0.0:3000/immagini/', populateImmagini);
});