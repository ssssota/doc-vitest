# vite-plugin-doctest

When code blocks in JSDoc comments or Markdown contain a specific marker, the plugin converts them into the [in-source testing](https://vitest.dev/guide/in-source.html) format so they can be run as tests with Vitest.

## Transformation Example

````typescript
/**
 * @example
 * ```ts @import.meta.vitest
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export function add(a: number, b: number) {
  return a + b;
}
````

↓

````typescript
/**
 * @example
 * ```ts @import.meta.vitest
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export function add(a: number, b: number) {
  return a + b;
}

if (import.meta.vitest) {
const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
import.meta.vitest.test("...", async () => {
expect(add(1, 2)).toBe(3);
});
}
````
