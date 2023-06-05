async function getScheda(idScheda) {
    const Handshake = new XMLHttpRequest();
    const url = 'http://0.0.0.0:3000';
    Handshake.open("GET", url);
    Handshake.send();
    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            // La prima chiamata è stata completata con successo
            const GetSchede = new XMLHttpRequest();
            const urlSchede = 'http://0.0.0.0:3000/Schede/' + idScheda;
            GetSchede.open("GET", urlSchede);
            GetSchede.send();
            GetSchede.onreadystatechange = (e) => {
                let data = GetSchede.responseText
                if (data.length > 0) {
                    let parsedData = JSON.parse(data);
                    // Titolo
                    if ($(".title").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].titolo);
                        $(".title").append($pElement);
                    }
                    // Autore
                    if ($(".autori").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].autore);
                        $(".autori").append($pElement);
                    }
                    // Cronologia
                    if ($(".cronologia").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].cronologia_ambito);
                        $(".cronologia").append($pElement);
                        $(".cronologia").addClass("item");
                    }
                    // Corpo scheda
                    if ($(".corpo_scheda").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].corpo_scheda);
                        $(".corpo_scheda").append($pElement);
                        $(".corpo_scheda").addClass("item");
                    }
                    //iscrizioni
                    if ($(".iscrizioni").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].iscrizioni);
                        $(".iscrizioni").append($pElement);
                        $(".iscrizioni").addClass("item");
                    }
                    //oggetto
                    if ($(".oggetto").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0].oggetto);
                        $(".oggetto").append($pElement);
                        $(".oggetto").addClass("item");
                    }
                    //corpo-scheda
                    if ($(".corpo-scheda").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0]["corpo_scheda"]);
                        $(".corpo-scheda").append($pElement);
                        $(".corpo-scheda").addClass("item");
                    }
                    //storia-espositiva
                    if ($(".storia-espositiva").find("p").length === 0) {
                        let $pElement = $("<p>").text(parsedData.data[0]["storia_espositiva"]);
                        $(".storia-espositiva").append($pElement);
                        $(".storia-espositiva").addClass("item");
                    }
                }
            }
        }
    }
}


async function getMateriali(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_materiali' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/materiali' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].nome_materiale;
                            let $targetDiv = $(".materiali");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}


async function getTecniche(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_tecniche' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/tecniche' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].nome_tecnica;
                            let $targetDiv = $(".tecniche");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}


async function getMisure(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_misure' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/misure' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            //Descrizione
                            let newTextFirst = parsedData.data[0].descrizione + " ";
                            let $targetDivFirst = $(".misure");
                            let $existingElementFirst = $targetDivFirst.find("p").filter(function() {
                                return $(this).text() === newTextFirst;
                            });
                            if ($existingElementFirst.length > 0) {
                              return;
                            }
                            let $pElementFirst = $("<p>").text(newTextFirst);
                            $targetDivFirst.append($pElementFirst);
                            $pElementFirst.addClass("item inline");

                            // Misura
                            let newTextSecond = parsedData.data[0].misura + " ";
                            let $targetDivSecond = $(".misure");
                            let $existingElementSecond = $targetDivSecond.find("p").filter(function() {
                                return $(this).text() === newTextSecond;
                            });
                            if ($existingElementSecond.length > 0) {
                              return;
                            }
                            let $pElementSecond = $("<p>").text(newTextSecond);
                            $targetDivSecond.append($pElementSecond);
                            $pElementSecond.addClass("item inline");
                            // unità di misura
                            let newTextThird = parsedData.data[0].unita_di_misura + " ";
                            let $targetDivThird = $(".misure");
                            let $existingElementThird = $targetDivThird.find("p").filter(function() {
                                return $(this).text() === newTextThird;
                            });
                            if ($existingElementSecond.length > 0) {
                                return;
                            }
                            let $pElementThird = $("<p>").text(newTextThird);
                            $targetDivThird.append($pElementThird);
                            $pElementThird.addClass("item inline");
                            var $newLineElement = $("</br>")
                            $targetDivThird.append($newLineElement);


                        }
                    }
                }
            }
        }
    }
}

async function getUbicazioni(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_ubicazioni' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/ubicazioni' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].ubicazione;
                            let $targetDiv = $(".ubicazioni");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}

async function getInventari(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_inventari' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/inventari' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].nome_inventario;
                            let $targetDiv = $(".inventari");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}

