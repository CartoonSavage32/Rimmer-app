export const validateRequiredName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Timer name is required';
  }
  return null;
};


