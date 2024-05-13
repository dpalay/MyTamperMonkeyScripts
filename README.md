To set up:  run yarn install or npm install. (I'm assuming yarn for the rest of the documentation).

Use `yarn run create` to create a new Tampermonkey userscript.  Each script should be an index.ts file in its own directory.  

The generated scripts after running `yarn run build` will each be named for their directory tree.  That is, something in /MyPage/Util/index.ts will end up as MyPage_Util.user.js.

You are welcome to add whatever libraries you need.  Importing into your index.ts will result in the package being fully included in the output .user.js file, so it can be copied in to the extension without needing to @require anything.