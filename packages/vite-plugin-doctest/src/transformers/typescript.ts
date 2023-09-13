import { parse } from "@babel/parser";
import MagicString from "magic-string";
import { extractCode, extractTestComment, vitestExports } from "./utils";

export function transform(code: string, id: string) {
	const comments =
		parse(code, {
			plugins: id.match(/\.[cm]?tsx?$/) ? ["typescript"] : [],
			sourceType: "module",
		}).comments ?? [];
	const tests = comments
		.filter((c) => c.type === "CommentBlock" && c.value.startsWith("*"))
		.flatMap((c) => extractTestComment(c.value))
		.flatMap(extractCode);
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
