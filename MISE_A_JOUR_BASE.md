# Mettre à jour la base Prospects (sans payer 20€)

PULSE affiche directement ce qui est dans la table Supabase **`nouveaux_sites`**. Aucun import depuis l’app nécessaire.

## 1. Configure une seule fois

Dans le dossier `pulselead`, crée un fichier **`.env`** avec :

```
SUPABASE_URL=https://TON_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJta_cle_service_role...
```

(Tu trouves l’URL et la clé dans Supabase → Settings → API.)

## 2. Chaque fois que tu veux mettre à jour la base

1. Mets ton CSV dans le dossier `pulselead` et nomme-le **`database.csv`** (ou garde ton nom).
2. Dans le terminal :

```bash
cd pulselead
chmod +x importer.sh
./importer.sh
```

Avec un autre fichier : `./importer.sh mon_export.csv`

## 3. Une fois les données en base : exécuter le SQL (une seule fois)

Pour que PULSE affiche correctement les lignes, la table doit avoir les colonnes attendues (id, archived, random_order, nom, etc.). Après ton premier import (ou si tu as importé le CSV directement dans Supabase) :

1. Ouvre **Supabase** → **SQL Editor**.
2. Copie-colle le contenu du fichier **`FIX_TOUT_EN_1_COMMANDE.sql`** (à la racine du projet).
3. Exécute le script.

Ensuite : rafraîchis l’app PULSE et va dans **Prospects** : les lignes de `nouveaux_sites` s’affichent.

## 4. Résumé

- **PULSE lit uniquement la table `nouveaux_sites`** : ce que tu mets dedans (import CSV Supabase ou script `importer.sh`) est ce qui s’affiche dans l’app.
- Les lignes sont fusionnées par SIRET (même SIRET = mise à jour).
- Aucun service payant. Après configuration, tu fais : CSV → import (Supabase ou `./importer.sh`) → exécuter `FIX_TOUT_EN_1_COMMANDE.sql` si besoin → rafraîchir PULSE.
