// Configuration used by Rollup during `npm run build:dev-bundles`.

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
   {
      input: `@react-three/fiber`,
      output: {
         file: `src/lib/react-three-fiber.min.js`,
         format: 'es',
         outro: 'const React = react.exports; export { React, THREE };',
      },
      plugins: [ commonjs(), nodeResolve(), terser() ],
   },
];
