export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function toDateInputValue(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return '';
  }
}

export function fromDateInputValue(value: string): string | undefined {
  if (!value) return undefined;
  return value; // Already in YYYY-MM-DD format
}



