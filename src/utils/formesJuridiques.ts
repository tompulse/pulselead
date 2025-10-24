// Formes juridiques basées sur les 83 000 entreprises réelles
export const FORMES_JURIDIQUES = [
  { value: "Société civile immobilière", label: "SCI - Société Civile Immobilière" },
  { value: "Société par actions simplifiée", label: "SAS - Société par Actions Simplifiée" },
  { value: "Société à responsabilité limitée", label: "SARL - Société à Responsabilité Limitée" },
  { value: "Société civile", label: "SC - Société Civile" },
  { value: "Société par actions simplifiée (à associé unique)", label: "SASU - SAS à Associé Unique" },
  { value: "Société en Nom Collectif", label: "SNC - Société en Nom Collectif" },
  { value: "Société à responsabilité limitée (à associé unique)", label: "EURL - SARL à Associé Unique" },
  { value: "Exploitation agricole à responsabilité limitée", label: "EARL - Exploitation Agricole à Responsabilité Limitée" },
  { value: "Société civile de construction vente", label: "SCCV - Société Civile de Construction Vente" },
  { value: "Société civile de moyens", label: "SCM - Société Civile de Moyens" },
  { value: "Société civile d'exploitation agricole", label: "SCEA - Société Civile d'Exploitation Agricole" },
  { value: "Groupement foncier agricole", label: "GFA - Groupement Foncier Agricole" },
  { value: "Société d'exercice libéral à responsabilité limitée", label: "SELARL - Société d'Exercice Libéral à Responsabilité Limitée" },
  { value: "Société civile immobilière de construction vente", label: "SCI-CV - SCI de Construction Vente" },
  { value: "Groupement d'intérêt économique", label: "GIE - Groupement d'Intérêt Économique" },
  { value: "autre", label: "Autre forme juridique" },
];

export function normalizeFormeJuridique(forme: string | null): string {
  if (!forme) return "autre";
  
  // Retourner la forme exacte si elle existe dans la liste
  const formeExacte = FORMES_JURIDIQUES.find(f => f.value === forme);
  if (formeExacte) return forme;
  
  // Sinon normaliser avec les variations communes
  const formeLower = forme.toLowerCase().trim();

  // Abréviations courantes
  if (formeLower === 'sas') return 'Société par actions simplifiée';
  if (formeLower === 'sasu') return 'Société par actions simplifiée (à associé unique)';
  if (formeLower === 'sarl') return 'Société à responsabilité limitée';
  if (formeLower === 'eurl') return 'Société à responsabilité limitée (à associé unique)';
  if (formeLower === 'sci') return 'Société civile immobilière';
  if (formeLower === 'sc') return 'Société civile';
  if (formeLower === 'snc') return 'Société en Nom Collectif';
  if (formeLower === 'earl') return 'Exploitation agricole à responsabilité limitée';
  if (formeLower === 'sccv') return 'Société civile de construction vente';
  if (formeLower === 'scm') return 'Société civile de moyens';
  if (formeLower === 'scea') return "Société civile d'exploitation agricole";
  if (formeLower === 'gfa') return 'Groupement foncier agricole';
  if (formeLower === 'selarl') return "Société d'exercice libéral à responsabilité limitée";
  if (formeLower === 'gie') return "Groupement d'intérêt économique";
  
  if (formeLower.includes("civile immobilière")) return "Société civile immobilière";
  if (formeLower.includes("actions simplifiée") && formeLower.includes("associé unique")) return "Société par actions simplifiée (à associé unique)";
  if (formeLower.includes("actions simplifiée")) return "Société par actions simplifiée";
  if (formeLower.includes("responsabilité limitée") && formeLower.includes("associé unique")) return "Société à responsabilité limitée (à associé unique)";
  if (formeLower.includes("responsabilité limitée") && !formeLower.includes("exploitation")) return "Société à responsabilité limitée";
  if (formeLower.includes("société civile") && !formeLower.includes("immobilière")) return "Société civile";
  if (formeLower.includes("nom collectif")) return "Société en Nom Collectif";
  if (formeLower.includes("exploitation agricole à responsabilité")) return "Exploitation agricole à responsabilité limitée";
  if (formeLower.includes("construction vente") && formeLower.includes("immobilière")) return "Société civile immobilière de construction vente";
  if (formeLower.includes("construction vente")) return "Société civile de construction vente";
  if (formeLower.includes("civile de moyens")) return "Société civile de moyens";
  if (formeLower.includes("exploitation agricole")) return "Société civile d'exploitation agricole";
  if (formeLower.includes("groupement foncier agricole")) return "Groupement foncier agricole";
  if (formeLower.includes("exercice libéral")) return "Société d'exercice libéral à responsabilité limitée";
  if (formeLower.includes("groupement d'intérêt")) return "Groupement d'intérêt économique";
  
  return "autre";
}

export function getFormeJuridiqueLabel(value: string): string {
  const forme = FORMES_JURIDIQUES.find(f => f.value === value);
  return forme?.label || "Autre forme";
}
