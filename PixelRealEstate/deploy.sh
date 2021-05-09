git pull origin dev
npm install
npm run build
cp -a ./build/contracts/*.json ../public_html/canvas/server/build/contracts/
cp -a ./build_webpack/* ../public_html/canvas/
cp -a ./public/* ../public_html/canvas/public/