window.onload = function () {
    const Handshake = new XMLHttpRequest();
    const url = 'http://0.0.0.0:3000';
    Handshake.open("GET", url);
    Handshake.send();

    Handshake.onreadystatechange = (e) => {
        console.log(Handshake.responseText);
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            // La prima chiamata è stata completata con successo
            const GetSchede = new XMLHttpRequest();
            const urlSchede = 'http://0.0.0.0:3000/Schede/1'; // URL per la seconda chiamata GET
            GetSchede.open("GET", urlSchede);createTds_users_schede
            GetSchede.send();

            GetSchede.onreadystatechange = (e) => {
                console.log(GetSchede.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }
            const GetMateriali = new XMLHttpRequest();
            const urlMateriali = 'http://0.0.0.0:3000/tds_schede_materiali'; // URL per la seconda chiamata GET
            GetMateriali.open("GET", urlMateriali);
            GetMateriali.send();

            GetMateriali.onreadystatechange = (e) => {
                console.log(GetMateriali.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetTecniche = new XMLHttpRequest();
            const urlTecniche = 'http://0.0.0.0:3000/Tecniche'; // URL per la seconda chiamata GET
            GetTecniche.open("GET", urlTecniche);
            GetTecniche.send();

            GetTecniche.onreadystatechange = (e) => {
                console.log(GetTecniche.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }
            const GetMisure = new XMLHttpRequest();
            const urlMisure = 'http://0.0.0.0:3000/Misure'; // URL per la seconda chiamata GET
            GetMisure.open("GET", urlMisure);
            GetMisure.send();

            GetMisure.onreadystatechange = (e) => {
                console.log(GetMisure.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetUbicazioni = new XMLHttpRequest();
            const urlUbicazioni = 'http://0.0.0.0:3000/Ubicazioni'; // URL per la seconda chiamata GET
            GetUbicazioni.open("GET", urlUbicazioni);
            GetUbicazioni.send();

            GetUbicazioni.onreadystatechange = (e) => {
                console.log(GetUbicazioni.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetInventari = new XMLHttpRequest();
            const urlInventari = 'http://0.0.0.0:3000/Inventari'; // URL per la seconda chiamata GET
            GetInventari.open("GET", urlInventari);
            GetInventari.send();

            GetInventari.onreadystatechange = (e) => {
                console.log(GetInventari.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetProvenienze = new XMLHttpRequest();
            const urlProvenienze = 'http://0.0.0.0:3000/Provenienze'; // URL per la seconda chiamata GET
            GetProvenienze.open("GET", urlProvenienze);
            GetProvenienze.send();

            GetProvenienze.onreadystatechange = (e) => {
                console.log(GetProvenienze.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetMostre = new XMLHttpRequest();
            const urlMostre = 'http://0.0.0.0:3000/Mostre'; // URL per la seconda chiamata GET
            GetMostre.open("GET", urlMostre);
            GetMostre.send();

            GetMostre.onreadystatechange = (e) => {
                console.log(GetMostre.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetBibliografie = new XMLHttpRequest();
            const urlBibliografie = 'http://0.0.0.0:3000/Bibliografie'; // URL per la seconda chiamata GET
            GetBibliografie.open("GET", urlBibliografie);
            GetBibliografie.send();

            GetBibliografie.onreadystatechange = (e) => {
                console.log(GetBibliografie.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetaltreBibliografie = new XMLHttpRequest();
            const urlaltreBibliografie = 'http://0.0.0.0:3000/altreBibliografie'; // URL per la seconda chiamata GET
            GetaltreBibliografie.open("GET", urlaltreBibliografie);
            GetaltreBibliografie.send();

            GetaltreBibliografie.onreadystatechange = (e) => {
                console.log(GetaltreBibliografie.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetAutori = new XMLHttpRequest();
            const urlAutori = 'http://0.0.0.0:3000/Autori'; // URL per la seconda chiamata GET
            GetAutori.open("GET", urlAutori);
            GetAutori.send();

            GetAutori.onreadystatechange = (e) => {
                console.log(GetAutori.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }

            const GetImmagini = new XMLHttpRequest();
            const urlImmagini = 'http://0.0.0.0:3000/Immagini'; // URL per la seconda chiamata GET
            GetImmagini.open("GET", urlImmagini);
            GetImmagini.send();

            GetImmagini.onreadystatechange = (e) => {
                console.log(GetImmagini.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }
        }
    }
}
