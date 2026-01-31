#!/bin/bash

# =====================================================
# DÉPLOYER GET-MAPBOX-TOKEN
# =====================================================

cd /Users/raws/pulse-project/pulselead

echo "🚀 Déploiement de get-mapbox-token..."

supabase functions deploy get-mapbox-token

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🧪 TESTER LA FONCTION :"
echo ""
echo "1. Va sur Supabase Dashboard → Edge Functions → get-mapbox-token"
echo "2. Clique 'Invoke function' (laisser body vide)"
echo "3. Tu devrais voir : {\"token\": \"pk.ey...\"}"
echo ""
echo "4. Si tu vois le token → SUCCÈS ! ✅"
echo "5. Si tu vois {\"error\": \"Token Mapbox non configuré\"} → Le secret n'est pas chargé"
echo ""
echo "💡 IMPORTANT :"
echo "Après avoir ajouté le secret MAPBOX_PUBLIC_TOKEN dans Supabase,"
echo "tu DOIS redéployer la fonction pour qu'elle puisse accéder au secret !"
echo ""
echo "🔄 Maintenant, recharge la page du dashboard et réessaye la recherche d'adresse !"
