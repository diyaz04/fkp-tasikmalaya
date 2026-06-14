/**
 * Formats a phone number for use in a WhatsApp wa.me link.
 * Removes all non-numeric characters and converts local format (08xxx)
 * to international format (628xxx) for Indonesia.
 */
export function getWhatsAppLink(phone: string, text?: string): string {
  if (!phone) return '#';
  
  // Remove all non-numeric characters (spaces, dashes, plus sign, etc.)
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Indonesian local format
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  
  const baseUrl = `https://wa.me/${cleaned}`;
  if (text) {
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  return baseUrl;
}
