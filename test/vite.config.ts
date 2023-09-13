import { doctest } from "vite-plugin-doctest";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [doctest()],
	test: {
		includeSource: ["./src/**/*.[jt]s", "./src/**/*.md"],
	},
});
