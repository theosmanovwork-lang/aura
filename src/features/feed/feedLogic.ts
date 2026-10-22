export type ViewableItem = { index?: number | null; isViewable: boolean };

/** Index of the video that is on screen now, or null if none is. */
export function pickActiveIndex(items: readonly ViewableItem[]): number | null {
  const visible = items.find((item) => item.isViewable && item.index != null);
  return visible ? (visible.index as number) : null;
}
