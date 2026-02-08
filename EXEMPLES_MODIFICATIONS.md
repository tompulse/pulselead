# 🔧 Exemples de Modifications Rapides

## 📝 Comment Modifier le Contenu de la Page Entreprise

Tous les exemples ci-dessous concernent le fichier :
**`src/pages/EntrepriseLanding.tsx`**

---

## 1. 🎯 Changer le Titre Principal (Hero)

### Actuel :
```tsx
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
  Le Duo Stratégique : Prospection Téléphonique Ultra-Ciblée et Gestion Terrain App pour un ROI Exceptionnel
</h1>
```

### Exemple de modification :
```tsx
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
  Transformez Votre Prospection B2B : Leads Qualifiés + Accompagnement Premium
</h1>
```

---

## 2. 📊 Modifier les Stats du Hero

### Actuel (ligne ~110-116) :
```tsx
{[
  '+300 % de RDV qualifiés vs approche aléatoire',
  '-40 % de kilomètres inutiles grâce à l\'optimisation terrain',
  '+40 % de ROI mesuré en 3 mois pour les PME'
].map((stat, i) => (
  // ...
))}
```

### Exemple de modification :
```tsx
{[
  '+250 % de conversion sur leads <3 mois',
  '-50 % de temps perdu sur la route',
  '+60 % de chiffre d\'affaires en 6 mois'
].map((stat, i) => (
  // ...
))}
```

---

## 3. 💰 Changer les Tarifs

### Actuel (ligne ~490-650 environ) :

**Premium** :
```tsx
<div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>2 500 €</div>
<p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT</p>
```

**Elite** :
```tsx
<div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>4 000 €</div>
<p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT</p>
```

**Platinum** :
```tsx
<div className="text-5xl font-bold mb-2" style={{ color: '#00D4FF' }}>6 000 €</div>
<p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT (sur devis)</p>
```

### Exemple de modification (augmenter les prix) :
```tsx
{/* Premium */}
<div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>3 000 €</div>

{/* Elite */}
<div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>5 000 €</div>

{/* Platinum */}
<div className="text-5xl font-bold mb-2" style={{ color: '#00D4FF' }}>8 000 €</div>
```

---

## 4. 💬 Ajouter un Nouveau Témoignage

### Actuel (ligne ~420-460 environ) :
```tsx
{[
  {
    quote: "Le combo prospection téléphonique + app terrain a transformé notre approche commerciale. Nous avons doublé nos RDV qualifiés en 2 mois.",
    author: "Marc D.",
    role: "Directeur Commercial, Sécurité Pro 75",
    stars: 5
  },
  // ... autres témoignages
].map((testimonial, i) => (
  // ...
))}
```

### Exemple : Ajouter un 5e témoignage :
```tsx
{[
  {
    quote: "Le combo prospection téléphonique + app terrain a transformé notre approche commerciale. Nous avons doublé nos RDV qualifiés en 2 mois.",
    author: "Marc D.",
    role: "Directeur Commercial, Sécurité Pro 75",
    stars: 5
  },
  {
    quote: "Enfin un accompagnement qui comprend les enjeux terrain des installateurs. Les leads <3 mois sont une mine d'or.",
    author: "Sophie L.",
    role: "Gérante, Alarmes & Co",
    stars: 5
  },
  {
    quote: "L'optimisation des tournées via l'app nous a fait économiser 30% de carburant et gagner 2h par jour. ROI impressionnant.",
    author: "Thomas B.",
    role: "Chef d'équipe, SecurIT Solutions",
    stars: 5
  },
  {
    quote: "Pulse Entreprise a révolutionné notre prospection. Nous signons 3x plus de contrats grâce au ciblage ultra-précis.",
    author: "Julie R.",
    role: "Responsable Développement, TechSecure",
    stars: 5
  },
  // NOUVEAU TÉMOIGNAGE AJOUTÉ :
  {
    quote: "Service exceptionnel et résultats au rendez-vous. Notre équipe a gagné en efficacité et en motivation.",
    author: "Pierre M.",
    role: "CEO, SecureMax France",
    stars: 5
  }
].map((testimonial, i) => (
  // ...
))}
```

---

## 5. ❓ Modifier une Question de la FAQ

### Actuel (ligne ~680-750 environ) :
```tsx
{[
  {
    q: "Pourquoi les leads <3 mois sont-ils si efficaces ?",
    a: "Les entreprises nouvellement créées ont des besoins immédiats et urgents (équipements, services, infrastructures). Elles sont en phase d'installation et donc ouvertes aux propositions. Le taux de conversion est 3 à 5 fois supérieur à une prospection aléatoire."
  },
  // ... autres questions
].map((item, i) => (
  // ...
))}
```

### Exemple : Modifier la première question :
```tsx
{[
  {
    q: "Quelle est la différence avec vos concurrents ?",
    a: "Contrairement aux solutions classiques, Pulse Entreprise combine 3 piliers : leads ultra-qualifiés <3 mois, prospection téléphonique déléguée avec scripts sur mesure, et une app terrain collaborative. C'est un accompagnement clé en main, pas juste un outil."
  },
  // ... reste des questions
].map((item, i) => (
  // ...
))}
```

---

## 6. 🔗 Changer l'Email de Contact

### Actuel (plusieurs endroits dans le fichier) :
```tsx
<a href="mailto:tomiolovpro@gmail.com?subject=Demande de devis PULSE Équipes">
```

### Modifier partout :
Utilisez la fonction "Rechercher & Remplacer" de votre éditeur :
- **Rechercher** : `tomiolovpro@gmail.com`
- **Remplacer par** : `contact@pulse-lead.com`

---

## 7. 📱 Connecter le Formulaire à votre Backend

