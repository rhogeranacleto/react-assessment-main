// The .storybook config is type-checked by tsconfig.node.json, which does not
// include vite/client types. Declare side-effect CSS imports so the design
// system stylesheet can be imported in preview.ts without a TS2307 error.
declare module "*.css";
