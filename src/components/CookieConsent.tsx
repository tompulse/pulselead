import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Apply stored consent
      const consentData = JSON.parse(consent);
      updateGoogleConsent(consentData.analytics);
    }
  }, []);

  const updateGoogleConsent = (analytics: boolean) => {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const consent = { analytics: true, timestamp: new Date().toISOString() };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    updateGoogleConsent(true);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consent = { analytics: false, timestamp: new Date().toISOString() };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    updateGoogleConsent(false);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = { analytics: analyticsConsent, timestamp: new Date().toISOString() };
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    updateGoogleConsent(analyticsConsent);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <Card className="glass-card border-accent/20 p-6 max-w-2xl mx-auto shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Gestion des cookies</h3>
          <button 
            onClick={handleRejectAll}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showCustomize ? (
          <>
            <p className="text-white/70 mb-6 leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de notre site. 
              En cliquant sur "Tout accepter", vous acceptez l'utilisation de tous les cookies. 
              Consultez notre <Link to="/confidentialite" className="text-accent hover:underline">Politique de confidentialité</Link> pour plus d'informations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAcceptAll}
                className="flex-1 bg-accent hover:bg-accent/90 text-black font-semibold"
              >
                Tout accepter
              </Button>
              <Button 
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Tout refuser
              </Button>
              <Button 
                onClick={() => setShowCustomize(true)}
                variant="ghost"
                className="flex-1 text-white hover:bg-white/10"
              >
                Personnaliser
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Cookies essentiels</h4>
                  <p className="text-sm text-white/60">Nécessaires au fonctionnement du site</p>
                </div>
                <div className="text-sm text-accent font-medium">Toujours actif</div>
              </div>

              <div className="flex items-start justify-between p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Cookies d'analyse (Google Analytics)</h4>
                  <p className="text-sm text-white/60">Nous permettent d'améliorer notre service</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsConsent}
                    onChange={(e) => setAnalyticsConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleSavePreferences}
                className="flex-1 bg-accent hover:bg-accent/90 text-black font-semibold"
              >
                Enregistrer mes préférences
              </Button>
              <Button 
                onClick={() => setShowCustomize(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Retour
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
