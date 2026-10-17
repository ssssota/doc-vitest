import MagicString from "magic-string";
import { parseSync } from "oxc-parser";
import { extractExamples } from "./jsdoc";
import { extractCode, vitestExports } from "./utils";
export async function transform(code: string, id: string) {
	const comments = parseSync(id, code).comments.flatMap((comment) => {
		if (comment.type !== "Block" || !comment.value.startsWith("*")) return [];
		return [{ sourceText: code.slice(comment.start, comment.end) }];
	});
	if (comments.length === 0) return code;

	const tests = (await extractExamples(comments)).flatMap(extractCode);
	if (tests.length === 0) return code;

	const s = new MagicString(code);
	s.append(
		[
			"\nif (import.meta.vitest) {",
			`const {${vitestExports.join(",")}} = import.meta.vitest;`,
			...tests.flatMap(({ code, name }, i) => {
				const testName = JSON.stringify(name || `${id}#${i}`);
				return [
					`import.meta.vitest.test(${testName}, async () => {`,
					code,
					"});",
				];
			}),
			"}",
		].join("\n"),
	);

	return {
		code: s.toString(),
		map: s.generateMap({ hires: true, source: id }),
	};
}
