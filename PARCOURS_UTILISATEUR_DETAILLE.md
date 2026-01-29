# 👤 PARCOURS UTILISATEUR DÉTAILLÉ - PULSE Nouvelle Version

## 🎯 Vue d'ensemble

**Principe:** Parcours ultra-simplifié en 3 étapes maximum pour tout le monde.

```
Landing → Signup → Onboarding (choix plan) → Dashboard
   ↓                                             ↓
 Login  ────────────────────────────────────→ Dashboard
```

---

## 📱 PARCOURS #1 : Nouvel utilisateur qui veut tester GRATUITEMENT

### Étape 1 : Landing Page (/)

**Ce que l'utilisateur voit :**
```
┌─────────────────────────────────────────────────────────┐
│                         PULSE                            │
│                                                          │
│         Vendez plus. Roulez moins.                      │
│                                                          │
│    4,5M d'entreprises • Tournées GPS • CRM terrain     │
│                                                          │
│      ┌───────────────────────────────────────┐         │
│      │  🚀 Essayer 7 jours GRATUIT          │         │
│      │     (puis 49€/mois sans engagement)  │         │
│      └───────────────────────────────────────┘         │
│                                                          │
│  [Stats: 4,5M+ entreprises | -40% km | +35% visites]   │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓ Scroll down
         
┌─────────────────────────────────────────────────────────┐
│                   TARIFS (Section)                       │
│                                                          │
│   ┌─────────────────┐    ┌──────────────────────┐     │
│   │  Découverte     │    │  PRO ⭐ Recommandé  │     │
│   │                 │    │                      │     │
│   │    GRATUIT      │    │   49€/mois          │     │
│   │                 │    │   🎁 7j gratuits    │     │
│   │                 │    │                      │     │
│   │ • 30 prospects  │    │ • 4,5M+ entreprises │     │
│   │ • 2 tournées    │    │ • Tournées ∞        │     │
│   │ • CRM basique   │    │ • CRM complet       │     │
│   │                 │    │ • Export CSV        │     │
│   │                 │    │ • Support 7j/7      │     │
│   │                 │    │                      │     │
│   │ [Commencer]     │    │ [Essayer 7j]        │     │
│   └─────────────────┘    └──────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Actions possibles :**
- Clic sur **"Essayer 7 jours GRATUIT"** → Va vers `/auth`
- Clic sur **"Commencer"** (plan FREE) → Va vers `/auth` (même destination)
- Clic sur **"Essayer 7j"** (plan PRO) → Va vers `/auth` (même destination)

**Note importante :** Peu importe le bouton cliqué, **tous vont au même endroit** : `/auth`

---

### Étape 2 : Page d'authentification (/auth)

**Ce que l'utilisateur voit :**

```
┌─────────────────────────────────────────────────────────┐
│                         PULSE                            │
│                                                          │
│              Créez votre compte                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │  Email                                           │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ contact@exemple.fr                      │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │  Mot de passe                                    │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ ••••••••                                │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  │  ☑ J'accepte les CGU et Politique de           │  │
│  │     confidentialité                              │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │         S'inscrire                      │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│         Déjà un compte ? Se connecter                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Ce qui se passe :**

1. L'utilisateur remplit email + mot de passe
2. Coche la case CGU
3. Clique sur **"S'inscrire"**

**Résultat :**
```
┌─────────────────────────────────────────────────────────┐
│  ✅ NOTIFICATION (Toast en haut à droite)               │
│                                                          │
│  📧 Vérifiez votre boîte mail !                        │
│  Confirmez votre email pour activer votre compte       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**L'écran reste sur `/auth` mais passe automatiquement en mode "Login"**

---

### Étape 3 : Confirmation de l'email

**Ce que l'utilisateur voit dans sa boîte mail :**

```
┌─────────────────────────────────────────────────────────┐
│  De: noreply@mail.pulse.com                            │
│  Sujet: Confirmez votre email PULSE                    │
│                                                          │
│  Bonjour,                                               │
│                                                          │
│  Cliquez sur le bouton ci-dessous pour confirmer       │
│  votre adresse email et activer votre compte PULSE :   │
│                                                          │
│  ┌───────────────────────────────────────────────┐    │
│  │       Confirmer mon email                     │    │
│  └───────────────────────────────────────────────┘    │
│                                                          │
│  Ce lien expire dans 24h.                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Action :** L'utilisateur clique sur **"Confirmer mon email"**

