export const config = {
  // In production, point to the canonical production domain so the client
  // and API are same-origin. This avoids cross-site preview auth issues.
  apiBaseUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://invoice-scan-pdf-dashboard.vercel.app/api'
      : '/api',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
