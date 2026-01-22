# 🔍 DEBUG "Invalid API key"

## ÉTAPE 1 : Vérifier quelle URL Supabase est chargée

### Dans ton navigateur sur http://localhost:8080/

1. **Ouvre la console JavaScript** : `Cmd + Option + I` (Mac)
2. **Onglet "Console"**
3. **Colle cette commande et appuie sur Entrée :**

```javascript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30) + '...');
```

### ✅ RÉSULTAT ATTENDU :
```
SUPABASE_URL: https://ywavxjmbsywpjzchuuho.supabase.co
SUPABASE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
```

### ❌ SI TU VOIS L'ANCIEN PROJET :
```
SUPABASE_URL: https://pcrxbfbktmekkkqhppjn.supabase.co
```

→ Le navigateur a mis en cache l'ancien build !

---

## SOLUTION : VIDER LE CACHE COMPLÈTEMENT

### Option A : Hard reload avec cache vide
1. `Cmd + Option + I` pour ouvrir DevTools
2. **Clic droit sur le bouton refresh** (à côté de la barre d'URL)
3. Sélectionne **"Vider le cache et effectuer une actualisation forcée"**

### Option B : Navigation privée
1. Ouvre une **fenêtre de navigation privée** : `Cmd + Shift + N`
2. Va sur http://localhost:8080/
3. Essaie de te connecter

### Option C : Supprimer le localStorage
1. Console (`Cmd + Option + I`)
2. Onglet **"Application"**
3. Dans le menu gauche : **"Local Storage"** → `http://localhost:8080`
4. **Clic droit** → **"Clear"**
5. Recharge la page

---

## ÉTAPE 2 : Si ça marche toujours pas

Envoie-moi un screenshot de ce que tu vois dans la console après avoir exécuté :

```javascript
console.log('ENV:', import.meta.env);
```
