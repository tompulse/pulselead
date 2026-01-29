# ✅ Plan Découverte - Correctif Appliqué

## 🎯 Objectif

Réparer le bouton "Commencer gratuitement" pour qu'il donne **accès direct au plan FREE** après confirmation de l'email, **sans aucune erreur**.

## 📝 Résumé du Problème

L'utilisateur cliquait sur "Commencer gratuitement" mais :
- ❌ Erreurs dans la console
- ❌ Redirection vers `/dashboard` qui échouait
- ❌ Fonction RPC `activate_free_plan` manquante ou incorrecte

## ✅ Solution Implémentée

### 1. Fonction RPC `activate_free_plan`

Créée dans `APPLY_FREE_PLAN_FIX.sql` :

```sql
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
```

Cette fonction :
- ✅ Active le plan FREE
- ✅ Marque `is_first_login = false` (évite les boucles de redirection)
- ✅ Synchronise `user_quotas` et `user_subscriptions`
- ✅ Retourne un JSON de succès

### 2. Trigger Automatique

Le trigger `initialize_user_quota()` :
- ✅ S'exécute automatiquement à l'inscription
- ✅ Crée un plan FREE par défaut
- ✅ Initialise les quotas (30 prospects, 2 tournées)
- ✅ Marque `is_first_login = true`

### 3. Migrations SQL

Deux migrations créées :
- `supabase/migrations/20260127_fix_column_names.sql` - Corrige les noms de colonnes
- `supabase/migrations/20260127_fix_free_plan_activation.sql` - Active le plan FREE

## 🚀 Comment Appliquer (IMPORTANT!)

### Étape 1 : Exécuter le script SQL

**Via Supabase SQL Editor (RECOMMANDÉ)** :

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard)
2. Va dans **SQL Editor**
3. Copie le contenu de `APPLY_FREE_PLAN_FIX.sql`
4. Colle et exécute
5. Vérifie qu'il n'y a pas d'erreur

### Étape 2 : Tester

1. **Nouveau compte** :
   - Inscris-toi avec un nouvel email
   - Confirme l'email
   - Clique "Commencer gratuitement"
   - ✅ Tu dois arriver sur `/dashboard` sans erreur

2. **Déblocage** :
   - Ouvre un prospect
   - Clique "Débloquer ce prospect"
   - ✅ Les infos se dévoilent
   - ✅ Le compteur s'incrémente

## 📁 Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `APPLY_FREE_PLAN_FIX.sql` | Script SQL à exécuter dans Supabase |
| `PLAN_DECOUVERTE_FIX.md` | Documentation technique complète |
| `INSTRUCTIONS_FINALES.md` | Guide pas à pas |
| `README_PLAN_DECOUVERTE.md` | Ce fichier (résumé) |
| `supabase/migrations/20260127_fix_free_plan_activation.sql` | Migration |

## 🎯 Résultat Final

### Flux Utilisateur

```
Inscription → Email confirmé → /plan-selection
                                      ↓
                          "Commencer gratuitement"
                                      ↓
                              /dashboard (FREE)
                                      ↓
                     30 prospects | 2 tournées
```

### Limitations Plan FREE

| Ressource | Limite | Comportement |
|-----------|--------|--------------|
| Prospects débloqués | 30/mois | Modal upgrade au 31ème |
| Tournées créées | 2/mois | Erreur à la 3ème |
| SIRET | Verrouillé 🔒 | Débloqué après unlock |
| Adresse | Verrouillée 🔒 | Débloquée après unlock |
| Nom | Visible ✅ | Toujours |
| Code NAF | Visible ✅ | Toujours |

## 🐛 Dépannage Rapide

### Erreur : "activate_free_plan is not defined"

```sql
-- Exécute APPLY_FREE_PLAN_FIX.sql dans Supabase SQL Editor
```

### Boucle de redirection

```sql
-- Vérifie is_first_login
SELECT user_id, is_first_login FROM user_quotas;

-- Si bloqué, force :
UPDATE user_quotas SET is_first_login = false WHERE user_id = 'TON_ID';
```

### Quotas ne s'incrémentent pas

```sql
-- Vérifie les noms de colonnes
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_quotas';

-- Doit afficher :
-- prospects_unlocked_count
-- tournees_created_count
```

## 📞 Support

Si problèmes :
1. Console navigateur (F12) → Onglet "Console"
2. Supabase Dashboard → Logs
3. Consulte `PLAN_DECOUVERTE_FIX.md` pour détails techniques

## ✨ Prochaine Étape

**👉 Exécuter `APPLY_FREE_PLAN_FIX.sql` dans Supabase SQL Editor**

---

**Date** : 27 janvier 2026  
**Statut** : ✅ Solution prête à être appliquée  
**Action requise** : Exécuter le script SQL dans Supabase
