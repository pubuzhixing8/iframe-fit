export function createTimeout(callback: () => void, delay = 5000): () => void {
  const id = window.setTimeout(callback, delay)
  return () => window.clearTimeout(id)
}
