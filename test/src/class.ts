export class Foo {
	/** some note about this property */ // ← this causes the test discovery to fail
	private readonly bar: number = 3;

	/**
	 * @import.meta.vitest
	 * ```ts
	 * assert(true);
	 * ```
	 */
	public readonly baz = (): void => {};
}
