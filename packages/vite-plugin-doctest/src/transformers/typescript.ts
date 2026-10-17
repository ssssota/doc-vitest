import { RemoteJsdocTag, RemoteJsdocTagName } from "@ox-jsdoc/decoder";
import MagicString from "magic-string";
import { parseBatch } from "ox-jsdoc";
import { parseSync } from "oxc-parser";
import { extractCode, vitestExports } from "./utils";
export function transform(code: string, id: string) {
	const comments = parseSync(id, code).comments.flatMap((comment) => {
		if (comment.type !== "Block" || !comment.value.startsWith("*")) return [];
		return [{ sourceText: code.slice(comment.start, comment.end) }];
	});
	if (comments.length === 0) return code;

	const jsDocs = parseBatch(comments);
	const tests = jsDocs.asts.flatMap((jsDoc) =>
		(jsDoc?.tags ?? []).flatMap((tag) => {
			if (!(tag instanceof RemoteJsdocTag)) return [];
			const name = tag.tag;
			if (!(name instanceof RemoteJsdocTagName) || name.value !== "example") {
				return [];
			}
			// descriptionText() treats the opening code fence as a tag name value.
			// rawBody retains the complete example, including code indentation.
			return extractCode(tag.rawBody ?? "");
		}),
	);
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
