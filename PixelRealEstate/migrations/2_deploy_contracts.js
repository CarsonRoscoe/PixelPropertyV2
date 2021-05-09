var __vre = artifacts.require("./VirtualRealEstate.sol");
var __pxlpp = artifacts.require("./PXLProperty.sol");
var __pxlpput = artifacts.require("./PXLPropertyUnitTests.sol");

module.exports = function(deployer) {
    deployer.deploy(__vre);
    deployer.deploy(__pxlpp);
    deployer.deploy(__pxlpput);
};