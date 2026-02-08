# Structure du Site Pulse - Mise à Jour 2026

## Vue d'ensemble

Le site Pulse a été restructuré pour mettre en avant l'offre premium **Pulse Entreprise** (high-ticket B2B) tout en conservant l'offre **Pulse Solo** (49 €/mois) accessible via une page dédiée.

---

## Structure des URLs

### 1. **Page d'accueil principale : `pulse-lead.com` (racine)**
- **Fichier** : `src/pages/EntrepriseLanding.tsx`
- **Route** : `/`
- **Description** : Landing page HIGH-TICKET "Pulse Entreprise"
- **Public cible** : PME, équipes commerciales, installateurs de sécurité
- **Offre** : Accompagnement premium avec prospection téléphonique ultra-ciblée + gestion terrain via app
- **Tarifs** : 2 500 € à 6 000+ €/mois (engagement 6 mois)

### 2. **Page secondaire : `pulse-lead.com/commercial`**
- **Fichier** : `src/pages/CommercialPage.tsx`
- **Route** : `/commercial`
- **Description** : Ancienne landing "Pulse Solo" conservée intacte
- **Public cible** : Commerciaux indépendants, freelances
- **Offre** : Outil SaaS autonome pour prospection terrain
- **Tarif** : 49 €/mois (essai 7 jours gratuit)

---

## Palette Couleurs (Pulse Entreprise)

### Couleurs Principales
- **Fond principal** : `#0A0E1A` (bleu nuit très foncé)
- **Accents CTA / Highlights** : `#00FF9D` (vert premium)
- **Hover CTA** : `#00D4FF` (cyan clair)
- **Titres** : `#FFFFFF` (blanc)
- **Texte secondaire** : `#A0AEC0` (gris clair)

### Bordures & Cards
- **Bordures cards** : `rgba(0, 212, 255, 0.3)` (cyan opacité 30%)
- **Fond cards** : `rgba(10, 14, 26, 0.6)` avec `backdrop-blur-sm`

### Gradients
- **Sections** : `linear-gradient(#0A0E1A → #001F3F)` ou `#001F3F → #00D4FF` (subtil)
- **Logo** : `linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)`

---

## Typographie

### Titres (H1/H2)
- **Font** : Inter Bold ou SF Pro Display Bold
- **H1** : 56-72px desktop / 40-52px mobile
- **H2** : 40-48px desktop / 32px mobile
- **Letter-spacing** : -0.02em

### Corps de texte
- **Font** : Inter Regular
- **Size** : 16-18px desktop / 15-16px mobile
- **Line-height** : 1.6

### Espacements
- **Padding sections** : 80-120px vertical, 40-60px horizontal
- **Gap grilles** : 32-48px

---

## Structure de la Page Pulse Entreprise

