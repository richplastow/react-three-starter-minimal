import { createRoot, html, events, extend, THREE } from './dev-bundle.js';
extend(THREE); // register the THREE namespace as elements

import { Box } from './components/all.js';

// Configure the root, inject events optionally, set camera, etc.
const root = createRoot(document.querySelector('canvas'));
root.configure({ events, camera: { position:[0,0,-10] } });

// `createRoot` is not responsive, so handle resize here.
window.addEventListener('resize', () => root.configure({
    size: { width: window.innerWidth, height: window.innerHeight } }));
window.dispatchEvent(new Event('resize')); // trigger resize

// Start rendering the scene.
root.render(html`
    <ambientLight key=al />
    <pointLight key=pl position=${[10,10,10]} />
    <${Box} key=b0 position=${[-1.2,0,0]} />
    <${Box} key=b1 position=${[1.2,0,0]} />`
);

// root.unmount(); // unmount and dispose of memory
