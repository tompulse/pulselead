# 🚀 ÉTAPES À SUIVRE - Plan Découverte

## ⚡ Action Immédiate Requise

### Étape 1 : Appliquer le Correctif SQL ⏰ 2 minutes

1. **Ouvre Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/TON_PROJECT_ID
   ```

2. **Va dans SQL Editor** (dans le menu latéral gauche)

3. **Copie le contenu du fichier** `APPLY_FREE_PLAN_FIX.sql`

4. **Colle dans l'éditeur SQL**

5. **Clique sur "Run"** (bouton vert en haut à droite)

6. **Vérifie le résultat** :
   - ✅ Tu dois voir "✅ Vérification:" avec les comptes
   - ✅ Une liste de tes utilisateurs FREE actuels
   - ❌ Si erreur, envoie-moi le message d'erreur

---

### Étape 2 : Tester avec un Nouveau Compte ⏰ 3 minutes

#### A. Créer un compte test

1. **Ouvre un navigateur en mode incognito** (Cmd+Shift+N sur Chrome)

2. **Va sur ton app** :
   ```
   http://localhost:5173  (ou ton URL de prod)
   ```

3. **Clique sur "S'inscrire"**

4. **Utilise un email de test** :
   ```
   test-plan-free-27jan@example.com
   ```

5. **Confirme l'email** (dans Supabase Auth ou ta boîte mail)

#### B. Tester le bouton "Commencer gratuitement"

6. **Tu arrives sur** `/plan-selection`

7. **Vérifie que tu vois** :
   - Un plan "Découverte" à gauche
   - Un plan "PRO" à droite
   - Le plan Découverte affiche "Gratuit /mois"

8. **Clique sur "Commencer gratuitement"**

9. **🎯 RÉSULTAT ATTENDU** :
   ```
   ✅ Redirection vers /dashboard
   ✅ Message toast "🎉 Bienvenue sur PULSE FREE !"
   ✅ Header affiche "30 prospects" et "2 tournées"
   ✅ Aucune erreur dans la console (F12)
   ```

10. **❌ SI ERREUR** :
    - Ouvre la console (F12)
    - Copie l'erreur
    - Vérifie que le script SQL a bien été exécuté

#### C. Tester le déblocage de prospect

11. **Clique sur "Nouveaux Sites"** (dans le menu)

12. **Choisis une entreprise** et clique dessus

13. **Vérifie que tu vois** :
    ```
    ✅ Nom visible : "Entreprise ABC"
    ✅ Code NAF visible : "47.11B"
    🔒 SIRET flouté : "████████"
    🔒 Adresse floutée : "████████"
    ```

14. **Clique sur "Débloquer ce prospect"**

15. **🎯 RÉSULTAT ATTENDU** :
    ```
    ✅ SIRET dévoilé
    ✅ Adresse dévoilée
    ✅ Badge "Débloqué" affiché
    ✅ Compteur passe à "1/30 prospects"
    ```

---

### Étape 3 : Tester les Limites ⏰ 1 minute

#### A. Limite de prospects (optionnel)

16. **Dans Supabase SQL Editor**, simule 30 prospects débloqués :
    ```sql
    UPDATE user_quotas 
    SET prospects_unlocked_count = 30 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-plan-free-27jan@example.com');
    ```

17. **Rafraîchis la page** `/dashboard`

18. **Essaie de débloquer un nouveau prospect**

19. **🎯 RÉSULTAT ATTENDU** :
    ```
    ✅ Modal d'upgrade s'affiche
    ✅ Message "30/30 prospects débloqués"
    ✅ Bouton "Passer à PRO (49€/mois)"
    ```

#### B. Limite de tournées (optionnel)

20. **Crée 2 tournées** via l'interface

21. **Essaie d'en créer une 3ème**

22. **🎯 RÉSULTAT ATTENDU** :
    ```
    ✅ Message d'erreur "Limite atteinte (2/2 tournées)"
    ✅ Modal d'upgrade proposé
    ```

---

### Étape 4 : Commit et Push ⏰ 1 minute

23. **Vérifie les modifications** :
    ```bash
    cd /Users/raws/pulse-project/pulselead
    git status
    ```

24. **Ajoute les nouveaux fichiers** :
    ```bash
    git add APPLY_FREE_PLAN_FIX.sql
    git add PLAN_DECOUVERTE_FIX.md
    git add INSTRUCTIONS_FINALES.md
    git add README_PLAN_DECOUVERTE.md
    git add ETAPES_A_SUIVRE.md
    git add FREEMIUM_FIXED.md
    git add supabase/migrations/20260127_fix_column_names.sql
    git add supabase/migrations/20260127_fix_free_plan_activation.sql
    ```

25. **Commit** :
    ```bash
    git commit -m "fix: réparer plan découverte FREE - accès direct après confirmation email

    - Ajout fonction RPC activate_free_plan
    - Fix trigger initialize_user_quota
    - Correction noms de colonnes (prospects_unlocked_count, tournees_created_count)
    - Documentation complète du correctif
    - Tests validés"
    ```

26. **Push** :
    ```bash
    git push origin main
    ```

---

## ✅ Checklist Finale

Avant de marquer cette tâche comme terminée, vérifie :

- [ ] Script SQL exécuté dans Supabase sans erreur
- [ ] Nouveau compte créé en mode incognito
- [ ] Bouton "Commencer gratuitement" fonctionne
- [ ] Redirection vers `/dashboard` réussie
- [ ] Quotas affichés (30 prospects, 2 tournées)
- [ ] Déblocage de prospect fonctionne
- [ ] Compteur s'incrémente correctement
- [ ] Modifications committées et pushées

---

## 🐛 En Cas de Problème

### Problème 1 : Script SQL échoue

**Symptôme** : Erreur lors de l'exécution du script

**Solution** :
```sql
-- Exécute les commandes une par une dans cet ordre :

-- 1. Créer la fonction
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
  VALUES (p_user_id, 'free', 0, 0, false)
  ON CONFLICT (user_id) DO UPDATE SET plan_type = 'free', is_first_login = false, updated_at = now();
  
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (p_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO UPDATE SET plan_type = 'free', subscription_status = 'active';
  
  RETURN json_build_object('success', true, 'plan_type', 'free', 'message', 'Plan FREE activé');
END;
$$;

-- 2. Grant permission
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;
```

### Problème 2 : Erreur "activate_free_plan is not defined"

**Symptôme** : Erreur dans la console du navigateur

**Solution** :
1. Vérifie que le script SQL a été exécuté
2. Rafraîchis le schéma Supabase :
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
3. Vide le cache du navigateur (Cmd+Shift+R)

### Problème 3 : Boucle de redirection

**Symptôme** : Redirection infinie entre `/plan-selection` et `/dashboard`

**Solution** :
```sql
-- Force is_first_login à false
UPDATE user_quotas 
SET is_first_login = false 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'TON_EMAIL');
```

---

## 📞 Besoin d'Aide ?

Si tu es bloqué :
1. Ouvre la console du navigateur (F12)
2. Copie l'erreur
3. Vérifie les logs Supabase (Dashboard > Logs)
4. Consulte `PLAN_DECOUVERTE_FIX.md` pour plus de détails

---

## ✨ Temps Total Estimé : 7 minutes

- Étape 1 (SQL) : 2 min
- Étape 2 (Test) : 3 min
- Étape 3 (Limites) : 1 min
- Étape 4 (Commit) : 1 min

**👉 COMMENCE PAR L'ÉTAPE 1 : Exécuter `APPLY_FREE_PLAN_FIX.sql`**
