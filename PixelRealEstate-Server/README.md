# PixelRealEstate-Server
Intermediary server for caching state of PixelRealEstate.

To replicate setup:
===

In Terminal 1:
---
    npm install -g testrpc
    testrpc

In Terminal 2:
---
    truffle migrate
    node . dev #runs dev. Remove 'dev' to run prod.

Now visit http://localhost:8080/

To use base project:
===

Grab a private key from Terminal1, and import it into MetaMask using "Import Account".
The Dapp will now recognize your account, and you can use the app under that account.


Extra Commands:
---
Compile:              truffle compile
Migrate:              truffle migrate
Test contracts:       truffle test
Test dapp:            npm test
Run dev server:       npm run start
Build for production: npm run build
