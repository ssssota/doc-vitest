import MagicString from "magic-string";
import typescript from "typescript";
import { extractCode, vitestExports } from "./utils";
export function transform(code: string, id: string) {
	const node = typescript.createSourceFile(
		id,
		code,
		typescript.ScriptTarget.ESNext,
	);
	const jsDocs = findJSDoc(node);
	const tests = jsDocs.flatMap(extractTestComment).flatMap(extractCode);
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

function findJSDoc(node: typescript.Node): typescript.JSDoc[] {
	const nodes: typescript.JSDoc[] = [];
	// HACK: typescript.Node has no jsDoc property
	if ("jsDoc" in node && Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
		nodes.push(
			...node.jsDoc.flatMap((doc) => (typescript.isJSDoc(doc) ? [doc] : [])),
		);
	}
	node.forEachChild((child) => {
		nodes.push(...findJSDoc(child));
	});
	return nodes;
}

function extractTestComment(jsDoc: typescript.JSDoc): string[] {
	if (jsDoc.tags == null) return [];
	return jsDoc.tags.flatMap((tag) => {
		if (tag.comment == null) return [];
		const commentText =
			typeof tag.comment === "string"
				? tag.comment
				: tag.comment.map((c) => c.text).join("\n");
		if (tag.tagName.text === "example") {
			return [commentText];
		}
		return [];
	});
}
