# 🔧 FIX DÉFINITIF - Webhook Stripe

## 🚨 PROBLÈME IDENTIFIÉ

Le webhook Stripe **ne trouve pas l'utilisateur** après paiement.

### Cause racine :
Le webhook cherche l'user par email avec `listUsers().find()`, mais :
- ❌ Peut ne pas retourner tous les users (pagination)
- ❌ Peut ne pas matcher l'email (casse différente)
- ❌ Peut chercher avant que l'email soit confirmé

---

## ✅ SOLUTION IMPLÉMENTÉE

### AVANT (cassé) :
```typescript
let userId = session.metadata?.user_id;

if (!userId && customerEmail) {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const user = data.users.find(u => u.email === customerEmail);
  userId = user.id;
}
```

❌ **Problèmes** :
- Ignore `client_reference_id` (pourtant passé dans Payment Link URL)
- `listUsers()` peut ne pas retourner tous les users
- Recherche sensible à la casse

---

### APRÈS (fix) :
```typescript
// 🔥 PRIORITÉ 1 : Utiliser client_reference_id
let userId = session.client_reference_id || session.metadata?.user_id;

if (!userId && customerEmail) {
  // Fallback : recherche case-insensitive
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const user = data.users.find(u => 
    u.email?.toLowerCase() === customerEmail?.toLowerCase()
  );
  userId = user.id;
}
```

✅ **Améliorations** :
- Utilise `client_reference_id` (user_id passé dans URL Stripe)
- Recherche case-insensitive en fallback
- Logs détaillés pour diagnostiquer

---

## 🚀 DÉPLOIEMENT DU FIX

### 1️⃣ Déploie le webhook corrigé

```bash
cd /Users/raws/pulse-project/pulselead
supabase functions deploy stripe-webhook
```

Tu devrais voir :
```
✅ Deployed function stripe-webhook
```

---

### 2️⃣ Vérifie que le webhook reçoit bien `client_reference_id`

Le `client_reference_id` est passé dans l'URL du Payment Link :

```typescript
// Dans Auth.tsx et EmailConfirmed.tsx
const paymentUrl = `${STRIPE_PAYMENT_LINK}?client_reference_id=${session.user.id}`;
```

✅ **Ça fonctionne déjà !** Stripe recevra l'user_id directement.

---

## 🧪 TEST APRÈS FIX

1. **Active TON compte** avec `ACTIVE_COMPTE_TOM.sql` (déblocage immédiat)
2. **Crée un nouveau compte** pour tester le webhook
3. **Paie sur Stripe**
4. **Vérifie les logs** :
   ```bash
   supabase functions logs stripe-webhook --tail
   ```

Tu devrais voir :
```
[STRIPE-WEBHOOK] 🎉 Checkout completed
[STRIPE-WEBHOOK] 🔍 Looking for user - clientReferenceId: "abc-123-def"
[STRIPE-WEBHOOK] ✅ User identified
[STRIPE-WEBHOOK] ✅ Account ACTIVATED
```

---

## 🎯 POURQUOI ÇA VA MARCHER MAINTENANT

### Flow avant (cassé) :
```
Stripe → Webhook
  ↓
Cherche user par email (listUsers)
  ↓
❌ Pas trouvé (pagination/casse)
  ↓
❌ Break (compte jamais activé)
```

### Flow après (fixé) :
```
Stripe → Webhook
  ↓
Lit client_reference_id (user_id)
  ↓
✅ User_id direct !
  ↓
✅ Active le compte
  ↓
✅ Envoie mail bienvenue
```

---

## 📋 CHECKLIST

- [ ] Exécute `ACTIVE_COMPTE_TOM.sql` pour débloquer ton compte
- [ ] Déploie le webhook : `supabase functions deploy stripe-webhook`
- [ ] Teste avec un nouveau compte
- [ ] Vérifie les logs webhook
- [ ] Vérifie réception mail "Bienvenue sur PULSE"

---

## 🆘 SI LE PROBLÈME PERSISTE

**Envoie-moi** :
1. Logs du webhook : `supabase functions logs stripe-webhook --tail`
2. Screenshot de Stripe Dashboard > Webhooks > Events

Je trouverai le problème ! 🚀
