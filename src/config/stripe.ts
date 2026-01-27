/**
 * Stripe Configuration
 * 
 * Payment Links for different plans
 * Update these URLs after creating Payment Links in Stripe Dashboard
 */

export const STRIPE_CONFIG = {
  // PRO Plan Payment Link (7-day free trial)
  // Replace with your actual Payment Link URL from Stripe Dashboard
  PAYMENT_LINK_PRO: import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00',
  
  // PRO Plan Price ID (for webhook verification)
  PRO_PRICE_ID: 'price_1SqxKmHjyidZ5i9L8tCztpFU',
  
  // Success/Cancel URLs
  SUCCESS_URL: `${window.location.origin}/checkout-success?trial=true`,
  CANCEL_URL: `${window.location.origin}/?checkout=cancelled`,
} as const;

/**
 * Get Stripe Payment Link for PRO plan with pre-filled email
 * @param email - User's email address to pre-fill
 * @returns Full Stripe Payment Link URL with email parameter
 */
export function getProPaymentLink(email?: string): string {
  const baseUrl = STRIPE_CONFIG.PAYMENT_LINK_PRO;
  
  if (!email) {
    return baseUrl;
  }
  
  // Stripe Payment Links support ?prefilled_email= parameter
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}prefilled_email=${encodeURIComponent(email)}`;
}