async function getProvenienze(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_provenienze' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/provenienze' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            //provenienze
                            let newTextFirst = parsedData.data[0].provenienza + " ";
                            let $targetDivFirst = $(".provenienze");
                            let $existingElementFirst = $targetDivFirst.find("p").filter(function() {
                                return $(this).text() === newTextFirst;
                            });
                            if ($existingElementFirst.length > 0) {
                              return;
                            }
                            let $pElementFirst = $("<p>").text(newTextFirst);
                            $targetDivFirst.append($pElementFirst);
                            $pElementFirst.addClass("item inline");

                            // descrizione
                            let newTextSecond = parsedData.data[0].descrizione + " ";
                            let $targetDivSecond = $(".provenienze");
                            let $existingElementSecond = $targetDivSecond.find("p").filter(function() {
                                return $(this).text() === newTextSecond;
                            });
                            if ($existingElementSecond.length > 0) {
                              return;
                            }
                            let $pElementSecond = $("<p>").text(newTextSecond);
                            $targetDivSecond.append($pElementSecond);
                            $pElementSecond.addClass("item inline");
                        

                        }
                    }
                }
            }
        }
    }
}


async function getMostre(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_mostre' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/mostre' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            //titolo_mostra
                            let newTextFirst = parsedData.data[0].titolo_mostra + " ";
                            let $targetDivFirst = $(".mostre");
                            let $existingElementFirst = $targetDivFirst.find("p").filter(function() {
                                return $(this).text() === newTextFirst;
                            });
                            if ($existingElementFirst.length > 0) {
                              return;
                            }
                            let $pElementFirst = $("<p>").text(newTextFirst);
                            $targetDivFirst.append($pElementFirst);
                            $pElementFirst.addClass("item inline");

                            // data_mostra
                            let newTextSecond = parsedData.data[0].descrizione + " ";
                            let $targetDivSecond = $(".data_mostra");
                            let $existingElementSecond = $targetDivSecond.find("p").filter(function() {
                                return $(this).text() === newTextSecond;
                            });
                            if ($existingElementSecond.length > 0) {
                              return;
                            }
                            let $pElementSecond = $("<p>").text(newTextSecond);
                            $targetDivSecond.append($pElementSecond);
                            $pElementSecond.addClass("item inline");
                        
                            // descrizione
                            let newTextThird = parsedData.data[0].descrizione + " ";
                            let $targetDivThird = $(".data_mostra");
                            let $existingElementThird = $targetDivThird.find("p").filter(function() {
                                return $(this).text() === newTextThird;
                            });
                            if ($existingElementThird.length > 0) {
                                return;
                            }
                            let $pElementThird= $("<p>").text(newTextThird);
                            $targetDivThird.append($pElementThird);
                            $pElementThird.addClass("item inline");

                        }
                    }
                }
            }
        }
    }
}


async function getBibliografie(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_bibliografie' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/bibliografie' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].riferimento_bibliografico;
                            let $targetDiv = $(".bibliografie");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}

async function getAltreBibliografie(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_altreBibliografie' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/altreBibliografie' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let newText = parsedData.data[0].riferimento_bibliografico;
                            let $targetDiv = $(".altre_bibliografie");
                            let $existingElement = $targetDiv.find("p").filter(function() {
                                return $(this).text() === newText;
                            });
                            if ($existingElement.length > 0) {
                              return;
                            }
                            let $pElement = $("<p>").text(newText);
                            $targetDiv.append($pElement);
                            $pElement.addClass("item");
                        }
                    }
                }
            }
        }
    }
}


async function getImmagini(dataID) {

    const Handshake = new XMLHttpRequest();
    const tdsUrl = 'http://0.0.0.0:3000/tds_schede_immagini' + '/' + dataID; // URL per la seconda chiamata GET
    Handshake.open("GET", tdsUrl);
    Handshake.send();
    let elemetsData = []

    Handshake.onreadystatechange = (e) => {
        if (Handshake.readyState === 4 && Handshake.status === 200) {
            let elementsId = Handshake.responseText;
            let elements = []
            if (elementsId.length > 1) {
                elementsId = JSON.parse(elementsId)
                let listOfElements = elementsId.data
                for (let i = 0; i < listOfElements.length; i++) {
                    elements.push(Object.values(listOfElements[i])[1])
                }
                for (let j = 0; j < elements.length; j++) {
                    let GetSchedeData = new XMLHttpRequest();
                    GetSchedeData.open("GET", 'http://0.0.0.0:3000/immagini' + '/' + elements[j]);
                    GetSchedeData.send();
                    GetSchedeData.onreadystatechange = (e) => {
                        let element = GetSchedeData.responseText
                        if (element.length > 0) {
                            let parsedData = JSON.parse(element);
                            let a = 9;
                        }
                    }
                }
            }
        }
    }
}