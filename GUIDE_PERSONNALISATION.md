# Guide de Personnalisation Rapide - Pulse Entreprise

## 🎯 Où modifier le contenu principal ?

Tous les textes et contenus se trouvent dans `/src/pages/EntrepriseLanding.tsx`.

---

## 📝 Modifications Fréquentes

### 1. Changer le Titre Principal (Hero)

**Ligne ~92-96** :
```tsx
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
  Le Duo Stratégique : Prospection Téléphonique Ultra-Ciblée et Gestion Terrain App pour un ROI Exceptionnel
</h1>
```

### 2. Modifier les Stats du Hero

**Ligne ~110-116** :
```tsx
{[
  '+300 % de RDV qualifiés vs approche aléatoire',
  '-40 % de kilomètres inutiles grâce à l\'optimisation terrain',
  '+40 % de ROI mesuré en 3 mois pour les PME'
].map((stat, i) => (
  // ...
))}
```

### 3. Changer les Tarifs

**Ligne ~490-650 environ** :
```tsx
{/* Premium */}
<Card>
  <h3>Premium</h3>
  <div className="text-5xl font-bold">2 500 €</div>
  // ...
</Card>

{/* Elite - POPULAIRE */}
<Card>
  <h3>Elite</h3>
  <div className="text-5xl font-bold">4 000 €</div>
  // ...
</Card>

{/* Platinum */}
<Card>
  <h3>Platinum</h3>
  <div className="text-4xl font-bold">À partir de</div>
  <div className="text-5xl font-bold">6 000 €</div>
  // ...
</Card>
```

### 4. Modifier les Témoignages

**Ligne ~420-460 environ** :
```tsx
{[
  {
    quote: "Le combo prospection téléphonique + app terrain a transformé notre approche commerciale...",
    author: "Marc D.",
    role: "Directeur Commercial, Sécurité Pro 75",
    stars: 5
  },
  // Ajoutez ou modifiez les témoignages ici
].map((testimonial, i) => (
  // ...
))}
```

### 5. Ajuster les Questions FAQ

**Ligne ~680-750 environ** :
```tsx
{[
  {
    q: "Pourquoi les leads <3 mois sont-ils si efficaces ?",
    a: "Les entreprises nouvellement créées ont des besoins immédiats..."
  },
  // Ajoutez ou modifiez les questions ici
].map((item, i) => (
  // ...
))}
```

---

## 🎨 Changer les Couleurs

Si vous voulez ajuster la palette de couleurs, modifiez ces valeurs partout dans le fichier :

### Vert Premium (CTA principal)
```tsx
style={{ background: '#00FF9D', color: '#000' }}
```

### Cyan Clair (Hover / Secondaire)
```tsx
style={{ background: '#00D4FF', color: '#000' }}
```

### Texte Secondaire
```tsx
style={{ color: '#A0AEC0' }}
```

### Bordures Cards
```tsx
style={{ borderColor: 'rgba(0, 212, 255, 0.3)' }}
```

---

## 🔗 Modifier les Liens

### Lien vers Calendly (Démo)
Cherchez toutes les occurrences de :
```tsx
onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
```

Remplacez par un lien direct si vous préférez :
```tsx
onClick={() => window.location.href = 'https://calendly.com/votre-lien'}
```

### Lien Email
**Ligne ~610 environ** :
```tsx
<a href="mailto:tomiolovpro@gmail.com?subject=Demande de devis PULSE Équipes">
```

---

## 📋 Formulaire de Contact

### Traitement du Formulaire

**Ligne ~25-35** :
```tsx
const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // TODO: Intégrer votre logique d'envoi de formulaire (email, CRM, etc.)
  console.log('Form submitted:', formData);
  alert('Merci ! Nous vous contactons sous 24h.');
};
```

**À faire :**
1. Connecter à votre API backend
2. Intégrer avec Zapier, Make, ou webhook
3. Envoyer un email via service type SendGrid, Mailgun, etc.

