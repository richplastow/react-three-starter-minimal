# react-three-starter-minimal

A simple template for reactive 3D web apps

---

## How to create a react-three starter

### __1. Create the repo__

1. At GitHub, click the ‘+’ icon, and ‘New repository’
2. Name it, describe it, tick ‘Add a README file’, choose MIT license
3. Click ‘Create repository’
4. Click the ‘Code’ button, ‘Local’ tab, ‘SSH’, and the copy icon
5. In your Terminal, `cd` to wherever you work
6. `git clone ` and paste something like ‘git@github.com:kim/my-app.git’
7. `cd` into the new directory, eg `cd my-app`

### __2. Create the .gitignore file__

```
.DS_Store
node_modules
node_modules.zip
```

### __3. Create the package.json file__

1. Create a default __package.json__ file:  
   `npm init --yes`
2. Change the version to 0.0.1:  
   `sed -i.bu 's/: "1.0.0",/: "0.0.1",/' package.json`
3. Insert your name, email and domain:  
   `sed -i.bu 's/"author": "",/"author": "n <e> (https:\/\/d)",/' package.json`
4. Change the license to MIT:  
   `sed -i.bu 's/: "ISC",/: "MIT",/' package.json`
5. Remove the ‘main’ property because this is an app not a library,  
   and also tell Node to use `import` not `require()` (avoids needing .mjs):  
   `sed -i.bu 's/"main": "index.js"/"type": "module"/' package.json`
6. Delete the temporary __package.json.bu__ file:  
   `rm package.json.bu`

### __4. Create a simple server, for zero-build development on your local machine__

Create __server.js__ — `npm start` will look for this file:  

```js
// server.js
// A simple server, intended for zero-build development on your local machine.

/* -------------------------- Imports and Constants ------------------------- */

import child_process from 'child_process';
import fs from 'fs';
import http from 'http';
import { dirname, resolve } from 'path';
import { Transform } from 'stream';
import { repairJsImports } from '@0bdx/semi-parser';

const host = '127.0.0.1'; // localhost
const port = 4321;

// `npm start --open` or `npm start -o` means we should open a browser window.
const doOpen = process.env.npm_config_open || process.env.npm_config_o;

// `npm start --src` means we should use the 'src/' folder, not 'docs/'.
const dir = process.env.npm_config_src ? 'src' : 'docs';


/* --------------------------------- Server --------------------------------- */

// Create and start the server.
http.createServer((req, res) => {

    // Proxy '/' to '/index.html', or '/sub/dir/' to '/sub/dir/index.html'.
    // Get the mime type, or respond with a 404 if there's a problem.
    const url = req.url.slice(-1) === '/' ? `${req.url}index.html` : req.url;
    const ext = getExt(url); // undefined if there's no extension
    if (! ext) return send404(res, `url '${url}' has no extension`);
    const mime = getMime(ext); // undefined if the extension is not recognised
    if (! mime) return send404(res, `extension '${ext}' is not recognised`);

    // Serve a JavaScript file, or respond with a 404 if it doesn't exist.
    // repairJsImports() will make `export` and `import` paths browser-friendly.
    if (ext === 'js' || ext === 'mjs') {

        // Proxy '__NODE_MODULES_PROXY__/a/b.js' to '../node_modules/a/b.js'.
        // These kind of urls are usually generated by repairJsImports(), using
        // the repairMap we passed in.
        const proxyPos = url.indexOf('__NODE_MODULES_PROXY__');
        const realLocation = proxyPos === -1 ? `${dir}${url}`
            : `${dir}/../node_modules/${url.slice(proxyPos + 22)}`;

        // JavaScript source code must be read in its entirety, so that it can
        // be semi-parsed by repairJsImports().
        try {
            const source = fs.readFileSync(realLocation)+'';
            res.setHeader('Content-Type', mime);
            res.write(repairJsImports(source, repairMap));
            res.end();                
        } catch (error) { send404(res, 'Not Found') }
        return;
    }

    // Serve a non-JavaScript file, or respond with a 404 if it doesn't exist.
    // Since we don’t need to semi-parse this file, we can stream it, which
    // should improve performance, especially for large files.
    const readStream = fs.createReadStream(`${dir}${url}`);
    readStream.on('error', () => send404(res, 'Not Found') );
    readStream.on('open', () => {
        res.setHeader('Content-Type', mime);
        readStream.pipe(res);
    });

}).listen(port, host, () => console.log(`${dir}/ 👉 http://${host}:${port}/`));

