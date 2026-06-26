/**
 * Fallback label for a reported key that has no display metadata (e.g. a
 * snapshot sent before the instance started shipping labels). Turns
 * `games.skill_suggestions` into `Games · Skill suggestions`.
 */
export function humanizeKey(key: string): string {
  return key
    .split('.')
    .map(part => {
      const words = part.replace(/_/g, ' ').trim()
      return words.charAt(0).toUpperCase() + words.slice(1)
    })
    .join(' · ')
}
