curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1","user_role": 1, "email": "example@example.com", "first_name": "John", "last_name": "Doe", "password": "password123"}' \  http://0.0.0.0:3000/users
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "titolo": "Titolo scheda", "corpo_scheda": "Corpo_scheda", "iscrizioni": "Iscrizioni scheda", "descrizione_sintetica": "Descrizione sintetica scheda", "storia_espositiva": "Storia espositiva scheda", "classificazione": "classificazione"}' \  http://0.0.0.0:3000/schede
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "formula_precedente": "Formula precedente autore", "formula_successiva": "Formula successiva autore", "categoria": "Categoria autore", "nome": "Nome autore"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "formula_precedente": "Formula precedente autore 2", "formula_successiva": "Formula successiva autore 2", "categoria": "Categoria autore 2", "nome": "Nome autore 2"}' \  http://0.0.0.0:3000/autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 1}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_autore": 2}' \  http://0.0.0.0:3000/tds_schede_autori
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "ambito_storico": "Ambito storico cronologia", "etichetta_data": "basso medioevo, 1340 ca", "data_da": "22-12-1098", "data_a": "22-12-1450"}' \  http://0.0.0.0:3000/cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_cronologia": 1}' \  http://0.0.0.0:3000/tds_schede_cronologie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "nome_materiale": "Nome materiale", "descrizione": "Descrizione materiale"}' \  http://0.0.0.0:3000/materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_materiale": 1}' \  http://0.0.0.0:3000/tds_schede_materiali
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "nome_tecnica": "Nome tecnica", "descrizione": "Descrizione tecnica"}' \  http://0.0.0.0:3000/tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_tecnica": 1}' \  http://0.0.0.0:3000/tds_schede_tecniche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "direzione": "da destra a sinistra", "tipo": "lunghezza", "valore": 25.5, "unita_di_misura": "Centimetri"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "direzione": "da sinistra a destra", "tipo": "lunghezza", "valore": 30, "unita_di_misura": "Centimetri"}' \  http://0.0.0.0:3000/misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "id_scheda": 1, "id_misura": 1, "intero_parziale": "intero_parziale", "descrizione": "Descrizione"}' \  http://0.0.0.0:3000/tds_schede_misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "id_scheda": 1, "id_misura": 2, "intero_parziale": "intero_parziale", "descrizione": "Descrizione"}' \  http://0.0.0.0:3000/tds_schede_misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": 1, "id_gruppo_misure": 1}' \  http://0.0.0.0:3000/tds_schede_gruppo_misure
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "ubicazione": "Room A", "descrizione": "Description of Room A"}' \  http://0.0.0.0:3000/ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "ubicazione": "Room B", "descrizione": "Description of Room B"}' \  http://0.0.0.0:3000/ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_ubicazione": "1"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_ubicazione": "1"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_ubicazione": "2"}' \  http://0.0.0.0:3000/tds_schede_ubicazioni
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "numero_inventario": "INV001", "nome_inventario": "Inventario 1", "descrizione": "Descrizione inventario 1"}' \  http://0.0.0.0:3000/inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_inventario": "1"}' \  http://0.0.0.0:3000/tds_schede_inventari
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "provenienza": "Proenienza 1", "descrizione": "Descrizione provenienza 1", "note": "Note provenienza 1"}' \  http://0.0.0.0:3000/provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_provenienza": "1"}' \  http://0.0.0.0:3000/tds_schede_provenienze
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "curatore": "Curator 1", "titolo_mostra": "Exhibition 1", "data_mostra": "2023-06-14", "luogo_mostra": "Location 1", "descrizione": "Description of Exhibition 1"}' \  http://0.0.0.0:3000/mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_mostra": "1"}' \  http://0.0.0.0:3000/tds_schede_mostre
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Bibliografia 1"}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Bibliografia 2"}' \  http://0.0.0.0:3000/bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_bibliografia": "2"}' \  http://0.0.0.0:3000/tds_schede_bibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Additional Reference 1"}' \  http://0.0.0.0:3000/altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "2", "riferimento_bibliografico": "Additional Reference 2"}' \  http://0.0.0.0:3000/altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_altreBibliografia": "1"}' \  http://0.0.0.0:3000/tds_schede_altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_altreBibliografia": "2"}' \  http://0.0.0.0:3000/tds_schede_altreBibliografie
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "001","path": "../api/attach/pictures/1/1.png","didascalia": "didascalia 1"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "002","path": "../api/attach/pictures/1/2.png","didascalia": "didascalia 2"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "003","path": "../api/attach/pictures/1/3.png","didascalia": "didascalia 3"}' \  http://0.0.0.0:3000/immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "001"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "002"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1","id_immagine": "003"}' \  http://0.0.0.0:3000/tds_schede_immagini
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id": "1", "riferimento_bibliografico": "Photographic Documentation 1"}' \  http://0.0.0.0:3000/documentazioniFotografiche
curl --header "Content-Type: application/json" \  --request POST \  --data '{"id_scheda": "1", "id_documentazioneFotografica": "1"}' \  http://0.0.0.0:3000/tds_schede_documentazioniFotografiche