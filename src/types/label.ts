export type LabelColor = 'red' | 'amber' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'

export const LABEL_COLORS: LabelColor[] = ['red', 'amber', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink']
export const DEFAULT_LABEL_COLOR: LabelColor = 'red'

export interface Label {
  id: string
  user_id: string
  name: string
  color: LabelColor
  created_at: string
}

// Same visual recipe as the priority/due-date badges in TaskCard.vue
// (bg-{color}-500/15 text-{color}-700), extended across the swatch palette.
export const labelColorStyles: Record<LabelColor, string> = {
  red: 'bg-red-500/15 text-red-700 dark:text-red-400',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  green: 'bg-green-500/15 text-green-700 dark:text-green-400',
  teal: 'bg-teal-500/15 text-teal-700 dark:text-teal-400',
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  indigo: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  pink: 'bg-pink-500/15 text-pink-700 dark:text-pink-400',
}

// Solid swatch dots for the color picker (checkbox rows / new-label swatch grid).
export const labelSwatchStyles: Record<LabelColor, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
}
