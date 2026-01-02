export const getSlug = (): string => {
  const hostName = window.location.hostname;
  const isDev = hostName.includes('localhost');

  if (isDev) {
    return 'lightwell';
  }

  const parts = hostName.split('.');
  return parts[0];
};