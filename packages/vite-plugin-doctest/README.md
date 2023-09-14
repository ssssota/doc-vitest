# vite-plugin-doctest

Vitest plugin for doctest.
You can write test in your source code with documentation.

## Usage

```ts
/**
 * @import.meta.vitest
 * ```ts
 * expect(add(1, 2)).toBe(3);
 * assert(add(3, 4) === 7);
 * ```
 */
export function add(a: number, b: number) {
  return a + b;
}
```

````markdown
# Test

<!-- @import.meta.vitest -->
```ts
const { add } = await import('./add');
expect(add(1, 2)).toBe(3);
```
````

## Setup

```sh
npm i -D vitest vite-plugin-doctest
```

```ts
// vitest.config.ts or vite.config.ts (js)
import { defineConfig } from 'vitest/config'; // or `import { defineConfig } from 'vite';`
import { doctest } from 'vite-plugin-doctest';
export default defineConfig({
  plugins: [doctest({ /* options */ })],
  test: { includeSource: ['./src/**/*.[jt]s?(x)'] },
});
```

```sh
npx vitest
```

### Options

Currently, there is no option.

```ts
type Options = {}
```

## How it works

This plugin will transform your documentation tests.

This transformation occurs only when you start Vitest.
So, you don't need to worry about the performance of your production code.

```ts
/**
 * @import.meta.vitest
 * ```ts
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export function add(a: number, b: number) {
  return a + b;
}
```

↓

```ts
/**
 * @import.meta.vitest
 * ```ts:1+2=3
 * expect(add(1, 2)).toBe(3);
 * ```
 */
export function add(a: number, b: number) {
  return a + b;
}

if (import.meta.vitest) {
const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
import.meta.vitest.test("1+2=3", async () => {
expect(add(1, 2)).toBe(3);
});
}
```

### Constraints

This plugin has some constraints.

- You cannot use typechecks. (e.g. `expectTypeOf`, `assertType`, etc...)
- You cannot use lifecycle hooks. (e.g. `beforeEach`, `afterAll`, etc...)
- Currently you cannot use `import` statement in your test code. (You can use dynamic import)
- and more... (Please make an issue if you find it)

## Related

- [Vitest](https://vitest.dev)
- [power-doctest](https://github.com/azu/power-doctest)

## License

MIT License
