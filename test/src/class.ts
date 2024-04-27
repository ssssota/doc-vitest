export class Foo {
	/** some note about this property */ // ← this causes the test discovery to fail
	private readonly bar: number = 3;

	/**
	 * @example
	 * ```ts @import.meta.vitest
	 * assert(true);
	 * ```
	 */
	public readonly baz = (): void => {};
}
