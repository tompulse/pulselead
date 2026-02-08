# ✅ Checklist de Déploiement - Pulse Entreprise

## 🎯 Avant de Mettre en Production

### 1. Contenu & Textes

- [ ] Vérifier tous les textes du Hero (titre, sous-titre, stats)
- [ ] Valider les 3 tarifs (Premium, Elite, Platinum) et leurs montants
- [ ] Relire les 4-5 témoignages (noms, entreprises, quotes)
- [ ] Vérifier les 8 questions/réponses de la FAQ
- [ ] Corriger les fautes d'orthographe et de grammaire
- [ ] Valider le ton "premium" et l'urgence dans le copywriting

### 2. Images & Médias

- [ ] Remplacer le mockup placeholder du Hero par une vraie capture d'écran
- [ ] Ajouter des images de qualité pour la section Expertise
- [ ] Optimiser toutes les images (WebP, compression, taille max 500 KB)
- [ ] Ajouter des `alt` tags descriptifs pour le SEO
- [ ] Tester le lazy loading des images

### 3. Formulaire de Contact

- [ ] Connecter le formulaire à votre backend/CRM/email
- [ ] Tester l'envoi du formulaire (tous les champs requis)
- [ ] Configurer les notifications email de réception
- [ ] Ajouter un message de confirmation après envoi
- [ ] Vérifier la protection RGPD (consentement, politique de confidentialité)

### 4. Liens & CTAs

- [ ] Remplacer tous les liens `mailto:tomiolovpro@gmail.com` par votre email
- [ ] Configurer les liens Calendly si vous utilisez ce service
- [ ] Tester tous les liens du menu (ancres de navigation)
- [ ] Vérifier le lien "Version Solo (49 €)" → `/commercial`
- [ ] Tester les boutons CTA (scroll smooth, redirection)

### 5. SEO & Meta Tags

- [ ] Ajouter les meta tags (title, description) via React Helmet
- [ ] Configurer l'Open Graph pour le partage sur réseaux sociaux
- [ ] Créer une image OG (1200x630px) pour le partage
- [ ] Ajouter un fichier `robots.txt` à la racine du `public/`
- [ ] Créer un `sitemap.xml` avec les URLs principales
- [ ] Vérifier les balises H1/H2/H3 (hiérarchie SEO)

### 6. Analytics & Tracking

- [ ] Installer Google Analytics (GA4)
- [ ] Configurer les événements de conversion (CTA clics, formulaire submit)
- [ ] Installer Facebook Pixel (si publicités Meta)
- [ ] Ajouter un gestionnaire de consentement cookies (RGPD)
- [ ] Tester le tracking en mode incognito

### 7. Performance & Optimisation

- [ ] Lancer `npm run build` et vérifier qu'il n'y a pas d'erreurs
- [ ] Analyser la taille des bundles (< 600 KB par chunk recommandé)
- [ ] Tester le temps de chargement sur PageSpeed Insights (score > 80)
- [ ] Optimiser les fonts (Google Fonts → local ou preload)
- [ ] Activer la compression Gzip/Brotli sur le serveur
- [ ] Configurer le cache HTTP (Cache-Control headers)

### 8. Responsive & Cross-Browser

- [ ] Tester sur mobile (iPhone, Android)
- [ ] Tester sur tablette (iPad, Android tablet)
- [ ] Tester sur desktop (1920x1080, 1440x900, 1280x720)
- [ ] Vérifier sur Chrome, Firefox, Safari, Edge
- [ ] Tester le menu mobile (Sheet/drawer)
- [ ] Vérifier le sticky CTA en bas sur mobile (Pulse Solo uniquement)

### 9. Sécurité & Conformité

- [ ] Ajouter une page "Mentions Légales" complète
- [ ] Créer une page "Politique de Confidentialité" (RGPD)
- [ ] Ajouter les CGU et CGV détaillées
- [ ] Vérifier que les formulaires sont protégés (HTTPS, CSRF)
- [ ] Configurer les headers de sécurité (CSP, X-Frame-Options, etc.)
- [ ] Tester les erreurs 404/500 (pages dédiées)

### 10. Tests Fonctionnels

