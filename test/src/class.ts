export class Foo {
	// biome-ignore-start lint/correctness/noUnusedPrivateClassMembers: for testing
	/** some note about this property */ // ← this causes the test discovery to fail
	private readonly bar: number = 3;
	// biome-ignore-end lint/correctness/noUnusedPrivateClassMembers: for testing

	/**
	 * @example
	 * ```ts @import.meta.vitest
	 * assert(true);
	 * ```
	 */
	public readonly baz = (): void => {};
}
