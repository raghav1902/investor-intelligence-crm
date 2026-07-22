export function getWorkspaceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('workspaceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('workspaceId', id);
  }
  return id;
}
