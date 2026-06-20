/**
 * Sanitizes user-controlled URLs to prevent XSS attacks (e.g. javascript: / data: / vbscript:).
 * Allowed protocols: http://, https:// (and standard safe relative link '#').
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed === '#') return '#';

  const lower = trimmed.toLowerCase();

  // Explicitly block dangerous protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '#';
  }

  // Allow only http:// and https:// protocols
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }

  return '#'; // Fallback for any other custom protocols or invalid schemas
};