Exemple d'intégration simple :
```tsx
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('https://votre-api.com/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Merci ! Nous vous contactons sous 24h.');
      setFormData({ nom: '', email: '', telephone: '', secteur: '', tailleEquipe: '', fonctionsCiblees: '' });
    } else {
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Erreur lors de l\'envoi. Veuillez réessayer.');
  }
};
```

---

## 🖼️ Ajouter de Vraies Images

### Hero Section - Mockup

**Ligne ~145-165** :
Remplacez le placeholder par une vraie image :

```tsx
<div className="relative">
  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
    border: '2px solid rgba(0,212,255,0.3)'
  }}>
    <img 
      src="/images/hero-mockup.png" 
      alt="Dashboard Pulse Entreprise"
      className="w-full h-auto"
    />
  </div>
  <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF9D]/20 to-[#00D4FF]/20 blur-3xl -z-10 rounded-3xl"></div>
</div>
```

---

## 🔧 Personnaliser le Header

### Changer les Items du Menu

**Ligne ~50-57** :
```tsx
<nav className="hidden lg:flex items-center gap-8">
  <a href="#education">Pourquoi &lt;3 Mois ?</a>
  <a href="#expertise">Prospection Téléphonique Ciblée</a>
  // Ajoutez ou supprimez des liens ici
</nav>
```

---

## 📱 Désactiver le Menu Mobile

Si vous voulez masquer le lien "Version Solo" sur mobile, modifiez :

**Ligne ~110-130** :
Supprimez la section :
```tsx
<a href="/commercial" className="block mb-4 text-sm" style={{ color: '#A0AEC0' }}>
  Version Solo (49 €)
</a>
```

---

## 🚀 Optimisations Recommandées

### 1. SEO - Ajouter les Meta Tags

Installez `react-helmet` :
```bash
npm install react-helmet
```

Puis ajoutez au début de `EntrepriseLanding.tsx` :
```tsx
import { Helmet } from 'react-helmet';

// Dans le composant :
<Helmet>
  <title>Pulse Entreprise : Accompagnement High-Ticket Prospection Téléphonique + Terrain</title>
  <meta name="description" content="Multipliez par 3 à 5 vos RDV qualifiés grâce au duo stratégique : leads <3 mois + prospection téléphonique ultra-ciblée + gestion terrain optimisée via app. ROI garanti pour PME." />
  <meta property="og:title" content="Pulse Entreprise : Accompagnement High-Ticket" />
  <meta property="og:description" content="Multipliez par 3 à 5 vos RDV qualifiés..." />
  <meta property="og:image" content="https://pulse-lead.com/og-image.jpg" />
</Helmet>
```

### 2. Analytics - Tracking des Conversions

Ajoutez Google Analytics événements :
```tsx
// Lorsque l'utilisateur clique sur un CTA
onClick={() => {
  gtag('event', 'cta_click', {
    event_category: 'engagement',
    event_label: 'demo_vip',
    value: 1
  });
  // ... votre code
}}
```

### 3. Lazy Loading des Images

Ajoutez `loading="lazy"` à toutes les images :
```tsx
<img src="/images/hero.png" alt="Hero" loading="lazy" />
```

---

## 🐛 Troubleshooting

### Le serveur de dev ne démarre pas
Essayez :
```bash
rm -rf node_modules
npm install
npm run dev
```

### Erreur de build
Vérifiez que toutes les dépendances sont installées :
```bash
npm install
```

### Les couleurs ne s'appliquent pas
Vérifiez que vous utilisez bien `style={{ ... }}` et non `className` pour les couleurs custom.

---

## 📞 Support

Pour toute question sur la personnalisation, vérifiez d'abord :
1. Le fichier `EntrepriseLanding.tsx` (tout le contenu est là)
2. Le fichier `STRUCTURE_SITE_MISE_A_JOUR.md` (architecture complète)
3. Les composants shadcn/ui dans `src/components/ui/`

---

**Dernière mise à jour** : 8 février 2026