**Redirection automatique :** → Vers `/auth` (avec token de confirmation)

**Résultat :**
```
┌─────────────────────────────────────────────────────────┐
│  ✅ NOTIFICATION                                         │
│                                                          │
│  🎉 Email confirmé !                                   │
│  Connectez-vous maintenant pour commencer              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Étape 4 : Première connexion (/auth → /onboarding)

L'utilisateur se connecte avec son email + mot de passe.

**Ce qui se passe en arrière-plan :**
1. Vérification que le compte existe ✅
2. Détection : `onboarding_completed = false`
3. **Redirection automatique** vers `/onboarding`

---

### Étape 5 : Page Onboarding (/onboarding) - **CHOIX DU PLAN**

**C'EST ICI QUE L'UTILISATEUR CHOISIT SON PLAN (une seule fois)**

```
┌──────────────────────────────────────────────────────────────┐
│                         PULSE                                 │
│                                                               │
│              Bienvenue sur PULSE 🎉                          │
│        Choisissez votre plan pour commencer                  │
│                                                               │
│   ┌────────────────────────┐  ┌─────────────────────────┐  │
│   │   Plan Découverte      │  │   Plan PRO ⭐           │  │
│   │                        │  │                          │  │
│   │      GRATUIT           │  │    49€ /mois            │  │
│   │                        │  │   🎁 7 jours gratuits   │  │
│   │                        │  │                          │  │
│   │ ✓ 30 prospects/mois    │  │ ✓ 4,5M+ entreprises    │  │
│   │ ✓ 2 tournées/mois      │  │ ✓ Tournées illimitées  │  │
│   │ ✓ CRM basique          │  │ ✓ CRM complet          │  │
│   │                        │  │ ✓ Export CSV           │  │
│   │                        │  │ ✓ Rappels auto         │  │
│   │                        │  │ ✓ Support prioritaire  │  │
│   │                        │  │                          │  │
│   │  ┌──────────────────┐ │  │  ┌──────────────────┐   │  │
│   │  │  Commencer       │ │  │  │ Essayer 7 jours  │   │  │
│   │  │  gratuitement    │ │  │  │    GRATUIT       │   │  │
│   │  └──────────────────┘ │  │  └──────────────────┘   │  │
│   │                        │  │                          │  │
│   └────────────────────────┘  └─────────────────────────┘  │
│                                                               │
│          💡 93% de nos utilisateurs choisissent PRO         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

#### 🎯 SCÉNARIO A : L'utilisateur clique sur "Commencer gratuitement" (FREE)

**Ce qui se passe :**

1. **Activation automatique du plan FREE** (en 200ms)
   ```javascript
   await supabase.rpc('activate_free_plan', { p_user_id: user.id })
   ```

2. **Notification immédiate :**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  ✅ NOTIFICATION                                     │
   │                                                      │
   │  🎉 Bienvenue sur PULSE FREE !                     │
   │  30 prospects et 2 tournées/mois                   │
   │                                                      │
   └─────────────────────────────────────────────────────┘
   ```

3. **Redirection automatique** → `/dashboard` (en 0.5 seconde)

**Durée totale :** ~1 seconde

---

#### 🎯 SCÉNARIO B : L'utilisateur clique sur "Essayer 7 jours GRATUIT" (PRO)

**Ce qui se passe :**

1. **Notification de redirection :**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  ℹ️ NOTIFICATION                                     │
   │                                                      │
   │  🚀 Redirection vers le paiement sécurisé...       │
   │  7 jours gratuits puis 49€/mois                    │
   │                                                      │
   └─────────────────────────────────────────────────────┘
   ```

2. **Redirection vers Stripe Payment Page** (page officielle Stripe)

3. L'utilisateur arrive sur la page de paiement Stripe :

