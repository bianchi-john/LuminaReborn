curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "titolo_di_servizio": "Ultima cena Leonardo da Vinci", "titolo_opera": "Ultima cena", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nel tabellone apicale I(e)S[us n]AZARENU(s) REX IUDEORUM", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "formula_precedente": "Esempio formula precedente", "formula_successiva": "copia da Giusto Suttermans", "categoria": "Categoria autore", "nome": "Filippo Latini"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "formula_precedente": "Formula precedente autore 2", "formula_successiva": "Formula successiva autore 2", "categoria": "Categoria autore 2", "nome": "Nome autore 2"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 1}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 2}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "ambito_storico": "Basso medioevo", "etichetta_data": " 1340 ca", "giorno_data_da": "10", "mese_data_da":"02", "anno_data_da": "1020", "giorno_data_a": "11", "mese_data_a":"03", "anno_data_a": "1520"}' \  http://0.0.0.0:3000/cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_cronologia": 1}' \  http://0.0.0.0:3000/tds_schede_cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "nome_materiale": "Nome materiale", "descrizione": "descrizione materiale"}' \  http://0.0.0.0:3000/materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_materiale": 1}' \  http://0.0.0.0:3000/tds_schede_materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "nome_tecnica": "Nome tecnica", "descrizione": "descrizione tecnica"}' \  http://0.0.0.0:3000/tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_tecnica": 1}' \  http://0.0.0.0:3000/tds_schede_tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "ubicazione": "Lucca", "descrizione": "Museo Nazionale di Villa Guinigi, sala 3"}' \  http://0.0.0.0:3000/ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_ubicazione": "1"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "numero_inventario": "INV001", "nome_inventario": "Inventario 1", "descrizione": "Stato"}' \  http://0.0.0.0:3000/inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_inventario": "1"}' \  http://0.0.0.0:3000/tds_schede_inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "provenienza": "Lucca", "descrizione": "sacrestia della chiesa di Santa Maria dei Servi (fino al 1899)", "note": "Esempio note provenienza 1"}' \  http://0.0.0.0:3000/provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_provenienza": "1"}' \  http://0.0.0.0:3000/tds_schede_provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "curatore": "Curator 1", "titolo_mostra": "Esempio titolo mostra", "giorno_data_da": "10", "mese_data_da":"02", "anno_data_da": "1020", "giorno_data_a": "11", "mese_data_a":"03", "anno_data_a": "1520", "luogo_mostra": "esempio luogo mostra", "descrizione": "esempio descrizione della mostra 1"}' \  http://0.0.0.0:3000/mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_mostra": "1"}' \  http://0.0.0.0:3000/tds_schede_mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Bini T., Notizie della chiesa e del crocifisso di Santa Giulia a Lucca, Lucca 1858, p. 10."}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Crowe J.A., Cavalcaselle G.B., A New History of Painting in Italy from the Second to the Sixteenth century, 3 voll., London 1864-1866, vol. I (1864), p. 158"}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "2"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Ridolfi E., Guida di Lucca, Lucca 1877, p. 86."}' \  http://0.0.0.0:3000/altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Ridolfi E., Guida di Lucca, Lucca 1899, p. 94."}' \  http://0.0.0.0:3000/altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_altreBibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_altreBibliografia": "2"}' \  http://0.0.0.0:3000/tds_schede_altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "001","path": "../api/attach/pictures/1/1.png","didascalia": "esempio didascalia figura 1"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "002","path": "../api/attach/pictures/1/2.png","didascalia": "esempio didascalia figura 2"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "003","path": "../api/attach/pictures/1/3.png","didascalia": "esempio didascalia figura 3"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "001"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "002"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "003"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Esempio documentazione fotografica"}' \  http://0.0.0.0:3000/documentazioniFotografiche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_documentazioneFotografica": "1"}' \  http://0.0.0.0:3000/tds_schede_documentazioniFotografiche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "direzione": "altezza", "tipo": "assoluta", "valore": 25.5, "unita_di_misura": "cm", "id_gruppo_misure": "1"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "direzione": "larghezza", "tipo": "derivata", "valore": 30, "unita_di_misura": "cm", "id_gruppo_misure": "1"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "direzione": "spessore", "tipo": "assoluto", "valore": 55.5, "unita_di_misura": "mm", "id_gruppo_misure": "2"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "4", "direzione": "profondità", "tipo": "derivata", "valore": 50, "unita_di_misura": "mm", "id_gruppo_misure": "2"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "intero_parziale": "intero", "titolo_gruppo_misure": "Collana A", "id_tds": "1"}' \  http://0.0.0.0:3000/tds_schede_gruppo_misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "intero_parziale": "parziale, Pendaglio A", "titolo_gruppo_misure": "Collana A", "id_tds": "1"}' \  http://0.0.0.0:3000/tds_schede_gruppo_misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_gruppo_misure": 1}' \  http://0.0.0.0:3000/tds_schede_misure

curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "titolo_di_servizio": "La Gioconda", "titolo_opera": "Monna Lisa", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nessuna iscrizione presente", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 2, "id_autore": 1}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 2, "id_autore": 2}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "nome_materiale": "Olio su tavola", "descrizione": "descrizione materiale"}' \  http://0.0.0.0:3000/materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 2, "id_materiale": 2}' \  http://0.0.0.0:3000/tds_schede_materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "nome_tecnica": "Pittura a olio", "descrizione": "descrizione tecnica"}' \  http://0.0.0.0:3000/tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 2, "id_tecnica": 2}' \  http://0.0.0.0:3000/tds_schede_tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "ubicazione": "Parigi", "descrizione": "Museo del Louvre, Sala 5"}' \  http://0.0.0.0:3000/ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "2", "id_ubicazione": "1"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "numero_inventario": "INV002", "nome_inventario": "Inventario 2", "descrizione": "Stato"}' \  http://0.0.0.0:3000/inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "2", "id_inventario": "2"}' \  http://0.0.0.0:3000/tds_schede_inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "provenienza": "Firenze", "descrizione": "Galleria degli Uffizi", "note": "Esempio note provenienza 2"}' \  http://0.0.0.0:3000/provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "2", "id_provenienza": "2"}' \  http://0.0.0.0:3000/tds_schede_provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "riferimento_bibliografico": "Vasari G., Le vite de più eccellenti pittori, scultori e architettori, Firenze 1550."}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "2", "id_bibliografia": "3"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "2", "id_bibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Esempio altra documentazione fotografica"}' \ http://0.0.0.0:3000/documentazioniFotografiche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "ambito_storico": "Basso medioevo", "etichetta_data": " 1340 ca", "giorno_data_da": "10", "mese_data_da":"02", "anno_data_da": "-2000", "giorno_data_a": "11", "mese_data_a":"03", "anno_data_a": "-1000"}' \  http://0.0.0.0:3000/cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 2, "id_cronologia": 2}' \  http://0.0.0.0:3000/tds_schede_cronologie



curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "titolo_di_servizio": "Notte Stellata", "titolo_opera": "Notte Stellata", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nessuna iscrizione presente", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 3, "id_autore": 1}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 3, "id_autore": 2}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "nome_materiale": "Olio su tela", "descrizione": "descrizione materiale"}' \  http://0.0.0.0:3000/materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 3, "id_materiale": 3}' \  http://0.0.0.0:3000/tds_schede_materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "nome_tecnica": "Pittura ad olio", "descrizione": "descrizione tecnica"}' \  http://0.0.0.0:3000/tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 3, "id_tecnica": 3}' \  http://0.0.0.0:3000/tds_schede_tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "ubicazione": "Amsterdam", "descrizione": "Museo Van Gogh, Sala 7"}' \  http://0.0.0.0:3000/ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "3", "id_ubicazione": "1"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "numero_inventario": "INV003", "nome_inventario": "Inventario 3", "descrizione": "Stato"}' \  http://0.0.0.0:3000/inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "3", "id_inventario": "3"}' \  http://0.0.0.0:3000/tds_schede_inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "provenienza": "Arles", "descrizione": "Collezione privata", "note": "Esempio note provenienza 3"}' \  http://0.0.0.0:3000/provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "3", "id_provenienza": "3"}' \  http://0.0.0.0:3000/tds_schede_provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "4", "riferimento_bibliografico": "Van Gogh Museum, Amsterdam, Netherlands"}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "3", "id_bibliografia": "4"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "3", "id_bibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "riferimento_bibliografico": "Esempio altra documentazione fotografica"}' \  http://0.0.0.0:3000/documentazioniFotografiche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 3, "id_cronologia": 3}' \  http://0.0.0.0:3000/tds_schede_cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "ambito_storico": "Basso medioevo", "etichetta_data": " 1340 ca", "giorno_data_da": "10", "mese_data_da":"02", "anno_data_da": "-2000", "giorno_data_a": "11", "mese_data_a":"03", "anno_data_a": "1000"}' \  http://0.0.0.0:3000/cronologie
