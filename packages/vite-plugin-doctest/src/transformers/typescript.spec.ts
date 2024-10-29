import { expect, it } from "vitest";
import { transform } from "./typescript";
const getCode = (maybeCode: string | { code: string }) =>
	typeof maybeCode === "string" ? maybeCode : maybeCode.code;
it("should generate test code", () => {
	expect(
		getCode(
			transform(
				`
/**
 * @example
 * \`\`\`ts @import.meta.vitest
 * expect(add(1, 2)).toBe(3);
 * \`\`\`
 */
export const add = (a: number, b: number) => a + b;`,
				"add.ts",
			),
		),
	).toMatchInlineSnapshot(`
		"
		/**
		 * @example
		 * \`\`\`ts @import.meta.vitest
		 * expect(add(1, 2)).toBe(3);
		 * \`\`\`
		 */
		export const add = (a: number, b: number) => a + b;
		if (import.meta.vitest) {
		const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
		import.meta.vitest.test("add.ts#0", async () => {
		expect(add(1, 2)).toBe(3);
		});
		}"
	`);

	expect(
		getCode(
			transform(
				`
/**
 * @example
 * \`\`\`ts @import.meta.vitest
 * const { add } = await import('./add');
 * expect(add(1, 2)).toBe(3);
 * \`\`\`
 */
export const sub = (a: number, b: number) => {
	/**
	 * @example
	 * \`\`\`ts @import.meta.vitest
	 * expect(sub(1, 2)).toBe(-1);
	 * \`\`\`
	 */

	return a - b;
};`,
				"sub.ts",
			),
		),
	).toMatchInlineSnapshot(`
		"
		/**
		 * @example
		 * \`\`\`ts @import.meta.vitest
		 * const { add } = await import('./add');
		 * expect(add(1, 2)).toBe(3);
		 * \`\`\`
		 */
		export const sub = (a: number, b: number) => {
			/**
			 * @example
			 * \`\`\`ts @import.meta.vitest
			 * expect(sub(1, 2)).toBe(-1);
			 * \`\`\`
			 */

			return a - b;
		};
		if (import.meta.vitest) {
		const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
		import.meta.vitest.test("sub.ts#0", async () => {
		const { add } = await import('./add');
		expect(add(1, 2)).toBe(3);
		});
		import.meta.vitest.test("sub.ts#1", async () => {
		expect(sub(1, 2)).toBe(-1);
		});
		}"
	`);

	expect(
		getCode(
			transform(
				`
/**
 * @example
 * \`\`\`ts @import.meta.vitest
 * const hoge = new Hoge();
 * assert(hoge instanceof Hoge);
 * \`\`\`
 */
class Hoge {
	internal = 1;
  /**
   * @example
   * \`\`\`ts @import.meta.vitest
   * const hoge = new Hoge();
   * expect(hoge.add(1)).toBe(2);
   * expect(hoge.add(2)).toBe(4);
   * \`\`\`
  add(num) {
    return this.internal += num;
  }
}`,
				"class.js",
			),
		),
	).toMatchInlineSnapshot(`
		"
		/**
		 * @example
		 * \`\`\`ts @import.meta.vitest
		 * const hoge = new Hoge();
		 * assert(hoge instanceof Hoge);
		 * \`\`\`
		 */
		class Hoge {
			internal = 1;
		  /**
		   * @example
		   * \`\`\`ts @import.meta.vitest
		   * const hoge = new Hoge();
		   * expect(hoge.add(1)).toBe(2);
		   * expect(hoge.add(2)).toBe(4);
		   * \`\`\`
		  add(num) {
		    return this.internal += num;
		  }
		}
		if (import.meta.vitest) {
		const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
		import.meta.vitest.test("class.js#0", async () => {
		const hoge = new Hoge();
		assert(hoge instanceof Hoge);
		});
		import.meta.vitest.test("class.js#1", async () => {
		const hoge = new Hoge();
		expect(hoge.add(1)).toBe(2);
		expect(hoge.add(2)).toBe(4);
		});
		}"
	`);
});
