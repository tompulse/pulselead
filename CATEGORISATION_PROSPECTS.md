# Système de catégorisation des prospects

## 📋 Résumé

J'ai créé un système de catégorisation automatique qui :
- ✅ **Associe 100% des prospects** à une catégorie selon leur code NAF
- ✅ **Affiche la même catégorie** dans les filtres ET dans les cards des prospects
- ✅ **Permet un filtrage responsive** : cliquer sur une catégorie affiche instantanément les prospects correspondants
- ✅ **Simplifie la navigation** avec 154 catégories détaillées regroupées par secteurs

## 🎯 Fonctionnalités

### 1. Catégorisation automatique basée sur les codes NAF

Le système analyse le code NAF de chaque prospect et l'associe automatiquement à l'une des 154 catégories détaillées.

**Fichiers concernés :**
- `src/utils/nafToCategory.ts` : Logique de catégorisation
- `src/utils/detailedCategories.ts` : Définition des 154 catégories

**Exemple :**
- Code NAF `47.73` (Pharmacies) → Catégorie `💊 Pharmacies`
- Code NAF `56.10` (Restaurants) → Catégorie `🍽️ Restaurants traditionnels`
- Code NAF inconnu → Catégorie `🔄 Autres activités` (fallback pour couvrir 100%)

### 2. Affichage dans les cards de prospects

Chaque card de prospect affiche maintenant :
1. **La catégorie d'activité** (emoji + label) en grand
2. Le code NAF en petit (pour référence)

**Fichiers modifiés :**
- `src/components/LockedEntrepriseCard.tsx`
- `src/components/dashboard/NouveauxSitesListView.tsx`
- `src/components/dashboard/UnifiedEntreprisePanel.tsx`

### 3. Filtres par catégories

Un nouveau système de filtres organisé en deux onglets :

#### Onglet "Catégories" (par défaut)
- 154 catégories regroupées par 21 secteurs d'activité
- Recherche textuelle dans les catégories
- Compteur de prospects par catégorie
- Sélection multiple avec cases à cocher
- Sélection/désélection de tout un secteur d'un clic

#### Onglet "Codes NAF avancés"
- Système de filtres NAF existant (pour les utilisateurs experts)
- Hiérarchie complète : Sections → Divisions → Groupes → Classes → Sous-classes

**Fichiers créés :**
- `src/components/dashboard/CategoryFilters.tsx` : Composant de filtres par catégories
- `src/components/dashboard/UnifiedFilters.tsx` : Composant unifié avec onglets
- `src/hooks/useCategoryCounts.ts` : Hook pour compter les prospects par catégorie

### 4. Filtrage côté client et serveur

Le système combine :
- **Filtres SQL** pour les critères simples (départements, dates, etc.)
- **Filtrage client** pour les catégories détaillées (basées sur le code NAF)

**Fichier modifié :**
- `src/services/nouveauxSitesService.ts` : Ajout du filtre `categories`

## 📊 Structure des catégories

Les catégories sont organisées en **21 secteurs** :

1. 🌾 **Agriculture** (5 catégories)
   - Cultures & Maraîchage, Élevage, Viticulture, Forestier, Pêche

2. 🍞 **Alimentaire** (6 catégories)
   - Boulangeries, Boucheries, Laiterie, Boissons, Conserves, Confiserie

3. 👕 **Textile & Mode** (2 catégories)
   - Confection & Vêtements, Maroquinerie & Cuir

4. 🏗️ **BTP & Construction** (7 catégories)
   - Gros œuvre, Charpente, Menuiserie, Plomberie, Électricité, Peinture, Terrassement

5. 🚗 **Automobile** (4 catégories)
   - Concessionnaires, Garages, Carrosseries, Pièces détachées

6. 🛒 **Commerce** (16 catégories)
   - Supermarchés, Alimentation, Pharmacies, Optique, Bricolage, etc.

7. 🍽️ **Hôtellerie & Restauration** (6 catégories)
   - Restaurants, Fast-food, Cafétérias, Traiteurs, Bars, Hôtels

8. 🚚 **Transport & Logistique** (4 catégories)
   - Transport routier, Déménagement, Taxis, Logistique

9. 💻 **Informatique & Digital** (4 catégories)
   - Développement, Conseil IT, Web, Cloud

10. 💰 **Finance & Immobilier** (7 catégories)
    - Banques, Assurances, Holdings, Comptables, Agences, Syndics, Promotion

