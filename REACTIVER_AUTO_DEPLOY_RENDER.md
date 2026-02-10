# 🔄 Réactiver l'Auto-Deploy sur Render

## Problème
Les déploiements automatiques ne se déclenchent plus après un `git push`. Tu dois déployer manuellement.

## Solution - 2 minutes

### Étape 1: Accéder aux Settings Render

1. Va sur [https://dashboard.render.com](https://dashboard.render.com)
2. Clique sur ton service **PULSE** / **pulselead**
3. Clique sur l'onglet **"Settings"** (en haut)

### Étape 2: Vérifier Auto-Deploy

Scroll jusqu'à la section **"Build & Deploy"**

#### Option A: Auto-Deploy désactivé ❌

Si tu vois:
```
Auto-Deploy: No
```

**Solution:**
1. Clique sur **"Edit"** à côté de "Auto-Deploy"
2. Sélectionne **"Yes"** dans le dropdown
3. Clique sur **"Save Changes"**

✅ **C'est réglé !** Les futurs push déclencheront automatiquement un déploiement.

---

#### Option B: Branche incorrecte 🔀

Si tu vois:
```
Branch: develop (ou autre que "main")
```

**Solution:**
1. Clique sur **"Edit"** à côté de "Branch"
2. Change pour **"main"**
3. Clique sur **"Save Changes"**

✅ **C'est réglé !** Render écoutera maintenant la branche `main`.

---

#### Option C: Repository déconnecté 🔌

Si tu vois un message d'erreur ou "Repository not found":

**Solution:**
1. Va dans la section **"Connected Repository"**
2. Clique sur **"Disconnect"**
3. Clique sur **"Connect Repository"**
4. Sélectionne **GitHub**
5. Autorise l'accès si demandé
6. Sélectionne le repository **tompulse/pulselead**
7. Confirme

✅ **C'est réglé !** La connexion GitHub ↔ Render est restaurée.

---

### Étape 3: Tester

1. Fais un petit changement (ex: ajoute un commentaire dans un fichier)
   ```bash
   cd /Users/raws/pulse-project/pulselead
   echo "# test auto-deploy" >> README.md
   git add README.md
   git commit -m "Test: auto-deploy"
   git push origin main
   ```

2. **Retourne sur Render Dashboard**
3. Tu devrais voir un nouveau déploiement se lancer automatiquement dans les 10-30 secondes
4. Un badge "Deploying..." devrait apparaître

✅ **Si tu vois le déploiement démarrer automatiquement → C'EST BON !**

---

## Vérifications supplémentaires

### Webhook GitHub (si rien ne marche)

1. Sur GitHub, va sur ton repo: [https://github.com/tompulse/pulselead](https://github.com/tompulse/pulselead)
2. Clique sur **"Settings"** (du repo)
3. Clique sur **"Webhooks"** dans le menu de gauche
4. Cherche un webhook pour **Render** (render.com)

**Si absent ou erreur:**
- Déconnecte et reconnecte le repository sur Render (voir Option C ci-dessus)
- Render recréera automatiquement le webhook

---

## Résumé

**Dans 99% des cas**, le problème vient de l'option **"Auto-Deploy: No"** dans les Settings Render.

⏱️ **Temps de résolution: 30 secondes**

Une fois réactivé, tous tes futurs `git push origin main` déclencheront automatiquement un déploiement Render ! 🚀
