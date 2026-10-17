import assert from "node:assert/strict";
import { registerHooks } from "node:module";

const withoutWasm = process.argv.includes("--without-wasm");
let nativeAttempts = 0;
let wasmAttempts = 0;

// Exercise the built plugin's fallback even on hosts with a native binding.
registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === "ox-jsdoc") {
			nativeAttempts++;
			throw new Error("Native binding unavailable for this test");
		}
		if (specifier === "@ox-jsdoc/wasm") {
			wasmAttempts++;
			if (withoutWasm) throw new Error("Optional WASM peer is not installed");
		}
		return nextResolve(specifier, context);
	},
});

const { doctest } = await import("vite-plugin-doctest");
const plugin = doctest();
assert.equal(
	nativeAttempts,
	0,
	"Parser must not load when importing the plugin",
);
const source = [
	'const 挨拶 = "こんにちは😀";',
	"/**",
	" * @example",
	" * ```ts @import.meta.vitest",
	' * expect(挨拶).toBe("こんにちは😀");',
	" * ```",
	" */",
].join("\n");

if (withoutWasm) {
	await assert.rejects(plugin.transform(source, "example.ts"), {
		message: /npm install --save-dev @ox-jsdoc\/wasm@0\.0\.19/,
	});
} else {
	const result = await plugin.transform(source, "example.ts");
	assert.ok(result.code.startsWith(source));
	assert.ok(
		result.code
			.slice(source.length)
			.includes(
				'import.meta.vitest.test("example.ts#0", async () => {\n' +
					'expect(挨拶).toBe("こんにちは😀");',
			),
	);
}

assert.equal(nativeAttempts, 1);
assert.ok(wasmAttempts > 0);
console.log(
	withoutWasm ? "Missing WASM peer error verified" : "WASM fallback verified",
);
