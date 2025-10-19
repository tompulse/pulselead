export const REGIONS_DATA = {
  "Auvergne-Rhône-Alpes": {
    center: [5.7301, 45.7640],
    zoom: 7,
    departments: ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"]
  },
  "Bourgogne-Franche-Comté": {
    center: [5.0415, 47.2805],
    zoom: 7,
    departments: ["21", "25", "39", "58", "70", "71", "89", "90"]
  },
  "Bretagne": {
    center: [-2.9539, 48.2020],
    zoom: 8,
    departments: ["22", "29", "35", "56"]
  },
  "Centre-Val de Loire": {
    center: [1.7191, 47.7516],
    zoom: 7,
    departments: ["18", "28", "36", "37", "41", "45"]
  },
  "Corse": {
    center: [9.0915, 42.0396],
    zoom: 8,
    departments: ["2A", "2B"]
  },
  "Grand Est": {
    center: [6.1838, 48.6994],
    zoom: 7,
    departments: ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"]
  },
  "Hauts-de-France": {
    center: [2.9934, 50.4801],
    zoom: 7,
    departments: ["02", "59", "60", "62", "80"]
  },
  "Île-de-France": {
    center: [2.3522, 48.8566],
    zoom: 9,
    departments: ["75", "77", "78", "91", "92", "93", "94", "95"]
  },
  "Normandie": {
    center: [0.3381, 49.1829],
    zoom: 7,
    departments: ["14", "27", "50", "61", "76"]
  },
  "Nouvelle-Aquitaine": {
    center: [0.0000, 45.0000],
    zoom: 7,
    departments: ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"]
  },
  "Occitanie": {
    center: [1.4442, 43.6045],
    zoom: 7,
    departments: ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"]
  },
  "Pays de la Loire": {
    center: [-0.5792, 47.4784],
    zoom: 8,
    departments: ["44", "49", "53", "72", "85"]
  },
  "Provence-Alpes-Côte d'Azur": {
    center: [6.0679, 43.9352],
    zoom: 7,
    departments: ["04", "05", "06", "13", "83", "84"]
  }
} as const;

export const DEPARTMENT_NAMES: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
  "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
  "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
  "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "21": "Côte-d'Or",
  "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs",
  "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
  "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde",
  "34": "Hérault", "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire",
  "38": "Isère", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher",
  "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret",
  "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
  "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne",
  "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan", "57": "Moselle",
  "58": "Nièvre", "59": "Nord", "60": "Oise", "61": "Orne",
  "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées",
  "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône",
  "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie",
  "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne",
  "78": "Yvelines", "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn",
  "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendée",
  "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
  "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne", "95": "Val-d'Oise", "2A": "Corse-du-Sud", "2B": "Haute-Corse"
};
