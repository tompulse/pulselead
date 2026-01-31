# ⚡ SOLUTION IMMÉDIATE - Erreur JWT/CORS

## 🎯 Le Problème
Votre token d'authentification (JWT) est expiré ou invalide.

## ✅ La Solution (2 minutes)

### Option 1: Vider le cache et reconnecter (RECOMMANDÉ)

**Dans votre navigateur (sur pulse-lead.com):**

1. **Ouvrez la console** (F12 ou Cmd+Option+I sur Mac)

2. **Tapez cette commande et appuyez sur Entrée:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Reconnectez-vous** à votre application

4. **Réessayez** de créer une tournée

### Option 2: Reconnecter simplement

1. **Déconnectez-vous** de l'application (menu utilisateur → Déconnexion)
2. **Reconnectez-vous**
3. **Réessayez**

---

## 🧪 Pour vérifier si votre JWT est valide

**Dans la console du navigateur (F12):**

```javascript
// Vérifier la session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Expire à:', session ? new Date(session.expires_at * 1000) : 'Aucune session');
console.log('JWT valide:', session && session.expires_at * 1000 > Date.now());
```

Si "JWT valide: false" → Votre token est expiré, reconnectez-vous!

---

## 🚨 Si ça ne marche toujours pas

### Vérifier que la fonction est déployée:

**Dans votre terminal:**
```bash
supabase functions deploy optimize-tournee
```

### Vérifier les secrets Supabase:

**Dashboard Supabase → Edge Functions → Secrets**

Vérifiez que ces secrets existent:
- `MAPBOX_PUBLIC_TOKEN` 
- `MAPBOX_ACCESS_TOKEN`

Si manquants, ajoutez-les puis redéployez:
```bash
supabase functions deploy
```

---

## 💡 Pourquoi cette erreur?

Le JWT (JSON Web Token) est un token de sécurité qui prouve que vous êtes connecté. Il expire après quelques heures pour des raisons de sécurité.

Quand il expire:
- Les fonctions Edge qui nécessitent une authentification (`verify_jwt = true`) rejettent la requête
- Le navigateur affiche "CORS error" (mais c'est en fait une erreur 401 Unauthorized)

**Solution:** Rafraîchir votre session en vous reconnectant.

---

## ✅ Checklist

- [ ] J'ai fait `localStorage.clear()` et rechargé la page
- [ ] Je me suis reconnecté
- [ ] J'ai réessayé de créer une tournée
- [ ] Ça marche! 🎉

Si ça ne marche toujours pas après ces 3 étapes, il y a un problème de déploiement des fonctions Edge.
