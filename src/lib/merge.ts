export function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined || patch === null) {
    return base;
  }
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }
  if (typeof base !== "object") {
    return patch as T;
  }
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    return patch as T;
  }

  const out: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  const p = patch as Record<string, unknown>;

  for (const key of Object.keys(p)) {
    const pv = p[key];
    /* null / undefined : on ne remplace pas la base (évite localStorage corrompu) */
    if (pv === undefined || pv === null) {
      continue;
    }
    const bv = out[key];
    if (
      bv &&
      typeof bv === "object" &&
      !Array.isArray(bv) &&
      typeof pv === "object" &&
      pv !== null &&
      !Array.isArray(pv)
    ) {
      out[key] = deepMerge(bv as object, pv);
    } else {
      out[key] = pv;
    }
  }

  return out as T;
}
