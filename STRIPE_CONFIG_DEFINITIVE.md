# 🎯 CONFIGURATION STRIPE DÉFINITIVE

**Date**: 30 janvier 2026  
**Objectif**: Redirection automatique après paiement - Solution PRO

---

## 🔥 LE VRAI PROBLÈME

Les **Payment Links Stripe** ont une limitation : **ils ne permettent PAS de configurer une Success URL personnalisée facilement via le dashboard**.

---

## ✅ LA VRAIE SOLUTION (2 options)

### **Option 1 : Modifier le Payment Link existant** ⚙️

1. **Va sur Stripe Dashboard** :
   ```
   https://dashboard.stripe.com/test/payment-links
   ```

2. **Clique sur ton Payment Link PRO** (49€/mois)

3. **Clique sur les 3 points (⋯) en haut à droite** > **"Edit link"**

4. **Scroll jusqu'à "After payment"**

5. **Dans "Redirect on success"** :
   - ✅ Sélectionne **"Custom URL"**
   - ✅ Entre : `https://pulse-lead.com/stripe-return`

6. **Sauvegarde**

**C'EST TOUT !** ✅

---

### **Option 2 : Créer un nouveau Payment Link avec Success URL** 🆕

Si l'option 1 ne marche pas (certains anciens Payment Links), crée un nouveau :

1. **Va sur Stripe Dashboard** :
   ```
   https://dashboard.stripe.com/test/payment-links
   ```

2. **Clique "Create payment link"**

3. **Configure le produit** :
   - Name: `PULSE PRO`
   - Price: `49€`
   - Billing: `Recurring - Monthly`
   - Free trial: `7 days`

4. **Dans "After payment"** :
   - ✅ "Redirect on success" → **"Custom URL"**
   - ✅ URL : `https://pulse-lead.com/stripe-return`

5. **Clique "Create link"**

6. **Copie la nouvelle URL du Payment Link**

7. **Met à jour le `.env`** :
   ```bash
   VITE_STRIPE_PAYMENT_LINK_PRO=https://buy.stripe.com/test_XXXXXX
   ```

8. **Redéploie le front**

---

## 📊 VÉRIFIER QUE C'EST BON

### **Test rapide** :

1. Ouvre ton Payment Link dans un onglet privé
2. Regarde l'URL en bas de page
3. Si tu vois quelque chose comme :
   ```
   After payment → Redirect to pulse-lead.com/stripe-return
   ```
   ✅ **C'est bon !**

### **Test complet** :

1. Inscris-toi avec un nouvel email
2. Confirme l'email (clique lien)
3. Paie sur Stripe (carte 4242...)
4. Vérifie :
   - ✅ Redirigé vers `pulse-lead.com/stripe-return`
   - ✅ Voir "🎉 Paiement réussi !"
   - ✅ Redirection `/dashboard` (2s)
   - ✅ Loader "Activation en cours..."
   - ✅ Dashboard PRO s'affiche (5-15s)

---

## 🐛 SI ÇA NE MARCHE TOUJOURS PAS

### **Problème 1 : L'option "Custom URL" n'existe pas**

➡️ **Cause** : Ancien Payment Link (avant 2023)

➡️ **Solution** : Crée un nouveau Payment Link (Option 2)

---

### **Problème 2 : Success URL grisée / non modifiable**

➡️ **Cause** : Payment Link créé via API avec des restrictions

➡️ **Solution** : Utilise l'**Option 3** ci-dessous (Checkout Sessions)

---

### **Problème 3 : Success URL configurée mais pas de redirection**

➡️ **Cause** : Cache navigateur ou mode test/live

➡️ **Solution** :
1. Vide le cache navigateur (Cmd+Shift+R)
2. Teste en navigation privée
3. Vérifie que tu es bien en mode **Test** (ou **Live** en prod)

---

## 🚀 OPTION 3 : Checkout Sessions (Solution PRO)

Si les Payment Links ne marchent vraiment pas, utilise **Checkout Sessions** créées programmatiquement.

### **Avantages** :
- ✅ Contrôle total de la Success URL
- ✅ Métadonnées personnalisées
- ✅ Plus flexible
- ✅ Meilleure intégration

### **Comment faire** :

1. **Crée un endpoint Supabase Edge Function** : `create-checkout-session`

2. **Dans le front, remplace** :
   ```typescript
   // AVANT (Payment Link)
   window.location.href = 'https://buy.stripe.com/...';
   
   // APRÈS (Checkout Session)
   const { data } = await supabase.functions.invoke('create-checkout-session', {
     body: { 
       userId: session.user.id,
       email: session.user.email,
       priceId: 'price_...',
     }
   });
   window.location.href = data.url;
   ```

3. **Edge Function** :
   ```typescript
   const session = await stripe.checkout.sessions.create({
     customer_email: email,
     client_reference_id: userId,
     line_items: [{
       price: priceId,
       quantity: 1,
     }],
     mode: 'subscription',
     subscription_data: {
       trial_period_days: 7,
     },
     success_url: 'https://pulse-lead.com/stripe-return',
     cancel_url: 'https://pulse-lead.com/?checkout=cancelled',
     metadata: {
       user_id: userId,
     },
   });
   
   return { url: session.url };
   ```

---

## 📋 RÉCAPITULATIF

### **Si tu veux une solution rapide** :
➡️ Essaie **Option 1** ou **Option 2** (modifier/créer Payment Link)

### **Si tu veux une solution pro et flexible** :
➡️ Utilise **Option 3** (Checkout Sessions)

---

## 🎯 MA RECOMMANDATION

**Pour l'instant** : Essaie l'**Option 1** (modifier Payment Link existant)

**Si ça marche** : T'es bon ✅

**Si ça marche pas** : Crée un nouveau Payment Link (**Option 2**)

**Si toujours pas** : Passe aux Checkout Sessions (**Option 3**) - je t'aide à coder

---

## 📞 PROCÉDURE DE TEST

1. **Configure l'Option 1 ou 2**
2. **Teste UNE SEULE FOIS** avec carte 4242...
3. **Envoie-moi un screen** de ce qui se passe après le paiement
4. Je te dis si c'est bon ou pas

**Plus besoin de tester 10 fois**, un seul test suffit pour voir si la redirection fonctionne.

---

## ✅ CHECKLIST

- [ ] Success URL configurée dans Stripe : `https://pulse-lead.com/stripe-return`
- [ ] Payment Link sauvegardé
- [ ] Test en navigation privée
- [ ] Carte test 4242... utilisée
- [ ] Après paiement → Redirigé vers `/stripe-return` ✅

---

**Fais l'Option 1 maintenant et teste une fois. Envoie-moi le résultat !** 🚀
