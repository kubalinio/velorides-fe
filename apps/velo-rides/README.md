# Angular Project Setup

## Installation

```bash
pnpm create @angular@latest -s -t -S --experimental-zoneless --ssr false --style scss [yourProjectName]
```

Manually add the following props to the angular.json.
The path is `projects.[yourProjectName].schematics.@schematics/angular:component`

- "changeDetection": "OnPush"
- "flat": true

## UI

```bash
pnpm ng add @angular/material
pnpm install -D tailwindcss postcss autoprefixer
pnpm tailwindcss init
```

Open `tailwind.config.js` and add the following code to `module.exports`:

```javascript
module.exports = {
  // ...
  content: ["./src/**/*.{html,ts}"],
};
```

At the beginning of `styles.scss`, add the following code:

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Testing

Install the Angular Testing Library along the user-event library:

```bash
pnpm i -D @testing-library/angular @testing-library/dom @testing-library/user-event
```

Next, install Playwright and install the accompanying browsers:

```bash
pnpm i -D @playwright/test
pnpm playwright install
```

---

## Code Quality

For code quality, we install `angular-eslint`, `eslint-plugin-unused-imports`, `husky`, `prettier`,`lint-staged` and Sheriff.

```bash
pnpm ng add @angular-eslint/schematics
pnpm i -D eslint-plugin-unused-imports husky prettier lint-staged @softarc/{sheriff-core,eslint-plugin-sheriff}
```

To integrate `eslint-plugin-unused-imports` and sheriff into ESLint, add the following to `eslint.config.js`:

```javascript
// exsting imports...

const sheriff = require("@softarc/eslint-plugin-sheriff");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = tseslint.config(
  // exsting setup...
  {
    files: ["**/*.ts"],
    extends: [sheriff.configs.all],
  },
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
);
```

For defining barrel-less modulesyou can initialize the Sheriff configuration by running the following command:

```bash
pnpm sheriff init
```

Code formatting will be done by prettier, but only for staged files and before a commit:

```bash
pnpm husky init
```

Create the `.lintstagedrc` with the following content:

```text
{
  "*.{js,ts,json,html,scss,css,md}": [
    "prettier --write"
  ]
}

```

`.husky/pre-commit`, should have the following content:

```bash
pnpm ng lint
pnpm ng test --watch=false
pnpm lint-staged --allow-empty
```

## State Management

Next on the list is state management with the NgRx SignalStore. We also include the devtools extension for debugging purposes:

```bash
pnpm i @ngrx/signals @angular-architects/ngrx-toolkit
```

It is also important to use the official ESLint rules for NgRx:

```bash
pnpm i -D @ngrx/eslint-plugin-ngrx
```

Add the following to the ESLint configuration `eslint.config.js`:

```javascript
// existing imports...
const ngrx = require("@ngrx/eslint-plugin/v9");

module.exports = tseslint.config(
  // existing config...
  {
    files: ["**/*.ts"],
    extends: [...ngrx.configs.signals],
  },
);
```

---

**Enjoy your new Angular project setup! 🚀**
