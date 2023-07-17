export const buildDynamicQuery = (searchCriteria: { title: string; author: string; }) => {
    let query = "SELECT * FROM schede WHERE 1=1";
    const params = [];
  
    // Costruisci la clausola WHERE in base ai criteri di ricerca
    if (searchCriteria.title) {
      query += " AND LOWER(titolo_di_servizio) LIKE ?";
      params.push(`%${searchCriteria.title.toLowerCase()}%`);
    }
  
    if (searchCriteria.author) {
      query += " AND LOWER(titolo_opera) LIKE ?";
      params.push(`%${searchCriteria.author.toLowerCase()}%`);
    }
  
    // Aggiungi ulteriori clausole WHERE per gli altri campi se necessario
    // Esempio: if (searchCriteria.corpo_scheda) { query += " AND LOWER(corpo_scheda) LIKE ?"; params.push(`%${searchCriteria.corpo_scheda.toLowerCase()}%`); }
  
    return {
      query,
      params,
    };
  };
  