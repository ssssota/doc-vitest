/**
 * @import.meta.vitest
 * ```ts
 * const { add } = await import('./add');
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export const sub = (a: number, b: number) => {
	/**
	 * @import.meta.vitest
	 * ```ts
	 * expect(sub(1, 2)).toBe(-1);
	 * ```
	 */

	return a - b;
};
