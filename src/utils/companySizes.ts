// Catégories de taille d'entreprise selon l'INSEE
// Source: https://www.insee.fr/fr/metadonnees/definition/c1057

export interface CompanySize {
  code: string;
  label: string;
  description: string;
  emoji: string;
}

export const COMPANY_SIZES: CompanySize[] = [
  {
    code: "GE",
    label: "Grande entreprise",
    description: "5 000+ salariés ou CA > 1,5 Md€",
    emoji: "🏢"
  },
  {
    code: "ETI",
    label: "Entreprise de taille intermédiaire",
    description: "250 à 4 999 salariés",
    emoji: "🏬"
  },
  {
    code: "PME",
    label: "Petite et moyenne entreprise",
    description: "10 à 249 salariés",
    emoji: "🏪"
  },
  {
    code: "Non spécifié",
    label: "Non spécifié",
    description: "Taille non renseignée",
    emoji: "❓"
  }
];

// Get company size info
export function getCompanySizeInfo(code: string): CompanySize | null {
  return COMPANY_SIZES.find(s => s.code === code) || null;
}

// Get company size label
export function getCompanySizeLabel(code: string): string {
  const info = getCompanySizeInfo(code);
  return info?.label || code;
}
