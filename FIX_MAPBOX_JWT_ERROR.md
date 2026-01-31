# FIX: Mapbox Configuration Error & Invalid JWT

## 🔴 Problème
Vous avez deux erreurs liées:
1. **"Erreur de configuration Mapbox - Impossible de récupérer le token d'accès"**
2. **"Invalid JWT" (code 401)**

## 🔍 Cause
La fonction Edge `get-mapbox-token` n'était **pas configurée** dans `supabase/config.toml`.

Par défaut, Supabase Edge Functions nécessitent une authentification JWT (`verify_jwt = true`). 

Quand votre frontend appelait `supabase.functions.invoke('get-mapbox-token')`:
- Sans un utilisateur connecté → JWT invalide
- La fonction rejetait la requête avec une erreur 401

## ✅ Solution Appliquée

J'ai ajouté dans `supabase/config.toml`:

```toml
[functions.get-mapbox-token]
verify_jwt = false
```

Cela permet d'appeler la fonction **sans authentification** (comme c'est une fonction publique qui expose uniquement le token Mapbox public).

## 📋 Prochaines Étapes

### 1. Vérifier que le secret Mapbox est configuré

Dans votre **Supabase Dashboard**:
1. Allez dans **Project Settings → Edge Functions → Secrets**
2. Cherchez `MAPBOX_PUBLIC_TOKEN`
3. Si absent, ajoutez-le avec votre token public Mapbox

**Comment obtenir un token Mapbox:**
- Allez sur https://www.mapbox.com
- Créez un compte gratuit (50k requêtes/mois gratuites)
- Allez dans **Access tokens**
- Copiez votre **Default public token** (commence par `pk.`)

### 2. Redéployer les Edge Functions

```bash
# Depuis votre terminal dans le dossier du projet
cd /Users/raws/pulse-project/pulselead

# Redéployer get-mapbox-token
supabase functions deploy get-mapbox-token

# OU redéployer toutes les fonctions
supabase functions deploy
```

**Important:** Après avoir ajouté un secret dans Supabase, vous DEVEZ redéployer les fonctions pour qu'elles puissent y accéder!

### 3. Tester la fonction

Dans le **Supabase Dashboard**:
1. Allez dans **Edge Functions → get-mapbox-token**
2. Cliquez sur **"Invoke function"**
3. Laissez le body vide
4. Cliquez **"Run"**

**Résultat attendu:**
```json
{
  "token": "pk.eyJ1IjoieW91dXNlciIsImEiOiJ...votre token..."
}
```

**Si vous voyez une erreur:**
```json
{
  "error": "Token Mapbox non configuré",
  "token": null
}
```
→ Le secret `MAPBOX_PUBLIC_TOKEN` n'est pas configuré ou vous n'avez pas redéployé la fonction.

### 4. Tester dans l'application

1. Rechargez votre application frontend
2. Allez dans la section Tournées
3. Essayez de créer une tournée et rechercher une adresse
4. La carte devrait maintenant fonctionner!

## 🔧 Configuration Complète

Les fonctions Mapbox dans votre `config.toml`:

```toml
# Fonction publique - pas d'auth requise
[functions.get-mapbox-token]
verify_jwt = false

# Fonctions utilisateur - auth requise
[functions.geocode-entreprise]
verify_jwt = true

[functions.calculate-routes]
verify_jwt = true

[functions.optimize-tournee]
verify_jwt = true
```

## 📝 Secrets Nécessaires dans Supabase

Assurez-vous d'avoir ces secrets configurés dans **Supabase Dashboard → Edge Functions → Secrets**:

1. **MAPBOX_PUBLIC_TOKEN** - Token public (commence par `pk.`)
   - Utilisé par: `get-mapbox-token`
   - Exposé au frontend
   
2. **MAPBOX_ACCESS_TOKEN** - Token privé (commence par `pk.` ou `sk.`)
   - Utilisé par: `geocode-entreprise`, `calculate-routes`, `optimize-tournee`
   - Reste côté serveur uniquement

> 💡 **Note:** Vous pouvez utiliser le même token pour les deux si vous n'avez qu'un seul token public Mapbox.

## 🧪 Debugging

Si ça ne fonctionne toujours pas:

1. **Vérifiez la console du navigateur:**
   ```javascript
   const { data, error } = await supabase.functions.invoke('get-mapbox-token');
   console.log('Response:', { data, error });
   ```

2. **Vérifiez les logs Supabase:**
   - Dashboard → Edge Functions → get-mapbox-token → Logs
   
3. **Vérifiez que la fonction est bien déployée:**
   ```bash
   supabase functions list
   ```
   
   Vous devriez voir:
   ```
   get-mapbox-token | ✓ Deployed
   ```

## 🎯 Résumé

- ✅ **Configuré:** `verify_jwt = false` pour `get-mapbox-token`
- ⏳ **À faire:** 
  1. Ajouter `MAPBOX_PUBLIC_TOKEN` dans les secrets Supabase
  2. Redéployer les fonctions
  3. Tester!

Une fois ces étapes complétées, les erreurs Mapbox et JWT disparaîtront! 🎉
