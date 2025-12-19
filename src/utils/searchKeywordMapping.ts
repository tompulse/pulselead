// Mapping des mots-clés métier vers les codes NAF correspondants
export const KEYWORD_TO_NAF: Record<string, string[]> = {
  // Automobile
  'garage': ['45.20A', '45.20B', '45.11Z', '45.19Z', '45.32Z', '45.40Z'],
  'garagiste': ['45.20A', '45.20B'],
  'mecanique': ['45.20A', '45.20B', '33.12Z'],
  'mecanicien': ['45.20A', '45.20B'],
  'carrosserie': ['45.20A', '45.20B'],
  'carrossier': ['45.20A', '45.20B'],
  'automobile': ['45.11Z', '45.19Z', '45.20A', '45.20B', '45.32Z', '45.40Z'],
  'auto': ['45.11Z', '45.19Z', '45.20A', '45.20B', '45.32Z', '45.40Z'],
  'voiture': ['45.11Z', '45.19Z', '45.20A', '45.20B'],
  'concessionnaire': ['45.11Z', '45.19Z'],
  'pneu': ['45.32Z'],
  'pneumatique': ['45.32Z'],
  
  // Restauration
  'restaurant': ['56.10A', '56.10B', '56.10C'],
  'resto': ['56.10A', '56.10B', '56.10C'],
  'restauration': ['56.10A', '56.10B', '56.10C', '56.21Z', '56.29A', '56.29B'],
  'cafe': ['56.30Z'],
  'bar': ['56.30Z'],
  'brasserie': ['56.10A', '56.30Z'],
  'pizzeria': ['56.10A'],
  'pizza': ['56.10A'],
  'fast food': ['56.10C'],
  'fastfood': ['56.10C'],
  'traiteur': ['56.21Z'],
  'snack': ['56.10C'],
  
  // Boulangerie / Pâtisserie
  'boulangerie': ['10.71B', '10.71C', '47.24Z'],
  'boulanger': ['10.71B', '10.71C', '47.24Z'],
  'patisserie': ['10.71B', '10.71C', '47.24Z'],
  'patissier': ['10.71B', '10.71C', '47.24Z'],
  'pain': ['10.71B', '10.71C', '47.24Z'],
  
  // Commerce alimentaire
  'epicerie': ['47.11A', '47.11B', '47.11C', '47.11D'],
  'supermarche': ['47.11A', '47.11B', '47.11C', '47.11D', '47.11E', '47.11F'],
  'alimentation': ['47.11A', '47.11B', '47.11C', '47.11D'],
  'primeur': ['47.21Z'],
  'fruits': ['47.21Z'],
  'legumes': ['47.21Z'],
  'boucherie': ['47.22Z'],
  'boucher': ['47.22Z'],
  'charcuterie': ['47.22Z'],
  'poissonnerie': ['47.23Z'],
  'poissonnier': ['47.23Z'],
  'fromager': ['47.29Z'],
  'fromagerie': ['47.29Z'],
  'caviste': ['47.25Z'],
  'vin': ['47.25Z'],
  
  // Beauté / Bien-être
  'coiffeur': ['96.02A', '96.02B'],
  'coiffure': ['96.02A', '96.02B'],
  'salon': ['96.02A', '96.02B', '96.04Z'],
  'esthetique': ['96.02B', '96.04Z'],
  'beaute': ['96.02A', '96.02B', '96.04Z', '47.75Z'],
  'spa': ['96.04Z'],
  'massage': ['96.04Z'],
  'onglerie': ['96.02B'],
  'manucure': ['96.02B'],
  'barbier': ['96.02A'],
  
  // Santé
  'pharmacie': ['47.73Z'],
  'pharmacien': ['47.73Z'],
  'medecin': ['86.21Z', '86.22A', '86.22B', '86.22C'],
  'docteur': ['86.21Z', '86.22A', '86.22B', '86.22C'],
  'dentiste': ['86.23Z'],
  'kine': ['86.90D'],
  'kinesitherapeute': ['86.90D'],
  'osteopathe': ['86.90D'],
  'opticien': ['47.78A'],
  'optique': ['47.78A'],
  'veterinaire': ['75.00Z'],
  'infirmier': ['86.90C'],
  'laboratoire': ['86.90B'],
  
  // BTP / Construction
  'btp': ['41.20A', '41.20B', '43.11Z', '43.12A', '43.12B'],
  'construction': ['41.20A', '41.20B', '43.11Z', '43.12A', '43.12B'],
  'batiment': ['41.20A', '41.20B', '43.11Z', '43.12A', '43.12B'],
  'maconnerie': ['43.99A', '43.99B'],
  'macon': ['43.99A', '43.99B'],
  'plombier': ['43.22A', '43.22B'],
  'plomberie': ['43.22A', '43.22B'],
  'electricien': ['43.21A', '43.21B'],
  'electricite': ['43.21A', '43.21B'],
  'peintre': ['43.34Z'],
  'peinture': ['43.34Z'],
  'menuisier': ['43.32A', '43.32B', '43.32C'],
  'menuiserie': ['43.32A', '43.32B', '43.32C'],
  'charpentier': ['43.91A', '43.91B'],
  'couvreur': ['43.91A', '43.91B'],
  'toiture': ['43.91A', '43.91B'],
  'carreleur': ['43.33Z'],
  'carrelage': ['43.33Z'],
  'chauffagiste': ['43.22A', '43.22B'],
  'climatisation': ['43.22A', '43.22B'],
  
  // Immobilier
  'immobilier': ['68.10Z', '68.20A', '68.20B', '68.31Z', '68.32A', '68.32B'],
  'agence immobiliere': ['68.31Z'],
  'agent immobilier': ['68.31Z'],
  
  // Services aux entreprises
  'comptable': ['69.20Z'],
  'comptabilite': ['69.20Z'],
  'expert comptable': ['69.20Z'],
  'avocat': ['69.10Z'],
  'cabinet': ['69.10Z', '69.20Z'],
  'notaire': ['69.10Z'],
  'huissier': ['69.10Z'],
  'assurance': ['65.11Z', '65.12Z', '66.21Z', '66.22Z'],
  'assureur': ['65.11Z', '65.12Z', '66.21Z', '66.22Z'],
  'banque': ['64.19Z', '64.92Z'],
  'conseil': ['70.22Z'],
  'consulting': ['70.22Z'],
  
  // Informatique / Tech
  'informatique': ['62.01Z', '62.02A', '62.02B', '62.03Z', '62.09Z'],
  'info': ['62.01Z', '62.02A', '62.02B', '62.03Z', '62.09Z'],
  'developpeur': ['62.01Z'],
  'programmeur': ['62.01Z'],
  'web': ['62.01Z', '62.09Z', '63.12Z'],
  'digital': ['62.01Z', '62.09Z', '63.12Z'],
  'hebergement_web': ['63.11Z'],
  
  // Commerce de détail
  'fleuriste': ['47.76Z'],
  'fleurs': ['47.76Z'],
  'librairie': ['47.61Z', '47.62Z'],
  'livre': ['47.61Z', '47.62Z'],
  'bijouterie': ['47.77Z'],
  'bijoutier': ['47.77Z'],
  'horlogerie': ['47.77Z'],
  'vetement': ['47.71Z'],
  'pret a porter': ['47.71Z'],
  'mode': ['47.71Z'],
  'chaussure': ['47.72A', '47.72B'],
  'sport': ['47.64Z', '93.11Z', '93.12Z', '93.13Z'],
  'jouet': ['47.65Z'],
  'electromenager': ['47.54Z'],
  'meuble': ['47.59A', '47.59B'],
  'decoration': ['47.59A', '47.59B'],
  'bricolage': ['47.52A', '47.52B'],
  'quincaillerie': ['47.52A', '47.52B'],
  'jardinerie': ['47.76Z'],
  
  // Transport / Logistique
  'transport': ['49.41A', '49.41B', '49.41C', '49.42Z'],
  'transporteur': ['49.41A', '49.41B', '49.41C'],
  'demenagement': ['49.42Z'],
  'logistique': ['52.10A', '52.10B', '52.29A', '52.29B'],
  'coursier': ['53.20Z'],
  'livraison': ['53.20Z'],
  'taxi': ['49.32Z'],
  'vtc': ['49.32Z'],
  
  // Formation / Education
  'formation': ['85.59A', '85.59B'],
  'ecole': ['85.10Z', '85.20Z', '85.31Z', '85.32Z', '85.41Z', '85.42Z'],
  'auto ecole': ['85.53Z'],
  'creche': ['88.91A'],
  'garderie': ['88.91A'],
  
  // Hôtellerie
  'hotel': ['55.10Z'],
  'hebergement': ['55.10Z', '55.20Z', '55.30Z', '63.11Z'],
  'camping': ['55.30Z'],
  'chambre hote': ['55.20Z'],
  'gite': ['55.20Z'],
  
  // Industrie
  'usine': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
  'industrie': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
  'fabrication': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
  
  // Imprimerie
  'imprimerie': ['18.11Z', '18.12Z', '18.13Z', '18.14Z'],
  'impression': ['18.11Z', '18.12Z', '18.13Z', '18.14Z'],
  
  // Agriculture
  'agricole': ['01.11Z', '01.12Z', '01.13Z', '01.14Z', '01.15Z', '01.16Z', '01.19Z'],
  'agriculture': ['01.11Z', '01.12Z', '01.13Z', '01.14Z', '01.15Z', '01.16Z', '01.19Z'],
  'elevage': ['01.41Z', '01.42Z', '01.43Z', '01.44Z', '01.45Z', '01.46Z', '01.47Z', '01.49Z'],
  'ferme': ['01.11Z', '01.12Z', '01.13Z', '01.41Z', '01.42Z'],
};