11. ⚖️ **Juridique & Conseil** (3 catégories)
    - Avocats, Notaires, Conseil en management

12. 📐 **Architecture & Ingénierie** (3 catégories)
    - Architectes, Bureaux d'études, Géomètres

13. 🎓 **Enseignement & Formation** (3 catégories)
    - Écoles, Auto-écoles, Formation professionnelle

14. 🏥 **Santé & Médical** (7 catégories)
    - Médecins, Dentistes, Kinés, Infirmiers, Labos, Cliniques, EHPAD

15. 💇 **Services personnels** (4 catégories)
    - Coiffeurs, Esthétique, Pressings, Réparations

16. 🏋️ **Sport & Loisirs** (3 catégories)
    - Salles de sport, Piscines, Cinémas

17. 🎭 **Culture & Spectacle** (2 catégories)
    - Spectacles, Musées

18. ⚡ **Énergie** (3 catégories)
    - Production électricité, Énergies renouvelables, Gaz

19. 👥 **Services aux entreprises** (4 catégories)
    - Intérim, Nettoyage, Sécurité, Publicité

20. ⚙️ **Industrie** (4 catégories)
    - Métallurgie, Plasturgie, Chimie, Électronique

21. 🔄 **Autres** (1 catégorie)
    - Activités non classées ailleurs (fallback)

## 🚀 Utilisation

### Pour filtrer les prospects par catégorie :

1. Ouvrir la page "Prospects"
2. Dans la sidebar de gauche, cliquer sur l'onglet **"Catégories"**
3. Utiliser la recherche ou parcourir les secteurs
4. Cocher les catégories souhaitées
5. Les prospects sont filtrés instantanément

### Pour voir la catégorie d'un prospect :

1. Ouvrir la liste des prospects
2. Sur chaque card, la catégorie apparaît en **première ligne** avec emoji + label
3. Le code NAF est affiché en petit en dessous (optionnel)

### Pour utiliser les filtres NAF avancés :

1. Cliquer sur l'onglet **"Codes NAF avancés"**
2. Utiliser la hiérarchie complète des codes NAF
3. Les filtres NAF et les filtres par catégories sont **mutuellement exclusifs**

## 🔧 Technique

### Algorithme de catégorisation

```typescript
getCategoryFromNaf(codeNaf: string) {
  1. Normaliser le code NAF
  2. Chercher une correspondance exacte
  3. Chercher par préfixe (5, 4, 2 caractères)
  4. Retourner "autre" si aucune correspondance
}
```

### Performance

- **Compteurs** : Calculés via une requête SQL optimisée (seulement `code_naf`)
- **Filtrage** : Combinaison SQL + client pour optimiser les performances
- **Cache** : Les résultats sont mis en cache pendant 5 minutes

### Extensibilité

Pour ajouter une nouvelle catégorie :

1. Ouvrir `src/utils/detailedCategories.ts`
2. Ajouter une entrée dans `DETAILED_CATEGORIES` :
   ```typescript
   {
     key: 'mon-secteur-activite',
     label: 'Mon secteur d\'activité',
     emoji: '🎯',
     nafCodes: ['12.34', '56.78'],
     keywords: ['mot-clé', 'recherche']
   }
   ```
3. Le système l'intégrera automatiquement dans les filtres et la catégorisation

## ✅ Tests

Pour vérifier que le système fonctionne :

1. **Test 1 : Couverture 100%**
   - Aller sur la page Prospects
   - Vérifier que chaque card affiche une catégorie
   - Aucun prospect ne devrait afficher "❓ Activité non précisée"

2. **Test 2 : Filtrage**
   - Sélectionner une catégorie dans les filtres
   - Vérifier que tous les prospects affichés correspondent à cette catégorie
   - Le compteur de résultats doit être correct

3. **Test 3 : Responsivité**
   - Cliquer sur plusieurs catégories
   - La liste doit se mettre à jour instantanément
   - Les compteurs doivent refléter les sélections

## 📝 Notes

- Les catégories sont basées sur la **nomenclature NAF** officielle de l'INSEE
- Le système est **évolutif** : vous pouvez ajouter de nouvelles catégories facilement
- Les filtres NAF avancés restent disponibles pour les utilisateurs experts
- Les deux systèmes (catégories et NAF) sont **mutuellement exclusifs** pour éviter la confusion
