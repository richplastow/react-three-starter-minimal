// server.js
// A simple server, intended for zero-build development on your local machine.

/* -------------------------- Imports and Constants ------------------------- */

import child_process from 'child_process';
import fs from 'fs';
import http from 'http';
import { dirname, resolve } from 'path';
import { Transform } from 'stream';

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

    // Proxy '__NODE_MODULES_PROXY__/foo/foo.js' to '../node_modules/foo/foo.js'.
    // These kind of urls are usually generated by fixImportPathsForBrowsers().
    const proxyPos = url.indexOf('__NODE_MODULES_PROXY__');
    const readStream = fs.createReadStream(proxyPos === -1 ? `${dir}${url}`
        : `${dir}/../node_modules/${url.slice(proxyPos + 22)}`);

    // Serve the file, or respond with a 404 if it doesn't exist.
    // For JavaScript files, make `import` paths browser-friendly.
    readStream.on('error', () => send404(res, 'Not Found') );
    readStream.on('open', () => {
        res.setHeader('Content-Type', mime);
        if (ext === 'js' || ext === 'mjs')
            readStream.pipe(fixImportPathsForBrowsers(url)).pipe(res);
        else
            readStream.pipe(res);
    });

}).listen(port, host, () => console.log(`${dir}/ ???? http://${host}:${port}/`));

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

// @TODO describe
function fixImportPathsForBrowsers(url) {
    const fn = 'fixImportPathsForBrowsers(): ';
    return new Transform({
        transform: (chunk, _encoding, done) =>
            done(null, chunk.toString().split('\n').map(
                (line, index) => {
                    const importPos = line.indexOf('import ');
                    const exportPos = line.indexOf('export ');
                    if (importPos === -1 && exportPos === -1) return line;
                    if (importPos !== -1 && exportPos !== -1)
                        throw Error(`${fn}${url}:${index+1} import and export on one line`);
                    const fromPos = line.indexOf(
                        ' from',
                        (exportPos === -1 ? importPos : exportPos) + 8,
                    );
                    if (fromPos === -1) return line;
                    const pathMatch = line.slice(fromPos + 5).match(/^(\s*)(['"])(.+)(['"])(.*)/);
                    if (! pathMatch) return line;
                    const [ _, spc, q1, path, q2, rest] = pathMatch;
                    if (q1 !== q2)
                        throw Error(`${fn}${url}:${index+1} quotes mismatch`);
                    if (getExt(path)) return line; // already has an extension
                    const endsSlash = path.slice(-1) === '/';
                    const newPath = path.slice(0, 2) !== './' && path.slice(0, 3) !== '../'
                        ? nodeModulesProxy[path]
                        : endsSlash
                            ? `${path}index.js`
                            : fs.existsSync(resolve(dir, `.${dirname(url)}`, path))
                                ? `${path}/index.js`
                                : `${path}.js`;
                    if (! newPath) // nodeModulesProxy[path] is undefined
                        throw Error(`${fn}${url}:${index+1} path ${q1}${path}${q2} is not in nodeModulesProxy`);
                    return `${line.slice(0, fromPos + 5)}${spc}${q1}${newPath}${q2}${rest}`;
                }
            ).join('\n'))
    })
}

// @TODO describe
const nodeModulesProxy = {
    // htm: './__NODE_MODULES_PROXY__/htm/dist/htm.module.js',
    htm: './__NODE_MODULES_PROXY__/htm/src/index.mjs',
};
