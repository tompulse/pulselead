# 🚀 ROADMAP 30 JOURS - PULSE

## 📅 Planning validé

**Contexte :**
- User 1 en trial actuellement
- User 2 arrive dimanche soir
- 4 démos vendredi
- 30 jours de prospection intense

**Objectif :** 20-30 trials, 10-15 payants, 500-750€ MRR

---

## SEMAINE 1 : Démolir les démos + Launch

### Jeudi 23/01 (Aujourd'hui)
- [x] Mode démo créé ✅
- [x] Landing page optimisée ✅
- [x] UX polish ✅
- [x] Onboarding amélioré ✅
- [ ] Créer compte demo@pulse.com
- [ ] Tester app de A à Z

### Vendredi 24/01 - DEMO DAY 🔥
- [ ] 4 démos (prospects + réseau)
- [ ] 4 comptes créés (trials lancés)
- [ ] Collecter feedback détaillé
- [ ] Noter objections + questions surprises

**Output attendu :**
- 4-6 trials actifs
- 2-3 conversions probables à J+7
- Feedback précis pour itérer

---

## SEMAINE 2 : Feature #1 - Enrichissement Pappers (15h)

### Lundi 27/01 (4h)
- [ ] Setup compte Pappers (récupérer clé API)
- [ ] Edge Function `enrich-contact`
- [ ] Intégration API Pappers
- [ ] Tests basiques

### Mardi 28/01 (4h)
- [ ] UI : Bouton "Enrichir" dans fiches entreprises
- [ ] Loading states + animations
- [ ] Gestion erreurs (API down, quota, etc.)
- [ ] Affichage résultats enrichis

### Mercredi 29/01 (3h)
- [ ] Modal saisie manuelle (si Pappers n'a rien)
- [ ] Système de cache (1 seul appel par entreprise)
- [ ] Tests avec vraies données

### Jeudi 30/01 (2h)
- [ ] Contribution collaborative (BONUS)
- [ ] Gamification ("Tu as enrichi X entreprises")
- [ ] Analytics enrichissement (tracking usage)

### Vendredi 31/01 (2h)
- [ ] Tests end-to-end complets
- [ ] Déploiement production
- [ ] Tom teste en live avec ses prospects

**Output attendu :**
- Feature enrichissement opérationnelle
- 90% des entreprises enrichissables
- Argument de vente #1 validé

---

## SEMAINE 3 : Engagement & Rétention (15h)

### Lundi 03/02 (6h) - Notifications Push
- [ ] Setup Push Notifications (PWA déjà configuré)
- [ ] Notification quotidienne (9h) : "Tu as X RDV à rappeler"
- [ ] Notification inactivité (J+3) : "Crée ta prochaine tournée"
- [ ] Notification fin de trial (J-2) : "Ton essai se termine"
- [ ] Paramétrage user (activer/désactiver)

### Mardi 04/02 (5h) - Analytics Commercial
- [ ] Dashboard perso (stats utilisateur)
- [ ] Cette semaine : X visites, Y RDV, Z km
- [ ] Graphique progression mensuelle
- [ ] Meilleur secteur : "Restauration (12 RDV)"
- [ ] Taux de conversion : "23%"

### Mercredi 05/02 (4h) - Export PDF
- [ ] Bouton "Exporter ma tournée" en PDF
- [ ] PDF propre avec carte + liste prospects
- [ ] Téléphone + adresse pour chaque stop
- [ ] Ordre optimisé visible
- [ ] Branding PULSE

**Output attendu :**
- Engagement × 2 (users reviennent quotidiennement)
- Churn réduit de 40%
- Features de différenciation vs concurrents

---

## SEMAINE 4 : Growth & Viralité (10h)

### Lundi 10/02 (8h) - Referral Program
- [ ] Section "Parraine un collègue" dans dashboard
- [ ] Lien unique : pulse-lead.com/ref/TOM123
- [ ] Récompense : 1 mois gratuit par filleul
- [ ] Filleul : -50% sur 1er mois (24€ au lieu de 49€)
- [ ] Tracking automatique via Stripe
- [ ] Email auto : "Ton filleul a souscrit !"

### Mardi 11/02 (2h) - Polish Final
- [ ] Tests automatisés critiques (paiement, CRM, tournées)
- [ ] Monitoring & alertes (Sentry)
- [ ] Fix derniers bugs

**Output attendu :**
- Croissance organique +30%/mois
- CAC divisé par 2-3
- App stable et scalable

---

## 🎯 MÉTRIQUES À SUIVRE (Dashboard Google Sheets)

### Acquisition
- Trials créés/jour
- Source (démo, LinkedIn, bouche-à-oreille)
- Taux de conversion landing → trial

### Activation
- % users qui créent leur 1ère tournée
- % users qui enrichissent un prospect
- % users qui ajoutent une interaction CRM

### Rétention
- Taux d'utilisation quotidien
- % users actifs J+7, J+14, J+21
- Churn rate mensuel

### Conversion
- Trial → Payant (objectif 50%+)
- Durée moyenne du trial utilisé
- Raisons d'annulation

### Revenus
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value estimé)

