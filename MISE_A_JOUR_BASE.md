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

Pour que **tous tes users PULSE** voient les prospects dans l’onglet Prospects, il faut exécuter un script SQL dans Supabase.

**Guide détaillé (débutant) :** ouvre ** [GUIDE_SQL_SUPABASE.md](./GUIDE_SQL_SUPABASE.md) ** — tout y est expliqué étape par étape.

**Résumé rapide :**
1. Va sur **Supabase** → ton projet → menu gauche **SQL Editor**.
2. Ouvre le fichier **`ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql`** (à la racine du projet), copie tout son contenu.
3. Colle dans l’éditeur SQL sur Supabase, puis clique sur **Run** (Exécuter).
4. Vérifie « Success » en bas, puis rafraîchis PULSE : les prospects s’affichent dans l’onglet **Prospects**.

**Option complète** (renommages, types, etc.) : utilise **`FIX_TOUT_EN_1_COMMANDE.sql`** à la place.

## 4. Résumé

- **PULSE lit uniquement la table `nouveaux_sites`** : ce que tu mets dedans (import CSV Supabase ou script `importer.sh`) est ce qui s’affiche dans l’app.
- Les lignes sont fusionnées par SIRET (même SIRET = mise à jour).
- Aucun service payant. Après configuration, tu fais : CSV → import (Supabase ou `./importer.sh`) → exécuter `FIX_TOUT_EN_1_COMMANDE.sql` si besoin → rafraîchir PULSE.
