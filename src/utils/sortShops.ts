export type ShopSortOption = "discover" | "az" | "za";

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export function sortShops<T extends { id: string; name: string }>(
  items: T[],
  sortBy: ShopSortOption
): T[] {
  if (sortBy === "az") return [...items].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "za") return [...items].sort((a, b) => b.name.localeCompare(a.name));

  // Discover: consistent within a day, rotates each day
  const seed = new Date().toISOString().slice(0, 10);
  return [...items].sort(
    (a, b) => hashString(`${seed}:${a.id}`) - hashString(`${seed}:${b.id}`)
  );
}
