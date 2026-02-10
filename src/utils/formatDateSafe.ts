import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Parse une chaîne date (YYYY-MM-DD, DD/MM/YYYY, ou ISO) en Date.
 * Retourne null si invalide.
 */
function parseDateSafe(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const str = String(value).trim();
  if (str === '') return null;

  // Déjà au format ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // Format DD/MM/YYYY (français)
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback: new Date(str)
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formate une date de manière sûre pour l'affichage.
 * Retourne une chaîne vide si la date est invalide.
 */
export function formatDateSafe(
  dateStr: string | null | undefined,
  formatStr: string = 'dd MMM yyyy'
): string {
  const date = parseDateSafe(dateStr);
  if (!date) return '';
  try {
    return format(date, formatStr, { locale: fr });
  } catch {
    return '';
  }
}

/**
 * Pour affichage "Créé le DD MMM YYYY"
 */
export function formatDateCreation(dateStr: string | null | undefined): string {
  return formatDateSafe(dateStr, 'dd MMM yyyy');
}
