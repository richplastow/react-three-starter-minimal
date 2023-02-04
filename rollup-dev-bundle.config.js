// Configuration used by Rollup during `npm run build:dev-bundle`.

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
   {
      input: './rollup-dev-bundle.js',
      output: {
         file: 'src/dev-bundle.js',
         format: 'es',
         banner: '/**\n * @license htm\n * Copyright Jason Miller\n * SPDX-License-Identifier: Apache-2.0\n */',
         outro: 'const React = react.exports; export { React, THREE };\nconst html = htm.bind(React.createElement);\nexport { html };\n',
      },
      plugins: [ commonjs(), nodeResolve(), terser() ],
   },
];

