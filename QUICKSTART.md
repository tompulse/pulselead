# 🚀 Traitement des 9000 Prospects - Démarrage Rapide

## ⚡ Méthode Ultra-Rapide (2 minutes)

```bash
# 1. Configurer
export DATABASE_URL="votre_connection_string_postgresql"

# 2. Vérifier l'état initial
psql $DATABASE_URL -f VERIF_PRE_TRAITEMENT.sql

# 3. Traiter TOUT en une commande
./traiter_prospects.sh

# 4. Voir le rapport final
psql $DATABASE_URL -f RAPPORT_FINAL.sql
```

## ✅ Ce qui sera fait automatiquement

- ✅ **Codes postaux corrigés**: `1234` → `01234`
- ✅ **Secteurs d'activité**: Assignés selon code NAF (10 catégories)
- ✅ **Dates validées**: Format standardisé YYYY-MM-DD
- ✅ **Statistiques**: Rapport complet

## 🐍 Optionnel: Géocodage (si vous voulez GPS)

Si vous voulez aussi ajouter latitude/longitude:

```bash
# Installer les dépendances
pip install supabase requests

# Configurer
export SUPABASE_URL="https://ywavxjmbsywpjzchuuho.supabase.co"
export SUPABASE_SERVICE_KEY="votre_service_role_key"

# Lancer le géocodage (15-30 min pour 9000 prospects)
python3 process_new_prospects.py
```

## 📁 Fichiers créés

### Scripts SQL (rapides)
- `ADD_SECTEUR_ACTIVITE_COLUMN.sql` - Ajoute colonne secteur
- `FIX_CODES_POSTAUX.sql` - Corrige codes postaux
- `UPDATE_ALL_SECTEURS.sql` - Assigne secteurs NAF
- `AUDIT_PROSPECTS.sql` - État des prospects
- `VERIF_PRE_TRAITEMENT.sql` - Vérification avant
- `RAPPORT_FINAL.sql` - Rapport après

### Scripts Python (avec géocodage)
- `process_new_prospects.py` - Traitement complet Python

### Automation
- `traiter_prospects.sh` - Script bash tout-en-un
- `guide.py` - Guide interactif

## 🏢 Secteurs d'Activité (10 catégories)

1. **Alimentaire** (NAF 10, 11)
2. **BTP & Construction** (NAF 16, 23, 41, 42, 43)
3. **Automobile** (NAF 29, 30, 45)
4. **Commerce & Distribution** (NAF 46, 47)
5. **Hôtellerie & Restauration** (NAF 55, 56)
6. **Transport & Logistique** (NAF 49-53)
7. **Informatique & Digital** (NAF 58-63)
8. **Santé & Médical** (NAF 86-88)
9. **Services personnels** (NAF 95, 96)
10. **Autres** (tout le reste)

## 🆘 Aide

### Afficher le guide complet
```bash
python3 guide.py
```

### Documentation détaillée
```bash
cat README_TRAITEMENT_PROSPECTS.md
```

## 📊 Vérifications Rapides

```sql
-- Combien de prospects ?
SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true';

-- Codes postaux OK ?
SELECT COUNT(*) FROM nouveaux_sites WHERE LENGTH(code_postal) = 5;

-- Secteurs assignés ?
SELECT secteur_activite, COUNT(*) 
FROM nouveaux_sites 
GROUP BY secteur_activite 
ORDER BY COUNT(*) DESC;
```

---

**C'est tout !** Lancez simplement `./traiter_prospects.sh` et c'est fait en 2 minutes. 🎉
