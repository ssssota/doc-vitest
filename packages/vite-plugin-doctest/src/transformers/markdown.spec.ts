import { expect, it } from "vitest";
import { transform } from "./markdown";

it("should generate testcode", async () => {
	const { code } = await transform(
		`~~~ts @import.meta.vitest
expect(1 + 1).toBe(2);
~~~
`,
		"add.ts",
		{ markdownSetup: "" },
	);

	expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts#0", async () => {
    expect(1 + 1).toBe(2);
    });
    }"
  `);
});

it("should generate testcode when file ends with closing code fence", async () => {
	const { code } = await transform(
		`~~~ts @import.meta.vitest
expect(1 + 1).toBe(2);
~~~`,
		"add.ts",
		{ markdownSetup: "" },
	);

	expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts#0", async () => {
    expect(1 + 1).toBe(2);
    });}"
  `);
});

it("should not include @import.meta.vitest in filename", async () => {
	const { code } = await transform(
		`~~~ts:add.ts@import.meta.vitest
expect(1 + 1).toBe(2);
~~~`,
		"add.ts",
		{ markdownSetup: "" },
	);

	expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts", async () => {
    expect(1 + 1).toBe(2);
    });}"
  `);
});
