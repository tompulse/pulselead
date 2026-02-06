# 🛡️ Onglet Admin - PulseLead

## 🎯 Accès

**Visible uniquement pour :** `tomiolovpro@gmail.com`

L'onglet **Admin** apparaît automatiquement dans le header du dashboard après connexion.

## ✨ Fonctionnalités actuelles

### 📥 Import CSV Hebdomadaire
- Upload de fichiers CSV pour importer de nouveaux prospects
- Traitement par batch de 500 lignes
- Barre de progression en temps réel
- Détection automatique du délimiteur (`;` ou `,`)
- Format attendu : `siret;Entreprise;date_creation;siege;categorie_juridique;categorie_entreprise;complement_adresse;numero_voie;type_voie;libelle_voie;code_postal;ville;coordonnee_lambert_x;coordonnee_lambert_y;code_naf`

## 🚀 Fonctionnalités futures (prévues)

### 📊 Statistiques Base de Données
- Nombre total de prospects
- Nouveaux prospects par semaine/mois
- Répartition par département
- Répartition par NAF

### 👥 Gestion Utilisateurs
- Liste des utilisateurs inscrits
- Gestion des abonnements
- Quotas et limites
- Historique d'activité

### 📄 Rapports
- Génération de rapports d'activité
- Export des données
- Métriques d'utilisation

### 📈 Analytics Avancées
- Métriques détaillées
- Tableaux de bord personnalisés
- Insights business

## 🔧 Architecture Technique

### Fichiers
- **Vue principale :** `src/views/AdminViewContainer.tsx`
- **Contexte :** `src/contexts/DashboardContext.tsx` (type `DashboardView` inclut `'admin'`)
- **Navigation :** `src/components/dashboard/DashboardHeader.tsx` (bouton visible si `userEmail === 'tomiolovpro@gmail.com'`)
- **Dashboard :** `src/pages/Dashboard.tsx` (affichage conditionnel de la vue admin)

### Ajout de nouvelles fonctionnalités

Pour ajouter une nouvelle section dans l'onglet Admin :

1. **Créer un nouveau composant** dans `src/components/admin/`
2. **Importer** dans `AdminViewContainer.tsx`
3. **Ajouter** une nouvelle Card dans le layout

Exemple :
```tsx
<Card className="p-6 glass-card border-accent/20">
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-accent/10">
        <YourIcon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h2 className="text-xl font-bold">Nouvelle Fonctionnalité</h2>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
    </div>
    {/* Contenu de la fonctionnalité */}
  </div>
</Card>
```

## 📝 Notes

- L'import CSV utilise l'Edge Function `import-nouveaux-sites`
- Les données sont insérées/mises à jour dans la table `nouveaux_sites`
- Le reload automatique s'effectue après un import réussi
- Les erreurs sont loggées et affichées à l'utilisateur
