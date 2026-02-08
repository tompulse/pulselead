# 🗺️ Architecture du Site Pulse - Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         pulse-lead.com                              │
│                    (Domaine Principal)                              │
└────────────────────────┬────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│   Route: /      │             │  Route: /comm.. │
│                 │             │                 │
│ PULSE ENTREPRISE│             │   PULSE SOLO    │
│  (HIGH-TICKET)  │             │    (49 €)       │
│                 │             │                 │
│  Fichier:       │             │  Fichier:       │
│  Entreprise     │             │  Commercial     │
│  Landing.tsx    │             │  Page.tsx       │
└─────────────────┘             └─────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│  Public Cible   │             │  Public Cible   │
│  ─────────────  │             │  ─────────────  │
│  • PME          │             │  • Freelances   │
│  • Équipes      │             │  • Commerciaux  │
│  • Installateurs│             │    individuels  │
│    sécurité     │             │                 │
└─────────────────┘             └─────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│     Offre       │             │     Offre       │
│  ─────────────  │             │  ─────────────  │
│  Accompagnement │             │  Outil SaaS     │
│  premium avec:  │             │  autonome avec: │
│  • Prospection  │             │  • Leads <3mois │
│    téléphonique │             │  • Tournées GPS │
│  • App terrain  │             │  • CRM mobile   │
│  • Coaching     │             │                 │
└─────────────────┘             └─────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│    Tarifs       │             │    Tarifs       │
│  ─────────────  │             │  ─────────────  │
│  2 500-6 000+ € │             │     49 €/mois   │
│     par mois    │             │  (7j gratuit)   │
│  (engagement    │             │  Sans engagement│
│    6 mois)      │             │                 │
└─────────────────┘             └─────────────────┘
```

---

## 🔗 Navigation Entre les Pages

```
┌───────────────────────────────────────────────────┐
│           PULSE ENTREPRISE (/)                    │
│  ┌─────────────────────────────────────────────┐ │
│  │  Header                                     │ │
│  │  ┌─────┬─────┬─────┬──────────────────┐    │ │
│  │  │Logo │Menu │     │ Version Solo (49€)│    │ │
│  │  │     │     │     │        ↓         │    │ │
│  │  └─────┴─────┴─────┴──────────────────┘    │ │
│  │                      Lien vers /commercial  │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [ Contenu HIGH-TICKET ]                         │
│  • Hero avec mockup                              │
│  • Section Éducation (<3 mois)                   │
│  • Expertise Sectorielle                         │
│  • Tarifs Premium                                │
│  • Formulaire Contact                            │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  Footer                                     │ │
│  │  Ressources → Version Solo (49 €)          │ │
│  │               ↓ Lien vers /commercial      │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
                         │
                         │ (click sur "Version Solo")
                         ▼
┌───────────────────────────────────────────────────┐
│           PULSE SOLO (/commercial)                │
│  ┌─────────────────────────────────────────────┐ │
│  │  Header                                     │ │
│  │  ┌─────┬─────┬─────┬──────────────────┐    │ │
│  │  │Logo │Menu │     │   Mon Dashboard   │    │ │
│  │  │     │     │     │                   │    │ │
│  │  └─────┴─────┴─────┴──────────────────┘    │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [ Contenu ACCESSIBLE ]                          │
│  • Hero "Vendez plus, Roulez moins"              │
│  • Fonctionnalités                               │
│  • Avant/Après                                   │
│  • Tarif 49 €/mois                               │
│  • CTA "Essayer 7j Gratuit"                      │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │  Footer                                     │ │
│  │  (Pas de lien retour vers Entreprise)      │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## 🎨 Palette de Couleurs

