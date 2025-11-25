export const environment = {
  production: true,
  apiUrl: window.location.origin.includes('localhost')
    ? 'http://localhost:8085/api'
    : (typeof (window as any).__env !== 'undefined' && (window as any).__env.apiUrl)
      ? (window as any).__env.apiUrl
      : '/api',
  tenantId: '' // Will be set dynamically or from localStorage
};
