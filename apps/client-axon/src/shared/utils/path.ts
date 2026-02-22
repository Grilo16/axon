export const sanitizePath = (path: string): string => {
  // Convert all backslashes to forward slashes
  let sanitized = path.replace(/\\/g, '/');
  
  // Handle the "G:" case -> "G:/"
  if (/^[a-zA-Z]:$/.test(sanitized)) {
    sanitized += '/';
  }
  
  // Remove trailing slashes (unless it's a root drive like G:/)
  if (sanitized.length > 3 && sanitized.endsWith('/')) {
    sanitized = sanitized.slice(0, -1);
  }
  
  return sanitized;
};

export const getParentDir = (path: string): string => {
  const sanitized = sanitizePath(path);
  const parts = sanitized.split('/').filter(Boolean);
  
  if (parts.length <= 1) {
    // If we are at G:/, we can't go up further
    return sanitized.includes(':') ? `${parts[0]}/` : '/';
  }
  
  return parts.slice(0, -1).join('/') + (parts.length === 2 && sanitized.includes(':') ? '/' : '');
};