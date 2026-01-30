-- 🚨 ACTIVATION MANUELLE D'UN COMPTE APRÈS PAIEMENT STRIPE
-- Utilise ce script SEULEMENT si le webhook Stripe ne fonctionne pas

-- ⚠️ IMPORTANT : Remplace [TON_EMAIL_ICI] par ton vrai email

-- 1️⃣ Récupère ton user_id
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
WHERE email = '[TON_EMAIL_ICI]';
-- Copie le user_id affiché

-- 2️⃣ Active ton compte dans user_quotas
UPDATE public.user_quotas
SET 
    is_first_login = false,
    plan_type = 'pro',
    subscription_status = 'trialing',
    prospects_limit = 999999,
    tournees_limit = 999999,
    updated_at = NOW()
WHERE user_id = '[COLLE_TON_USER_ID_ICI]';

-- 3️⃣ Vérifie que c'est activé
SELECT 
    user_id,
    plan_type,
    is_first_login,
    subscription_status,
    prospects_limit,
    tournees_limit
FROM public.user_quotas
WHERE user_id = '[COLLE_TON_USER_ID_ICI]';

-- ✅ Tu dois voir :
-- is_first_login: false
-- plan_type: pro
-- subscription_status: trialing
-- prospects_limit: 999999

-- 🎯 Après ça :
-- 1. Retourne sur https://pulse-lead.com/auth
-- 2. Connecte-toi
-- 3. Tu seras redirigé vers le dashboard ✅

-- 💡 RAPPEL :
-- Cette solution est temporaire.
-- Le vrai fix est de configurer le webhook Stripe (voir DIAGNOSTIC_WEBHOOK_STRIPE.md)
