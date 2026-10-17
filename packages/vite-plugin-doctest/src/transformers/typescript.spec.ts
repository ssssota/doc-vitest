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
   */
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
		   */
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

const example = (body: string, info = "ts @import.meta.vitest") =>
	[
		"/**",
		" * @example",
		` * \`\`\`${info}`,
		...body.split("\n").map((line) => ` * ${line}`),
		" * ```",
		" */",
	].join("\n");

it.each([
	["example.ts", "export const value: number = 1;"],
	["example.mts", "export const value: number = 1;"],
	["example.cts", "const value: number = 1; export = value;"],
	["example.js", "export const value = 1;"],
	["example.mjs", "export const value = 1;"],
	["example.cjs", "module.exports = 1;"],
	["example.jsx", "export const value = <div />;"],
	["example.tsx", "export const value = <div /> satisfies unknown;"],
])("should parse documentation in %s", (id, declaration) => {
	const source = `${example("expect(true).toBe(true);")}\n${declaration}`;
	const result = getCode(transform(source, id));
	expect(result.startsWith(source)).toBe(true);
	expect(result.slice(source.length)).toContain(
		`import.meta.vitest.test("${id}#0", async () => {\nexpect(true).toBe(true);\n});`,
	);
});

it("should preserve code indentation, blank lines, and inline JSDoc links", () => {
	const body = [
		"const text = `first",
		"",
		"  third {@link value}`;",
		"if (text) {",
		'  expect(text).toContain("  third {@link value}");',
		"}",
	].join("\n");
	const source = `${example(body)}\nexport const value = 1;`;
	expect(
		getCode(transform(source, "example.ts")).slice(source.length),
	).toContain(body);
});

it("should preserve Unicode before comments and in test names", () => {
	const body = 'expect(挨拶).toBe("こんにちは😀");';
	const source = `const 挨拶 = "こんにちは😀";\n${example(body, "ts @import.meta.vitest:日本語😀")}`;
	const generated = getCode(transform(source, "日本語.ts")).slice(
		source.length,
	);
	expect(generated).toContain(
		'import.meta.vitest.test("日本語😀", async () => {',
	);
	expect(generated).toContain(body);
});

it("should handle CRLF comments", () => {
	const source =
		`${example("expect(1).toBe(1);")}\nexport const value = 1;`.replace(
			/\n/g,
			"\r\n",
		);
	expect(
		getCode(transform(source, "example.ts")).slice(source.length),
	).toContain("expect(1).toBe(1);");
});

it("should extract multiple examples and blocks in source order", () => {
	const first = example("expect(1).toBe(1);", "ts @import.meta.vitest:first");
	const second = example("expect(2).toBe(2);").replace("/**\n", "");
	const source = [
		first.replace(" */", ` * @returns A number\n * @example\n */`),
		"export function value() { return 1; }",
		"const object = {",
		first.replace("@import.meta.vitest:first", "@import.meta.vitest:second"),
		"method() { return 1; },",
		"};",
		`/**\n * @example A caption\n * \`\`\`ts @import.meta.vitest:third\n * expect(3).toBe(3);\n * \`\`\`\n${second}`,
		"export const final = 2;",
	].join("\n");
	const generated = getCode(transform(source, "example.ts")).slice(
		source.length,
	);
	const names = [
		...generated.matchAll(/import\.meta\.vitest\.test\("([^"]+)"/g),
	].map((match) => match[1]);
	expect(names).toEqual(["first", "second", "third", "example.ts#3"]);
	expect(generated).toContain("expect(2).toBe(2);");
	expect(generated).toContain("expect(3).toBe(3);");
});

it("should keep lines starting with @ inside a code fence", () => {
	const body = "@decorate\nclass Example {}\nexpect(Example).toBeDefined();";
	const source = `${example(body)}\nexport const decorate = () => {};`;
	expect(
		getCode(transform(source, "example.ts")).slice(source.length),
	).toContain(body);
});

it.each([
	"export const value = 1;",
	example("expect(1).toBe(1);").replace("/**", "/*"),
	example("expect(1).toBe(1);").replace("@example", "@description"),
	example("expect(1).toBe(1);", "ts"),
	"/** @example */\nexport const value = 1;",
	`export const value = ${JSON.stringify(example("expect(1).toBe(1);"))};`,
	`export const value = \`${example("expect(1).toBe(1);").replaceAll("`", "\\`")}\`;`,
	`// ${JSON.stringify(example("expect(1).toBe(1);"))}`,
	String.raw`const pattern = /\/\*\* @example/;`,
])(
	"should leave source without documentation tests unchanged (%#)",
	(source) => {
		expect(transform(source, "example.ts")).toBe(source);
	},
);