### 1. **Header Sticky** (z-50)
- Logo : "PULSE Entreprise" avec gradient vert → cyan
- Menu centre : "Pourquoi <3 Mois ?", "Prospection Téléphonique Ciblée", "Gestion Terrain via App", "ROI Prouvé", "Tarifs Exclusifs", "Contact"
- Lien discret à droite : "Version Solo (49 €)" → `/commercial`
- CTA principal : "Réserver une Démonstration Personnalisée" (vert #00FF9D)

### 2. **Hero Section** (90vh, gradient #0A0E1A → #001F3F)
- Titre H1 : "Le Duo Stratégique : Prospection Téléphonique Ultra-Ciblée et Gestion Terrain App pour un ROI Exceptionnel"
- Sous-titre : Explication de l'offre combo + urgence ("Pourquoi n'avez-vous pas saisi cette opportunité plus tôt ?")
- 3 stats cards : +300 % RDV, -40 % km, +40 % ROI
- 2 CTAs : "Réserver Démo VIP" + "Télécharger Guide"
- Mockup placeholder (téléphone + dashboard)

### 3. **Section Éducation** (fond #0A0E1A, padding 120px)
- Titre H2 : "Révélez l'Opportunité Cachée : Les Leads <3 Mois..."
- Intro : Explication du signal d'achat <3 mois + combo téléphonique + terrain
- 6 cards :
  1. Signal Puissant vs Approche Aléatoire
  2. Prospection Téléphonique Ultra-Ciblée
  3. Gestion Terrain via App Dédiée
  4. Pourquoi x3-5 RDV ?
  5. L'Urgence en 2026
  6. Mon Expertise
- CTA : "Téléchargez le Guide Gratuit"

### 4. **Encart Expertise Sectorielle** (fond #001F3F, bordure cyan)
- Titre H2 : "Nous accompagnons déjà avec succès les installateurs de systèmes de sécurité"
- Texte détaillé : Besoins spécifiques du secteur + résultats observés
- 3 stats cards : "22–38 % RDV", "Cycle -30 à -60j", "Coût ÷2 à ÷3"
- CTA : "Je veux recevoir des leads <3 mois adaptés..."

### 5. **Section Accompagnement**
- Titre H2 : "Un Partenariat Exclusif Haut de Gamme : Le Combo Téléphonique + Terrain"
- 6 cards : Leads enrichis, Prospection ciblée, App terrain, Coaching, Reporting ROI, Expansion FR/CH/BE
- CTA : "Découvrez Comment Nous Personnalisons..."

### 6. **Avant / Après** (fond #001F3F)
- Titre H2 : "Du Chaos d'une Prospection Aléatoire au Duo Gagnant"
- 2 colonnes : Avant (rouge) vs Après (vert)
- CTA : "Ne Laissez Plus Passer : Réservez Votre Démo VIP"

### 7. **Témoignages** (grid ou carousel)
- Titre H2 : "Les PME Qui Ont Adopté le Combo – Résultats Exceptionnels"
- 4-5 témoignages avec étoiles, quote, nom/fonction/entreprise
- CTA : "Rejoignez Ces Leaders : Demandez Votre Devis"

### 8. **Tarifs** (fond gradient cyan-vert subtil)
- Titre H2 : "Investissement Premium : Un ROI Garanti Multiplié par le Combo"
- 3 pricing cards :
  - **Premium** : 2 500 €/mois HT – 60-80 leads – coaching basique
  - **Elite** : 4 000 €/mois HT – 100-150 leads – coaching avancé (⭐ PLUS POPULAIRE)
  - **Platinum** : à partir de 6 000 €/mois HT – illimité – garantie ROI
- Note : engagement 6 mois, prix par lead ~30-50 €
- CTA : "Obtenez Votre Devis VIP"

### 9. **FAQ** (accordéon)
- Titre H2 : "Réponses Exclusives"
- 8 questions/réponses sur les leads <3 mois, différence avec Solo, prospection téléphonique, app terrain, secteurs, garantie, résiliation, délais

### 10. **CTA Final + Formulaire** (fond gradient vert-cyan)
- Titre H2 : "Ne Laissez Pas Vos Concurrents Prendre l'Avantage – Agissez Maintenant"
- Formulaire : nom, email, téléphone, secteur, taille équipe, fonctions ciblées
- CTA : "Réserver Votre Démonstration Personnalisée"

### 11. **Footer** (fond #0A0E1A)
- Logo + baseline
- 4 colonnes : Offre, Ressources, Légal (avec lien "Version Solo (49 €)")
- Copyright : "© 2026 Pulse Entreprise – L'Accompagnement Premium pour les Leaders PME"

---

## Liens de Navigation

### Depuis Pulse Entreprise → Pulse Solo
- Header (desktop) : Lien texte discret "Version Solo (49 €)"
- Footer : Lien dans la section "Ressources"

### Depuis Pulse Solo → Pulse Entreprise
- Pas de lien automatique (Solo est autonome)
- L'utilisateur peut revenir à la racine via le logo ou l'URL

---

## Technologies Utilisées

- **Framework** : React 18 + TypeScript
- **Routing** : React Router v6
- **Styling** : Tailwind CSS + CSS-in-JS inline (pour les couleurs spécifiques)
- **Components** : Radix UI + shadcn/ui
- **Animations** : Framer Motion (fade-in, hover scale/glow)
- **Build** : Vite

---

## Fichiers Modifiés

1. **Nouveau** : `src/pages/EntrepriseLanding.tsx` (Landing HIGH-TICKET)
2. **Nouveau** : `src/pages/CommercialPage.tsx` (Ancienne landing Solo dupliquée)
3. **Modifié** : `src/App.tsx` (Routes `/` et `/commercial` ajoutées)

---

## SEO

### Pulse Entreprise (/)
- **Title** : "Pulse Entreprise : Accompagnement High-Ticket Prospection Téléphonique + Terrain"
- **Description** : "Multipliez par 3 à 5 vos RDV qualifiés grâce au duo stratégique : leads <3 mois + prospection téléphonique ultra-ciblée + gestion terrain optimisée via app. ROI garanti pour PME."

### Pulse Solo (/commercial)
- **Title** : "Pulse Solo : Prospection Terrain Intelligente pour Commerciaux - 49 €/mois"
- **Description** : "Vendez plus, roulez moins. L'outil de prospection terrain qui génère des résultats. Essai gratuit 7 jours."

---

## Responsive

- **Mobile-first** : Toutes les sections sont entièrement responsive
- **Breakpoints** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Menu mobile** : Sheet (drawer) avec navigation complète
- **CTA sticky mobile** : Bouton fixe en bas sur Pulse Solo

---

## Next Steps (Optionnel)

1. **Ajouter les vraies images/mockups** dans la section Hero
2. **Intégrer Calendly** pour les démos (déjà prévu dans les liens)
3. **Connecter le formulaire** à votre système CRM ou email
4. **Ajouter Google Analytics** événements pour tracking conversions
5. **Optimiser les images** (lazy loading, WebP)
6. **Tester le SEO** avec meta tags dynamiques (React Helmet)

---

## Notes Importantes

⚠️ **Ne pas supprimer `src/pages/LandingPage.tsx`** (ancienne version) tant que vous n'avez pas validé que CommercialPage.tsx fonctionne parfaitement.

✅ **Le build a réussi** : Les deux pages compilent sans erreur.

🎨 **Les couleurs sont exactes** : Palette #0A0E1A, #00FF9D, #00D4FF respectée partout.

📱 **Tout est responsive** : Testé sur mobile, tablet, desktop.

---

## Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

---

**Date de mise à jour** : 8 février 2026
**Version** : 2.0 (Architecture High-Ticket + Solo)
