import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
	vi.resetModules();
});

afterEach(() => {
	vi.doUnmock("ox-jsdoc");
	vi.doUnmock("@ox-jsdoc/wasm");
});

const nativeUnavailable = new Error("Native binding is unavailable");
const source = [
	'const 挨拶 = "こんにちは😀";',
	"/**",
	" * @example",
	" * ```ts @import.meta.vitest",
	' * expect(挨拶).toBe("こんにちは😀");',
	" * ```",
	" */",
].join("\n");

it("should prefer native and cache the parser without loading WASM", async () => {
	const parseBatch = vi.fn(() => ({ asts: [] }));
	const loadNative = vi.fn(() => ({ parseBatch }));
	const loadWasm = vi.fn(() => {
		throw new Error("WASM should not be loaded");
	});
	vi.doMock("ox-jsdoc", loadNative);
	vi.doMock("@ox-jsdoc/wasm", loadWasm);
	const { extractExamples } = await import("./jsdoc");
	await Promise.all([extractExamples([]), extractExamples([])]);
	expect(loadNative).toHaveBeenCalledTimes(1);
	expect(parseBatch).toHaveBeenCalledTimes(2);
	expect(loadWasm).not.toHaveBeenCalled();
});

it("should fall back to real WASM, initialize once, and free each result", async () => {
	vi.doMock("ox-jsdoc", () => {
		throw nativeUnavailable;
	});
	const wasm =
		await vi.importActual<typeof import("@ox-jsdoc/wasm")>("@ox-jsdoc/wasm");
	const initWasm = vi.fn(wasm.initWasm);
	const free = vi.fn();
	const parseBatch = vi.fn((items: Parameters<typeof wasm.parseBatch>[0]) => {
		const result = wasm.parseBatch(items);
		return {
			...result,
			free() {
				free();
				result.free();
			},
		};
	});
	vi.doMock("@ox-jsdoc/wasm", () => ({ ...wasm, initWasm, parseBatch }));
	const { transform } = await import("./typescript");
	const results = await Promise.all([
		transform(source, "one.ts"),
		transform(source, "two.ts"),
	]);
	for (const [i, result] of results.entries()) {
		expect(result).toMatchObject({
			code: expect.stringContaining(
				`import.meta.vitest.test("${i === 0 ? "one" : "two"}.ts#0", async () => {\nexpect(挨拶).toBe("こんにちは😀");`,
			),
		});
	}
	expect(initWasm).toHaveBeenCalledTimes(1);
	expect(parseBatch).toHaveBeenCalledTimes(2);
	expect(free).toHaveBeenCalledTimes(2);
});

it("should free WASM results even if reading the AST fails", async () => {
	vi.doMock("ox-jsdoc", () => {
		throw nativeUnavailable;
	});
	const free = vi.fn();
	const failure = new Error("Failed to read the AST");
	vi.doMock("@ox-jsdoc/wasm", () => ({
		initWasm: vi.fn(),
		parseBatch: () => ({
			asts: [
				{
					get tags() {
						throw failure;
					},
				},
			],
			free,
		}),
	}));
	const { extractExamples } = await import("./jsdoc");
	await expect(extractExamples([])).rejects.toBe(failure);
	expect(free).toHaveBeenCalledTimes(1);
});

it("should explain how to install the missing optional peer and retain both causes", async () => {
	const wasmUnavailable = new Error("Cannot find package '@ox-jsdoc/wasm'");
	vi.doMock("ox-jsdoc", () => {
		throw nativeUnavailable;
	});
	vi.doMock("@ox-jsdoc/wasm", () => {
		throw wasmUnavailable;
	});
	const { extractExamples } = await import("./jsdoc");
	await expect(extractExamples([])).rejects.toMatchObject({
		message: expect.stringContaining(
			"npm install --save-dev @ox-jsdoc/wasm@0.0.19",
		),
		cause: expect.objectContaining({
			errors: [
				expect.objectContaining({ cause: nativeUnavailable }),
				expect.objectContaining({ cause: wasmUnavailable }),
			],
		}),
	});
});

it("should skip loading either parser for source without JSDoc", async () => {
	const loadNative = vi.fn(() => {
		throw nativeUnavailable;
	});
	vi.doMock("ox-jsdoc", loadNative);
	const { transform } = await import("./typescript");
	await expect(
		transform("export const value = 1;", "example.ts"),
	).resolves.toBe("export const value = 1;");
	expect(loadNative).not.toHaveBeenCalled();
});
