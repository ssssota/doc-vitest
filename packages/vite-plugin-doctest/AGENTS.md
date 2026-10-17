# vite-plugin-doctest

JSDocやMarkdownのコードブロックに特定のマーカーが含まれていた場合、[In-source testing](https://vitest.dev/guide/in-source.html)の形式に変換してVitestでテスト実行可能にする。

## 変換例

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
