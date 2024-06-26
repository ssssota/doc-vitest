export const vitestExports = [
	// "afterAll", // lifecycle hooks are not supported
	// "afterEach", // lifecycle hooks are not supported
	"assert",
	// "assertType", // typechecks are not supported
	// "beforeAll", // lifecycle hooks are not supported
	// "beforeEach", // lifecycle hooks are not supported
	// "bench", // benchmarking is not supported
	"chai",
	"createExpect",
	// "describe", // suite is not supported
	"expect",
	// "expectTypeOf", // typechecks are not supported
	"getRunningMode",
	// "isFirstRun", // run-once feature is not supported
	"isWatchMode",
	// "it", // test is not supported
	// "onTestFailed", // lifecycle hooks are not supported
	// "runOnce", // run-once feature is not supported
	"should",
	// "suite", // suite is not supported
	// "test", // test is not supported
	"vi",
	"vitest",
];

type TestCode = {
	name?: string;
	code: string;
};

export function extractCode(md: string): TestCode[] {
	const matched = md.match(/```.+?\n.+?\n```/gs);
	if (matched == null) return [];
	return matched.flatMap((suggestion) => {
		const matched = suggestion.match(/```(.+?)\n(.+?)\n```/s) ?? [];
		const [, lang, code] = matched;
		if (!code) throw new Error("Unexpected blank code block");
		if (lang == null || !lang.includes("@import.meta.vitest")) return [];
		const name = lang.split(":", 2)[1]?.trim();
		return { name, code };
	});
}
