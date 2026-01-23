# 📧 TEMPLATES EMAIL SUPABASE - GUIDE COMPLET

## 🎨 Direction Artistique
- **Background** : `#0D1422` (navy deep)
- **Gradient** : Cyan `#00BFFF` → `#06b6d4`
- **Accent** : Cyan `#00BFFF`
- **Text** : Blanc `#ffffff` / Gris `#b0b0b0`
- **CTA Button** : Gradient cyan avec shadow

---

## 📋 TEMPLATE 1 : EMAIL DE CONFIRMATION (Signup)

**Où configurer** : Supabase Dashboard → Authentication → Email Templates → **Confirm signup**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0D1422; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1422; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(0, 191, 255, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #00BFFF;">PULSE</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #06b6d4; font-style: italic;">Vends plus. Roule moins.</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 26px; color: #ffffff; text-align: center;">📧 Confirmez votre email</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Merci de vous être inscrit sur <strong style="color: #00BFFF;">PULSE</strong> ! Pour activer votre compte 
                et commencer à optimiser votre prospection terrain, confirmez votre adresse email.
              </p>
              
              <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00BFFF; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6;">
                  Cliquez sur le bouton ci-dessous pour confirmer votre email et accéder immédiatement à votre tableau de bord.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 30px; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                Confirmer mon email →
              </a>
            </td>
          </tr>
          
          <!-- Alternative Link -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888; text-align: center;">
                Ou copiez-collez ce lien :
              </p>
              <p style="margin: 0; font-size: 13px; color: #00BFFF; word-break: break-all; text-align: center;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: rgba(255, 171, 0, 0.1); border: 1px solid rgba(255, 171, 0, 0.3); border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #ffab00; line-height: 1.6; text-align: center;">
                  ⚠️ Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
                À très bientôt,<br>L'équipe PULSE
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #555555;">
                © 2026 PULSE — Tom Iolov — 108 rue de Crimée, 75019 Paris<br>
                SIRET 948 550 561 00039
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 TEMPLATE 2 : MAGIC LINK (Connexion sans mot de passe)

**Où configurer** : Supabase Dashboard → Authentication → Email Templates → **Magic Link**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0D1422; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1422; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(0, 191, 255, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #00BFFF;">PULSE</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #06b6d4; font-style: italic;">Vends plus. Roule moins.</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 56px;">🔐</span>
              </div>
              
              <h2 style="margin: 0 0 20px; font-size: 26px; color: #ffffff; text-align: center;">Connexion à PULSE</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Vous avez demandé à vous connecter à votre compte PULSE.
              </p>
              
              <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00BFFF; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6;">
                  Cliquez sur le bouton ci-dessous pour vous connecter instantanément (pas besoin de mot de passe).
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 30px; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                Se connecter à PULSE →
              </a>
            </td>
          </tr>
          
          <!-- Alternative Link -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888; text-align: center;">
                Ou copiez-collez ce lien :
              </p>
              <p style="margin: 0; font-size: 13px; color: #00BFFF; word-break: break-all; text-align: center;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          
          <!-- OTP Code (if applicable) -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
                  Ou utilisez ce code de connexion :
                </p>
                <p style="margin: 0; font-size: 32px; color: #00BFFF; font-weight: bold; letter-spacing: 6px; font-family: monospace;">
                  {{ .Token }}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: rgba(255, 171, 0, 0.1); border: 1px solid rgba(255, 171, 0, 0.3); border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #ffab00; line-height: 1.6; text-align: center;">
                  ⚠️ Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette connexion, ignorez cet email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
                L'équipe PULSE
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #555555;">
                © 2026 PULSE — Tom Iolov — 108 rue de Crimée, 75019 Paris<br>
                SIRET 948 550 561 00039
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📋 TEMPLATE 3 : RESET PASSWORD

**Où configurer** : Supabase Dashboard → Authentication → Email Templates → **Reset Password**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0D1422; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1422; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(0, 191, 255, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #00BFFF;">PULSE</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #06b6d4; font-style: italic;">Vends plus. Roule moins.</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 56px;">🔒</span>
              </div>
              
              <h2 style="margin: 0 0 20px; font-size: 26px; color: #ffffff; text-align: center;">Réinitialiser votre mot de passe</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Bonjour,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                Vous avez demandé à réinitialiser votre mot de passe PULSE.
              </p>
              
              <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00BFFF; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6;">
                  Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 30px; text-align: center;">
              <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                Réinitialiser mon mot de passe →
              </a>
            </td>
          </tr>
          
          <!-- Alternative Link -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888; text-align: center;">
                Ou copiez-collez ce lien :
              </p>
              <p style="margin: 0; font-size: 13px; color: #00BFFF; word-break: break-all; text-align: center;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background: rgba(255, 171, 0, 0.1); border: 1px solid rgba(255, 171, 0, 0.3); border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #ffab00; line-height: 1.6; text-align: center;">
                  ⚠️ Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Security note -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 13px; color: #666666; text-align: center; line-height: 1.6;">
                🔒 Pour votre sécurité, ne partagez jamais ce lien. Si vous recevez régulièrement ces emails sans les demander, contactez-nous immédiatement.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
              <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
                L'équipe PULSE
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #555555;">
                © 2026 PULSE — Tom Iolov — 108 rue de Crimée, 75019 Paris<br>
                SIRET 948 550 561 00039 — <a href="mailto:tomiolovpro@gmail.com" style="color: #06b6d4;">tomiolovpro@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🚀 CONFIGURATION SUPABASE

### **📧 Emails automatiques (gérés par Supabase Auth)**

Ces emails sont déclenchés automatiquement par Supabase :

1. **Confirm signup** : Envoyé après création de compte
2. **Magic Link** : Envoyé si l'utilisateur demande une connexion sans mot de passe
3. **Reset Password** : Envoyé quand l'utilisateur clique "Mot de passe oublié"

**Configuration** :
1. Supabase Dashboard → Authentication → Email Templates
2. Pour chaque template, copie-colle le HTML ci-dessus
3. Save

---

### **⏰ Email rappel fin d'essai (3 jours avant)**

**Déjà configuré !** L'edge function `send-trial-reminder` existe.

**Comment ça marche** :
- Webhook Stripe déclenche l'email 3 jours avant la fin du trial
- Ou cron job quotidien qui check les trials qui finissent dans 3 jours

**Rien à configurer** : Le code est déjà déployé et stylé.

---

### **🎉 Email confirmation de paiement**

**Déjà configuré !** L'edge function `send-payment-confirmation` existe.

**Comment ça marche** :
- Webhook Stripe déclenche l'email après `checkout.session.completed`
- Edge function envoie l'email automatiquement

**Rien à configurer** : Le code est déjà déployé et stylé.

---

## ✅ CHECKLIST COMPLÈTE

```
✅ Template Confirm signup (étape 1)
✅ Template Magic Link (étape 1)
✅ Template Reset Password (étape 1)
✅ send-trial-reminder (déjà déployé)
✅ send-payment-confirmation (déjà déployé)
✅ Design cohérent cyan/dark partout
✅ Mentions légales dans footers
✅ Liens expiration + warnings sécurité
```

---

## 🔍 VARIABLES DISPONIBLES DANS SUPABASE

Dans les templates Supabase Auth, tu peux utiliser :

- `{{ .ConfirmationURL }}` : Lien de confirmation/connexion
- `{{ .Token }}` : Code OTP (Magic Link uniquement)
- `{{ .Email }}` : Email de l'utilisateur
- `{{ .SiteURL }}` : URL de ton site (pulse-lead.com)
- `{{ .TokenHash }}` : Hash du token (technique)

---

**Prochaine étape** : Copie-colle les 3 templates dans Supabase Email Templates ! 🚀
