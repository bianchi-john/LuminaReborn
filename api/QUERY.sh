#
# SCHEDA 1
#
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "titolo_di_servizio": "Ultima cena Leonardo da Vinci", "titolo_opera": "Ultima cena", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nel tabellone apicale I(e)S[us n]AZARENU(s) REX IUDEORUM", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "formula_precedente": "Esempio formula precedente", "formula_successiva": "copia da Giusto Suttermans", "categoria": "Categoria autore", "nome": "Filippo Latini"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "formula_precedente": "Formula precedente autore 2", "formula_successiva": "Formula successiva autore 2", "categoria": "Categoria autore 2", "nome": "Nome autore 2"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 1}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 2}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "ambito_storico": "Basso medioevo", "etichetta_data": " 1340 ca", "data_da": "22-12-1098", "data_a": "22-12-1450"}' \  http://0.0.0.0:3000/cronologie
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
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "curatore": "Curator 1", "titolo_mostra": "Esempio titolo mostra", "data_inizio_mostra": "06-12-2022", "data_fine_mostra": "09-12-2022", "luogo_mostra": "esempio luogo mostra", "descrizione": "esempio descrizione della mostra 1"}' \  http://0.0.0.0:3000/mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_mostra": "1"}' \  http://0.0.0.0:3000/tds_schede_mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Bini T., Notizie della chiesa e del crocifisso di Santa Giulia a Lucca, Lucca 1858, p. 10."}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Crowe J.A., Cavalcaselle G.B., A New History of Painting in Italy from the Second to the Sixteenth century, 3 voll., London 1864-1866, vol. I (1864), p. 158"}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "2"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Ridolfi E., Guida di Lucca, Lucca 1877, p. 86."}' \  http://0.0.0.0:3000/altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Ridolfi E., Guida di Lucca, Lucca 1899, p. 94."}' \  http://0.0.0."1"0:3000/altreBibliografie
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
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_gruppo_misure": 2}' \  http://0.0.0.0:3000/tds_schede_misure
#
# SCHEDA 2
#
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "titolo_di_servizio": "Gioconda Leonardo da Vinci", "titolo_opera": "Gioconda", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nel tabellone apicale I(e)S[us n]AZARENU(s) REX IUDEORUM", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede
#
# SCHEDA 3
#
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "3", "titolo_di_servizio": "Annunciazione Leonardo da Vinci", "titolo_opera": "Annunciazione", "corpo_scheda": "Esempio corpo scheda", "iscrizioni": "Nel tabellone apicale I(e)S[us n]AZARENU(s) REX IUDEORUM", "descrizione_sintetica": "Esempio descrizione sintetica scheda", "storia_espositiva": "Esempio storia espositiva scheda", "classificazione": "Dipinto"}' \  http://0.0.0.0:3000/schede