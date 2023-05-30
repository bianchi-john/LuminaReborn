window.onload = function () {
    const Handshake = new XMLHttpRequest();
    const url1 = 'http://172.19.0.3:3000';
    Handshake.open("GET", url1);
    Handshake.send();

    Handshake.onreadystatechange = (e) => {
        console.log(Handshake.responseText);
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            // La prima chiamata è stata completata con successo
            const GetScheda = new XMLHttpRequest();
            const url2 = 'http://172.19.0.3:3000/schede'; // URL per la seconda chiamata GET
            GetScheda.open("GET", url2);
            GetScheda.send();

            GetScheda.onreadystatechange = (e) => {
                console.log(GetScheda.responseText);
                // Puoi gestire la risposta della seconda chiamata qui
            }
        }
    }
}
