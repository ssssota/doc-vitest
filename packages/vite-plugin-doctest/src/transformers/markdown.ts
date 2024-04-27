import MagicString from "magic-string";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { transformWithEsbuild, type EsbuildTransformOptions } from "vite";
import { vitestExports } from "./utils";

export const transform = async (code: string, id: string) => {
	const ast = unified().use(remarkParse).parse(code);
	const s = new MagicString(code);

	let testCount = 0;
	const tests = await Promise.all(
		ast.children.map(async (node) => {
			// skip if not code block
			if (
				node.type !== "code" ||
				(!node.meta?.includes("@import.meta.vitest") &&
					!node.lang?.includes("@import.meta.vitest"))
			)
				return;
			const [lang, name] = (node.lang || "ts").split(":", 2);
			const testNumber = testCount++;
			const transformResult = await transformWithEsbuild(
				node.value,
				`${id}?${testNumber}`,
				{ loader: getLoaderFromLang(lang) },
			);
			return {
				name: name || `${id}#${testNumber}`,
				code: transformResult.code,
				position: node.position,
			};
		}),
	);

	let lineCursor = 1;
	for (const test of tests) {
		if (!test) continue;
		const line = test.position?.start?.line ?? lineCursor;
		for (let l = lineCursor; l < line; l++) {
			// comment out lines before test block
			s.appendLeft(getIndexOfLine(code, l), "//");
		}
		lineCursor = line + 1;
		// '```js' -> 'import.meta.vitest.test(...'
		const rangeOfCodeBlockStartPos = getRangeOfLine(code, line);
		s.update(
			...rangeOfCodeBlockStartPos,
			`import.meta.vitest.test(${JSON.stringify(test.name)}, async () => {`,
		);
		lineCursor = test.position?.end?.line ?? lineCursor;
		// '```' -> '});'
		const rangeOfCodeBlockEndPos = getRangeOfLine(code, lineCursor);
		s.update(...rangeOfCodeBlockEndPos, "});");
		lineCursor++;
		// source code -> transpiled code
		s.update(
			rangeOfCodeBlockStartPos[1] + 1,
			rangeOfCodeBlockEndPos[0],
			test.code,
		);
	}
	for (let l = lineCursor; l <= detectLine(code, code.length - 1); l++) {
		// comment out lines after test block
		s.appendLeft(getIndexOfLine(code, l), "//");
	}

	s.prepend(`\
if (import.meta.vitest) {
const {${vitestExports.join(",")}} = import.meta.vitest;\n`);
	s.append("}");
	return {
		code: s.toString(),
		map: s.generateMap({ hires: true, source: id }),
	};
};

function getLoaderFromLang(lang: string): EsbuildTransformOptions["loader"] {
	switch (lang.toLowerCase()) {
		case "ts":
		case "typescript":
			return "ts";
		case "tsx":
			return "tsx";
		case "js":
		case "javascript":
			return "js";
		case "jsx":
			return "jsx";
		default:
			return "ts";
	}
}

function detectLine(code: string, index: number): number {
	let line = 1;
	for (let i = 0; i < index; i++) {
		if (code[i] === "\n") line++;
	}
	return line;
}

function getIndexOfLine(code: string, line: number): number {
	let index = 0;
	for (let i = 1; i < line; i++) {
		index = code.indexOf("\n", index) + 1;
	}
	return index;
}

function getRangeOfLine(code: string, line: number): [number, number] {
	const start = getIndexOfLine(code, line);
	const end = code.indexOf("\n", start);
	return [start, end];
}
