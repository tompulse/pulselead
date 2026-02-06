# 🚀 Redéployer l'Edge Function

## Étape 1: Exécute le SQL de correction

Exécute `FIX_EST_SIEGE.sql` dans Supabase SQL Editor pour corriger les données existantes.

## Étape 2: Redéploie l'Edge Function

### Option A: Depuis le Dashboard Supabase (recommandé)

1. Va sur https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
2. Clique sur `import-nouveaux-sites`
3. Clique sur "Deploy new version"
4. Sélectionne le fichier `supabase/functions/import-nouveaux-sites/index.ts`
5. Clique sur "Deploy"

### Option B: En ligne de commande

```bash
# Se connecter à Supabase
supabase login

# Déployer la fonction
cd /Users/raws/pulse-project/pulselead
supabase functions deploy import-nouveaux-sites --no-verify-jwt
```

## ✅ Vérification

Une fois déployé:
1. Recharge ton dashboard Pulse
2. Vérifie que les filtres "Siège social" affichent les bons nombres
3. Les futurs imports CSV géreront correctement VRAI/FAUX

## 📊 Nouvelles colonnes CSV supportées

L'Edge Function accepte maintenant tous ces formats pour le siège:
- `siege` (avec ou sans accent)
- `est_siege`
- `etablissementSiege`

Et toutes ces valeurs:
- VRAI/FAUX
- true/false
- 1/0
- OUI/NON
- V/F
- T/F