// Open a browser window, if the '--open' or '-o' command line option was set.
// Based on https://stackoverflow.com/a/49013356
// @TODO test on Windows and Linux
if (doOpen) {
    const openCommand = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'start' : 'xdg-open';
    const fullUrl = `http://${host}:${port}/index.html`;
    child_process.exec(
        `${openCommand} ${fullUrl}`,
        (error, _stdout, stderr) => console.log(
            error || stderr || `Opened ${fullUrl} in your default browser.`)
    );
}


/* --------------------------------- Helpers -------------------------------- */

// Responds to a request with a 404 error, and a plain text message.
function send404(res, err) {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 404;
    res.end(err.message || err);
    console.error(err.message || err);
}

// Gets the file extension from a url, or undefined if no extension is present.
function getExt(url) {
    const exts = url.split('/').pop().split('.');
    if (exts.length === 1) return void 0;
    return exts.pop().toLowerCase();
}

// Returns the mime type if the extension is recognised, or else undefined.
function getMime(ext) {
    return {
        css: 'text/css',
        gif: 'image/gif',
        htm: 'text/html',
        html: 'text/html',
        ico: 'image/x-icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        js: 'application/javascript',
        json: 'application/json',
        mjs: 'application/javascript',
        otf: 'application/x-font-opentype',
        png: 'image/png',
        svg: 'image/svg+xml',
        ttf: 'application/x-font-ttf',
        txt: 'text/plain',
        wasm: 'application/wasm',
        webmanifest: 'application/manifest+json',
        woff: 'application/font-woff',
        woff2: 'application/font-woff2',
        xml: 'text/xml',
    }[ext];
}

// Passed in to repairJsImports().
const repairMap = {
    // htm: './__NODE_MODULES_PROXY__/htm/dist/htm.module.js',
    htm: './__NODE_MODULES_PROXY__/htm/src/index.mjs',
};
```

### __5. Create an initial static page, and bundle it for production__

Create the initial __src/index.html__ file:  

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg
    xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text
    y=%22.9em%22 font-size=%2290%22>🎊</text></svg>">
  <title>react-three-starter-minimal</title>
  <style>
    body { background:#111; color:#ccc; font:20px/1.5 Arial }
  </style>
</head>
<body>
  <h1>Loading...</h1>
  <script src="main.js" type="module"></script>
</body>
</html>
```

Create the initial __src/main.js__ file:  

```js
document.querySelector('h1').innerText = 'Hello react-three-starter-minimal';
```

Install Rollup, along with a couple of plugins, as dev dependencies.  
`npm i rollup -D`  
3.10.0 adds 2 packages, 2.5 MB, 29 items.

`npm i rollup-plugin-copy -D`  
3.4.0 adds 39?? packages, 829?? kB, 397?? items.  
This will let Rollup copy files from src/ to docs/.

`npm i @rollup/plugin-terser -D`  
0.3.0 adds 16?? packages, 3.6?? MB, 143?? items.  
Minifies JavaScipt bundles.

Create the __scripts/rollup-production.config.js__ file:  

```js
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
```

Add this to the `"scripts"` object in the __package.json__ file:  
`"build:production": "rollup -c scripts/rollup-production.config.js",`

Run the Rollup build:  
`npm run build:production`  
After a few seconds, __docs/__ should be created. You should see that
__docs/main.js__ has been minified, and has a block comment at the top containing
values from the __package.json__ file.

Point the local development server at the docs folder:  
`npm start --open`  
A browser window should automatically open http://127.0.0.1:4321/index.html,
showing the headline “Hello react-three-starter-minimal”.

### __Use Rollup to create a browser-friendly ES module build of React Three Fiber__

