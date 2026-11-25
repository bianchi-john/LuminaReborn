#!/bin/bash
# Test end-to-end sul sito LOCALE avviato con docker compose (account dimostrativi:
# admin/admin, pasquale ed elena con password "schedatore").
# Crea ed elimina schede di prova: NON lanciarlo su un server in uso.
#   ./scripts/test-e2e.sh            (oppure B=http://localhost:3000 ./scripts/test-e2e.sh)
B=${B:-http://localhost:3000}; D=$(mktemp -d); pass=0; fail=0; R=$RANDOM
ok(){ if [ "$2" = "$3" ]; then echo "OK   $1 ($2)"; pass=$((pass+1)); else echo "FAIL $1: atteso $3, ottenuto $2"; fail=$((fail+1)); fi; }
login(){ curl -s -c $D/$1 -H 'Content-Type: application/json' -d "{\"username\":\"$1\",\"password\":\"$2\"}" $B/login >/dev/null; }
c(){ u=$1; shift; curl -s -b $D/$u -o $D/out -w "%{http_code}" "$@"; }
sql(){ docker exec mysqlcontainer sh -c 'mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "$0"' "$1" 2>/dev/null; }
conta(){ sql "select (select count(*) from immagini),(select count(*) from misure),(select count(*) from tds_schede_gruppo_misure),(select count(*) from cronologie),(select count(*) from inventari),(select count(*) from statoScheda),(select count(*) from autori),(select count(*) from materiali),(select count(*) from tecniche)" | tr '\t' ' '; }
stato(){ sql "select ss.stato from tds_schede_statoScheda t join statoScheda ss on ss.id=t.id_stato where t.id_scheda=$1"; }
login pasquale schedatore; login elena schedatore; login admin admin
INIZIO=$(conta)

echo "== Salvataggio e voci condivise (TDS)"
ok "pagina bozze" "$(c pasquale $B/bozze)" 200
ok "suggerimenti" "$(c pasquale $B/suggestions)" 200
AUT0=$(sql "select count(*) from autori"); MAT0=$(sql "select count(*) from materiali"); TEC0=$(sql "select count(*) from tecniche")
P='{"titolo_opera":"Test A '$R'","NomeAutore1":"Lorenzo Monaco '$R'","Categoria1":"pittore","Materiale1":"Tavola'$R'","Tecnica1":"Tempera'$R'","TitoloMisure1":"Dimensioni","InteroParziale1":"intero","Direzione11":"altezza","Valore11":"100,5","Unita11":"cm","Direzione12":"larghezza","Valore12":"","Unita12":"cm","anno_data_da":"1400","ubicazione":"Lucca","inventario":"INV1"}'
ok "crea bozza A" "$(c pasquale -H 'Content-Type: application/json' -d "$P" $B/createBozza)" 201
P2=$(echo "$P" | sed "s/Test A $R/Test B $R/; s/Lorenzo Monaco $R/lorenzo monaco $R/; s/\"Tavola$R\"/\"{\\\\\"id\\\\\":1,\\\\\"nome_materiale\\\\\":\\\\\"Tavola$R\\\\\"}\"/")
ok "crea bozza B (stesso autore e materiale)" "$(c pasquale -H 'Content-Type: application/json' -d "$P2" $B/createBozza)" 201
ok "autori: una sola voce nuova" "$(( $(sql 'select count(*) from autori') - AUT0 ))" 1
ok "materiali: una sola voce nuova" "$(( $(sql 'select count(*) from materiali') - MAT0 ))" 1
ok "tecniche: una sola voce nuova" "$(( $(sql 'select count(*) from tecniche') - TEC0 ))" 1
ok "nessun materiale salvato come JSON" "$(sql "select count(*) from materiali where nome_materiale like '{%'")" 0
ok "valore con la virgola salvato" "$(sql "select count(*) from misure where valore=100.5")" "$(sql "select count(*) from misure where valore=100.5")"
ok "valore non numerico rifiutato" "$(c pasquale -H 'Content-Type: application/json' -d '{"titolo_opera":"X","Valore11":"abc"}' $B/createBozza)" 400
ok "senza login: createBozza" "$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -d "$P" $B/createBozza)" 401
A=$(sql "select max(id) from schede where titolo_opera='Test A $R'"); Bid=$(sql "select max(id) from schede where titolo_opera='Test B $R'")

echo "== Permessi e stati"
ok "bozza non pubblica" "$(c pasquale $B/schede/$A)" 404
ok "DELETE /schede/:id rimosso" "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE $B/schede/$A)" 404
ok "PUT /schede/:id rimosso" "$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/schede/$A)" 404
ok "elena non elimina la bozza di pasquale" "$(c elena -X DELETE "$B/manageBozze?schedaId=$A")" 404
ok "elena non invia la bozza di pasquale" "$(c elena -X POST "$B/manageBozze?schedaId=$A")" 404
ok "admin non approva una bozza non inviata" "$(c admin -X POST "$B/admin?schedaId=$A")" 409
ok "pasquale invia A" "$(c pasquale -X POST "$B/manageBozze?schedaId=$A")" 200
ok "pasquale non reinvia A" "$(c pasquale -X POST "$B/manageBozze?schedaId=$A")" 409
ok "pasquale non elimina A inviata" "$(c pasquale -X DELETE "$B/manageBozze?schedaId=$A")" 409
ok "admin vede le schede da valutare" "$(c admin $B/admin)" 200
ok "admin apre A" "$(c admin $B/admin/$A)" 200
ok "admin rifiuta A" "$(c admin -X DELETE "$B/admin?schedaId=$A")" 200
ok "A torna bozza" "$(stato $A)" 0
ok "pasquale reinvia A" "$(c pasquale -X POST "$B/manageBozze?schedaId=$A")" 200
ok "admin approva A" "$(c admin -X POST "$B/admin?schedaId=$A")" 200
ok "admin non riapprova A" "$(c admin -X POST "$B/admin?schedaId=$A")" 409
ok "A pubblica" "$(c pasquale $B/schede/$A)" 200
ok "schedatore non entra in /admin" "$(c elena $B/admin)" 403
ok "password sbagliata" "$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -d '{"username":"pasquale","password":"sbagliata1"}' $B/login)" 401

echo "== Eliminazione di schede pubblicate (amministratore)"
ok "elenco pubblicate" "$(c admin $B/admin/pubblicate)" 200
ok "A compare tra le pubblicate" "$(grep -c "\"id\":$A," $D/out)" 1
ok "B (bozza) non compare" "$(grep -c "\"id\":$Bid," $D/out)" 0
ok "schedatore non può elencare" "$(c elena $B/admin/pubblicate)" 403
ok "schedatore non può eliminare" "$(c elena -X DELETE "$B/admin/pubblicate?schedaId=$A")" 403
ok "senza login non si elimina" "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$B/admin/pubblicate?schedaId=$A")" 401
ok "admin non elimina una bozza" "$(c admin -X DELETE "$B/admin/pubblicate?schedaId=$Bid")" 409
ok "id mancante" "$(c admin -X DELETE "$B/admin/pubblicate")" 400
ok "admin elimina A" "$(c admin -X DELETE "$B/admin/pubblicate?schedaId=$A")" 200
ok "A non c'è più" "$(c pasquale $B/schede/$A)" 404
ok "seconda eliminazione" "$(c admin -X DELETE "$B/admin/pubblicate?schedaId=$A")" 404
ok "autore condiviso con B: resta" "$(sql "select count(*) from autori where nome='Lorenzo Monaco $R'")" 1
ok "pasquale elimina la bozza B" "$(c pasquale -X DELETE "$B/manageBozze?schedaId=$Bid")" 200
ok "autore non più usato: tolto" "$(sql "select count(*) from autori where nome='Lorenzo Monaco $R'")" 0

echo "== Tenuta"
for i in $(seq 1 60); do c pasquale $B/suggestions >/dev/null; c pasquale $B/manageBozze >/dev/null; done
ok "dopo 120 richieste risponde ancora" "$(c pasquale $B/manageBozze)" 200
ok "nessuna riga orfana lasciata dai test" "$(conta)" "$INIZIO"
echo "---- $pass ok, $fail falliti"
[ $fail -eq 0 ]
