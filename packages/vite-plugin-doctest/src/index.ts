import type { PluginOption } from "vite";
import { markdown, typescript } from "./transformers";
import type { MarkdownTransformOptions } from "./transformers";

export type Options = {
	markdown?: MarkdownTransformOptions;
};

export const doctest = (options: Options = {}): PluginOption => {
	return {
		name: "vite-plugin-doctest",
		enforce: "pre",
		apply() {
			if (process.env.VITEST === "true") return true;
			return false;
		},
		transform(code, id) {
			if (id.match(/\.[cm]?[jt]sx?$/)) return typescript(code, id);
			if (id.match(/\.md$/)) return markdown(code, id, options.markdown);
		},
	};
};

export default doctest;
