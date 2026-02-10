# Push Git et déploiement Render

## 1. Push Git (depuis ta machine)

Le push doit être fait **depuis ton terminal** (authentification GitHub).

```bash
cd /Users/raws/pulse-project/pulselead
git status
git add -A
git commit -m "ton message"
git push
```

**Si `git push` demande un login / échoue :**

- **Option A – SSH (recommandé)**  
  Vérifie la remote : `git remote -v`  
  Si tu vois `https://github.com/...`, passe en SSH :
  ```bash
  git remote set-url origin git@github.com:TON_USER/pulselead.git
  git push
  ```
  (Remplace `TON_USER` par ton compte GitHub.)

- **Option B – HTTPS avec token**  
  Sur GitHub : Settings → Developer settings → Personal access tokens.  
  Crée un token avec `repo`, puis :
  ```bash
  git push
  ```
  Quand il demande le mot de passe, colle le **token** (pas ton mot de passe GitHub).

- **Option C – GitHub Desktop / Cursor**  
  Utilise le bouton "Push" dans l’interface (elle gère l’auth à ta place).

---

## 2. Déploiement Render

Une fois le code poussé sur GitHub, Render rebuild en général tout seul (si l’auto-deploy est activé).

**Si le deploy ne part pas ou échoue :**

1. **Render Dashboard** → ton service **pulselead** (ou le nom du projet).
2. **Settings** :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
   - **Root Directory** : laisser vide si le repo = le projet front.
3. **Environment** : ajoute les variables nécessaires (ex. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` si l’app les utilise).
4. **Manual Deploy** : onglet "Manual Deploy" → "Deploy latest commit".

**Vérifier le build en local :**

```bash
npm run build
```

Si ça passe en local, Render a les mêmes chances de succès (à part env vars manquantes).

---

## 3. Résumé

| Problème              | Où agir                          |
|-----------------------|-----------------------------------|
| Push qui échoue       | Terminal : SSH ou token GitHub   |
| Deploy pas déclenché  | Render → Settings → Build/Publish + Manual Deploy |
| Deploy en erreur      | Render → Logs ; vérifier `npm run build` et les env vars |
