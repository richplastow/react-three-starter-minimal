// Configuration used by Rollup during `npm run build:production`.

import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';
import child_process from 'child_process';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: `src/main.js`,
        output: {
            banner: generateBanner(),
            file: `docs/main.js`,
            format: 'es',
        },
        plugins: [
            copy({
                targets: [
                    { src:'src/index.html', dest:'docs' },
                    { src:'src/favicon.ico', dest:'docs' },
                    { src:'src/asset', dest:'docs' },
                ],
            }),
            nodeResolve(),
            terser(),
        ],
    },
];

function generateBanner() {
   const { author, license, name, version } =
       JSON.parse(readFileSync('./package.json', 'utf-8'));
   const firstCommitYear = getYearOfFirstGitCommit();
   if (! firstCommitYear) process.exit(1);
   const thisYear = new Date().getFullYear();
   const year = ! firstCommitYear || firstCommitYear === thisYear
       ? thisYear : `${firstCommitYear} - ${thisYear}`;
   return [
       '/**',
       ` * ${name}`,
       ` * @version ${version}`,
       ` * @license Copyright (c) ${year} ${author}`,
       ` * SPDX-License-Identifier: ${license}`,
       ' */',
   ].join('\n');
}

function getYearOfFirstGitCommit() {
   const fn = 'Warning: getYearOfFirstGitCommit():';
   try {
       const stdout = child_process.execSync(
           'git log $(git rev-list --max-parents=0 HEAD)').toString();
       const matches = stdout.match(/Date:\s*([^\n\r]+)/);
       if (matches === null) return console.warn(fn, 'Unexpected stdout:', stdout);
       const date = new Date(matches[1]);
       if (isNaN(date)) return console.warn(fn, 'Invalid date:', matches[1]);
       return date.getFullYear();
   } catch (err) {
       return console.warn(fn, err.stderr.toString());
   }
}
