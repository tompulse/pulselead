// Départements français organisés par région
// Source: INSEE - Code Officiel Géographique

export interface Region {
  code: string;
  label: string;
  departments: {
    code: string;
    label: string;
  }[];
}

export const REGIONS: Region[] = [
  {
    code: "ARA",
    label: "Auvergne-Rhône-Alpes",
    departments: [
      { code: "01", label: "Ain" },
      { code: "03", label: "Allier" },
      { code: "07", label: "Ardèche" },
      { code: "15", label: "Cantal" },
      { code: "26", label: "Drôme" },
      { code: "38", label: "Isère" },
      { code: "42", label: "Loire" },
      { code: "43", label: "Haute-Loire" },
      { code: "63", label: "Puy-de-Dôme" },
      { code: "69", label: "Rhône" },
      { code: "73", label: "Savoie" },
      { code: "74", label: "Haute-Savoie" }
    ]
  },
  {
    code: "BFC",
    label: "Bourgogne-Franche-Comté",
    departments: [
      { code: "21", label: "Côte-d'Or" },
      { code: "25", label: "Doubs" },
      { code: "39", label: "Jura" },
      { code: "58", label: "Nièvre" },
      { code: "70", label: "Haute-Saône" },
      { code: "71", label: "Saône-et-Loire" },
      { code: "89", label: "Yonne" },
      { code: "90", label: "Territoire de Belfort" }
    ]
  },
  {
    code: "BRE",
    label: "Bretagne",
    departments: [
      { code: "22", label: "Côtes-d'Armor" },
      { code: "29", label: "Finistère" },
      { code: "35", label: "Ille-et-Vilaine" },
      { code: "56", label: "Morbihan" }
    ]
  },
  {
    code: "CVL",
    label: "Centre-Val de Loire",
    departments: [
      { code: "18", label: "Cher" },
      { code: "28", label: "Eure-et-Loir" },
      { code: "36", label: "Indre" },
      { code: "37", label: "Indre-et-Loire" },
      { code: "41", label: "Loir-et-Cher" },
      { code: "45", label: "Loiret" }
    ]
  },
  {
    code: "COR",
    label: "Corse",
    departments: [
      { code: "2A", label: "Corse-du-Sud" },
      { code: "2B", label: "Haute-Corse" }
    ]
  },
  {
    code: "GES",
    label: "Grand Est",
    departments: [
      { code: "08", label: "Ardennes" },
      { code: "10", label: "Aube" },
      { code: "51", label: "Marne" },
      { code: "52", label: "Haute-Marne" },
      { code: "54", label: "Meurthe-et-Moselle" },
      { code: "55", label: "Meuse" },
      { code: "57", label: "Moselle" },
      { code: "67", label: "Bas-Rhin" },
      { code: "68", label: "Haut-Rhin" },
      { code: "88", label: "Vosges" }
    ]
  },
  {
    code: "HDF",
    label: "Hauts-de-France",
    departments: [
      { code: "02", label: "Aisne" },
      { code: "59", label: "Nord" },
      { code: "60", label: "Oise" },
      { code: "62", label: "Pas-de-Calais" },
      { code: "80", label: "Somme" }
    ]
  },
  {
    code: "IDF",
    label: "Île-de-France",
    departments: [
      { code: "75", label: "Paris" },
      { code: "77", label: "Seine-et-Marne" },
      { code: "78", label: "Yvelines" },
      { code: "91", label: "Essonne" },
      { code: "92", label: "Hauts-de-Seine" },
      { code: "93", label: "Seine-Saint-Denis" },
      { code: "94", label: "Val-de-Marne" },
      { code: "95", label: "Val-d'Oise" }
    ]
  },
  {
    code: "NOR",
    label: "Normandie",
    departments: [
      { code: "14", label: "Calvados" },
      { code: "27", label: "Eure" },
      { code: "50", label: "Manche" },
      { code: "61", label: "Orne" },
      { code: "76", label: "Seine-Maritime" }
    ]
  },
  {
    code: "NAQ",
    label: "Nouvelle-Aquitaine",
    departments: [
      { code: "16", label: "Charente" },
      { code: "17", label: "Charente-Maritime" },
      { code: "19", label: "Corrèze" },
      { code: "23", label: "Creuse" },
      { code: "24", label: "Dordogne" },
      { code: "33", label: "Gironde" },
      { code: "40", label: "Landes" },
      { code: "47", label: "Lot-et-Garonne" },
      { code: "64", label: "Pyrénées-Atlantiques" },
      { code: "79", label: "Deux-Sèvres" },
      { code: "86", label: "Vienne" },
      { code: "87", label: "Haute-Vienne" }
    ]
  },
  {
    code: "OCC",
    label: "Occitanie",
    departments: [
      { code: "09", label: "Ariège" },
      { code: "11", label: "Aude" },
      { code: "12", label: "Aveyron" },
      { code: "30", label: "Gard" },
      { code: "31", label: "Haute-Garonne" },
      { code: "32", label: "Gers" },
      { code: "34", label: "Hérault" },
      { code: "46", label: "Lot" },
      { code: "48", label: "Lozère" },
      { code: "65", label: "Hautes-Pyrénées" },
      { code: "66", label: "Pyrénées-Orientales" },
      { code: "81", label: "Tarn" },
      { code: "82", label: "Tarn-et-Garonne" }
    ]
  },
  {
    code: "PDL",
    label: "Pays de la Loire",
    departments: [
      { code: "44", label: "Loire-Atlantique" },
      { code: "49", label: "Maine-et-Loire" },
      { code: "53", label: "Mayenne" },
      { code: "72", label: "Sarthe" },
      { code: "85", label: "Vendée" }
    ]
  },
  {
    code: "PAC",
    label: "Provence-Alpes-Côte d'Azur",
    departments: [
      { code: "04", label: "Alpes-de-Haute-Provence" },
      { code: "05", label: "Hautes-Alpes" },
      { code: "06", label: "Alpes-Maritimes" },
      { code: "13", label: "Bouches-du-Rhône" },
      { code: "83", label: "Var" },
      { code: "84", label: "Vaucluse" }
    ]
  }
];