// Normalise une chaîne pour la recherche (supprime accents, minuscules)
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Trouve les codes NAF correspondant à un terme de recherche
export function findNafCodesForKeyword(searchTerm: string): string[] {
  const normalized = normalizeSearchTerm(searchTerm);
  const nafCodes: Set<string> = new Set();
  
  // Chercher le terme exact
  if (KEYWORD_TO_NAF[normalized]) {
    KEYWORD_TO_NAF[normalized].forEach(code => nafCodes.add(code));
  }
  
  // Chercher les termes qui contiennent le mot recherché
  Object.entries(KEYWORD_TO_NAF).forEach(([keyword, codes]) => {
    if (keyword.includes(normalized) || normalized.includes(keyword)) {
      codes.forEach(code => nafCodes.add(code));
    }
  });
  
  return Array.from(nafCodes);
}

// Génère les conditions de filtre NAF pour Supabase
export function generateNafFilterConditions(nafCodes: string[]): string {
  if (nafCodes.length === 0) return '';
  
  const conditions = nafCodes.map(code => {
    // Si c'est un code à 2 chiffres (division), on cherche tous les codes qui commencent par ces 2 chiffres
    if (/^\d{2}$/.test(code)) {
      return `code_naf.ilike.${code}%`;
    }
    // Sinon on cherche le code exact
    return `code_naf.eq.${code}`;
  });
  
  return conditions.join(',');
}