- [ ] Tester la navigation complète (header, footer, ancres)
- [ ] Vérifier que tous les boutons sont cliquables
- [ ] Tester le scroll fluide (smooth scroll)
- [ ] Vérifier les animations (fade-in, hover, scale)
- [ ] Tester le comportement du formulaire (validation, envoi)
- [ ] Vérifier que la page `/commercial` (Solo) fonctionne indépendamment

---

## 🚀 Déploiement

### Option 1 : Déploiement sur Vercel (Recommandé)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter votre repo GitHub/GitLab
3. Configurer les variables d'environnement (si nécessaire)
4. Lancer le déploiement automatique
5. Configurer le domaine `pulse-lead.com` dans Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Option 2 : Déploiement sur Netlify

1. Créer un compte sur [Netlify](https://netlify.com)
2. Drag & drop le dossier `dist/` après `npm run build`
3. Ou connecter votre repo pour déploiement automatique
4. Configurer les redirects pour SPA (Single Page App)

Créer un fichier `public/_redirects` :
```
/*    /index.html   200
```

### Option 3 : Serveur Custom (Apache, Nginx)

**Apache** - Ajouter dans `.htaccess` :
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx** - Configurer dans `nginx.conf` :
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🔧 Configuration DNS

Si vous utilisez un domaine externe :

1. **Ajouter un record A** :
   ```
   Type: A
   Name: @
   Value: [IP du serveur]
   TTL: 3600
   ```

2. **Ajouter un record CNAME** pour `www` :
   ```
   Type: CNAME
   Name: www
   Value: pulse-lead.com
   TTL: 3600
   ```

3. **Configurer SSL/TLS** (Let's Encrypt) :
   ```bash
   sudo certbot --nginx -d pulse-lead.com -d www.pulse-lead.com
   ```

---

## 📊 Après le Déploiement

### Monitoring & Suivi

- [ ] Configurer Google Search Console
- [ ] Soumettre le sitemap.xml à Google
- [ ] Installer un outil de monitoring (Sentry, LogRocket)
- [ ] Configurer les alertes de downtime (UptimeRobot, Pingdom)
- [ ] Vérifier les Core Web Vitals dans PageSpeed Insights

### A/B Testing (Optionnel)

- [ ] Tester différentes versions du titre Hero
- [ ] Tester différentes couleurs de CTA (vert vs cyan)
- [ ] Tester différents prix (si flexible)
- [ ] Analyser les heatmaps (Hotjar, Crazy Egg)

### Optimisations Continues

- [ ] Analyser les stats Analytics chaque semaine
- [ ] Identifier les pages avec fort taux de rebond
- [ ] Optimiser le tunnel de conversion
- [ ] Ajouter des témoignages vidéo (si possible)
- [ ] Enrichir le blog éducatif avec du contenu SEO

---

## 🎉 Checklist Post-Lancement

### Semaine 1
- [ ] Vérifier que le formulaire reçoit bien les leads
- [ ] Analyser les premiers retours utilisateurs
- [ ] Corriger les bugs éventuels signalés
- [ ] Partager sur les réseaux sociaux (LinkedIn, Twitter)

### Semaine 2-4
- [ ] Lancer une campagne Google Ads (si budget)
- [ ] Optimiser le SEO (backlinks, guest posts)
- [ ] Créer du contenu éducatif (blog, études de cas)
- [ ] Recueillir de nouveaux témoignages clients

### Mois 2-3
- [ ] Analyser le ROI des campagnes marketing
- [ ] Ajuster les tarifs si nécessaire
- [ ] Tester des variations de landing page (A/B test)
- [ ] Développer des partenariats sectoriels

---

## 🆘 En Cas de Problème

### Site inaccessible après déploiement
1. Vérifier les DNS (propagation peut prendre 24-48h)
2. Vérifier les logs du serveur
3. Tester avec `curl -I https://pulse-lead.com`

### Formulaire ne fonctionne pas
1. Vérifier la console navigateur (erreurs JS)
2. Tester l'endpoint API avec Postman
3. Vérifier les CORS si API externe

### Images ne s'affichent pas
1. Vérifier les chemins d'accès (`/images/` vs `./images/`)
2. Vérifier que les images sont dans `public/`
3. Tester le CDN si vous en utilisez un

---

## 📞 Ressources Utiles

- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [RGPD Guide for Websites](https://www.cnil.fr/fr)

---

**Bonne chance pour le lancement ! 🚀**

**Date** : 8 février 2026
