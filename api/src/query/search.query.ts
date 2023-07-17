export const buildDynamicQuery = (searchCriteria: {

  titoloOpera: string;
  corpoScheda: string;
  iscrizioni: string;
  descrizioneSintetica: string;
  storiaEspositiva: string;
  classificazione: string;
  formulaPrecedente: string;
  formulaSuccessiva: string;
  categoria: string;
  nomeAutore: string;
  ambitoStorico: string;
  dataDa: Date;
  dataA: Date;
  nomeMateriale: string;
  descrizioneMateriale: string;
  nomeTecnica: string;
  descrizioneTecnica: string;
  ubicazione: string;
  descrizioneUbicazione: string;
  nomeInventario: string;
  nomeProvenienza: string;
  descrizioneProvenienza: string;
  curatore: string;
  titoloMostra: string;
  dataInizioMostra: Date;
  dataFineMostra: Date;
  luogoMostra: string;
  descrizioneMostra: string;
  riferimentoBibliografico: string;
  altroRiferimentoBibliografico: string;
  documentazioniFotografiche: string;
}) => {
  let query = "SELECT * FROM schede WHERE 1=1";
  const params = [];

  // Aggiungi ulteriori clausole WHERE per gli altri campi se necessario
  if (searchCriteria.titoloOpera) {
    query += " AND LOWER(titolo_opera) LIKE ?";
    params.push(`%${searchCriteria.titoloOpera.toLowerCase()}%`);
  }

  if (searchCriteria.corpoScheda) {
    query += " AND LOWER(corpo_scheda) LIKE ?";
    params.push(`%${searchCriteria.corpoScheda.toLowerCase()}%`);
  }

  // Aggiungi le altre clausole WHERE per gli altri campi
  if (searchCriteria.iscrizioni) {
    query += " AND LOWER(iscrizioni) LIKE ?";
    params.push(`%${searchCriteria.iscrizioni.toLowerCase()}%`);
  }

  if (searchCriteria.descrizioneSintetica) {
    query += " AND LOWER(descrizione_sintetica) LIKE ?";
    params.push(`%${searchCriteria.descrizioneSintetica.toLowerCase()}%`);
  }

  if (searchCriteria.storiaEspositiva) {
    query += " AND LOWER(storia_espositiva) LIKE ?";
    params.push(`%${searchCriteria.storiaEspositiva.toLowerCase()}%`);
  }

  if (searchCriteria.classificazione) {
    query += " AND LOWER(classificazione) LIKE ?";
    params.push(`%${searchCriteria.classificazione.toLowerCase()}%`);
  }

  if (searchCriteria.formulaPrecedente) {
    query += " AND LOWER(formula_precedente) LIKE ?";
    params.push(`%${searchCriteria.formulaPrecedente.toLowerCase()}%`);
  }

  if (searchCriteria.formulaSuccessiva) {
    query += " AND LOWER(formula_successiva) LIKE ?";
    params.push(`%${searchCriteria.formulaSuccessiva.toLowerCase()}%`);
  }

  if (searchCriteria.categoria) {
    query += " AND LOWER(categoria) LIKE ?";
    params.push(`%${searchCriteria.categoria.toLowerCase()}%`);
  }

  if (searchCriteria.nomeAutore) {
    query += " AND LOWER(nome_autore) LIKE ?";
    params.push(`%${searchCriteria.nomeAutore.toLowerCase()}%`);
  }

  if (searchCriteria.ambitoStorico) {
    query += " AND LOWER(ambito_storico) LIKE ?";
    params.push(`%${searchCriteria.ambitoStorico.toLowerCase()}%`);
  }

  if (searchCriteria.dataDa) {
    query += " AND data >= ?";
    params.push(searchCriteria.dataDa);
  }

  if (searchCriteria.dataA) {
    query += " AND data <= ?";
    params.push(searchCriteria.dataA);
  }

  if (searchCriteria.nomeMateriale) {
    query += " AND LOWER(nome_materiale) LIKE ?";
    params.push(`%${searchCriteria.nomeMateriale.toLowerCase()}%`);
  }

  if (searchCriteria.descrizioneMateriale) {
    query += " AND LOWER(descrizione_materiale) LIKE ?";
    params.push(`%${searchCriteria.descrizioneMateriale.toLowerCase()}%`);
  }

  if (searchCriteria.nomeTecnica) {
    query += " AND LOWER(nome_tecnica) LIKE ?";
    params.push(`%${searchCriteria.nomeTecnica.toLowerCase()}%`);
  }

  if (searchCriteria.descrizioneTecnica) {
    query += " AND LOWER(descrizione_tecnica) LIKE ?";
    params.push(`%${searchCriteria.descrizioneTecnica.toLowerCase()}%`);
  }

  if (searchCriteria.ubicazione) {
    query += " AND LOWER(ubicazione) LIKE ?";
    params.push(`%${searchCriteria.ubicazione.toLowerCase()}%`);
  }

  if (searchCriteria.descrizioneUbicazione) {
    query += " AND LOWER(descrizione_ubicazione) LIKE ?";
    params.push(`%${searchCriteria.descrizioneUbicazione.toLowerCase()}%`);
  }

  if (searchCriteria.nomeInventario) {
    query += " AND LOWER(nome_inventario) LIKE ?";
    params.push(`%${searchCriteria.nomeInventario.toLowerCase()}%`);
  }

  if (searchCriteria.nomeProvenienza) {
    query += " AND LOWER(nome_provenienza) LIKE ?";
    params.push(`%${searchCriteria.nomeProvenienza.toLowerCase()}%`);
  }

  if (searchCriteria.descrizioneProvenienza) {
    query += " AND LOWER(descrizione_provenienza) LIKE ?";
    params.push(`%${searchCriteria.descrizioneProvenienza.toLowerCase()}%`);
  }

  if (searchCriteria.curatore) {
    query += " AND LOWER(curatore) LIKE ?";
    params.push(`%${searchCriteria.curatore.toLowerCase()}%`);
  }

  if (searchCriteria.titoloMostra) {
    query += " AND LOWER(titolo_mostra) LIKE ?";
    params.push(`%${searchCriteria.titoloMostra.toLowerCase()}%`);
  }

  if (searchCriteria.dataInizioMostra) {
    query += " AND data_inizio_mostra >= ?";
    params.push(searchCriteria.dataInizioMostra);
  }

  if (searchCriteria.luogoMostra) {
    query += " AND luogoMostra <= ?";
    params.push(searchCriteria.luogoMostra);
  }
  if (searchCriteria.descrizioneMostra) {
    query += " AND descrizioneMostra <= ?";
    params.push(searchCriteria.descrizioneMostra);
  }
  if (searchCriteria.riferimentoBibliografico) {
    query += " AND riferimentoBibliografico <= ?";
    params.push(searchCriteria.riferimentoBibliografico);
  }
  if (searchCriteria.altroRiferimentoBibliografico) {
    query += " AND altroRiferimentoBibliografico <= ?";
    params.push(searchCriteria.altroRiferimentoBibliografico);
  }
  if (searchCriteria.documentazioniFotografiche) {
    query += " AND documentazioniFotografiche <= ?";
    params.push(searchCriteria.documentazioniFotografiche);
  }

  return {
    query,
    params,
  };
};
