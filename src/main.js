import htm from 'htm';
import { firstUtil, secondUtil } from    "./utils/";
import { fifthUtil } from "./utils/deep/";
import thirdUtil from './utils/third-util';
// import foo from `nope`;

console.log(htm);
firstUtil();
secondUtil();
thirdUtil();
fifthUtil();

document.querySelector('h1').innerText = 'Hello react-three-starter-minimal';
