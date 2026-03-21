import type { PluginOption, EsbuildTransformOptions } from "vite";
import { markdown, typescript } from "./transformers";

export type Options = { markdownSetup?: string, esbuildTarget?: EsbuildTransformOptions["target"] };
export const doctest = (options: Options = {}): PluginOption => {
	return {
		name: "vite-plugin-doctest",
		enforce: "pre",
		transform(code, id) {
			if (process.env.VITEST !== "true") return code;
			if (id.match(/\.[cm]?[jt]sx?$/)) return typescript(code, id);
			if (id.match(/\.md$/))
				return markdown(code, id, {
					markdownSetup: options.markdownSetup ?? "",
					esbuildTarget: options.esbuildTarget ?? "node25"
				});
		},
	};
};

export default doctest;
