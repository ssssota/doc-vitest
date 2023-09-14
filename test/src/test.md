<!-- @import.meta.vitest -->
```js
const add = (a, b) => a + b;
assert(add(1, 2) === 3);
```

<!-- @import.meta.vitest -->
```ts
const sub = (a: number, b: number) => a - b;
expect(sub(1, 2)).toBe(-1);
```

<!-- @import.meta.vitest -->
```js:dynamic import
const { mul } = await import('./mul.js');
assert(mul(1, 2) === 2);
```
