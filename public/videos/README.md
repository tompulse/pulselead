# 📹 Comment ajouter votre vidéo PULSE

## 📁 Fichiers requis

Placez ces 2 fichiers dans ce dossier (`public/videos/`) :

1. **demo-pulse.mp4** - Votre vidéo de démonstration
2. **demo-pulse-poster.jpg** (optionnel) - Image de prévisualisation (thumbnail)

## 📝 Instructions

### 1. Ajouter la vidéo principale

```bash
# Copiez votre fichier MP4 ici et renommez-le :
cp /chemin/vers/votre/video.mp4 public/videos/demo-pulse.mp4
```

### 2. Créer une image de prévisualisation (recommandé)

L'image apparaît avant que l'utilisateur clique sur play.

**Option A - Depuis la vidéo :**
```bash
# Extraire une frame de la vidéo (nécessite ffmpeg)
ffmpeg -i demo-pulse.mp4 -ss 00:00:02 -vframes 1 demo-pulse-poster.jpg
```

**Option B - Capture d'écran :**
- Ouvrez la vidéo, mettez pause sur un moment clé
- Prenez une capture d'écran
- Enregistrez-la comme `demo-pulse-poster.jpg`

## ✅ Vérification

Après avoir ajouté les fichiers :

```
public/videos/
├── demo-pulse.mp4          ← Votre vidéo
├── demo-pulse-poster.jpg   ← Image de preview (optionnel)
└── README.md              ← Ce fichier
```

## 🎨 Optimisation (optionnel)

Pour un chargement plus rapide :

```bash
# Compresser la vidéo sans trop perdre en qualité
ffmpeg -i demo-pulse.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k demo-pulse-compressed.mp4
```

## 🚀 Déploiement

Une fois les fichiers ajoutés :

```bash
git add public/videos/demo-pulse.mp4
git commit -m "Ajout vidéo de démonstration PULSE"
git push
```

Votre vidéo sera automatiquement déployée sur votre site !
