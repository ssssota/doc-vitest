/**
 * @example
 * ```ts @import.meta.vitest
 * const { add } = await import('./add');
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export const sub = (a: number, b: number) => {
	/**
	 * @example
	 * ```ts @import.meta.vitest
	 * expect(sub(1, 2)).toBe(-1);
	 * ```
	 */

	return a - b;
};
