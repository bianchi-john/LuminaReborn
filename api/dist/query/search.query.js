"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDynamicQuery = void 0;
const buildDynamicQuery = (key, value) => {
    function generateCondition(key, value) {
        let condition = '';
        if (key === 'titoloOpera') {
            condition = `SELECT * FROM schede  WHERE titolo_opera LIKE '%${value}%';`;
        }
        else if (key === 'corpoScheda') {
            condition = `SELECT * FROM schede WHERE corpo_scheda LIKE '%${value}%';`;
        }
        else if (key === 'iscrizioni') {
            condition = `SELECT * FROM schede WHERE iscrizioni LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneSintetica') {
            condition = `SELECT * FROM schede WHERE descrizione_sintetica LIKE '%${value}%';`;
        }
        else if (key === 'storiaEspositiva') {
            condition = `SELECT * FROM schede WHERE storia_espositiva LIKE '%${value}%';`;
        }
        else if (key === 'classificazione') {
            condition = `SELECT * FROM schede WHERE classificazione LIKE '%${value}%';`;
        }
        else if (key === 'formulaPrecedente') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.formula_precedente LIKE '%${value}%';`;
        }
        else if (key === 'formulaSuccessiva') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.formula_successiva LIKE '%${value}%';`;
        }
        else if (key === 'categoria') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
        }
        else if (key === 'nomeAutore') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.nome LIKE '%${value}%';`;
        }
        else if (key === 'ambitoStorico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_cronologie tsa ON s.id = tsa.id_scheda INNER JOIN cronologie a ON tsa.id_cronologia = a.id WHERE a.ambito_storico LIKE '%${value}%';`;
            // } else if (key === 'dataDa') {
            //   `INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
            // } else if (key === 'dataA') {
            //   `INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
        }
        else if (key === 'nomeMateriale') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_materiali tsa ON s.id = tsa.id_scheda INNER JOIN materiali a ON tsa.id_materiale = a.id WHERE a.nome_materiale LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneMateriale') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_materiali tsa ON s.id = tsa.id_scheda INNER JOIN materiali a ON tsa.id_materiale = a.id WHERE a.descrizione LIKE '%${value}%';`;
        }
        else if (key === 'nomeTecnica') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_tecniche tsa ON s.id = tsa.id_scheda INNER JOIN tecniche a ON tsa.id_tecnica = a.id WHERE a.nome_tecnica LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneTecnica') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_tecniche tsa ON s.id = tsa.id_scheda INNER JOIN tecniche a ON tsa.id_tecnica = a.id WHERE a.descrizione LIKE '%${value}%';`;
        }
        else if (key === 'ubicazione') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_ubicazioni tsa ON s.id = tsa.id_scheda INNER JOIN ubicazioni a ON tsa.id_ubicazione = a.id WHERE a.ubicazione LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneUbicazione') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_ubicazioni tsa ON s.id = tsa.id_scheda INNER JOIN ubicazioni a ON tsa.id_ubicazione = a.id WHERE a.descrizione LIKE '%${value}%';`;
        }
        else if (key === 'nomeInventario') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_inventari tsa ON s.id = tsa.id_scheda INNER JOIN inventari a ON tsa.id_inventario = a.id WHERE a.nome_inventario LIKE '%${value}%';`;
        }
        else if (key === 'nomeProvenienza') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_provenienze tsa ON s.id = tsa.id_scheda INNER JOIN provenienze a ON tsa.id_provenienza = a.id WHERE a.provenienza LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneProvenienza') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_provenienze tsa ON s.id = tsa.id_scheda INNER JOIN provenienze a ON tsa.id_provenienza = a.id WHERE a.descrizione LIKE '%${value}%';`;
        }
        else if (key === 'curatore') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.curatore LIKE '%${value}%';`;
        }
        else if (key === 'titoloMostra') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.titolo_mostra LIKE '%${value}%';`;
            // } else if (key === 'dataInizioMostra') {
            //   `INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
            // } else if (key === 'dataFineMostra') {
            //   `INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
        }
        else if (key === 'luogoMostra') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.luogo_mostra LIKE '%${value}%';`;
        }
        else if (key === 'descrizioneMostra') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.descrizione LIKE '%${value}%';`;
        }
        else if (key === 'riferimentoBibliografico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_bibliografie tsa ON s.id = tsa.id_scheda INNER JOIN bibliografie a ON tsa.id_bibliografia = a.id WHERE a.riferimento_bibliografico LIKE '%${value}%';`;
        }
        else if (key === 'altroRiferimentoBibliografico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
        }
        else if (key === 'documentazioniFotografiche') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria LIKE '%${value}%';`;
        }
        return condition;
    }
    // Esempi di utilizzo:
    const condition = generateCondition(key, value);
    let result = '';
    if (condition) {
        result = `${condition}`;
        return result;
    }
    return ('Errore nella richiesta');
    console.log(result);
};
exports.buildDynamicQuery = buildDynamicQuery;
