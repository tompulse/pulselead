// SYSTÈME ULTRA-SIMPLE : Secteur → Sections NAF
// Plus de mapping compliqué, juste des sections NAF directes

export const SECTEUR_TO_NAF_SECTIONS: Record<string, string[]> = {
  // Alimentaire = sections 10 + 11
  'Alimentaire': ['10', '11'],
  
  // BTP & Construction = sections 41, 42, 43
  'BTP & Construction': ['16', '23', '41', '42', '43'],
  
  // Automobile = section 45
  'Automobile': ['29', '30', '45'],
  
  // Commerce & Distribution = sections 46 + 47
  'Commerce & Distribution': ['46', '47'],
  
  // Hôtellerie & Restauration = sections 55 + 56
  'Hôtellerie & Restauration': ['55', '56'],
  
  // Transport & Logistique = sections 49, 50, 51, 52, 53
  'Transport & Logistique': ['49', '50', '51', '52', '53'],
  
  // Informatique & Digital = sections 62, 63
  'Informatique & Digital': ['58', '59', '60', '61', '62', '63'],
  
  // Santé & Médical = sections 86, 87, 88
  'Santé & Médical': ['86', '87', '88'],
  
  // Services = sections 95, 96
  'Services personnels': ['95', '96'],
  
  // Autres
  'Autres': ['01', '02', '03', '05', '06', '07', '08', '09', '12', '13', '14', '15', '17', '18', '19', '20', '21', '22', '24', '25', '26', '27', '28', '31', '32', '33', '35', '36', '37', '38', '39', '64', '65', '66', '68', '69', '70', '71', '72', '73', '74', '75', '77', '78', '79', '80', '81', '82', '84', '85', '90', '91', '92', '93', '94', '97', '98', '99']
};

export function getSecteurFromNaf(codeNaf: string | null | undefined): string {
  if (!codeNaf || codeNaf === '' || codeNaf === 'null') return 'Autres';
  
  // Nettoyer le code NAF (supprimer points, espaces, etc.)
  const cleanedNaf = codeNaf.replace(/[.\s]/g, '').trim();
  if (!cleanedNaf) return 'Autres';
  
  // Extraire les 2 premiers chiffres (section NAF)
  const section = cleanedNaf.substring(0, 2);
  
  for (const [secteur, sections] of Object.entries(SECTEUR_TO_NAF_SECTIONS)) {
    if (sections.includes(section)) {
      return secteur;
    }
  }
  
  return 'Autres';
}

export function getSecteurNafSections(secteur: string): string[] {
  return SECTEUR_TO_NAF_SECTIONS[secteur] || [];
}
