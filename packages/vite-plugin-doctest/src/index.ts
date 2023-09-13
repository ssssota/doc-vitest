import type { Plugin } from "vite";
import { typescript } from "./transformers";

type Options = {};
export const doctest = (_options: Options = {}): Plugin => {
	return {
		name: "vite-plugin-doctest",
		enforce: "pre",
		transform(code, id) {
			if (process.env.VITEST !== "true") return code;
			if (id.match(/\.[cm]?[jt]sx?$/)) return typescript(code, id);
		},
	};
};

export default doctest;
