/**
 * Opens Google Maps with the given coordinates
 * On mobile, tries to open the native app
 * On desktop, opens in browser
 */
export const openGoogleMaps = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  
  // On mobile, use location.href to trigger native app
  // On desktop, use window.open
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Opens Waze with the given coordinates
 * On mobile, tries to open the native app
 * On desktop, opens in browser
 */
export const openWaze = (latitude: number, longitude: number) => {
  const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  
  // On mobile, use location.href to trigger native app
  // On desktop, use window.open
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};
