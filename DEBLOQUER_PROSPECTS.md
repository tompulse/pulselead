# Débloquer l'affichage des prospects dans PULSE (pas à pas)

Suis ces étapes **dans l'ordre** pour faire apparaître tes prospects de `nouveaux_sites` dans PULSE.

---

## ÉTAPE 1 : Vérifier que la table existe et a des données

1. Va sur **https://supabase.com** et connecte-toi.
2. Clique sur **ton projet** (celui que tu utilises pour PULSE).
3. Dans le menu de gauche, clique sur **« Table Editor »**.
4. Cherche la table **`nouveaux_sites`** dans la liste.

**✅ Si tu vois la table :**
- Clique dessus.
- Vérifie qu'il y a des lignes (en bas tu vois « X rows » avec un nombre > 0).
- Si c'est le cas, **passe à l'étape 2**.

**❌ Si la table n'existe pas ou est vide :**
- Tu dois d'abord importer tes données (CSV).
- Utilise le script `./importer.sh ton_fichier.csv` depuis le terminal (voir `MISE_A_JOUR_BASE.md`).
- **Puis reviens à l'étape 1** pour vérifier que des lignes apparaissent.

---

## ÉTAPE 2 : Vérifier que l'app pointe vers le bon projet Supabase

**Guide détaillé :** ouvre **[TROUVER_CLES_SUPABASE.md](./TROUVER_CLES_SUPABASE.md)** – il explique **exactement** où trouver l'URL et la clé anon (publishable) dans Supabase.

**Résumé rapide :**

1. Dans Supabase : **Settings** → **API** → tu y trouves :
   - **Project URL** (ex. `https://xxxxx.supabase.co`) → c'est `VITE_SUPABASE_URL`.
   - **anon** (public) key (ex. `eyJhbGc...`) → c'est `VITE_SUPABASE_PUBLISHABLE_KEY`.

2. Dans le dossier `pulselead` sur ton PC, ouvre (ou crée) **`.env`** et ajoute ces 2 lignes :
   ```
   VITE_SUPABASE_URL=https://ton_projet.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
   ```

3. **Sauvegarde** le fichier `.env`.

---

## ÉTAPE 3 : Activer RLS et la policy de lecture

1. Retourne sur **Supabase** → ton projet.
2. Dans le menu de gauche, clique sur **« SQL Editor »**.
3. Dans le dossier `pulselead` sur ton ordinateur, ouvre le fichier **`ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql`**.
4. **Sélectionne tout** le texte (Ctrl+A ou Cmd+A), puis **copie** (Ctrl+C ou Cmd+C).
5. Retourne dans **Supabase SQL Editor**, **colle** le texte dans la grande zone (Ctrl+V ou Cmd+V).
6. Clique sur **« Run »** (ou **« Exécuter »**) en haut à droite.
7. En bas de l'écran, tu dois voir un message du type :
   ```
   Success. No rows returned
   ```
   ou une ligne avec `status: OK – Les users PULSE peuvent voir les prospects...`

**✅ Si tu vois « Success » :**
- Parfait, passe à l'étape 4.

**❌ Si tu vois une erreur (en rouge) :**
- Copie le message d'erreur complet et envoie-le moi (ex. « relation "nouveaux_sites" does not exist »).
- On corrigera le script en fonction de l'erreur.

---

## ÉTAPE 4 : Rebuild l'app pour prendre en compte le nouveau code

### Option A – Si tu utilises **npm run dev** en local

1. Dans le terminal, arrête le serveur (Ctrl+C).
2. Relance :
   ```bash
   cd /Users/raws/pulse-project/pulselead
   npm run dev
   ```
3. Ouvre **http://localhost:5173** dans ton navigateur.
4. **Passe à l'étape 5**.

### Option B – Si tu utilises **Render** (ou autre hébergement)

1. Dans le terminal, dans le dossier du projet :
   ```bash
   cd /Users/raws/pulse-project/pulselead
   git add -A
   git commit -m "Fix: service nouveaux_sites direct + RLS policy"
   git push
   ```
2. Si `git push` bloque, suis les instructions dans **PUSH_ET_DEPLOY.md** (SSH ou token).
3. Une fois le push réussi, va sur **Render Dashboard** (ou ton hébergeur), trouve ton projet **pulselead**, et clique sur **« Manual Deploy »** (déploiement manuel) ou attends que le déploiement auto se déclenche.
4. Attends que le build termine (≈2-5 min), puis ouvre l'URL de production de ton app.
5. **Passe à l'étape 5**.

---

## ÉTAPE 5 : Tester dans PULSE

1. Ouvre ton application PULSE (local ou production).
2. **Connecte-toi** avec un compte utilisateur (pas forcément admin).
3. Tu arrives sur le **Dashboard**.
4. Clique sur l'onglet **« Prospects »** (en haut, premier onglet).

**✅ Si tu vois des cartes de prospects :**
- **C'EST BON !** Tes prospects de `nouveaux_sites` s'affichent.
- Les filtres sur le côté (NAF, département, etc.) fonctionnent aussi (appliqués sur les lignes affichées).

**❌ Si tu vois « Impossible de charger les prospects » avec un message d'erreur :**
- Le message indique la cause exacte (ex. « permission denied », « relation does not exist », etc.).
- **Copie ce message** et envoie-le moi, je corrigerai en fonction.

**⚠️ Si tu vois « Aucun site trouvé » :**
- C'est que la requête a réussi (pas d'erreur) mais n'a retourné 0 ligne.
- Retourne à **Étape 1** et vérifie que la table `nouveaux_sites` a bien des lignes dans Supabase.

---

## Résumé rapide

| Étape | Action | Où |
|-------|--------|-----|
| 1 | Vérifier table `nouveaux_sites` existe et a des lignes | Supabase → Table Editor |
| 2 | Vérifier `.env` pointe vers le bon projet | Fichier `.env` (local) |
| 3 | Exécuter `ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql` | Supabase → SQL Editor |
| 4 | Rebuild/redeploy l'app | Terminal + Render (ou `npm run dev`) |
| 5 | Ouvrir PULSE → Prospects | Navigateur |

---

Si tu bloques à une étape ou que tu vois un message d'erreur, envoie-le moi et on débloque ensemble.
