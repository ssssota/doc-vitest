import remarkParse from "remark-parse";
import { unified } from "unified";
import { EsbuildTransformOptions, transformWithEsbuild } from "vite";
import { buildTestBlock } from "./utils";

export const transform = async (code: string, id: string) => {
	const ast = unified().use(remarkParse).parse(code);
	const tests = await Promise.all(
		ast.children.map(async (node, i, arr) => {
			// skip if not code block
			if (node.type !== "code") return;
			const [lang, name] = (node.lang || "ts").split(":", 2);
			const prevNode = arr[i - 1];
			// skip if not test target
			if (
				!lang.match(/^([jt]sx?|javascript|typescript)$/) ||
				prevNode?.type !== "html" ||
				!prevNode.value.match(/^<!--\s*@import.meta.vitest\s*-->$/)
			)
				return;
			const transformResult = await transformWithEsbuild(
				node.value,
				`${id}?${i}`,
				{ loader: getLoaderFromLang(lang) },
			);
			return {
				name: name || `${id}#${i}`,
				code: transformResult.code,
			};
		}),
	);
	return buildTestBlock(id, tests);
};

function getLoaderFromLang(lang: string): EsbuildTransformOptions["loader"] {
	switch (lang) {
		case "ts":
		case "tsx":
		case "js":
		case "jsx":
			return lang;
		case "typescript":
			return "ts";
		case "javascript":
			return "js";
		default:
			return "ts";
	}
}