```
┌────────────────────────────────────────────────────────┐
│          PULSE ENTREPRISE (HIGH-TICKET)                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Fond principal:        ████ #0A0E1A (bleu nuit)     │
│  Gradients:             ████ #001F3F → #00D4FF       │
│  CTA principal:         ████ #00FF9D (vert premium)   │
│  Hover CTA:             ████ #00D4FF (cyan clair)     │
│  Titres:                ████ #FFFFFF (blanc)          │
│  Texte secondaire:      ████ #A0AEC0 (gris clair)     │
│  Bordures cards:        ████ rgba(0,212,255,0.3)      │
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│            PULSE SOLO (ACCESSIBLE)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Fond principal:        ████ hsl(220, 60%, 8%)        │
│  Accents:               ████ hsl(190, 100%, 50%)      │
│  CTA principal:         ████ Dégradé vert              │
│  Texte:                 ████ Blanc / Gris              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Comparaison des Offres

```
┌───────────────────────┬───────────────────────┐
│   PULSE ENTREPRISE    │     PULSE SOLO        │
├───────────────────────┼───────────────────────┤
│  B2B High-Ticket      │  B2C Accessible       │
│  2 500 - 6 000+ €/mois│  49 €/mois            │
│  Engagement 6 mois    │  Sans engagement      │
│  Leads + Tel + App    │  Outil autonome       │
│  Coaching dédié       │  Self-service         │
│  Account manager      │  Support standard     │
│  Garantie ROI         │  Essai 7 jours        │
│  Multi-utilisateurs   │  1 utilisateur        │
└───────────────────────┴───────────────────────┘
```

---

## 🚀 Flux Utilisateur

### Scénario 1 : Visiteur PME (cible Entreprise)

```
1. Arrive sur pulse-lead.com/
   │
   ├─► Lit le Hero HIGH-TICKET
   │
   ├─► Découvre le combo "Téléphonique + App"
   │
   ├─► Voit les stats impressionnantes (+300% RDV)
   │
   ├─► Lit les témoignages clients
   │
   ├─► Consulte les tarifs (2 500-6 000+ €)
   │
   └─► Remplit le formulaire de contact
       │
       └─► Reçoit un call de l'équipe sous 24h
```

### Scénario 2 : Visiteur Commercial Solo

```
1. Arrive sur pulse-lead.com/
   │
   ├─► Découvre l'offre Entreprise (trop cher)
   │
   ├─► Voit le lien "Version Solo (49 €)" dans le header
   │
   └─► Clique et arrive sur /commercial
       │
       ├─► Lit le Hero "Vendez plus, Roulez moins"
       │
       ├─► Découvre l'outil SaaS autonome
       │
       ├─► Voit le tarif 49 €/mois
       │
       └─► Clique sur "Essayer 7j Gratuit"
           │
           └─► Inscription → Onboarding → Dashboard
```

---

## 📂 Structure des Fichiers Source

```
src/
├── pages/
│   ├── EntrepriseLanding.tsx  ← Page d'accueil HIGH-TICKET (/)
│   ├── CommercialPage.tsx     ← Page Solo accessible (/commercial)
│   ├── LandingPage.tsx        ← Ancienne version (conservée, pas utilisée)
│   ├── Auth.tsx               ← Inscription/Connexion
│   ├── Dashboard.tsx          ← Tableau de bord utilisateur
│   ├── Onboarding.tsx         ← Choix du plan après inscription
│   └── ...
├── components/
│   ├── ui/                    ← Composants shadcn/ui
│   └── landing/               ← Composants spécifiques landing
└── App.tsx                    ← Routes principales
```

---

## 🎯 Points Clés

✅ **2 pages indépendantes** : Entreprise (/) et Solo (/commercial)
✅ **Navigation discrète** : Lien "Version Solo (49 €)" dans header Entreprise
✅ **Pas de retour automatique** : Solo ne pointe pas vers Entreprise
✅ **Couleurs distinctes** : Vert/Cyan pour Entreprise, Cyan électrique pour Solo
✅ **Responsive complet** : Mobile, tablet, desktop optimisés
✅ **Build réussi** : Code prêt pour déploiement

---

**Date** : 8 février 2026
