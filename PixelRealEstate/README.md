# PixelRealEstate

# EthereumAlpha

To replicate setup:
===

In Terminal 1:
---
    npm install -g testrpc
    testrpc

In Terminal 2:
---
    npm install -g truffle
    truffle unbox react-auth
    truffle compile
    truffle migrate
    npm run dev

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