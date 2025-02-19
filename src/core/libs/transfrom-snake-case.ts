export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function formatSortDirection(sortDirection: string) {
  return (sortDirection.toUpperCase() as unknown as 'ASC' | 'DESC') || 'ASC';
}