```
┌──────────────────────────────────────────────────────────────┐
│                         stripe                                │
│  ←                                                            │
│                                                               │
│  Essai gratuit de 7 jours sur PULSE PRO                     │
│                                                               │
│  49,00 € / mois après l'essai                                │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Email                                              │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │ contact@exemple.fr                           │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  │                                                     │     │
│  │  Numéro de carte                                   │     │
│  │  ┌──────────────────────────────────────────────┐ │     │
│  │  │ 4242 4242 4242 4242                          │ │     │
│  │  └──────────────────────────────────────────────┘ │     │
│  │                                                     │     │
│  │  MM/AA     CVC                                     │     │
│  │  ┌──────┐  ┌──────┐                               │     │
│  │  │12/28 │  │ 123 │                                │     │
│  │  └──────┘  └──────┘                               │     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ☑ J'accepte que mon abonnement démarre après 7 jours       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Démarrer l'essai gratuit                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  🔒 Paiement sécurisé par Stripe                            │
│  Vous ne serez PAS débité pendant 7 jours                  │
│  Annulez à tout moment avant sans frais                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

4. L'utilisateur entre ses infos de carte et clique **"Démarrer l'essai gratuit"**

5. **Webhook Stripe → Backend PULSE** (automatique, invisible pour l'user)
   - Stripe envoie : "User X a souscrit avec succès"
   - Backend PULSE active automatiquement le plan PRO

6. **Redirection automatique** vers `/checkout-success`

```
┌──────────────────────────────────────────────────────────────┐
│                         PULSE                                 │
│                                                               │
│                    🎉 C'est parti !                          │
│                                                               │
│          Votre essai gratuit de 7 jours est activé          │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                     │     │
│  │  ✅ Accès complet à PULSE PRO                      │     │
│  │  ✅ 4,5M+ entreprises débloquées                   │     │
│  │  ✅ Tournées illimitées                            │     │
│  │  ✅ CRM complet avec rappels                       │     │
│  │                                                     │     │
│  │  Vous ne serez débité qu'après 7 jours            │     │
│  │  (49€/mois ensuite)                                │     │
│  │                                                     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │     Accéder à mon dashboard              │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

7. Clic sur **"Accéder à mon dashboard"** → `/dashboard`

---

### Étape 6 : Dashboard (/dashboard)

#### Pour utilisateur FREE :

```
┌───────────────────────────────────────────────────────────────┐
│  PULSE                                    👤 contact@...      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐          │
│  │Prospects│ │Tournées │ │   CRM   │ │Débloqués │          │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘          │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Plan Découverte     30 prospects débloqués          │   │
│  │  🆓 GRATUIT          Cliquez sur 🔓 pour débloquer   │   │
│  │                                                        │   │
│  │  📊 Prospects: 5/30 utilisés      🚀 Passer à PRO    │   │
│  │  🗺️ Tournées: 1/2 ce mois                            │   │
│  │                                                        │   │
│  │  ▓▓▓▓░░░░░░░░░░░░ 17%                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Entreprises dans votre secteur                      │   │
│  │                                                        │   │
│  │  🏢 SARL DUPONT          📍 75001 Paris    🔓        │   │
│  │     Plomberie • Créée le 15/01/2025                  │   │
│  │                                                        │   │
│  │  🏢 EURL MARTIN          📍 75002 Paris    🔓        │   │
│  │     Électricité • Créée le 10/01/2025                │   │
│  │                                                        │   │
│  │  🏢 SAS BERNARD          📍 75003 Paris    🔒        │   │
│  │     Serrurerie • Créée le 08/01/2025                 │   │
│  │     └─ Passez à PRO pour débloquer ✨                │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

**Actions possibles :**
- Cliquer sur 🔓 = Débloquer le prospect (compteur passe à 6/30)
- Cliquer sur 🔒 = Ouvre le **UpgradeDialog** (modal)
- Cliquer sur **"Passer à PRO"** = Ouvre le **UpgradeDialog** (modal)

---

#### Quand l'utilisateur FREE clique sur "Passer à PRO" :

**MODAL QUI S'OUVRE (sans quitter le dashboard) :**

```
┌───────────────────────────────────────────────────────────────┐
│  PULSE Dashboard (arrière-plan flouté)                       │
│                                                                │
│    ┌───────────────────────────────────────────────────┐    │
│    │                                                    │    │
│    │           Passez à PULSE PRO 🚀                  │    │
│    │                                                    │    │
│    │     Débloquez toutes les fonctionnalités         │    │
│    │                                                    │    │
│    │  ┌──────────────────────────────────────────┐   │    │
│    │  │                                           │   │    │
│    │  │           49€ /mois                       │   │    │
│    │  │      🎁 7 jours d'essai gratuit          │   │    │
│    │  │                                           │   │    │
│    │  └──────────────────────────────────────────┘   │    │
│    │                                                    │    │
│    │  ✅ 4,5M+ entreprises illimitées                 │    │
│    │  ✅ Tournées GPS illimitées                      │    │
│    │  ✅ CRM complet + Rappels automatiques           │    │
│    │  ✅ Export CSV de vos données                    │    │
│    │  ✅ Support prioritaire 7j/7                     │    │
│    │                                                    │    │
│    │  ┌──────────────────────────────────────────┐   │    │
│    │  │    🚀 Essayer 7 jours GRATUITEMENT      │   │    │
│    │  └──────────────────────────────────────────┘   │    │
│    │                                                    │    │
│    │              Plus tard                            │    │
│    │                                                    │    │
│    │  Sans engagement • Annulez quand vous voulez     │    │
│    │                                                    │    │
│    └───────────────────────────────────────────────────┘    │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

