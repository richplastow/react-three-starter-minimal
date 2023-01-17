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

1. Create a default package.json file:  
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
6. Delete the temporary file, package.json.bu:  
   `rm package.json.bu`
