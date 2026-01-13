/**
 * Utilitaires pour faciliter les communications par email et calendrier
 * 
 * UTILITÉ:
 * - Créer des liens mailto avec contenu pré-rempli
 * - Générer des fichiers .ics pour ajouter des événements au calendrier
 * - Créer des templates d'emails pour différents types d'interactions
 */

interface EmailTemplate {
  subject: string;
  body: string;
}

/**
 * Génère un lien mailto avec sujet et corps pré-remplis
 */
export const createMailtoLink = (
  to: string,
  subject: string,
  body: string
): string => {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${to}?${params.toString()}`;
};

/**
 * Templates d'emails pour différents types d'interactions
 */
export const emailTemplates = {
  firstContact: (entrepriseName: string): EmailTemplate => ({
    subject: `Prise de contact - ${entrepriseName}`,
    body: `Bonjour,

Je me permets de vous contacter concernant votre activité chez ${entrepriseName}.

J'aimerais échanger avec vous sur les opportunités de collaboration.

Seriez-vous disponible pour un échange téléphonique cette semaine ?

Cordialement,`,
  }),

  followUp: (entrepriseName: string): EmailTemplate => ({
    subject: `Suite à notre échange - ${entrepriseName}`,
    body: `Bonjour,

Suite à notre dernier échange, je reviens vers vous concernant ${entrepriseName}.

J'aimerais faire le point avec vous sur les prochaines étapes.

Quand seriez-vous disponible pour un nouveau point ?

Cordialement,`,
  }),

  proposalSend: (entrepriseName: string): EmailTemplate => ({
    subject: `Proposition commerciale - ${entrepriseName}`,
    body: `Bonjour,

Comme convenu, vous trouverez ci-joint notre proposition commerciale pour ${entrepriseName}.

Je reste à votre disposition pour toute question ou précision.

N'hésitez pas à me contacter pour en discuter.

Cordialement,`,
  }),

  meetingConfirmation: (entrepriseName: string, date: string): EmailTemplate => ({
    subject: `Confirmation de rendez-vous - ${entrepriseName}`,
    body: `Bonjour,

Je vous confirme notre rendez-vous prévu le ${date} pour ${entrepriseName}.

Vous trouverez ci-joint l'invitation avec les détails.

À très bientôt,

Cordialement,`,
  }),
};

/**
 * Ouvre l'application email avec un template pré-rempli
 */
export const openEmailWithTemplate = (
  email: string,
  templateType: keyof typeof emailTemplates,
  entrepriseName: string,
  additionalData?: string
): void => {
  const template = emailTemplates[templateType](entrepriseName, additionalData || '');
  const mailtoLink = createMailtoLink(email, template.subject, template.body);
  window.open(mailtoLink, '_blank');
};

/**
 * Génère un fichier .ics pour ajouter un événement au calendrier
 */
export const generateICSFile = (
  title: string,
  description: string,
  location: string,
  startDate: Date,
  endDate: Date
): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PULSE CRM//FR',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Rendez-vous dans 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
};

/**
 * Télécharge un fichier .ics pour l'ajouter au calendrier
 */
export const downloadICSFile = (
  title: string,
  description: string,
  location: string,
  startDate: Date,
  endDate: Date
): void => {
  const icsContent = generateICSFile(title, description, location, startDate, endDate);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Crée un lien Google Calendar
 */
export const createGoogleCalendarLink = (
  title: string,
  description: string,
  location: string,
  startDate: Date,
  endDate: Date
): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location: location,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Ouvre Google Calendar pour créer un événement
 */
export const openGoogleCalendar = (
  title: string,
  description: string,
  location: string,
  startDate: Date,
  endDate: Date
): void => {
  const link = createGoogleCalendarLink(title, description, location, startDate, endDate);
  window.open(link, '_blank');
};
