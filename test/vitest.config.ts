import { doctest } from "vite-plugin-doctest";
import Inspect from "vite-plugin-inspect";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [Inspect({ build: true, outputDir: ".vite-inspect" }), doctest({ markdownSetup: 'import { sub } from "./sub";\n' })],
	test: {
		includeSource: ["./src/**/*.[jt]s", "./src/**/*.md"],
		reporters: ["json"],
		outputFile: { json: "test-results.json" },
	},
});
