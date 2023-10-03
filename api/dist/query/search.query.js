"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDynamicQuery = void 0;
const buildDynamicQuery = (key, value) => {
    function isValidDate(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    function generateCondition(key, value) {
        let condition = '';
        // RICERCA GENERICA
        if (key === 'queryGenerica') {
            condition = `SELECT s.* FROM schede s LEFT JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda LEFT JOIN autori a ON tsa.id_autore = a.id LEFT JOIN tds_schede_ubicazioni tsu ON s.id = tsu.id_scheda LEFT JOIN ubicazioni u ON s.id = tsu.id_scheda LEFT JOIN tds_schede_provenienze tsp ON s.id = tsp.id_scheda LEFT JOIN provenienze p ON tsp.id_provenienza = p.id WHERE s.titolo_opera  REGEXP  '%${value}%' OR s.descrizione_sintetica  REGEXP  '%${value}%' OR s.corpo_scheda  REGEXP  '%${value}%' OR a.nome  REGEXP  '%${value}%' OR u.ubicazione  REGEXP  '%${value}%' OR p.provenienza  REGEXP  '%${value}%' OR u.ubicazione  REGEXP  '%${value}%' OR s.storia_espositiva  REGEXP '${value}';`;
        }
        // RICERCA SPECIFICA
        if (key === 'titoloOpera') {
            condition = `SELECT * FROM schede  WHERE titolo_opera REGEXP '${value}';`;
        }
        else if (key === 'corpoScheda') {
            condition = `SELECT * FROM schede WHERE corpo_scheda  REGEXP '${value}';`;
        }
        else if (key === 'iscrizioni') {
            condition = `SELECT * FROM schede WHERE iscrizioni  REGEXP '${value}';`;
        }
        else if (key === 'descrizioneSintetica') {
            condition = `SELECT * FROM schede WHERE descrizione_sintetica  REGEXP '${value}';`;
        }
        else if (key === 'storiaEspositiva') {
            condition = `SELECT * FROM schede WHERE storia_espositiva REGEXP  '${value}';`;
        }
        else if (key === 'classificazione') {
            condition = `SELECT * FROM schede WHERE classificazione  REGEXP '${value}';`;
        }
        else if (key === 'categoria') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.categoria  REGEXP '${value}';`;
        }
        else if (key === 'nomeAutore') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_autori tsa ON s.id = tsa.id_scheda INNER JOIN autori a ON tsa.id_autore = a.id WHERE a.nome  REGEXP '${value}';`;
        }
        else if (key === 'ambitoStorico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_cronologie tsa ON s.id = tsa.id_scheda INNER JOIN cronologie a ON tsa.id_cronologia = a.id WHERE a.ambito_storico  REGEXP '${value}';`;
        }
        else if (key === 'dataDadataA') {
            try {
                const splittedStrings = value.split(" ");
                const firstPart = splittedStrings[0];
                const secondPart = splittedStrings[1];
                const ephocFirstPart = splittedStrings[2];
                const ephocSecondPart = splittedStrings[3];
                const isValidFirstPart = isValidDate(firstPart);
                const isValidSecondPart = isValidDate(secondPart);
                if (isValidFirstPart && isValidSecondPart) {
                    let [firstYear, firstMonth, firstDay] = firstPart.split("-");
                    let [secondYear, secondMonth, secondDay] = secondPart.split("-");
                    if (ephocFirstPart == "avanti") {
                        firstYear = '-' + firstYear;
                    }
                    if (ephocSecondPart == "avanti") {
                        secondYear = '-' + secondYear;
                    }
                    condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_cronologie tsa ON s.id = tsa.id_scheda INNER JOIN cronologie a ON tsa.id_cronologia = a.id WHERE (anno_data_da >= ${firstYear} OR (anno_data_da >= ${firstYear} AND mese_data_da >= ${firstMonth}) OR (anno_data_da >= ${firstYear} AND mese_data_da >= ${firstMonth} AND giorno_data_da >= ${firstDay})) AND (anno_data_a <= ${secondYear} OR (anno_data_a <= ${secondYear} AND mese_data_a <= ${secondMonth}) OR (anno_data_a <= ${secondYear} AND mese_data_a <= ${secondMonth} AND giorno_data_a <= ${secondDay}));`;
                }
                else {
                    return '';
                }
            }
            catch (error) {
                return '';
            }
        }
        else if (key === 'nomeMateriale') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_materiali tsa ON s.id = tsa.id_scheda INNER JOIN materiali a ON tsa.id_materiale = a.id WHERE a.nome_materiale  REGEXP  '%${value}%' OR a.descrizione  REGEXP  '${value}';`;
        }
        else if (key === 'nomeTecnica') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_tecniche tsa ON s.id = tsa.id_scheda INNER JOIN tecniche a ON tsa.id_tecnica = a.id WHERE a.nome_tecnica  REGEXP  '%${value}%'OR a.descrizione  REGEXP '${value}';`;
        }
        else if (key === 'ubicazione') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_ubicazioni tsa ON s.id = tsa.id_scheda INNER JOIN ubicazioni a ON tsa.id_ubicazione = a.id WHERE a.ubicazione  REGEXP  '%${value}%' OR a.descrizione REGEXP  '${value}';`;
        }
        else if (key === 'nomeInventario') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_inventari tsa ON s.id = tsa.id_scheda INNER JOIN inventari a ON tsa.id_inventario = a.id WHERE a.nome_inventario  REGEXP '${value}';`;
        }
        else if (key === 'numeroInventario') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_inventari tsa ON s.id = tsa.id_scheda INNER JOIN inventari a ON tsa.id_inventario = a.id WHERE a.numero_inventario REGEXP  '${value}';`;
        }
        else if (key === 'nomeProvenienza') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_provenienze tsa ON s.id = tsa.id_scheda INNER JOIN provenienze a ON tsa.id_provenienza = a.id WHERE a.provenienza  REGEXP  '%${value}%' OR a.descrizione  REGEXP '${value}';`;
        }
        else if (key === 'curatore') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.curatore REGEXP  '${value}';`;
        }
        else if (key === 'titoloMostra') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.titolo_mostra  REGEXP '${value}';`;
        }
        else if (key === 'dataInizioMostradataFineMostra') {
            try {
                const splittedStrings = value.split(" ");
                const firstPart = splittedStrings[0];
                const secondPart = splittedStrings[1];
                const isValidFirstPart = isValidDate(firstPart);
                const isValidSecondPart = isValidDate(secondPart);
                if (isValidFirstPart && isValidSecondPart) {
                    let [firstYear, firstMonth, firstDay] = firstPart.split("-");
                    let [secondYear, secondMonth, secondDay] = secondPart.split("-");
                    condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE (anno_data_da <= ${firstYear} OR (anno_data_da >= ${firstYear} AND mese_data_da >= ${firstMonth}) OR (anno_data_da >= ${firstYear} AND mese_data_da >= ${firstMonth} AND giorno_data_da >= ${firstDay})) AND (anno_data_a <= ${secondYear} OR (anno_data_a <= ${secondYear} AND mese_data_a <= ${secondMonth}) OR (anno_data_a <= ${secondYear} AND mese_data_a <= ${secondMonth} AND giorno_data_a <= ${secondDay}));`;
                }
                else {
                    return '';
                }
            }
            catch (error) {
                return '';
            }
        }
        else if (key === 'luogoMostra') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_mostre tsa ON s.id = tsa.id_scheda INNER JOIN mostre a ON tsa.id_mostra = a.id WHERE a.luogo_mostra  REGEXP  '%${value}%' OR a.descrizione REGEXP  '${value}';`;
        }
        else if (key === 'riferimentoBibliografico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_bibliografie tsa ON s.id = tsa.id_scheda INNER JOIN bibliografie a ON tsa.id_bibliografia = a.id WHERE a.riferimento_bibliografico  REGEXP '${value}';`;
        }
        else if (key === 'altroRiferimentoBibliografico') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_altreBibliografie tsa ON s.id = tsa.id_scheda INNER JOIN altreBibliografie a ON tsa.id_altreBibliografie = a.id WHERE a.riferimento_bibliografico  REGEXP '${value}';`;
        }
        else if (key === 'documentazioniFotografiche') {
            condition = `SELECT s.* FROM schede s INNER JOIN tds_schede_documentazioniFotografiche tsa ON s.id = tsa.id_scheda INNER JOIN documentazioniFotografiche a ON tsa.id_documentazioneFotografica = a.id WHERE a.riferimento_bibliografico REGEXP  '${value}';`;
        }
        return condition;
    }
    const condition = generateCondition(key, value);
    return `${condition}`;
};
exports.buildDynamicQuery = buildDynamicQuery;