The React Three Fiber module actually contains React and ThreeJS, and it can
also [take the place of ReactDOM.](
https://docs.pmnd.rs/react-three-fiber/api/canvas#custom-canvas)

To install React Three Fiber:  
`npm i @react-three/fiber`  
8.10.0 adds 22 packages, 39 MB, 1,592 items.

Look at __node_modules/@react-three/fiber/dist/react-three-fiber.esm.js__ —
notice that the ES module `import` paths are designed to be resolved by Node:  
`import * as React from 'react';`  
Your development browser won’t resolve that. It expects something like:  
`import * as React from '../react/index.js';`  

We can use Rollup to concatenate all the imports into a single file, which your
development browser can import. [Vite calls this approach ‘dependency pre-bundling’.](
https://vitejs.dev/guide/dep-pre-bundling.html#dev-bundle)

Install Rollup, along with some plugins, as dev dependencies.  
`npm i rollup -D`  
3.10.0 adds 2 packages, 2.5 MB, 29 items.

`npm i @rollup/plugin-node-resolve -D`  
15.0.1 adds 6 packages, 554 kB, 280 items.  
This will let Rollup make sense of a path like 'react'.

`npm i @rollup/plugin-commonjs -D`  
24.0.0 adds 14 packages, 609 kB, 95 items.  
This will let Rollup import packages which use `require('...')`.

`npm i @rollup/plugin-terser -D`  
0.3.0 adds 16 packages, 3.6 MB, 143 items.  
Minifies JavaScipt bundles.

Create the __rollup-dev-bundle.config.js__ file:  

```js
// Configuration used by Rollup during `npm run build:dev-bundle`.
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
```

Add this to the `"scripts"` object in the __package.json__ file:  
`"build:dev-bundle": "rollup -c rollup-dev-bundle.config.js",`

Run the Rollup build:  
`npm run build:dev-bundle`

After a few seconds, __src/lib/react-three-fiber.js__ should be created.  
Its last line should be the Rollup `outro`, giving us access to R3F’s internal
React and THREE:  
`const React = react.exports; export { React, THREE };`


### __Modify the [React Three Starter demo](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction#what-does-it-look-like?) for a buildless development workflow__

We can’t use JSX in a buildless workflow, but [htm](
https://www.npmjs.com/package/htm) does a similar job:  
`npm i htm`  
3.1.1 adds 1 package, 88 kB, 50 items.  
Consider installing Matt Bierner’s ‘lit-html’ VS Code extension, for syntax
highlighting and intellisense.

Create the __src/main.js__ file:  

```js


```



Create the __src/index.html__ file:  

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg
    xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text
    y=%22.9em%22 font-size=%2290%22>🎊</text></svg>">
  <title>react-three-starter-minimal</title>
  <style>
    body { background:#111; color:#ccc; font:20px/1.5 Arial }
    canvas { position:fixed; top:0; left:0; z-index:-1 }
  </style>
</head>
<body>
  <h1>react-three-starter-minimal</h1>
  <canvas></canvas>
  <script>window.process = { env:{ production:true } }</script>
  <script type="module">
    import { extend, createRoot, events, React, THREE, useFrame }
      from './lib/react-three-fiber.min.js';
    const { createElement:h, useRef, useState } = React;
    extend(THREE); // register the THREE namespace as elements
      
    // Configure the root, inject events optionally, set camera, etc.
    const root = createRoot(document.querySelector('canvas'));
    root.configure({ events, camera: { position:[0,0,-10] } });

    // `createRoot` is not responsive, so handle resize here.
    window.addEventListener('resize', () => root.configure({
      size: { width: window.innerWidth, height: window.innerHeight } }));
    window.dispatchEvent(new Event('resize')); // trigger resize

    // Define the Box component.
    function Box(props) {
      const mesh = useRef(); // direct access to the mesh
      const [ hovered, setHover ] = useState(false); // set up hovered state
      const [ active, setActive ] = useState(false); // set up active state

      // Subscribe Box to the render-loop, and rotate the mesh every frame.
      useFrame((state, delta) => (mesh.current.rotation.x += delta));

      // Return the view - regular ThreeJS elements built by createElement().
      return (
        h('mesh', {
          ...props,
          ref: mesh,
          scale: active ? 1.5 : 1,
          onClick: event => setActive(!active),
          onPointerOver: event => setHover(true),
          onPointerOut: event => setHover(false),
        }, [
          h('boxGeometry', { key:'bg', args:[1,1,1] }),
          h('meshStandardMaterial', {
            key:'msm', color:hovered ? 'hotpink' : 'orange' }),
      ]));
    }

    root.render([ // start rendering the scene
      h('ambientLight', { key:'al' }),
      h('pointLight', { key:'pl', position:[10,10,10] }),
      h(Box, { key:'b0', position:[-1.2,0,0] }),
      h(Box, { key:'b1', position:[1.2,0,0] }),
    ]);
    // root.unmount(); // unmount and dispose of memory
  </script>
</body>
</html>
```

### __Use Rollup to create the production bundle__

`npm i rollup-plugin-copy -D`  
3.4.0 adds 39 packages, 829 kB, 397 items.  
This will let Rollup copy files from src/index.html to docs/index.html.

@TODO the rest of this section
