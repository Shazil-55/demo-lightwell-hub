export const getSlug = (): string => {
  const hostName = window.location.hostname;
  const pathName = window.location.pathname;
  const isDev = hostName.includes('localhost');

  // Check if there's a slug in the URL path (e.g., /lightwell)
  const pathSlug = pathName.split('/').filter(Boolean)[0];
  if (pathSlug) {
    return pathSlug;
  }

  if (isDev) {
    return 'lightwell';
  }

  // Check if hostname contains "lightwell" (for Vercel deployments like demo-lightwell-hub.vercel.app)
  if (hostName.includes('lightwell')) {
    return 'lightwell';
  }

  // Check if hostname contains "neighbour"
  if (hostName.includes('neighbour')) {
    return 'neighbour';
  }

  // Fallback: try to extract from subdomain
  const parts = hostName.split('.');
  return parts[0];
};