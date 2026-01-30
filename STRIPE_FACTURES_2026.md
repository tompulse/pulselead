# 📄 CONFIGURATION FACTURES STRIPE (2026)

## ⚠️ MISE À JOUR : Interface Stripe a changé en 2026

Les paramètres d'email ne sont plus au même endroit. Voici les **nouveaux emplacements** :

---

## 🔍 **MÉTHODE 1 : Activation via Branding/Emails**

1. **Se connecter sur** : https://dashboard.stripe.com
2. **Aller dans** : **Settings** (icône engrenage en haut à droite)
3. **Chercher** : **"Branding"** dans la barre de recherche
4. **OU naviguer** : Settings → Business settings → Branding
5. **Section "Emails"** :
   - ✅ Activer "Send emails to customers"
   - ✅ Configurer l'email d'expéditeur (noreply@pulse-lead.com ou support@pulse-lead.com)
   - ✅ Ajouter le logo PULSE
   - ✅ Choisir la couleur de marque : `#00BFFF`

---

## 🔍 **MÉTHODE 2 : Configuration via Invoices Settings**

1. **Dashboard Stripe** → https://dashboard.stripe.com
2. **Settings** → **Invoices**
3. **Default invoice settings** :
   - ✅ **Automatically send invoice emails** : **ON**
   - ✅ **Email receipts for one-time invoices** : **ON**
   - ✅ **Email receipts for recurring subscription invoices** : **ON**
4. **Email settings** :
   - Logo : Ajouter le logo PULSE
   - Footer text : "PULSE - Vends plus. Roule moins."
   - Support email : tomiolovpro@gmail.com ou support@pulse-lead.com

---

## 🔍 **MÉTHODE 3 : Vérifier les Email Notifications (Nouveau en 2026)**

1. **Dashboard** → **Settings**
2. **Chercher** : "Email notifications" ou "Customer notifications"
3. **Activer** :
   - ✅ Payment succeeded
   - ✅ Payment failed
   - ✅ Invoice finalized
   - ✅ Invoice paid
   - ✅ Subscription created
   - ✅ Subscription updated
   - ✅ Trial ending (si disponible)

---

## 🎨 **PERSONNALISATION DES FACTURES**

### **Logo et Branding** :
- **Format recommandé** : PNG transparent, 200x200px minimum
- **Couleur primaire** : `#00BFFF` (bleu cyan PULSE)
- **Police** : Laisser par défaut ou choisir une police moderne

### **Informations légales à ajouter** :
```
PULSE
Tom Iolov
108 rue de Crimée
75019 Paris
France

SIRET: 948 550 561 00039
Email: tomiolovpro@gmail.com
Site: https://pulse-lead.com
```

---

## ✅ **ALTERNATIVE : Stripe envoie déjà les factures par défaut**

**BONNE NOUVELLE** : Stripe envoie automatiquement les factures aux clients par email lors de :
- ✅ Paiement réussi (invoice.paid)
- ✅ Paiement échoué (invoice.payment_failed)
- ✅ Abonnement créé
- ✅ Renouvellement d'abonnement

**DONC** : Si tu ne trouves pas les paramètres, **c'est probablement déjà actif par défaut** !

---

## 🧪 **TESTER L'ENVOI DE FACTURES**

### **Option 1 : Test avec un paiement réel** (mode test)
1. Stripe Dashboard → Developers → **Test mode ON** (toggle en haut)
2. Créer un paiement test avec la carte : `4242 4242 4242 4242`
3. Vérifier l'email de réception

### **Option 2 : Envoyer une facture manuellement**
1. Stripe Dashboard → **Invoices**
2. Créer une nouvelle facture
3. **Send invoice** → Vérifier la réception

### **Option 3 : Vérifier les logs Stripe**
1. Stripe Dashboard → **Events**
2. Filtrer par `invoice.paid` ou `invoice.finalized`
3. Cliquer sur un événement
4. Voir si "Email sent" apparaît dans les détails

---

## 📧 **CE QUE LE CLIENT REÇOIT AUTOMATIQUEMENT**

### **Email Stripe (facture PDF)** :
- Logo de ton entreprise (si configuré)
- Détail de la transaction
- Montant, date, méthode de paiement
- Lien pour télécharger le PDF
- Informations légales

### **Email PULSE (confirmation paiement)** :
- Notre email custom via `send-payment-confirmation`
- Message de bienvenue
- Liste des fonctionnalités PRO
- Lien vers le dashboard

**RÉSULTAT** : Le client reçoit **2 emails** :
1. **Facture Stripe** (PDF officiel)
2. **Confirmation PULSE** (email marketing custom)

---

## 🆘 **DÉPANNAGE**

### **Les factures ne sont pas envoyées** :
1. Vérifier que le mode LIVE est actif (pas test)
2. Vérifier l'email du client dans Stripe (customer email)
3. Vérifier le spam de l'email client
4. Vérifier les événements Stripe : Events → invoice.paid

### **Vérifier si les emails sont actifs** :
```
Stripe Dashboard → Events → Filtrer par "invoice" 
→ Cliquer sur un événement récent
→ Voir "Email sent to customer: email@example.com"
```

Si tu vois "Email sent", **c'est actif** ! ✅

---

## 💡 **CONSEIL : Ne t'embête pas trop**

**Stripe envoie les factures automatiquement** depuis toujours. Si tu ne trouves pas les paramètres en 2026, c'est probablement parce que :
1. **C'est déjà actif par défaut** (Stripe l'a toujours fait)
2. L'interface a changé mais la fonctionnalité est toujours là
3. Les emails partent automatiquement dès qu'un `invoice.paid` se déclenche

**TEST SIMPLE** : Crée un abonnement test et vérifie la boîte mail → Si la facture arrive, c'est bon ! ✅

---

**DERNIÈRE MISE À JOUR** : 30 janvier 2026
**CONCLUSION** : Stripe envoie les factures par défaut, pas besoin de configuration complexe en 2026 🎉
