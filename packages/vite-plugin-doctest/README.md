# vite-plugin-doctest

Vitest plugin for doctest.
You can write test in your source code with documentation.

## Usage

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
