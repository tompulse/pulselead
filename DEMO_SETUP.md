# 🎯 Configuration du compte DÉMO

## Étape 1 : Créer le user dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Projet PulseLead → Authentication → Users
3. Cliquez sur "Add user" → "Create new user"
4. Email : `demo@pulse.com`
5. Password : `DemoPulse2024!`
6. Email Confirm : ✅ OUI (auto-confirm)

## Étape 2 : Appliquer la migration

```bash
supabase db push
```

Cela va créer l'abonnement actif et marquer l'onboarding terminé.

## Étape 3 : Créer les données démo (Manuel)

### Se connecter au compte démo

1. Allez sur https://pulse-lead.com (ou localhost:8080)
2. Cliquez sur "Voir une démo"
3. Se connecter automatiquement avec demo@pulse.com

### Créer 3 tournées réalistes

**Tournée 1 : Restaurants Paris 15**
- Filtrer : Restaurants (code NAF), Paris 15ème (75015)
- Sélectionner 8-10 restaurants
- Créer la tournée "Prospection Restau Paris 15"
- Ajouter 2-3 interactions :
  - "Le Comptoir du 15" → Visite + Note "Intéressé, rappeler mardi"
  - "La Brasserie" → Appel + RDV programmé dans 3 jours
  - "Sushi Délice" → À revoir + Note "Fermé, repasser après-midi"

**Tournée 2 : BTP/Construction Hauts-de-Seine (92)**
- Filtrer : Construction/BTP, département 92
- Sélectionner 6-8 entreprises
- Créer la tournée "BTP 92 - Semaine 4"
- Ajouter 1-2 interactions
  - Interaction "négociation" sur une entreprise
  - Note détaillée "Besoin urgent panneaux solaires"

**Tournée 3 : Services Bordeaux (33)**
- Filtrer : Services/Conseil, Gironde (33)
- Sélectionner 5-7 entreprises
- Créer la tournée "Services Bordeaux"
- Marquer 1-2 comme "gagnées" (client signé)

### Statuts CRM variés

Pour montrer le pipeline :
- 2-3 prospects : "nouveau"
- 2-3 prospects : "contacté"
- 1-2 prospects : "qualifié"
- 1 prospect : "proposition"
- 1 prospect : "négociation"
- 1 prospect : "gagné" ✅
- 1 prospect : "perdu" ❌

### Notes réalistes

Exemples de notes à ajouter :
- "RDV fixé le 28/01 à 14h avec le gérant"
- "Intéressé mais budget Q2, rappeler fin mars"
- "Pas intéressé, concurrent en place depuis 3 ans"
- "Très chaud ! Envoyer devis avant vendredi"
- "Pas de réponse au téléphone, rappeler demain matin"

## Étape 4 : Vérifier

1. Se déconnecter
2. Cliquer sur "Voir une démo"
3. Vérifier que :
   - ✅ Les tournées s'affichent
   - ✅ La carte montre les prospects
   - ✅ Le CRM contient les interactions
   - ✅ Les stats sont réalistes

## 🎉 Le compte démo est prêt !

Les visiteurs peuvent maintenant :
- Voir des données réalistes
- Tester l'interface sans s'inscrire
- Comprendre la valeur de PULSE en 30 secondes