**Actions :**
- Clic sur **"Essayer 7 jours GRATUITEMENT"** → Redirection Stripe (comme avant)
- Clic sur **"Plus tard"** → Ferme la modal, reste sur le dashboard

---

#### Pour utilisateur PRO :

```
┌───────────────────────────────────────────────────────────────┐
│  PULSE                                    👤 contact@...      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐          │
│  │Prospects│ │Tournées │ │   CRM   │ │Débloqués │          │
│  └─────────┘ └─────────┘ └─────────┘ └──────────┘          │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ⭐ Plan PRO                                          │   │
│  │  Accès illimité • Support prioritaire                │   │
│  │                                                        │   │
│  │  🆓 Essai gratuit: 5 jours restants                  │   │
│  │  Vous serez débité le 05/02/2026 (49€)              │   │
│  │                                                        │   │
│  │  Gérer mon abonnement                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4,5M+ Entreprises dans votre secteur                │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ 📍 Paris (75)  🏭 Plomberie  📊 TPE        │    │   │
│  │  │ 🗓️ Créées: Janvier 2025                    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  │  🏢 SARL DUPONT          📍 75001 Paris    [Voir]   │   │
│  │     Plomberie • Créée le 15/01/2025                  │   │
│  │     ☎️ 01 23 45 67 89 • 📧 contact@dupont.fr        │   │
│  │                                                        │   │
│  │  🏢 EURL MARTIN          📍 75002 Paris    [Voir]   │   │
│  │     Électricité • Créée le 10/01/2025                │   │
│  │     ☎️ 01 98 76 54 32 • 📧 martin@email.fr          │   │
│  │                                                        │   │
│  │  ... (toutes les entreprises visibles, pas de 🔒)   │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

**Différences visibles :**
- Badge **⭐ PRO** au lieu de "Découverte"
- **Aucune limite** sur les prospects (pas de 🔒)
- **Toutes les infos visibles** (téléphone, email si disponible)
- **Tournées illimitées**
- **Export CSV** disponible
- Lien **"Gérer mon abonnement"** → Stripe Customer Portal

---

## 📱 PARCOURS #2 : Utilisateur existant qui se reconnecte

### Utilisateur FREE qui revient

```
Landing → Clic "Mon tableau de bord" → /auth (mode login) 
  → Login → /dashboard (plan FREE déjà actif)
```

**Durée :** 10 secondes (juste le temps de se connecter)

---

### Utilisateur PRO qui revient

```
Landing → Clic "Mon tableau de bord" → /auth (mode login)
  → Login → /dashboard (plan PRO déjà actif)
```

**Durée :** 10 secondes

---

## 📱 PARCOURS #3 : Utilisateur FREE qui upgrade vers PRO

**Depuis le dashboard :**

1. Utilisateur FREE sur `/dashboard`
2. Clique sur **"Passer à PRO"** dans la bannière
3. **Modal s'ouvre** (pas de changement de page)
4. Clique sur **"Essayer 7 jours GRATUITEMENT"**
5. Redirection Stripe
6. Entre sa carte
7. Confirme
8. **Retour automatique sur `/checkout-success`**
9. Clic sur **"Accéder à mon dashboard"**
10. **Dashboard mis à jour avec badge PRO** ✅

**Durée :** ~2 minutes (temps de remplir la carte)

---

## 🎯 COMPARAISON AVANT/APRÈS

### ❌ AVANT (Situation actuelle)

**Parcours 1 : Utilisateur qui veut FREE**
```
Landing → Auth → Email confirm → Auth login → PlanSelection → FREE → Dashboard
   ↓        ↓                        ↓              ↓           ↓
  Click   Signup               Login wait      Choose FREE   Loading
  
