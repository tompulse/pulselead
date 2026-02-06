# 🔧 Solution pour vos colonnes CSV

Vos noms de colonnes ne correspondent pas aux noms attendus par la fonction API, **MAIS** ils correspondent parfaitement à la structure de la table !

## Vos colonnes actuelles :
```
siret | Entreprise | date_creation | siege | categorie_juridique | categorie_entreprise | 
complement_adresse | numero_voie | type_voie | libelle_voie | code_postal | ville | 
coordonnee_lambert_x | coordonnee_lambert_y | code naf
```

---

## ✅ Solution 1 : Import SQL Direct (RECOMMANDÉ)

### Méthode A : Script Python Automatique

J'ai créé un script qui convertit automatiquement votre CSV en SQL :

```bash
python3 convert_csv_to_sql.py votre_fichier.csv
```

Ce script va :
- ✅ Lire votre CSV avec vos noms de colonnes
- ✅ Générer un fichier `.sql` avec des INSERT
- ✅ Gérer les conversions de dates automatiquement
- ✅ Valider les SIRET
- ✅ Gérer les conflits (UPSERT)

**Ensuite** :
1. Ouvrir **Supabase Dashboard > SQL Editor**
2. Copier-coller le contenu du fichier `.sql` généré
3. Cliquer sur **Run**
4. ✅ C'est fait !

---

### Méthode B : Conversion Manuelle avec Excel/Calc

Si vous préférez Excel/LibreOffice Calc :

1. **Ouvrez votre CSV**

2. **Créez une colonne "SQL"** avec cette formule :

```excel
="('"&A2&"', '"&B2&"', '"&TEXT(C2,"YYYY-MM-DD")&"', "&IF(D2="VRAI","true","false")&", '"&E2&"', '"&F2&"', "&IF(G2="","NULL","'"&G2&"'")&", "&IF(H2="","NULL","'"&H2&"'")&", "&IF(I2="","NULL","'"&I2&"'")&", "&IF(J2="","NULL","'"&J2&"'")&", '"&K2&"', '"&L2&"', "&M2&", "&N2&", '"&O2&"'),"
```

Où :
- A = siret
- B = Entreprise
- C = date_creation
- D = siege
- E = categorie_juridique
- F = categorie_entreprise
- G = complement_adresse
- H = numero_voie
- I = type_voie
- J = libelle_voie
- K = code_postal
- L = ville
- M = coordonnee_lambert_x
- N = coordonnee_lambert_y
- O = code naf

3. **Copiez toutes les valeurs générées**

4. **Dans Supabase SQL Editor**, collez :

```sql
INSERT INTO public.nouveaux_sites (
  siret, nom, date_creation, est_siege, categorie_juridique,
  categorie_entreprise, complement_adresse, numero_voie, type_voie,
  libelle_voie, code_postal, ville, coordonnee_lambert_x,
  coordonnee_lambert_y, code_naf
) VALUES
[COLLEZ ICI VOS VALEURS]
ON CONFLICT (siret) DO UPDATE SET
  nom = EXCLUDED.nom,
  updated_at = now();
```

---

## ✅ Solution 2 : Renommer vos colonnes pour l'API

Si vous voulez utiliser la fonction API, renommez vos colonnes comme suit :

| Votre colonne actuelle | Nouveau nom requis |
|------------------------|-------------------|
| `siret` ✅ | `siret` (OK) |
| `Entreprise` ✅ | `Entreprise` (OK) |
| `date_creation` ❌ | `dateCreationEtablissement` |
| `siege` ❌ | `etablissementSiege` |
| `categorie_juridique` ❌ | `categorieJuridiqueUniteLegale` |
| `categorie_entreprise` ✅ | `categorieEntreprise` (OK) |
| `complement_adresse` ❌ | `complementAdresseEtablissement` |
| `numero_voie` ❌ | `numeroVoieEtablissement` |
| `type_voie` ❌ | `typeVoieEtablissement` |
| `libelle_voie` ❌ | `libelleVoieEtablissement` |
| `code_postal` ❌ | `codePostalEtablissement` |
| `ville` ❌ | `libelleCommuneEtablissement` |
| `coordonnee_lambert_x` ❌ | `coordonneeLambertAbscisseEtablissement` |
| `coordonnee_lambert_y` ❌ | `coordonneeLambertOrdonneeEtablissement` |
| `code naf` ❌ | `activitePrincipaleEtablissement` |

### ⚠️ Attention aux valeurs :
- `siege` : Doit être `VRAI` ou `FAUX` (pas `true`/`false`)
- `date_creation` : Format `DD/MM/YYYY` (ex: `15/01/2024`)
- `code naf` : **Supprimer l'espace** → `code_naf` ou `activitePrincipaleEtablissement`

---

## 🎯 Quelle solution choisir ?

### Solution 1 (SQL Direct) - Choisissez si :
- ✅ Vous avez moins de 10 000 lignes
- ✅ Vous voulez quelque chose de simple et rapide
- ✅ Vos noms de colonnes sont déjà bons pour la BDD
- ✅ **RECOMMANDÉ pour vous !**

### Solution 2 (API) - Choisissez si :
- ✅ Vous avez plus de 10 000 lignes
- ✅ Vous voulez un import progressif par batch
- ✅ Vous voulez la conversion Lambert → WGS84 automatique
- ✅ Vous êtes OK pour renommer toutes vos colonnes

---

## 🛠️ Étapes Recommandées Pour Vous

### Étape 1 : Préparez votre fichier CSV
Assurez-vous que :
- ✅ Le fichier est au format TSV (séparé par tabulations) ou CSV
- ✅ `code naf` → Remplacez l'espace par un underscore : `code_naf`
- ✅ `siege` contient `VRAI` ou `FAUX`
- ✅ SIRET = 14 chiffres exactement

### Étape 2 : Convertissez avec le script Python
```bash
python3 convert_csv_to_sql.py votre_fichier.csv
```

### Étape 3 : Importez dans Supabase
1. Ouvrir Dashboard Supabase
2. SQL Editor
3. Copier-coller le fichier `.sql` généré
4. Run

### Étape 4 : Vérifiez
```sql
SELECT COUNT(*) FROM nouveaux_sites WHERE created_at >= NOW() - INTERVAL '10 minutes';
```

---

## 📞 Problème ?

Si vous avez une erreur :
1. Vérifiez que tous les SIRET ont 14 chiffres
2. Vérifiez que les codes juridiques sont dans les [79 codes valides](./codes_juridiques_insee.txt)
3. Vérifiez le format de la date
4. Vérifiez que `code naf` n'a pas d'espace (utilisez `code_naf`)

✨ **Avec vos noms de colonnes actuels, la Solution 1 (SQL Direct) est parfaite pour vous !**
