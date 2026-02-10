# Trouver tes clés Supabase pour le .env

Guide simple pour trouver `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## Étape 1 : Va sur Supabase

1. Ouvre **https://supabase.com** dans ton navigateur.
2. Connecte-toi.
3. Clique sur ton **projet** (celui où tu as la table `nouveaux_sites`).

---

## Étape 2 : Ouvre les paramètres API

1. Dans le menu de gauche (sidebar), tout en bas, clique sur **« ⚙️ Settings »** (Paramètres).
2. Dans le sous-menu qui s'ouvre, clique sur **« API »**.
3. Tu arrives sur une page avec plusieurs sections.

---

## Étape 3 : Récupérer l'URL du projet

Dans la section **« Project URL »** (ou « URL du projet ») :

- Tu vois une URL du type :
  ```
  https://ywavxjmbsywpjzchuuho.supabase.co
  ```
  (un code unique + `.supabase.co`)

- **Copie cette URL complète** (sélectionne, Ctrl+C ou Cmd+C).
- C'est la valeur pour **`VITE_SUPABASE_URL`** dans ton `.env`.

---

## Étape 4 : Récupérer la clé anon (public)

Sur la **même page** (Settings → API), descends un peu.

Tu vois une section **« Project API keys »** avec plusieurs clés :

- **anon** (public) – c'est la clé que tu peux utiliser côté client (navigateur).
- **service_role** – c'est la clé secrète (ne JAMAIS la mettre dans l'app frontend).

**Ce qui te faut pour l'app :**
- La clé **anon** (aussi appelée **« anon public »**).
- Elle commence souvent par `eyJhbGc...`.

**Copie cette clé anon/public** (il y a un bouton pour copier à droite de la clé).

C'est la valeur pour **`VITE_SUPABASE_PUBLISHABLE_KEY`** dans ton `.env`.

---

## Étape 5 : Mettre à jour le .env

1. Dans le dossier `pulselead` sur ton ordinateur, ouvre le fichier **`.env`** (ou `.env.local` s'il existe).
2. Si le fichier n'existe pas, crée-le : clique droit dans le dossier → Nouveau fichier → nomme-le `.env`.
3. À l'intérieur, écris ces 2 lignes (remplace par tes vraies valeurs) :

```
VITE_SUPABASE_URL=https://ywavxjmbsywpjzchuuho.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Sauvegarde** le fichier.

---

## Étape 6 : Relance l'app

### Si tu utilises npm run dev (local)

```bash
cd /Users/raws/pulse-project/pulselead
npm run dev
```

Ouvre **http://localhost:5173** dans le navigateur.

### Si tu utilises Render (production)

Les variables d'environnement sont configurées **sur Render**, pas dans le `.env` local.

1. Va sur **Render Dashboard**.
2. Clique sur ton service **pulselead**.
3. Clique sur **« Environment »** (dans le menu de gauche).
4. Ajoute ou modifie ces 2 variables :
   - `VITE_SUPABASE_URL` = ton URL (celle de l'étape 3)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = ta clé anon (celle de l'étape 4)
5. Clique sur **« Save Changes »**.
6. Render va redéployer automatiquement (ou clique sur **« Manual Deploy »**).

---

## Récap : Les 2 valeurs à trouver

| Variable | Où la trouver dans Supabase | Exemple |
|----------|------------------------------|---------|
| `VITE_SUPABASE_URL` | Settings → API → **Project URL** | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Settings → API → **Project API keys** → **anon** (public) | `eyJhbGciOi...` (très long) |

**Important :** la clé **anon** et la clé **publishable** sont **la même chose** (anon = public = publishable). Ne confonds pas avec **service_role** qui est la clé secrète (à ne JAMAIS mettre dans l'app frontend, seulement pour les scripts backend/Python).

---

Une fois le `.env` mis à jour (local) ou les variables d'environnement configurées (Render), relance l'app et tu devrais voir tes prospects dans l'onglet Prospects.
