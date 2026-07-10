/**
 * Shared certification status mapping.
 * Single source of truth consumed by both the public Certifications component
 * and the admin CertificationsManager so badge colours are always identical.
 *
 * Public portfolio  → uses certStatusClass (CSS class names in Certifications.css)
 * Admin panel       → uses certStatusBadge (CSS class names in admin-shared.css)
 */

export interface CertStatusStyle {
  /** CSS class for the public .cert-status pill (Certifications.css) */
  publicClass: string;
  /** CSS class(es) for the admin badge (admin-shared.css) */
  adminBadge: string;
}

const CERT_STATUS_MAP: Record<string, CertStatusStyle> = {
  'Completed':   { publicClass: 'status-completed', adminBadge: 'badge-success' },
  'In Progress': { publicClass: 'status-in-progress', adminBadge: 'badge-warning' },
  'Planned':     { publicClass: 'status-planned',    adminBadge: 'badge-info'    },
  'Future Goal': { publicClass: 'status-future',     adminBadge: 'badge-muted'   },
};

const CERT_STATUS_FALLBACK: CertStatusStyle = {
  publicClass: 'status-future',
  adminBadge: 'badge-muted',
};

export const getCertStatusStyle = (status: string): CertStatusStyle =>
  CERT_STATUS_MAP[status] ?? CERT_STATUS_FALLBACK;
