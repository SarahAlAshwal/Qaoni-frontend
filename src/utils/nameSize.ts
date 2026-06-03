/** Tailwind text size for shop names in cards / small contexts */
export function shopNameSize(name: string): string {
  if (name.length <= 20) return "text-xl";
  if (name.length <= 35) return "text-lg";
  return "text-base";
}

/** Tailwind text size for shop names in full-width hero sections */
export function heroNameSize(name: string): string {
  if (name.length <= 20) return "text-3xl md:text-5xl";
  if (name.length <= 35) return "text-2xl md:text-4xl";
  return "text-xl md:text-3xl";
}
