# Exécuter le script SQL dans Supabase (débutant)

Ce guide explique comment exécuter **une fois** le fichier `ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql` dans Supabase pour que tes prospects s’affichent dans PULSE.

---

## Étape 1 : Ouvre ton projet Supabase

1. Va sur **https://supabase.com** et connecte-toi.
2. Clique sur ton **projet** (celui qui est lié à PULSE).

---

## Étape 2 : Ouvre l’éditeur SQL

1. Dans le menu à gauche, clique sur **« SQL Editor »** (icône qui ressemble à `</>` ou « Éditeur SQL »).
2. Tu arrives sur une page avec une grande zone de texte (éditeur) et un bouton pour exécuter.

---

## Étape 3 : Récupère le contenu du fichier SQL

1. Sur ton ordinateur, ouvre le **dossier du projet** (pulselead).
2. Ouvre le fichier **`ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql`** avec un éditeur de texte (Bloc-notes, VS Code, Cursor, etc.).
3. Sélectionne **tout** le texte (Ctrl+A ou Cmd+A).
4. Copie (Ctrl+C ou Cmd+C).

---

## Étape 4 : Colle et exécute dans Supabase

1. Reviens sur la page **SQL Editor** de Supabase.
2. Efface tout ce qui est déjà écrit dans la zone de texte (s’il y a un exemple).
3. Colle le texte que tu viens de copier (Ctrl+V ou Cmd+V).
4. Clique sur le bouton **« Run »** (ou **« Exécuter »** / **« Run »** en bas à droite).

---

## Étape 5 : Vérifier le résultat

- En bas de la page, tu dois voir un message du type **« Success »** ou **« OK »** et éventuellement une ligne avec `status: OK – Les users PULSE peuvent voir les prospects...`
- S’il y a une erreur en rouge, copie le message et tu pourras le partager pour qu’on le corrige.

---

## Étape 6 : Tester dans PULSE

1. Ouvre ton application PULSE (ou rafraîchis la page si elle est déjà ouverte).
2. Connecte-toi avec un compte utilisateur.
3. Va dans l’onglet **« Prospects »** (souvent le premier onglet).
4. Tu dois voir la liste des prospects qui viennent de la table `nouveaux_sites`.

---

## En résumé

| Étape | Où | Action |
|-------|-----|--------|
| 1 | Supabase (navigateur) | Ouvre ton projet |
| 2 | Supabase | Menu gauche → **SQL Editor** |
| 3 | Ton PC | Ouvre `ACTIVER_NOUVEAUX_SITES_POUR_PULSE.sql` → tout sélectionner → copier |
| 4 | Supabase SQL Editor | Coller le texte → cliquer **Run** |
| 5 | Supabase | Vérifier « Success » en bas |
| 6 | PULSE | Rafraîchir → onglet Prospects → voir les prospects |

Tu n’as besoin de faire ça **qu’une seule fois** par projet (ou après avoir recréé la table). Ensuite, les utilisateurs connectés à PULSE verront toujours les prospects dans l’onglet Prospects.
