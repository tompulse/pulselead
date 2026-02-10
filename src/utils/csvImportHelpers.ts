/**
 * Helpers pour l'import CSV → table nouveaux_sites (aligné avec import_csv_direct.py)
 */

function safeFloat(val: string | number | null | undefined): number | null {
  if (val == null || val === '') return null;
  const n = Number(val);
  if (Number.isNaN(n) || !Number.isFinite(n)) return null;
  return n;
}

export function parseDateCsv(dateStr: string | null | undefined): string | null {
  if (!dateStr?.trim()) return null;
  const s = dateStr.trim();
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

export function getNafHierarchy(codeNaf: string | null | undefined): { section: string | null; division: string | null; groupe: string | null; classe: string | null } {
  if (!codeNaf?.trim()) return { section: null, division: null, groupe: null, classe: null };
  const code = codeNaf.replace('.', '').toUpperCase();
  const division = code.length >= 2 ? code.slice(0, 2) : null;
  const groupe = code.length >= 3 ? code.slice(0, 3) : null;
  const classe = code.length >= 4 ? code.slice(0, 4) : null;
  let section: string | null = null;
  if (division) {
    const d = parseInt(division, 10);
    if (d >= 1 && d <= 3) section = 'A';
    else if (d >= 5 && d <= 9) section = 'B';
    else if (d >= 10 && d <= 33) section = 'C';
    else if (d === 35) section = 'D';
    else if (d >= 36 && d <= 39) section = 'E';
    else if (d >= 41 && d <= 43) section = 'F';
    else if (d >= 45 && d <= 47) section = 'G';
    else if (d >= 49 && d <= 53) section = 'H';
    else if (d >= 55 && d <= 56) section = 'I';
    else if (d >= 58 && d <= 63) section = 'J';
    else if (d >= 64 && d <= 66) section = 'K';
    else if (d === 68) section = 'L';
    else if (d >= 69 && d <= 75) section = 'M';
    else if (d >= 77 && d <= 82) section = 'N';
    else if (d === 84) section = 'O';
    else if (d === 85) section = 'P';
    else if (d >= 86 && d <= 88) section = 'Q';
    else if (d >= 90 && d <= 93) section = 'R';
    else if (d >= 94 && d <= 96) section = 'S';
    else if (d >= 97 && d <= 98) section = 'T';
    else if (d === 99) section = 'U';
  }
  return { section, division, groupe, classe };
}

export function lambert93ToWgs84(x: number, y: number): { lat: number; lng: number } | null {
  const n = 0.725607765053267;
  const c = 11754255.426096;
  const xs = 700000;
  const ys = 12655612.049876;
  const e = 0.08181919106;
  const lambda0 = (3 * Math.PI) / 180;
  if (x < 100000 || x > 1300000 || y < 6000000 || y > 7200000) return null;
  const dx = x - xs;
  const dy = ys - y;
  const R = Math.sqrt(dx * dx + dy * dy);
  const gamma = Math.atan2(dx, dy);
  const lambda = lambda0 + gamma / n;
  let L = -Math.log(R / c) / n;
  let phi = 2 * Math.atan(Math.exp(L)) - Math.PI / 2;
  for (let i = 0; i < 10; i++) {
    const eSinPhi = e * Math.sin(phi);
    phi = 2 * Math.atan(Math.pow((1 + eSinPhi) / (1 - eSinPhi), e / 2) * Math.exp(L)) - Math.PI / 2;
  }
  const lat = (phi * 180) / Math.PI;
  const lng = (lambda * 180) / Math.PI;
  if (lat < 41 || lat > 51.5 || lng < -5.5 || lng > 10) return null;
  return { lat, lng };
}

/** Row = record avec clés du CSV (ex: SIRET, Entreprise, ...). col = map lowercase header -> real header */
export function csvRowToNouveauxSitesRecord(
  row: Record<string, string>,
  col: Record<string, string>
): Record<string, unknown> | null {
  const get = (...candidates: string[]): string => {
    for (const c of candidates) {
      const r = col[c.toLowerCase()] ?? c;
      if (r && row[r] != null) return String(row[r] ?? '').trim();
    }
    return '';
  };
  const siretRaw = get('siret', 'SIRET');
  if (!siretRaw) return null;
  const siret = String(siretRaw).replace(/\.0$/, '').split('.')[0];
  const lambertX = get('coordonneeLambertAbscisseEtablissement', 'coordonnee_lambert_x');
  const lambertY = get('coordonneeLambertOrdonneeEtablissement', 'coordonnee_lambert_y');
  const lx = safeFloat(lambertX);
  const ly = safeFloat(lambertY);
  let lat: number | null = null;
  let lng: number | null = null;
  if (lx != null && ly != null) {
    const co = lambert93ToWgs84(lx, ly);
    if (co) {
      lat = co.lat;
      lng = co.lng;
    }
  }
  const dateCreation = parseDateCsv(get('date_creation', 'dateCreation'));
  const siegeVal = get('siege', 'Siege').toUpperCase();
  const estSiege = ['VRAI', 'TRUE', '1', 'V', 'T', 'OUI'].includes(siegeVal);
  const codeNaf = get('activitePrincipaleEtablissement', 'activite_principale', 'code_naf') || null;
  const naf = getNafHierarchy(codeNaf || undefined);
  const numVoie = get('numeroVoieEtablissement', 'numero_voie');
  const typeVoie = get('typeVoieEtablissement', 'type_voie');
  const libVoie = get('libelleVoieEtablissement', 'libelle_voie');
  const adresse = [numVoie, typeVoie, libVoie].filter(Boolean).join(' ') || null;
  return {
    siret,
    nom: get('entreprise', 'Entreprise', 'nom', 'nom_entreprise') || 'Entreprise sans nom',
    date_creation: dateCreation,
    est_siege: estSiege,
    categorie_juridique: get('categorie_juridique', 'categorieJuridique') || null,
    categorie_entreprise: get('categorieEntreprise', 'categorie_entreprise') || 'PME',
    complement_adresse: get('complementAdresseEtablissement', 'complement_adresse') || null,
    numero_voie: numVoie || null,
    type_voie: typeVoie || null,
    libelle_voie: libVoie || null,
    code_postal: get('codePostalEtablissement', 'code_postal') || null,
    ville: get('libelleCommuneEtablissement', 'ville', 'commune') || null,
    coordonnee_lambert_x: lx,
    coordonnee_lambert_y: ly,
    latitude: lat,
    longitude: lng,
    code_naf: codeNaf || null,
    naf_section: naf.section,
    naf_division: naf.division,
    naf_groupe: naf.groupe,
    naf_classe: naf.classe,
    adresse,
  };
}
