export function isOriginAllowed(origin: string, checkOrigin: boolean | string[]): boolean {
  if (checkOrigin === false) return true
  if (checkOrigin === true) return true
  return checkOrigin.includes(origin)
}
