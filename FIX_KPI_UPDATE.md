# Solution Temporaire: KPI ne se mettent pas à jour

## Problème
Quand vous supprimez un prospect d'une tournée, les KPI (distance/temps) ne se recalculent pas.

## Pourquoi?
Le code fixé est **local** sur votre machine, mais la version **en production** (pulse-lead.com) n'a pas encore ces changements.

## ✅ Solution Immédiate (Sans Déploiement)

### Option 1: Trigger Database (Recommandé)

Créez un trigger PostgreSQL qui recalcule automatiquement les KPI.

**Dans Supabase Dashboard SQL Editor:**

```sql
-- Fonction pour recalculer les KPI d'une tournée
CREATE OR REPLACE FUNCTION recalculate_tournee_kpis()
RETURNS TRIGGER AS $$
BEGIN
  -- Si ordre_optimise ou entreprises_ids change, reset les KPI
  IF (TG_OP = 'UPDATE' AND 
      (OLD.ordre_optimise IS DISTINCT FROM NEW.ordre_optimise OR 
       OLD.entreprises_ids IS DISTINCT FROM NEW.entreprises_ids)) THEN
    
    -- Reset les KPI pour forcer un recalcul côté client
    NEW.distance_totale_km := NULL;
    NEW.temps_estime_minutes := NULL;
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS recalculate_kpis_on_change ON tournees;
CREATE TRIGGER recalculate_kpis_on_change
  BEFORE UPDATE ON tournees
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_tournee_kpis();
```

**Ce que ça fait:**
- Quand vous supprimez un site, `ordre_optimise` change
- Le trigger détecte ce changement et **reset les KPI à NULL**
- Quand vous rechargez la page, le frontend voit les KPI à NULL et **recalcule automatiquement**

---

### Option 2: Déployer le Nouveau Code

Pour une solution permanente, déployez la nouvelle version:

```bash
# Build le projet
npm run build

# Déployez sur votre hébergeur (Vercel/Netlify/etc)
vercel --prod
# OU
netlify deploy --prod
```

---

## 🧪 Test

1. **Exécutez le SQL ci-dessus** dans Supabase
2. **Rechargez votre page** pulse-lead.com
3. **Supprimez un site** d'une tournée
4. **Rechargez la page** de la tournée
5. Les KPI devraient se **recalculer automatiquement** ✅

---

## 📝 Note

Le code local (`TourneeDetail.tsx` ligne 518-602) gère déjà correctement le recalcul. Une fois déployé, tout fonctionnera sans trigger!
