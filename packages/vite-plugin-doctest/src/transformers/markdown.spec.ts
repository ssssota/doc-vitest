import { expect, it } from "vitest";
import { transform } from "./markdown";

it("should generate testcode", async () => {
  const { code } = await transform(
    `~~~ts @import.meta.vitest
expect(1 + 1).toBe(2);
~~~
`,
    "add.ts",
    { markdownSetup: "", esbuildTarget: "node25" },
  );

  expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts#0", async () => {
    expect(1 + 1).toBe(2);
    });
    
    }"
  `);
});

it("should generate testcode when file ends with closing code fence", async () => {
  const { code } = await transform(
    `~~~ts @import.meta.vitest
expect(1 + 1).toBe(2);
~~~`,
    "add.ts",
    { markdownSetup: "", esbuildTarget: "node25" },
  );

  expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts#0", async () => {
    expect(1 + 1).toBe(2);
    });
    }"
  `);
});

it("should not include @import.meta.vitest in filename", async () => {
  const { code } = await transform(
    `~~~ts:add.ts@import.meta.vitest
expect(1 + 1).toBe(2);
~~~`,
    "add.ts",
    { markdownSetup: "", esbuildTarget: "node25" },
  );

  expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts", async () => {
    expect(1 + 1).toBe(2);
    });
    }"
  `);
});

it("should generate testcode with text on final line", async () => {
  const { code } = await transform(
    `~~~ts @import.meta.vitest
expect(1 + 1).toBe(2);
~~~
Extra text`,
    "add.ts",
    { markdownSetup: "", esbuildTarget: "node25" },
  );

  expect(code).toMatchInlineSnapshot(`
    "if (import.meta.vitest) {
    const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
    import.meta.vitest.test("add.ts#0", async () => {
    expect(1 + 1).toBe(2);
    });
    //Extra text
    }"
  `);
});

// Adapted from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators which is MIT licensed
it("should generate testcode with decorators", async () => {
  const { code } = await transform(
    `~~~ts @import.meta.vitest
class Person {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    @loggedMethod
    greet(): string {
        return \`Hello, my name is \${this.name}.\`;
    }
}
const p = new Person("Ray");
expect(p.greet()).toBe('Hello, my name is Ray');
~~~`,
    "greet.ts",
    { markdownSetup: "", esbuildTarget: "node25" },
  );

  expect(code).toMatchInlineSnapshot(`
"if (import.meta.vitest) {
const {assert,chai,createExpect,expect,getRunningMode,isWatchMode,should,vi,vitest} = import.meta.vitest;
import.meta.vitest.test("greet.ts#0", async () => {
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p2 = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p2 && !s && (target = target.prototype), k < 5 && (k > 3 || !p2) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p2 && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p2, access = ctx.access = { has: p2 ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p2 ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p2 ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p2 ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p2 ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p2 ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _greet_dec, _init;
_greet_dec = [loggedMethod];
class Person {
  constructor(name) {
    __runInitializers(_init, 5, this);
    __publicField(this, "name");
    this.name = name;
  }
  greet() {
    return \`Hello, my name is \${this.name}.\`;
  }
}
_init = __decoratorStart(null);
__decorateElement(_init, 1, "greet", _greet_dec, Person);
__decoratorMetadata(_init, Person);
const p = new Person("Ray");
expect(p.greet()).toBe("Hello, my name is Ray");
});
}"`);
});