---

## 💰 PROJECTION FINANCIÈRE

### Fin Semaine 1 (31/01)
- Trials : 6-8
- Payants : 0-1
- MRR : 0-49€

### Fin Semaine 2 (07/02)
- Trials : 10-15
- Payants : 3-5
- MRR : 150-250€

### Fin Semaine 3 (14/02)
- Trials : 15-20
- Payants : 7-10
- MRR : 350-500€

### Fin Semaine 4 (21/02)
- Trials : 20-30
- Payants : 10-15
- MRR : 500-750€

**Dans 3 mois (21/05)** :
- Trials : 50-80
- Payants : 30-50
- MRR : 1500-2500€
- Marge : ~90% (après infra)

**Dans 6 mois (21/08)** :
- Payants : 100-200
- MRR : 5K-10K€
- Marge : ~90%
- **Tu dégages 4-9K€/mois net** 💰

---

## 🎯 PLAN DE PROSPECTION (Parallèle au dev)

### Canaux prioritaires

#### 1. LinkedIn (quotidien)
- **Post 1×/jour** (9h du matin)
- Formats :
  - Témoignage client (avec capture d'écran)
  - Astuce prospection terrain
  - Avant/Après (avec vs sans PULSE)
  - Coulisses (ton parcours entrepreneur)
- **Engage 30 min/jour** (commenter, liker, DM)

#### 2. Démarchage direct (3h/jour)
- **LinkedIn Sales Navigator**
  - Cibler : Commerciaux terrain, Responsables dev commercial
  - Secteurs : BTP, Energie, Services B2B
  - Message type : "Salut [Prénom], je vois que tu bosses en [secteur]. Tu fais de la prosp terrain ? J'ai un truc qui pourrait t'intéresser..."
- **DM Instagram/Facebook** (groupes de commerciaux)

#### 3. Bouche-à-oreille (organique)
- Demander aux users actuels de partager
- Offre de parrainage (dès semaine 4)

#### 4. Démos gratuites (2-3/semaine)
- Proposer des démos de 15 min sur Calendly
- Convertir en live

---

## 🚨 INDICATEURS D'ALERTE

Si à la fin de chaque semaine :

### Semaine 1
- ❌ Moins de 4 trials créés → Revoir pitch démo
- ❌ Feedback négatif sur UX → Itérer immédiatement

### Semaine 2
- ❌ Taux d'utilisation enrichissement <50% → Feature pas assez visible
- ❌ Pas de conversion trial → Revoir pricing/onboarding

### Semaine 3
- ❌ Churn >50% → Problème de valeur perçue
- ❌ Engagement faible → Notifications pas assez pertinentes

### Semaine 4
- ❌ Croissance stagne → Manque de viralité
- ❌ MRR <500€ → Revoir stratégie acquisition

---

## ✅ CHECKLIST HEBDOMADAIRE

**Chaque lundi matin** :
- [ ] Analyser métriques semaine précédente
- [ ] Lire tous les feedbacks users
- [ ] Prioriser bugs/features
- [ ] Planifier la semaine

**Chaque vendredi soir** :
- [ ] Déployer les features de la semaine
- [ ] Tester en production
- [ ] Préparer communication users (si grosse feature)
- [ ] Célébrer les wins 🎉

---

## 🎉 MILESTONES À CÉLÉBRER

- 🥇 **Premier client payant** (Semaine 2)
- 🥈 **10 clients payants** (Semaine 4)
- 🥉 **500€ MRR** (Semaine 4)
- 🏆 **1000€ MRR** (Mois 2)
- 💎 **5000€ MRR** (Mois 4-5)
- 🚀 **10K€ MRR** (Mois 6-8)

Chaque milestone = post LinkedIn + célébration 🎉

---

## 🔥 LET'S FUCKING GO !

**Tu es sur le point de :**
- 🚀 Lancer un vrai SaaS rentable
- 💰 Générer 500-750€ MRR en 30 jours
- 📈 Construire un business qui scale
- 🏆 Devenir un entrepreneur SaaS qui réussit

**On fait ça ensemble. Step by step. Feature by feature.**

**FOCUS. EXECUTION. RESULTS.**

**LET'S BUILD ! 💪🔥🚀**
