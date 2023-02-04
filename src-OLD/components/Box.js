import { html, React, useFrame } from '../dev-bundle.js';
const { useRef, useState } = React;

// Define the Box component.
export default function Box(props) {
    const mesh = useRef(); // direct access to the mesh
    const [ hovered, setHover ] = useState(false); // set up hovered state
    const [ active, setActive ] = useState(false); // set up active state

    // Subscribe Box to the render-loop, and rotate the mesh every frame.
    useFrame((_state, delta) => (mesh.current.rotation.x += delta));

    // Return the view - regular ThreeJS elements built by createElement().
    return html`
        <mesh
            ...${props}
            ref=${mesh}
            scale=${active ? 1.5 : 1}
            onClick=${_event => setActive(!active)}
            onPointerOver=${_event => setHover(true)}
            onPointerOut=${_event => setHover(false)}>
            <boxGeometry key=bg args=${[1,1,1]} />
            <meshStandardMaterial key=msm color=${ hovered ? 'hotpink' : 'orange' } />
        </mesh>
    `;
}
