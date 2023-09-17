# test

## @import.meta.vitest

`@import.meta.vitest` is a special comment that will be tested.

<!-- @import.meta.vitest -->
```js
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

<!-- @import.meta.vitest -->
```ts
const add = (a: number, b: number) => a + b;
expect(add(1, 2)).toBe(3);
```

## External files

You can also import external files via dynamic import.

<!-- @import.meta.vitest -->
```js
const { add } = await import("./add");
assert(add(1, 2) === 34);
```

## Constraints

<!-- @import.meta.vitest -->
`inline code` is not supported.
