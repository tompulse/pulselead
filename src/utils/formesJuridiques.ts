// Formes juridiques normalisées
export const FORMES_JURIDIQUES = [
  { value: "sci", label: "SCI - Société Civile Immobilière" },
  { value: "sas", label: "SAS - Société par Actions Simplifiée" },
  { value: "sarl", label: "SARL - Société à Responsabilité Limitée" },
  { value: "sa", label: "SA - Société Anonyme" },
  { value: "snc", label: "SNC - Société en Nom Collectif" },
  { value: "scea", label: "SCEA - Société Civile d'Exploitation Agricole" },
  { value: "scm", label: "SCM - Société Civile de Moyens" },
  { value: "earl", label: "EARL - Exploitation Agricole à Responsabilité Limitée" },
  { value: "gfa", label: "GFA - Groupement Foncier Agricole" },
  { value: "gfr", label: "GFR - Groupement Foncier Rural" },
  { value: "gie", label: "GIE - Groupement d'Intérêt Économique" },
  { value: "autre", label: "Autre forme" },
];

export function normalizeFormeJuridique(forme: string | null): string {
  if (!forme) return "autre";
  
  const formeLower = forme.toLowerCase();
  
  if (formeLower.includes("civile immobilière") || formeLower === "sci") return "sci";
  if (formeLower.includes("actions simplifiée") || formeLower === "sas") return "sas";
  if (formeLower.includes("responsabilité limitée") && !formeLower.includes("earl")) return "sarl";
  if (formeLower.includes("anonyme")) return "sa";
  if (formeLower.includes("nom collectif")) return "snc";
  if (formeLower.includes("exploitation agricole")) return "scea";
  if (formeLower.includes("civile de moyens")) return "scm";
  if (formeLower.includes("earl") || formeLower.includes("exploitation agricole à responsabilité")) return "earl";
  if (formeLower.includes("groupement foncier agricole") || formeLower === "gfa") return "gfa";
  if (formeLower.includes("groupement foncier rural") || formeLower === "gfr") return "gfr";
  if (formeLower.includes("groupement d'intérêt") || formeLower === "gie") return "gie";
  
  return "autre";
}

export function getFormeJuridiqueLabel(value: string): string {
  const forme = FORMES_JURIDIQUES.find(f => f.value === value);
  return forme?.label || "Autre forme";
}
