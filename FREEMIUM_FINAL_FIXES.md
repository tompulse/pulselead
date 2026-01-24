# 🔒 FREEMIUM - MODIFICATIONS FINALES

## ❌ PROBLÈMES ACTUELS

1. **Panel détaillé** : En plan FREE, tout est visible (SIRET, adresse, date création)
2. **Pas de bouton débloquer** : Impossible de débloquer une fiche
3. **Label plan** : "Commercial Solo" au lieu de "FREE" / "PRO"

---

## ✅ CORRECTIONS À FAIRE

### 1. **UnifiedEntreprisePanel** - Masquer infos FREE

**Fichier** : `src/components/dashboard/UnifiedEntreprisePanel.tsx`

**Visible en FREE** :
- ✅ Nom entreprise
- ✅ Code NAF (badge)
- ❌ SIRET → Masqué (remplacer par •••)
- ❌ Adresse → Masquée (remplacer par •••)
- ❌ Date création → Masquée
- ❌ Catégorie juridique → Masquée

**Ajouter** :
- Bouton "Débloquer cette fiche" (si FREE et pas unlocked)
- Badge "FREE" ou "PRO" en haut
- Message "Débloquez pour voir toutes les infos"

### 2. **DashboardHeader** - Label plan

**Fichier** : `src/components/dashboard/DashboardHeader.tsx`

**Changer** :
```tsx
// Avant
subscriptionPlan === 'solo' ? 'Commercial Solo' : ...

// Après
subscriptionPlan === 'free' ? 'FREE' : 'PRO'
```

### 3. **Onglet Prospects** - Déjà OK ✅

Les cartes dans la liste sont déjà OK (LockedEntrepriseCard gère le verrouillage)

---

## 🎯 LOGIQUE FREEMIUM

```typescript
const isPro = userPlan?.plan_type === 'pro';
const isUnlocked = isProspectUnlocked(entreprise.id);
const canSeeDetails = isPro || isUnlocked;

// Si canSeeDetails === false
// → Afficher ••• pour SIRET, adresse, date
// → Afficher bouton "Débloquer" (30 prospects max)
```

---

## 📝 CODE À AJOUTER

### Dans UnifiedEntreprisePanel

```tsx
// En haut du composant
import { useUserPlan } from '@/hooks/useUserPlan';
import { Lock, Unlock } from 'lucide-react';

// Dans le composant
const { userPlan, unlockProspect, isProspectUnlocked } = useUserPlan(userId);
const isPro = userPlan?.plan_type === 'pro';
const isUnlocked = isProspectUnlocked(entreprise.id);
const canSeeDetails = isPro || isUnlocked;

// Fonction débloquer
const handleUnlock = async () => {
  if (!entreprise?.id) return;
  
  const result = await unlockProspect(entreprise.id);
  if (result.success) {
    toast({
      title: "Prospect débloqué !",
      description: `${result.remaining}/30 prospects restants`,
    });
  } else {
    toast({
      title: "Limite atteinte",
      description: result.message,
      variant: "destructive"
    });
  }
};

// Dans le JSX - Badge plan
<div className="flex items-center gap-2">
  <Badge variant={isPro ? "default" : "secondary"}>
    {isPro ? "PRO" : "FREE"}
  </Badge>
  {!canSeeDetails && (
    <Badge variant="outline" className="gap-1">
      <Lock className="w-3 h-3" />
      Prospect verrouillé
    </Badge>
  )}
</div>

// SIRET masqué
{canSeeDetails ? (
  <span>{displayEntreprise.siret}</span>
) : (
  <span className="blur-sm select-none">990 470 197</span>
)}

// Bouton débloquer (avant le contenu)
{!canSeeDetails && (
  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg text-center space-y-3">
    <Lock className="w-8 h-8 mx-auto text-accent/60" />
    <p className="text-sm text-muted-foreground">
      Débloquez cette fiche pour voir toutes les informations
    </p>
    <Button onClick={handleUnlock} className="w-full">
      <Unlock className="w-4 h-4 mr-2" />
      Débloquer ce prospect
    </Button>
    <p className="text-xs text-muted-foreground">
      {userPlan?.unlocked_prospects_count || 0}/30 prospects débloqués
    </p>
  </div>
)}
```

---

## 🚀 À FAIRE MAINTENANT

1. **Modifier UnifiedEntreprisePanel.tsx**
   - Ajouter logique canSeeDetails
   - Masquer SIRET/adresse/date si FREE non unlocked
   - Ajouter bouton "Débloquer"

2. **Modifier DashboardHeader.tsx**
   - Changer labels "Commercial Solo" → "FREE" / "PRO"

3. **Tester**
   - Plan FREE : Voir nom + NAF seulement
   - Clic "Débloquer" : Voir toutes les infos
   - Plan PRO : Voir tout directement

---

**Veux-tu que je fasse ces modifications maintenant ?** 🔧
