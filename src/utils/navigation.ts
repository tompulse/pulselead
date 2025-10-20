/**
 * Cross-platform helpers to open navigation apps from an iframe/sandbox
 * - Always open in a new tab/window to avoid iframe navigation blocks
 * - On mobile, try app deep links first, then fall back to web URLs
 */
const openInNewTab = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

const isIOS = () => /iPad|iPhone|iPod/i.test(navigator.userAgent);
const isAndroid = () => /Android/i.test(navigator.userAgent);
const isMobileUA = () => isIOS() || isAndroid();

export const openGoogleMaps = (latitude: number, longitude: number) => {
  const webURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (isMobileUA()) {
    // Deep link to app first
    if (isIOS()) {
      const googleApp = `comgooglemaps://?q=${latitude},${longitude}`;
      const appleMaps = `https://maps.apple.com/?ll=${latitude},${longitude}&q=${latitude},${longitude}`;
      openInNewTab(googleApp);
      // Fallback to Apple Maps (or Google web) shortly after if app isn't installed
      setTimeout(() => openInNewTab(appleMaps), 300);
    } else if (isAndroid()) {
      const androidGeo = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      openInNewTab(androidGeo);
      setTimeout(() => openInNewTab(webURL), 300);
    }
  } else {
    // Desktop: open web maps
    openInNewTab(webURL);
  }
};

export const openWaze = (latitude: number, longitude: number) => {
  const appURL = `waze://?ll=${latitude},${longitude}&navigate=yes`;
  const webURL = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;

  if (isMobileUA()) {
    openInNewTab(appURL);
    // Fallback to web URL if app isn't installed
    setTimeout(() => openInNewTab(webURL), 300);
  } else {
    openInNewTab(webURL);
  }
};
