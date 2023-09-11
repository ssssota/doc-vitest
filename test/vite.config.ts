import { docutestPlugin } from "vite-plugin-doctest";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [docutestPlugin()],
	test: {
		includeSource: ["./src/**/*.ts"],
	},
});
