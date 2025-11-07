export const config = {
  apiBaseUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://invoice-scan-pdf-dashboard-p7udb6itj-darkys-projects-1599475a.vercel.app/api'
      : '/api',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
