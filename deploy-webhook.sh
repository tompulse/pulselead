#!/bin/bash

# 🚀 DÉPLOIEMENT AUTOMATIQUE - Webhook Stripe & Email

echo "🚀 Déploiement du webhook Stripe et de l'envoi d'emails..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Déploiement stripe-webhook
echo "📦 Déploiement de stripe-webhook..."
if supabase functions deploy stripe-webhook; then
  echo -e "${GREEN}✅ stripe-webhook déployé avec succès${NC}"
else
  echo -e "${RED}❌ Erreur lors du déploiement de stripe-webhook${NC}"
  exit 1
fi

echo ""

# Déploiement send-welcome
echo "📦 Déploiement de send-welcome..."
if supabase functions deploy send-welcome; then
  echo -e "${GREEN}✅ send-welcome déployé avec succès${NC}"
else
  echo -e "${RED}❌ Erreur lors du déploiement de send-welcome${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}🎉 Tous les déploiements sont terminés !${NC}"
echo ""

# Afficher l'URL du webhook
echo "📋 Informations importantes :"
echo ""
echo "1️⃣ URL de ton webhook Stripe :"
SUPABASE_URL=$(supabase status 2>/dev/null | grep "API URL:" | awk '{print $3}')
if [ -n "$SUPABASE_URL" ]; then
  echo -e "${YELLOW}   ${SUPABASE_URL}/functions/v1/stripe-webhook${NC}"
  echo ""
  echo "   👉 Configure cette URL dans Stripe Dashboard :"
  echo "   https://dashboard.stripe.com/test/webhooks"
else
  echo -e "${RED}   ⚠️ Impossible de récupérer l'URL Supabase${NC}"
  echo "   Lance manuellement : supabase status"
fi

echo ""
echo "2️⃣ Secrets à vérifier :"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET (depuis Stripe webhook)"
echo "   - RESEND_API_KEY (depuis resend.com)"
echo ""
echo "   Vérifie avec : supabase secrets list"
echo ""

echo -e "${GREEN}✨ Prêt à recevoir les paiements !${NC}"
echo ""
echo "📚 Pour plus d'infos, lis :"
echo "   - DEPLOIEMENT_RAPIDE_WEBHOOK.md"
echo "   - DIAGNOSTIC_WEBHOOK_STRIPE.md"
