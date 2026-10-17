import { RemoteJsdocTag, RemoteJsdocTagName } from "@ox-jsdoc/decoder";
import type { BatchItem, BatchParseResult } from "ox-jsdoc";

type BatchParser = (
	items: BatchItem[],
) => BatchParseResult & { free?: () => void };

let parser: Promise<BatchParser> | undefined;

async function loadParser(): Promise<BatchParser> {
	try {
		return (await import("ox-jsdoc")).parseBatch;
	} catch (nativeError) {
		try {
			const wasm = await import("@ox-jsdoc/wasm");
			await wasm.initWasm();
			return wasm.parseBatch;
		} catch (wasmError) {
			throw new Error(
				"Unable to load the ox-jsdoc native or WASM parser. " +
					"On platforms without native bindings, install the optional peer dependency: " +
					"npm install --save-dev @ox-jsdoc/wasm@0.0.19",
				{ cause: new AggregateError([nativeError, wasmError]) },
			);
		}
	}
}

export async function extractExamples(items: BatchItem[]): Promise<string[]> {
	parser ??= loadParser();
	const parseBatch = await parser;
	const jsDocs = parseBatch(items);
	try {
		return jsDocs.asts.flatMap((jsDoc) =>
			(jsDoc?.tags ?? []).flatMap((tag) => {
				if (!(tag instanceof RemoteJsdocTag)) return [];
				const name = tag.tag;
				if (!(name instanceof RemoteJsdocTagName) || name.value !== "example") {
					return [];
				}
				// descriptionText() treats the opening code fence as a tag name value.
				// rawBody retains the complete example, including code indentation.
				return tag.rawBody == null ? [] : [tag.rawBody];
			}),
		);
	} finally {
		jsDocs.free?.();
	}
}
