/**
 * Fusion profonde pour surcharges EN : les tableaux d'objets avec `id` ou `slug`
 * sont fusionnés entrée par entrée (les champs manquants dans l'override gardent
 * ceux de la base — ex. `src` sur la galerie).
 */
export function mergeLocalizedConfig<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(override)) {
    if (!Array.isArray(base) || base.length === 0) return override as T;
    const merged = mergeArrayByKey(base as unknown[], override as unknown[]);
    return merged as T;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(override)) {
      out[key] = mergeLocalizedConfig(
        (base as Record<string, unknown>)[key],
        (override as Record<string, unknown>)[key],
      );
    }
    return out as T;
  }
  return override as T;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function mergeKey(item: unknown): string | null {
  if (!isPlainObject(item)) return null;
  if (typeof item.id === "string" && item.id) return item.id;
  if (typeof item.slug === "string" && item.slug) return `slug:${item.slug}`;
  return null;
}

function mergeArrayByKey(baseArr: unknown[], overrideArr: unknown[]): unknown[] {
  const firstKey = mergeKey(baseArr[0]);
  if (
    !firstKey ||
    !baseArr.every((x) => mergeKey(x) !== null) ||
    !overrideArr.every((x) => mergeKey(x) !== null)
  ) {
    return overrideArr.length ? overrideArr : baseArr;
  }

  const byKey = new Map<string, unknown>();
  for (const item of overrideArr) {
    const k = mergeKey(item);
    if (k) byKey.set(k, item);
  }

  return baseArr.map((baseItem) => {
    const k = mergeKey(baseItem);
    if (!k) return baseItem;
    const over = byKey.get(k);
    if (over === undefined) return baseItem;
    return mergeLocalizedConfig(baseItem, over);
  });
}