// DOM-TOM (optionnel, pas dans les données actuelles généralement)
export const DOM_TOM: Region[] = [
  {
    code: "GUA",
    label: "Guadeloupe",
    departments: [{ code: "971", label: "Guadeloupe" }]
  },
  {
    code: "MTQ",
    label: "Martinique",
    departments: [{ code: "972", label: "Martinique" }]
  },
  {
    code: "GUF",
    label: "Guyane",
    departments: [{ code: "973", label: "Guyane" }]
  },
  {
    code: "REU",
    label: "La Réunion",
    departments: [{ code: "974", label: "La Réunion" }]
  },
  {
    code: "MAY",
    label: "Mayotte",
    departments: [{ code: "976", label: "Mayotte" }]
  }
];

// Get department info
export function getDepartmentInfo(code: string): { region: Region; department: { code: string; label: string } } | null {
  for (const region of REGIONS) {
    const dept = region.departments.find(d => d.code === code);
    if (dept) {
      return { region, department: dept };
    }
  }
  // Check DOM-TOM
  for (const region of DOM_TOM) {
    const dept = region.departments.find(d => d.code === code);
    if (dept) {
      return { region, department: dept };
    }
  }
  return null;
}

// Get department label
export function getDepartmentLabel(code: string): string {
  const info = getDepartmentInfo(code);
  return info ? `${info.department.code} - ${info.department.label}` : code;
}

// Get all valid department codes
export function getAllDepartmentCodes(): string[] {
  return [
    ...REGIONS.flatMap(r => r.departments.map(d => d.code)),
    ...DOM_TOM.flatMap(r => r.departments.map(d => d.code))
  ];
}
