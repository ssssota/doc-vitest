import { parse } from "@babel/parser";
import MagicString from "magic-string";
import typescript from "typescript";
import type { Plugin } from "vite";

const vitestExports = [
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

type Options = {};
export const doctest = (_options: Options = {}): Plugin => {
	return {
		name: "vite-plugin-doctest",
		enforce: "pre",
		transform(code, id) {
			if (process.env.VITEST !== "true") return code;
			if (!id.match(/\.[cm]?[jt]sx?$/)) return code;

			const comments =
				parse(code, {
					plugins: id.match(/\.[cm]?tsx?$/) ? ["typescript"] : [],
					sourceType: "module",
				}).comments ?? [];
			const tests = comments
				.filter((c) => c.type === "CommentBlock" && c.value.startsWith("*"))
				.flatMap((c) => extractTestComment(c.value))
				.flatMap(extractCode);

			// const node = typescript.createSourceFile(
			// 	id,
			// 	code,
			// 	typescript.ScriptTarget.ESNext,
			// );
			// const jsDocs = findJSDoc(node);
			// const tests = jsDocs
			// 	.flatMap(extractTestComment)
			// 	.flatMap(extractCode);
			if (tests.length === 0) return code;

			const s = new MagicString(code);
			s.append(
				[
					"\nif (import.meta.vitest) {",
					`const {${vitestExports.join(",")}} = import.meta.vitest;`,
					...tests.flatMap(({ code, name }, i) => {
						return [
							`test(${JSON.stringify(name || `${id}#${i}`)}, async () => {`,
							code,
							"});",
						];
					}),
					"}",
				].join("\n"),
			);
			console.log(s.toString());

			return {
				code: s.toString(),
				map: s.generateMap({ hires: true, source: id }),
			};
		},
	};
};

export default doctest;

function findJSDoc(node: typescript.Node): typescript.JSDoc[] {
	const nodes: typescript.JSDoc[] = [];
	// HACK: typescript.Node has no jsDoc property
	if ("jsDoc" in node && Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
		nodes.push(
			...node.jsDoc.flatMap((doc) => (typescript.isJSDoc(doc) ? [doc] : [])),
		);
	}
	node.forEachChild((child) => nodes.push(...findJSDoc(child)));
	return nodes;
}

function extractTestComment(jsDoc: typescript.JSDoc | string): string[] {
	if (typeof jsDoc === "string") {
		const testTagMatcher = /^import\.meta\.vitest\b/;
		if (!jsDoc.startsWith("*")) return [];
		const tags = jsDoc.replace(/^[ \t]*\*[ \t]*/gm, "").split(/\n@/g).slice(1);
		const testTags = tags.filter((tag) => tag.match(testTagMatcher));
		return testTags.map((tagComment) => tagComment.replace(testTagMatcher, ""));
	}
	return (
		jsDoc.tags?.flatMap((tag) => {
			if (tag.comment == null) return [];
			const commentText =
				typeof tag.comment === "string"
					? tag.comment
					: tag.comment.map((c) => c.text).join("\n");
			// tagName should be `import.meta.vitest`. But it splits into `import` and `.meta.vitest`.
			if (
				tag.tagName.text === "import" &&
				commentText.startsWith(".meta.vitest")
			) {
				return [commentText];
			}
			return [];
		}) ?? []
	);
}

type TestCode = {
	name?: string;
	code: string;
};
function extractCode(md: string): TestCode[] {
	const matched = md.match(/```.*?\n.+?\n```/gs);
	if (matched == null) return [];
	return matched.map((suggestion) => {
		const matched = suggestion.match(/```(.*?)\n(.+?)\n```/s) ?? [];
		const [, lang, code] = matched;
		if (!code) throw new Error("Unexpected blank code block");
		if (lang == null) return { code };
		const name = lang.split(":")[1]?.trim();
		return { name, code };
	});
}