### Actuel (ligne ~25-35) :
```tsx
const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // TODO: Intégrer votre logique d'envoi de formulaire (email, CRM, etc.)
  console.log('Form submitted:', formData);
  alert('Merci ! Nous vous contactons sous 24h.');
};
```

### Exemple : Envoyer à une API Zapier Webhook :
```tsx
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('https://hooks.zapier.com/hooks/catch/XXXXXX/YYYYYY/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Merci ! Nous vous contactons sous 24h.');
      // Réinitialiser le formulaire
      setFormData({ 
        nom: '', 
        email: '', 
        telephone: '', 
        secteur: '', 
        tailleEquipe: '', 
        fonctionsCiblees: '' 
      });
    } else {
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Erreur lors de l\'envoi. Veuillez réessayer.');
  }
};
```

### Exemple : Envoyer via Supabase (si vous avez déjà une table) :
```tsx
import { supabase } from "@/integrations/supabase/client";

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { error } = await supabase
      .from('contact_requests')
      .insert([formData]);
    
    if (error) throw error;
    
    alert('Merci ! Nous vous contactons sous 24h.');
    setFormData({ nom: '', email: '', telephone: '', secteur: '', tailleEquipe: '', fonctionsCiblees: '' });
  } catch (error) {
    console.error('Error:', error);
    alert('Erreur lors de l\'envoi. Veuillez réessayer.');
  }
};
```

---

## 8. 🎨 Changer la Couleur du CTA Principal

### Actuel (plusieurs boutons verts #00FF9D) :
```tsx
<Button 
  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
  style={{ background: '#00FF9D', color: '#000' }}
>
  Réserver Votre Démonstration VIP Gratuite
  <ArrowRight className="ml-2 w-5 h-5" />
</Button>
```

### Exemple : Passer au cyan (#00D4FF) :
```tsx
<Button 
  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
  style={{ background: '#00D4FF', color: '#000' }}
  onMouseEnter={(e) => e.currentTarget.style.background = '#00FF9D'}
  onMouseLeave={(e) => e.currentTarget.style.background = '#00D4FF'}
>
  Réserver Votre Démonstration VIP Gratuite
  <ArrowRight className="ml-2 w-5 h-5" />
</Button>
```

---

## 9. 🖼️ Remplacer le Mockup Placeholder

### Actuel (ligne ~145-165) :
```tsx
<div className="relative">
  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
    background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,212,255,0.1) 100%)',
    border: '2px solid rgba(0,212,255,0.3)',
    height: '400px'
  }}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Phone className="w-20 h-20 mx-auto mb-4" style={{ color: '#00FF9D' }} />
        <p className="text-white text-lg font-semibold">Mockup Téléphone + Dashboard App</p>
      </div>
    </div>
  </div>
  <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF9D]/20 to-[#00D4FF]/20 blur-3xl -z-10 rounded-3xl"></div>
</div>
```

### Exemple : Ajouter une vraie image :
```tsx
<div className="relative">
  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
    border: '2px solid rgba(0,212,255,0.3)'
  }}>
    <img 
      src="/images/hero-mockup.png" 
      alt="Dashboard Pulse Entreprise avec app terrain"
      className="w-full h-auto"
      loading="eager"
    />
  </div>
  <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF9D]/20 to-[#00D4FF]/20 blur-3xl -z-10 rounded-3xl"></div>
</div>
```

---

## 10. 🎯 Changer les Items du Menu de Navigation

### Actuel (ligne ~50-57) :
```tsx
<nav className="hidden lg:flex items-center gap-8">
  <a href="#education">Pourquoi &lt;3 Mois ?</a>
  <a href="#expertise">Prospection Téléphonique Ciblée</a>
  <a href="#accompagnement">Gestion Terrain via App</a>
  <a href="#roi">ROI Prouvé</a>
  <a href="#pricing">Tarifs Exclusifs</a>
  <a href="#contact">Contact</a>
</nav>
```

### Exemple : Simplifier le menu :
```tsx
<nav className="hidden lg:flex items-center gap-8">
  <a href="#education">Opportunité</a>
  <a href="#expertise">Nos Services</a>
  <a href="#pricing">Tarifs</a>
  <a href="#contact">Contact</a>
</nav>
```

---

## 🎨 Modifier Globalement Toutes les Couleurs

Si vous voulez changer la palette complète :

### Rechercher & Remplacer :
1. **Vert premium** (#00FF9D) → Nouvelle couleur (ex: #00C896)
   - Rechercher : `#00FF9D`
   - Remplacer par : `#00C896`

2. **Cyan clair** (#00D4FF) → Nouvelle couleur (ex: #00B8E6)
   - Rechercher : `#00D4FF`
   - Remplacer par : `#00B8E6`

3. **Fond principal** (#0A0E1A) → Nouvelle couleur (ex: #0F1419)
   - Rechercher : `#0A0E1A`
   - Remplacer par : `#0F1419`

---

## 🚀 Tester Vos Modifications

Après chaque modification :

1. **Sauvegarder le fichier** (`Cmd+S` ou `Ctrl+S`)
2. **Le serveur de dev se recharge automatiquement**
3. **Vérifier dans le navigateur** (http://localhost:5173/)
4. **Tester le responsive** (mode mobile dans DevTools)

---

## 📝 Checklist Avant de Déployer

Après avoir fait vos modifications :

- [ ] Relire tous les textes (pas de fautes)
- [ ] Tester tous les liens (CTA, menu, footer)
- [ ] Vérifier le formulaire de contact (envoi OK)
- [ ] Tester sur mobile (responsive)
- [ ] Vérifier les couleurs (cohérence visuelle)
- [ ] Lancer `npm run build` (pas d'erreurs)

---

**Besoin d'aide ?** Consultez `GUIDE_PERSONNALISATION.md` pour plus de détails.
