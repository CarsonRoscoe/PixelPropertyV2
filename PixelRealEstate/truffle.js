module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*", // Match any network id
            gas: 4700000,
        },
        rinkeby: {
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            from: "0x4e11D7D39d1933f0dB081376d7B312fCfd118b1E", // default address to use for any transaction Truffle makes during migrations
            network_id: 4,
            gas: 4700000,
        },
        production: {
            host: "162.213.250.102",
            port: 8545,
            network_id: "*", // Match any network id
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};