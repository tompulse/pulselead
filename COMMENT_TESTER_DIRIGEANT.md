# 🎯 COMMENT TESTER L'ENRICHISSEMENT DIRIGEANT

## ⚠️ URL CORRECTE
Ton app tourne sur : **http://localhost:8080/**
(PAS localhost:5173)

---

## 📝 ÉTAPES EXACTES POUR TESTER

### 1️⃣ Ouvre l'app
```
http://localhost:8080/
```

### 2️⃣ Connecte-toi
- Utilise ton compte habituel

### 3️⃣ Va dans "Prospects" ou "Tournées"
- Clique sur l'onglet "Prospects" dans le menu de gauche
- OU clique sur une de tes tournées existantes

### 4️⃣ Clique sur UNE entreprise dans la liste
- Une entreprise avec un SIRET de préférence
- Le panneau latéral s'ouvre à droite (ou en bas sur mobile)

### 5️⃣ Clique sur l'onglet "Infos"
- Dans le panneau latéral
- Tu es peut-être déjà dessus par défaut

### 6️⃣ Scroll vers le bas
- Tu vas voir différentes sections :
  - Adresse
  - Activité
  - SIREN
  - Catégorie juridique
  - **👉 DIRIGEANT** ← NOUVELLE SECTION ICI
  - Date de création
  - Taille

### 7️⃣ Dans la section "DIRIGEANT"
Tu devrais voir :
- **Si l'entreprise a un SIRET** : Un bouton bleu "🧑 Trouver le gérant"
- **Si pas de SIRET** : Message "SIRET requis pour enrichir"

### 8️⃣ Clique sur "Trouver le gérant"
- Le bouton devient "⏳ Recherche..."
- Attends 2-3 secondes
- **BOOM !** 🎉 Un toast vert apparaît en haut à droite avec :
  - "Dirigeant trouvé : [Nom Prénom]"
  - "Fonction : Gérant"

### 9️⃣ Le panneau se met à jour automatiquement
Tu verras maintenant :
```
👤 DIRIGEANT
Jean DUPONT
Gérant
✓ Enrichi le 22/01/2026
```

---

## 🔧 SI ÇA NE MARCHE PAS

### Hard refresh du navigateur
- **Mac** : `Cmd + Shift + R`
- **Windows** : `Ctrl + Shift + R`

### Vérifie que tu es sur la bonne URL
- Doit être **localhost:8080**
- PAS localhost:5173

### Ouvre la console du navigateur
- `Cmd + Option + I` (Mac) ou `F12` (Windows)
- Onglet "Console"
- Regarde s'il y a des erreurs en rouge

### Teste avec un SIRET connu
Voici quelques SIRET d'entreprises réelles pour tester :
- **Apple France** : `44342610700016`
- **Google France** : `44350781400034`
- **Microsoft France** : `32738071400013`

---

## 📸 À QUOI ÇA RESSEMBLE

Avant enrichissement :
```
👤 DIRIGEANT                    [🧑 Trouver le gérant]
Cliquez pour enrichir
```

Pendant enrichissement :
```
👤 DIRIGEANT                    [⏳ Recherche...]
```

Après enrichissement :
```
👤 DIRIGEANT
Jean DUPONT
Gérant
✓ Enrichi le 22/01/2026
```

---

## 🎬 VIDÉO MENTALE DU FLOW

1. Liste des prospects
2. Clic sur une entreprise → Panneau s'ouvre
3. Onglet "Infos"
4. Scroll jusqu'à "DIRIGEANT"
5. Clic sur "Trouver le gérant"
6. Toast vert "Dirigeant trouvé : ..."
7. Info apparaît dans le panneau

**C'EST TOUT !** 🚀

---

## 💬 DIS-MOI

Une fois que tu as testé, dis-moi :
- ✅ "Ça marche !" → Je t'explique comment l'utiliser pour ton user trial
- ❌ "J'ai une erreur" → Envoie-moi le message d'erreur
- 🤔 "Je ne trouve pas le bouton" → Envoie-moi un screenshot

GO ! 💪
