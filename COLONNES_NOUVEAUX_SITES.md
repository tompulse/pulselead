# Colonnes de la table `nouveaux_sites`

## Liste EXACTE et DÉFINITIVE (sensible à la casse)

```
Siret
Nom
date_creation
Siege
categorie_entreprise
complement_adresse
numero_voie
type_voie
libelle_voie
code_postal
Commune
coordonnee_lambert_x
coordonnee_lambert_y
code_naf
archived
latitude (ajoutée par migration)
longitude (ajoutée par migration)
```

## Notes importantes

- **NOM**, **SIRET**, **SIEGE**, **COMMUNE** = Majuscules !
- Pas de colonne `nom` (minuscule)
- Pas de colonne `commune` (minuscule)
- Pas de colonne `adresse` (utiliser numero_voie + type_voie + libelle_voie)
- Pas de colonne `ville` 
- Pas de colonne `departement` (extraire des 2 premiers caractères de `code_postal`)
- `Siege` est TEXT ('VRAI', 'FAUX', etc.)
- `archived` est TEXT ('true', 'false', null)
