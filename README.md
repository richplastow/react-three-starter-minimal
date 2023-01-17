# react-three-starter-minimal

A simple template for reactive 3D web apps

---

## General guide to building template projects like this, from scratch

### __Create the repo__

1. At GitHub, click the ‘+’ icon, and ‘New repository’
2. Name it, describe it, tick ‘Add a README file’, choose MIT license
3. Click ‘Create repository’
4. Click the ‘Code’ button, ‘Local’ tab, ‘SHH’, and the copy icon
5. In your Terminal, `cd` to wherever you work
6. `git clone ` and paste something like ‘git@github.com:kim/my-app.git’
7. `cd` into the new directory, eg `cd my-app`

### __Create the .gitignore file__

```
.DS_Store
node_modules.zip
node_modules
```

### __Create the package.json file__

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


### __Use Rollup to create a browser-friendly ES module build of React Three Fiber__

The React Three Fiber module actually contains React and ThreeJS, and it can
also [take the place of ReactDOM.](
https://docs.pmnd.rs/react-three-fiber/api/canvas#custom-canvas)

So install React Three Fiber, the only front-end dependency we need:  
`npm i @react-three/fiber`  
8.10.0 adds 22 packages, 39 MB, 1,592 items.

Look at __node_modules/@react-three/fiber/dist/react-three-fiber.esm.js__ —
notice that the ES module `import` paths are designed to be resolved by Node:  
`import * as React from 'react';`  
Your development browser won’t resolve that. It expects something like:  
`import * as React from '../react/index.js';`  

We can use Rollup to concatenate all the imports into a single file, which your
development browser can import. [Vite calls this approach ‘dependency pre-bundling’.](
https://vitejs.dev/guide/dep-pre-bundling.html#dev-bundles)

Install Rollup, along with plugin-node-resolve and plugin-commonjs, as dev dependencies.  
`npm i rollup -D`  
3.10.0 adds 2 packages, 2.5 MB, 29 items.  
`npm i @rollup/plugin-node-resolve -D`  
15.0.1 adds 6 packages, 554 kB, 280 items.  
This will let Rollup make sense of a path like 'react'.  
`npm i @rollup/plugin-commonjs -D`  
24.0.0 adds 14 packages, 609 kB, 95 items.  
This will let Rollup import packages which use `require('...')`.  

Create the __rollup-rtf.config.js__ file:  

```js
// Configuration used by Rollup during `npm run build:dev-bundles`.
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default [
   {
      input: `@react-three/fiber`,
      output: {
         file: `src/lib/react-three-fiber.js`,
         format: 'es',
         outro: 'const React = react.exports; export { React, THREE };',
      },
      plugins: [ commonjs(), nodeResolve() ],
   },
];
```

Add this to the `"scripts"` object in the __package.json__ file:  
`"build:dev-bundles": "rollup -c rollup-rtf.config.js",`

Run the Rollup build:  
`npm run build:dev-bundles`

After a few seconds, __src/lib/react-three-fiber.js__ should be created.  
Its last line should be the Rollup `outro`, giving us access to R3F’s internal
React and THREE:  
`const React = react.exports; export { React, THREE };`


### __Modify the [React Three Starter demo](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction#what-does-it-look-like?) for a buildless development workflow__


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
  <main id="root"></main>
  <script>window.process = { env:{ production:true } }</script>
  <script type="module">
    import { extend, createRoot, events, React, THREE, useFrame }
      from './lib/react-three-fiber.js';
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
