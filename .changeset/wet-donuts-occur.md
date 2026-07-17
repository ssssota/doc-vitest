---
"vite-plugin-doctest": major
---

**Breaking:** Replace `markdownSetup` with `markdown.preamble`.

```ts
// Before
doctest({ markdownSetup: 'import path from "node:path";\n' })

// After
doctest({ markdown: { preamble: 'import path from "node:path";\n' } })
```