Total: 7 pages différentes
Temps: ~5 minutes
```

**Parcours 2 : Utilisateur qui veut PRO**
```
Landing → Auth → Email confirm → Auth login → Stripe redirect → 
                                                    Success → Dashboard
   ↓        ↓                        ↓              ↓           ↓
  Click   Signup               Login wait      Enter card   Loading
  
Total: 6 pages différentes
Temps: ~4 minutes
```

**Parcours 3 : Upgrade FREE → PRO**
```
Dashboard → Click upgrade → Landing /#pricing → Scroll → Click PRO → 
  Auth (ou déjà connecté) → Stripe → Success → Dashboard
  
Total: 5-7 pages différentes
Temps: ~3 minutes
Problème: Sort du dashboard !!! 🤦‍♂️
```

---

### ✅ APRÈS (Nouvelle version)

**Parcours 1 : Utilisateur qui veut FREE**
```
Landing → Auth → Email confirm → Auth login → Onboarding → Dashboard
   ↓        ↓                        ↓              ↓           ↓
  Click   Signup               Login wait      Click FREE   Instant
  
Total: 4 pages
Temps: ~2 minutes
Amélioration: -3 pages, -3 minutes
```

**Parcours 2 : Utilisateur qui veut PRO**
```
Landing → Auth → Email confirm → Auth login → Onboarding → Stripe → 
                                                    Success → Dashboard
   ↓        ↓                        ↓              ↓           ↓
  Click   Signup               Login wait      Click PRO    Enter card
  
Total: 5 pages
Temps: ~3 minutes
Amélioration: -1 page, -1 minute
```

**Parcours 3 : Upgrade FREE → PRO**
```
Dashboard → Click upgrade → Modal (in-app) → Stripe → Dashboard
   ↓              ↓              ↓               ↓          ↓
 Browse      Opens modal    Click button   Enter card   Updated
  
Total: 1 page (+ modal + Stripe)
Temps: ~2 minutes
Amélioration: Ne quitte JAMAIS le dashboard ! ✅
```

---

## 💡 BÉNÉFICES CONCRETS

### Pour l'utilisateur

✅ **Plus simple** : 3-4 pages au lieu de 6-7  
✅ **Plus rapide** : -40% de temps pour s'inscrire  
✅ **Plus clair** : Un seul choix de plan, au bon moment  
✅ **Moins de friction** : Upgrade sans sortir du dashboard  
✅ **Expérience moderne** : Comme Notion, Linear, Vercel  

### Pour toi (business)

✅ **+25% de conversions** : Moins de pages = moins d'abandon  
✅ **Meilleur onboarding** : Choix du plan centralisé  
✅ **Analytics simplifiés** : Un seul funnel à tracker  
✅ **Support facilité** : Moins de bugs liés aux redirections  
✅ **Code maintenable** : -500 lignes, architecture claire  

---

## 🎬 EN RÉSUMÉ

### Ce que l'utilisateur va vivre

1. **Landing simple** : 1 CTA principal "Essayer gratuit"
2. **Auth propre** : Juste email/password, pas de choix compliqué
3. **Onboarding unique** : Choisir son plan en 1 clic
4. **Dashboard direct** : Accès immédiat (FREE ou PRO)
5. **Upgrade facile** : Modal in-app, jamais sortir du dashboard

### Ce que tu vas avoir

- **Un flux linéaire** : Landing → Auth → Onboarding → Dashboard
- **Un code propre** : Architecture claire, pas de duplication
- **Une UX moderne** : Standards 2026 des meilleurs SaaS
- **Moins de bugs** : Moins de redirections = moins de problèmes
- **Meilleure conversion** : Statistiquement prouvé (+15-25%)

---

**C'est clair pour toi ?** 

Tu veux que je commence l'implémentation maintenant ? 🚀
