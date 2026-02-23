# test

## @import.meta.vitest

`@import.meta.vitest` is a special marker that will be tested.

```js @import.meta.vitest
const add = (a, b) => a + b;
assert(add(1, 2) === 3);
assert(add(0, 0) === 0);
assert(add(-1, -1) === -2);
assert(add(-1, 1) === 0);
```

This code will not be tested.

```ts
const add = (a: number, b: number) => a + b;
assert(add(1, 2) === 3);
```

## Languages

The plugin supports the following languages:

- JavaScript (includes js,jsx)
- TypeScript (includes ts,tsx)

```ts:add@import.meta.vitest
const add = (a: number, b: number) => a + b;
expect(add(1, 2)).toBe(3);
```

## External files

You can also import external files via dynamic import.

```js @import.meta.vitest
const { add } = await import("./add");
assert(add(1, 2) === 3);
```

Or via a static import in the `markdownSetup` option:

```js @import.meta.vitest
// `sub` import is declared in vitest.config.ts
assert(sub(2, 1) === 1);
```

## Constraints

`inline code` is not supported.
