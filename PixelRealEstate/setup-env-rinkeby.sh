chmod 777 ./destroy-env-dev.sh
./destroy-env-dev.sh
#truffle compile
geth --rinkeby --rpccorsdomain "127.0.0.1" --rpc
#for server :
#       /root/go-ethereum/build/bin/geth --rinkeby --rpccorsdomain "127.0.0.1" --rpc &
#geth --fast --cache=1024 --unlock 0x4e11d7d39d1933f0db081376d7b312fcfd118b1e --rpccorsdomain "*" --networkid 4 --rpc --rpcapi db,eth,net,web3,personal --rinkeby
#truffle migrate --network rinkeby &> ./logs/ctr.txt
echo "kill -9" $! >| destroy-env-dev.sh
cp ./build/contracts/*.json ../PixelRealEstate-Server/build/contracts/
cd ../PixelRealEstate-Server/
#node . dev cache &> ../PixelRealEstate/logs/server.txt &
cd ../PixelRealEstate/
echo "kill -9" $! >> destroy-env-dev.sh
npm run start

#geth console
#web3.personal.unlockAccount(web3.personal.listAccounts[0], "dael2345", 15000)

#geth --rinkeby --rpccorsdomain "*" --rpc