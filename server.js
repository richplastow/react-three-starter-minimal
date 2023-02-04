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
