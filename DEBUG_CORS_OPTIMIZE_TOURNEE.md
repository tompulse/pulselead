# DEBUG: CORS Error sur optimize-tournee

## 🔴 Erreur Actuelle

```
Access to fetch at 'https://ywavxjmbsywpjzchuuho.supabase.co/functions/v1/optimize-tournee' 
from origin 'https://pulse-lead.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## 🔍 Cause

Cette erreur CORS **ne vient PAS d'un problème de configuration CORS**, mais d'une **erreur 401 Unauthorized**.

La fonction `optimize-tournee` requiert une authentification JWT (`verify_jwt = true` dans config.toml), et:
- Soit l'utilisateur n'est **pas connecté**
- Soit le **JWT a expiré**
- Soit le JWT n'est **pas envoyé** correctement dans les headers

## ✅ Solutions

### Solution 1: Vérifier l'authentification de l'utilisateur

1. **Ouvrez la console du navigateur** (F12)
2. **Tapez:**
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```
3. **Résultats:**
   - Si `session` est `null` → L'utilisateur n'est PAS connecté
   - Si `session.expires_at` est dans le passé → Le JWT a expiré
   - Si `session` existe → Le JWT devrait être valide

### Solution 2: Reconnecter l'utilisateur

**Si le JWT a expiré ou est invalide:**

1. Déconnectez-vous de l'application
2. Reconnectez-vous
3. Réessayez de créer une tournée

Cela va générer un nouveau JWT valide.

### Solution 3: Vérifier l'envoi du JWT

Le client Supabase devrait automatiquement inclure le JWT dans les headers. Vérifiez dans `src/integrations/supabase/client.ts`:

```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,  // ✅ Important: auto-refresh du JWT
  }
});
```

### Solution 4: Debug complet

Ajoutez ce code de debug avant l'appel à `optimize-tournee`:

```typescript
// Dans TourneeCreationModal.tsx, ligne 71
console.log('[DEBUG] Checking auth before optimize-tournee...');
const { data: { session } } = await supabase.auth.getSession();
console.log('[DEBUG] Session:', session ? 'EXISTS' : 'NULL');
console.log('[DEBUG] JWT expires at:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');

if (!session) {
  throw new Error('Non connecté - Veuillez vous reconnecter');
}

// Appeler l'edge function d'optimisation
const { data: optimData, error: optimError } = await supabase.functions.invoke('optimize-tournee', {
  body: { entreprises }
});
```

## 🧪 Test de la fonction directement

Pour tester si la fonction fonctionne (en étant connecté):

1. **Ouvrez la console du navigateur**
2. **Tapez:**
   ```javascript
   const { data, error } = await supabase.functions.invoke('optimize-tournee', {
     body: {
       entreprises: [
         { id: '1', nom: 'Test 1', latitude: 48.8566, longitude: 2.3522 },
         { id: '2', nom: 'Test 2', latitude: 48.8606, longitude: 2.3376 }
       ]
     }
   });
   console.log('Result:', { data, error });
   ```

3. **Résultats attendus:**
   - **Si ça marche:** `data` contient l'itinéraire optimisé
   - **Si erreur 401:** `error` avec "Invalid JWT" → Problème d'authentification
   - **Si autre erreur:** Vérifier les logs Supabase

## 🔧 Vérifier la configuration Supabase

1. **Dashboard Supabase → Edge Functions → optimize-tournee**
2. Vérifiez que:
   - ✅ La fonction est **déployée**
   - ✅ Le secret `MAPBOX_ACCESS_TOKEN` est configuré
   - ✅ `verify_jwt = true` dans config.toml (c'est normal pour cette fonction)

## 📋 Checklist de résolution

- [ ] Vérifier que l'utilisateur est connecté
- [ ] Vérifier que le JWT n'a pas expiré
- [ ] Se déconnecter/reconnecter pour obtenir un nouveau JWT
- [ ] Vérifier les logs dans la console navigateur
- [ ] Tester la fonction manuellement dans la console
- [ ] Vérifier les logs Supabase Edge Functions

## 🎯 Solution Finale Probable

**99% du temps, cette erreur se résout en:**
1. **Déconnexion de l'application**
2. **Reconnexion**
3. **Nouvelle tentative de création de tournée**

Si ça persiste après reconnexion, c'est un problème de configuration du client Supabase ou des Edge Functions.

## 📞 Debug Avancé

Si rien ne fonctionne, vérifiez:

1. **Les logs Supabase:**
   - Dashboard → Edge Functions → optimize-tournee → Logs
   - Cherchez les erreurs 401 ou "Invalid JWT"

2. **Les headers de la requête:**
   - Ouvrez l'onglet Network dans DevTools
   - Trouvez la requête `optimize-tournee`
   - Vérifiez que `Authorization: Bearer <jwt>` est présent

3. **Le format du JWT:**
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('JWT:', session?.access_token);
   // Devrait commencer par 'eyJ...'
   ```

---

**TL;DR:** Déconnectez-vous et reconnectez-vous. C'est probablement un JWT expiré. 🔄
