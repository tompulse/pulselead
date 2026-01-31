-- =====================================================
-- VÉRIFIER SI MAPBOX_PUBLIC_TOKEN EST CONFIGURÉ
-- =====================================================

-- Cette requête ne fonctionne pas directement en SQL car les secrets
-- sont accessibles uniquement via les Edge Functions.

-- =====================================================
-- SOLUTION : Vérifier via Supabase Dashboard
-- =====================================================

-- 1. Va sur : https://supabase.com/dashboard/project/ywavxjmbsywpjzchuuho/settings/functions

-- 2. Onglet "Secrets" ou "Environment Variables"

-- 3. Cherche : MAPBOX_PUBLIC_TOKEN

-- 4. Si absent ou vide → Le configurer avec ta clé publique Mapbox

-- =====================================================
-- OBTENIR UNE CLÉ MAPBOX (si tu n'en as pas)
-- =====================================================

-- 1. Va sur : https://www.mapbox.com
-- 2. Créer un compte (gratuit)
-- 3. Dashboard → Tokens
-- 4. Copier le "Default public token" (commence par pk.ey...)
-- 5. Coller dans Supabase secrets : MAPBOX_PUBLIC_TOKEN

-- =====================================================
-- VÉRIFIER QUE LA FONCTION EST DÉPLOYÉE
-- =====================================================

-- Vérifie que get-mapbox-token est bien déployée :
-- Dans le terminal :

-- supabase functions list

-- Tu devrais voir :
-- get-mapbox-token | ✓ Deployed

-- Si absent, déployer :
-- supabase functions deploy get-mapbox-token

-- =====================================================
-- TESTER LA FONCTION
-- =====================================================

-- Option 1 : Via Supabase UI
-- 1. Dashboard → Edge Functions → get-mapbox-token
-- 2. Invoke function (laisser body vide)
-- 3. Tu devrais voir : {"token": "pk.ey..."}

-- Option 2 : Via la console du navigateur
-- 1. Ouvre la console (F12)
-- 2. Colle ce code :

/*
const { data, error } = await supabase.functions.invoke('get-mapbox-token');
console.log('Mapbox token:', data);
*/

-- =====================================================
-- PLAN GRATUIT MAPBOX
-- =====================================================

-- Mapbox offre GRATUITEMENT :
-- - 100 000 requêtes de géocodage/mois
-- - Largement suffisant pour ton usage

-- =====================================================
-- ALTERNATIVE : Désactiver la recherche d'adresse
-- =====================================================

-- Si tu ne veux pas configurer Mapbox, tu peux :
-- 1. Utiliser uniquement la géolocalisation du navigateur (bouton GPS)
-- 2. Ou permettre de taper manuellement une adresse (sans suggestions)

-- =====================================================
-- RÉSUMÉ
-- =====================================================

-- ✅ Fonction existe : supabase/functions/get-mapbox-token/index.ts
-- ⚠️ Secret manquant : MAPBOX_PUBLIC_TOKEN
-- 🔧 Action : Configurer le token dans Supabase Dashboard
