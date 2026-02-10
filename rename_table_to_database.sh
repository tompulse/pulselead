#!/bin/bash

# Script pour remplacer nouveaux_sites par database dans tous les fichiers sources

echo "🔄 Remplacement de 'nouveaux_sites' par 'database' dans les fichiers sources..."

# Liste des fichiers à modifier
files=(
  "src/components/dashboard/ActivityDetailSheet.tsx"
  "src/components/dashboard/TourneeDetailView.tsx"
  "src/pages/TourneeDetail.tsx"
  "src/views/CRMViewContainer.tsx"
  "src/hooks/useNotifications.ts"
  "src/components/dashboard/RelatedEstablishmentsCard.tsx"
  "src/components/dashboard/UnifiedEntreprisePanel.tsx"
  "src/components/dashboard/UnlockedProspectsView.tsx"
  "src/components/landing/OnboardingWizard.tsx"
  "src/components/dashboard/TourneeCreationStandalone.tsx"
  "src/components/dashboard/QualificationProgressDialog.tsx"
  "src/components/dashboard/PipelineDetailSheet.tsx"
  "src/components/dashboard/NotesDetailSheet.tsx"
  "src/components/dashboard/FilterOnboarding.tsx"
  "src/hooks/useAvailableNouveauxSitesFilters.ts"
  "src/views/AdminViewContainer.tsx"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Remplacer .from('nouveaux_sites') par .from('database')
    sed -i '' "s/.from('nouveaux_sites')/.from('database')/g" "$file"
    
    # Remplacer .from("nouveaux_sites") par .from("database")
    sed -i '' 's/.from("nouveaux_sites")/.from("database")/g' "$file"
    
    echo "  ✅ $file"
    ((count++))
  else
    echo "  ⚠️  $file introuvable"
  fi
done

echo ""
echo "🎉 $count fichiers modifiés!"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifie que ta table 'database' a les mêmes colonnes que 'nouveaux_sites'"
echo "2. Teste l'application"
echo "3. Si tout fonctionne: git add . && git commit -m 'Utilisation table database'"
