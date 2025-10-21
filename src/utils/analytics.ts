export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
    console.log('GA4 Event:', eventName, eventParams);
  }
};

export const trackCTAClick = (ctaName: string, location: string = 'landing') => {
  trackEvent('cta_click', { 
    cta_name: ctaName,
    cta_location: location
  });
};

export const trackEntrepriseView = (entrepriseId: string, entrepriseName: string, source: 'map' | 'list' | 'activities' | 'tournees' | 'pipeline') => {
  trackEvent('entreprise_view', {
    entreprise_id: entrepriseId,
    entreprise_name: entrepriseName,
    view_source: source
  });
};

export const trackViewChange = (newView: 'map' | 'list' | 'activities' | 'tournees' | 'pipeline') => {
  trackEvent('view_change', { 
    view_type: newView 
  });
};

export const trackInteractionAdded = (type: string, entrepriseId: string) => {
  trackEvent('interaction_added', { 
    interaction_type: type,
    entreprise_id: entrepriseId
  });
};

export const trackSync = (syncType: string) => {
  trackEvent('sync_initiated', { 
    sync_type: syncType 
  });
};
