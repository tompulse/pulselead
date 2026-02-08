# Simplification de la sync CRM

## Problème
- Logique trop compliquée avec Edge Functions CORS
- lead_statuts pas nécessaire
- Trop de conditions

## Solution ultra-simple

### Dans `handleVisiteChange` (TourneeDetail.tsx et TourneeDetailView.tsx)

```typescript
const handleVisiteChange = async (
  siteId: string,
  field: keyof VisiteStatus,
  value: boolean,
  dateRelance?: string
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    // 1. MAJ état local
    const newStatus = {
      ...visitesStatus,
      [siteId]: {
        ...(visitesStatus[siteId] || { visite: false, rdv: false, aRevoir: false, aRappeler: false }),
        [field]: value,
      },
    };
    setVisitesStatus(newStatus);

    // 2. Sauvegarder dans tournees
    await supabase
      .from('tournees')
      .update({ visites_effectuees: newStatus })
      .eq('id', tourneeId);

    const typeMap = {
      visite: 'visite',
      rdv: 'rdv',
      aRevoir: 'a_revoir',
      aRappeler: 'a_rappeler',
    };
    const type = typeMap[field];

    if (!value) {
      // DÉCOCHAGE: Supprimer
      await supabase
        .from('lead_interactions')
        .delete()
        .eq('entreprise_id', siteId)
        .eq('user_id', session.user.id)
        .eq('type', type);
      
      toast.success('Supprimé');
    } else {
      // COCHAGE: Delete + Insert (remplace toujours)
      await supabase
        .from('lead_interactions')
        .delete()
        .eq('entreprise_id', siteId)
        .eq('user_id', session.user.id)
        .eq('type', type);

      await supabase
        .from('lead_interactions')
        .insert({
          entreprise_id: siteId,
          user_id: session.user.id,
          type,
          statut: type === 'a_rappeler' ? 'a_rappeler' : 'en_cours',
          date_relance: dateRelance ?? null,
          notes: `Depuis tournée`,
        });
      
      toast.success('✅ Enregistré');
    }

    queryClient.invalidateQueries({ queryKey: ['crm-interactions'] });
    queryClient.invalidateQueries({ queryKey: ['notification-reminders'] });
  } catch (error) {
    console.error(error);
    toast.error('Erreur');
  }
};
```

## Supprimer
- Toute logique lead_statuts
- Toute vérification existingInteraction
- Tous les appels Edge Function
- Tous les messages complexes

## Garder
- lead_interactions seulement
- Delete + Insert simple
