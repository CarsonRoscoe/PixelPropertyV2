const { expect, assert } = require("chai");


// var PXLProperty = artifacts.require("./PXLProperty.sol");
// var PXLPropertyUnitTests = artifacts.require("./PXLPropertyUnitTests.sol");
// var VirtualRealEstate = artifacts.require("./VirtualRealEstate.sol");
var bigInt = require("big-integer");
var BigNumber = require('bignumber.js');
const { keccak256 } = require("@ethersproject/keccak256");
const { toUtf8Bytes } = require("@ethersproject/strings");

let byteArrayOnes = [1,1];
let byteArrayTwos = [2,2];
let byteArrayLong = [3,3];
let byteArrayShort = [4,4];


let stringToBigInts = (string) => {
  let result = [];
  let innerResult = new bigInt("0", 10);
  for(let i = 0; i < 32; i++) {
    let binary = 0;
    if (i < string.length) {
      binary = string.charCodeAt(i);
    }
    innerResult = innerResult.shiftLeft(8);
    innerResult = innerResult.or(binary);
  }
  result.push(new BigNumber(innerResult.toString(), 10));
  innerResult = new bigInt("0", 10);
  for(let i = 32; i < 64; i++) {
    let binary = 0;
    if (i < string.length) {
      binary = string.charCodeAt(i);
    }
    innerResult = innerResult.shiftLeft(8);
    innerResult = innerResult.or(binary);
  }
  result.push(new BigNumber(innerResult.toString(), 10));
  return result;
}

let bigIntsToString = (bigInts) => {
  let result = [];
  bigInts.reverse();
  for(let i = 0; i < 2; i++) {
      let uint256 = new bigInt(bigInts[i].toString(10), 10);
      if (uint256 != 0) {
          for(let j = 0; j < 32; j++) {
              let ascii = uint256.and(255).toJSNumber();
              if (ascii != 0) {
                result.push(String.fromCharCode(ascii));
              }
              uint256 = uint256.shiftRight(8); 
          }
      }
  }
  return result.reverse().join("");
}


/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

function compressHsl(h, s, l) {
  h *= 5;
  h /= 8;
  s *= 3;
  s /= 8;
  l *= 2;
  l /= 5;
}

function decompressHsl() {
  
}

let accounts;
let pxlPropertyTestInstance;
let pxlPropertyUnitTests;

describe("Full Test", function() {
  it("PXLProperty Testing Deployment", async function() {
    try {
      accounts = await ethers.getSigners();
  
      const PXLProperty = await ethers.getContractFactory("KovanPXLProperty");
      const pxlProperty = await PXLProperty.deploy(1000000000);
  
      const PXLPropertyL2_1 = await ethers.getContractFactory("MumbaiPXLProperty");
      const pxlPropertyL2_1 = await PXLPropertyL2_1.deploy(1000000000);

      const PXLPropertyL2_2 = await ethers.getContractFactory("ArbitrumPXLProperty");
      const pxlPropertyL2_2 = await PXLPropertyL2_2.deploy(1000000000);

      await pxlProperty.deployed();
      await pxlPropertyL2_1.deployed();
      await pxlPropertyL2_2.deployed();
  
      const VirtualRealEstateV2 = await ethers.getContractFactory("VirtualRealEstateV2");
      const virtualRealEstateV2 = await VirtualRealEstateV2.deploy("https://pixelproperty.io/nft/{id}", pxlProperty.address, pxlProperty.address);
      
      const VirtualCanvas = await ethers.getContractFactory("VirtualCanvas");
      const virtualCanvas_1 = await VirtualCanvas.deploy(pxlPropertyL2_1.address);
      const virtualCanvas_2 = await VirtualCanvas.deploy(pxlPropertyL2_2.address);
  
      await virtualRealEstateV2.deployed();
      await virtualCanvas_1.deployed();
      await virtualCanvas_2.deployed();
  
      let main = await pxlProperty.grantRole( keccak256(toUtf8Bytes('LEVEL_PIXEL_PROPERTY')), virtualRealEstateV2.address);
      let l2_1 = await pxlPropertyL2_1.grantRole( keccak256(toUtf8Bytes('LEVEL_PIXEL_PROPERTY')), virtualCanvas_1.address);
      let l2_2 = await pxlPropertyL2_2.grantRole( keccak256(toUtf8Bytes('LEVEL_PIXEL_PROPERTY')), virtualCanvas_2.address);
  
      let main_2 = await virtualRealEstateV2.setPXLPropertyContract(pxlProperty.address);
      let l2_1_ = await virtualCanvas_1.setPXLPropertyContract(pxlPropertyL2_1.address);
      let l2_2_ = await virtualCanvas_2.setPXLPropertyContract(pxlPropertyL2_2.address);
  
      pxlPropertyTestInstance = pxlProperty;
    } catch (e) {
      console.info(e);
    }
    
  });
});



describe("PXLProperty", function() {
  it("PXLProperty Testing Deployment", async function() {
    const PXLProperty = await ethers.getContractFactory("KovanPXLProperty");
    const pxlProperty = await PXLProperty.deploy(0);
    accounts = await ethers.getSigners();
    
    await pxlProperty.deployed();
    pxlPropertyTestInstance = pxlProperty;
  });
});


// //PXLPropertyUnitTests
describe('PXLPropertyUnitTests', function() {
  it("Load Unit Test Data", async function() {
    const PXLPropertyUnitTests = await ethers.getContractFactory("PXLPropertyUnitTests");
    pxlPropertyUnitTests = await PXLPropertyUnitTests.deploy();
    var l1 = await pxlPropertyTestInstance.setRegulatorAccessLevel(pxlPropertyUnitTests.address, 6, {from: accounts[0].address});
    var result = await pxlPropertyUnitTests.LoadUnitTests(pxlPropertyTestInstance.address);
  });
  it("VirtualRealEstate Access Unit Tests", async function() {
    let result = await pxlPropertyUnitTests.RunPixelPropertyAccessUnitTests();
    assert(result, true, "Should have passed all tests. Returns false on fail");
  });
  it("PropertyDapp Access Unit Tests", async function() {
    let result = await pxlPropertyUnitTests.RunPropertyDAppAccessUnitTests();
    assert(result, true, "Should have passed all tests. Returns false on fail");
  });
  it("Moderation & Admin Unit Tests", async function() {
    let result = await pxlPropertyUnitTests.RunModerationUnitTests();
    assert(result, true, "Should have passed all tests. Returns false on fail");
  });
  it("Upgradable Contract Unit Tests", async function() {
    let result = await pxlPropertyUnitTests.RunContractUpdateUnitTests();
    assert(result, true, "Should have passed all tests. Returns false on fail");
  });
});

let pxlPropertyInstance;
let ownerETH = 0;

describe('PXLProperty', function() {
  it("PXL Deployment", async function() {
    const PXLProperty = await ethers.getContractFactory("KovanPXLProperty");
    const pxlProperty = await PXLProperty.deploy(0);
    
    await pxlProperty.deployed();
    pxlPropertyTestInstance = pxlProperty;
  });
});

describe('VirtualRealEstate', function() {
  it("VirtualRealEstate Deployment", async function() {
    const VirtualRealEstateV2 = await ethers.getContractFactory("VirtualRealEstateV2");
    const virtualRealEstateV2 = await VirtualRealEstateV2.deploy("uri", pxlPropertyTestInstance.address, pxlPropertyTestInstance.address);

    accounts = await ethers.getSigners();

    await virtualRealEstateV2.deployed();

    let a = await pxlPropertyTestInstance.grantRole( keccak256(toUtf8Bytes('LEVEL_PIXEL_PROPERTY')), virtualRealEstateV2.address);

    let b = await virtualRealEstateV2.setPXLPropertyContract(pxlPropertyTestInstance.address);

    pixelPropertyInstance = virtualRealEstateV2;
  });

  //####PURCHASE, SELLING & TRANSFERING####
 it("User0 can purchase a property at default price in ETH", async function() {
  let buyPropertyResult = await pixelPropertyInstance.buyPropertyInETH(0, { from: accounts[1].address, value: 19500000000000000 }); 
  let propertyData = await pixelPropertyInstance.getPropertyData(0, { from: accounts[1].address });
  assert.equal(propertyData[0], accounts[1].address, "Should be owned by account 1" );
  ownerETH += 10000;
   //User1 owns property [0] with 0 PXL
 });

//  it("User0 can purchase multiple default properties (1-3) in ETH",  function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.buyPropertyInETH(1, { from: accounts[1], value: 19500000000000000 });
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
//    }).then(function(propertyData){
//      assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
//      return pixelPropertyInstance.buyPropertyInETH(2, { from: accounts[1], value: 19500000000000000 });
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
//    }).then(function(propertyData){
//      assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
//      return pixelPropertyInstance.buyPropertyInETH(3, { from: accounts[1], value: 19500000000000000 });
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
//    }).then(function(propertyData){
//      assert.equal(propertyData[0], accounts[1], "Should be owned by account 1" );
//      ownerETH += 11000 + 13000 + 15000;
//    });
//    //User1 owns property [0,1,2,3] with 0 PXL
//  });
//  it("After a sale, ownership changes", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.addCoin(accounts[2], 10000), { from: accounts[0]};
//    }).then(function() {
//      return pixelPropertyInstance.listForSale(0, 10000, { from: accounts[1] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
//      return pixelPropertyInstance.buyPropertyInPXL(0, 10000, {from: accounts[2] });
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[2], "Should now be owned by account1"); //Ownership changed
//      return pxlPropertyInstance.balanceOf(accounts[1], {from: accounts[1]})
//    }).then(function(balance) {
//      assert.equal(balance, 9800, "Owner should be paid 98% of 10000"); //Ownership changed
//      return pxlPropertyInstance.balanceOf(accounts[0], {from: accounts[0]})
//    }).then(function(balance) {
//      assert.equal(balance, 200, "Contract owner gets a 2% cut of 10000 PXL"); //Ownership changed
//    }).catch((e) => {
//      console.info("ERROR CAUGHT",e);
//    });
//    //User0 has 200 PXL
//    //User1 owns property [1,2,3] with 9800 PXL
//    //User2 owns property [0] with 0 PXL
//  });
//  //?#Money from initial property sale goes to contract owner
//  it("After a sale occurs, money goes to the old owner of a property", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.addCoin(accounts[2], 10000, { from: accounts[0] });
//    }).then(function() {
//      return pixelPropertyInstance.listForSale(1, 10000, { from: accounts[1] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
//      return pixelPropertyInstance.buyPropertyInPXL(1, 10000, {from: accounts[2] });
//    }).then(function() {
//      return pixelPropertyInstance.getPropertyData(1, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[2], "Should now be owned by account2"); //Ownership change
//      return pxlPropertyInstance.balanceOf(accounts[1], {from: accounts[1]});
//    }).then(function(amount) {
//      assert.equal(amount, 19600, "This should be the second test with a sale of 10k at 2% fee"); //Coin change
//      return pxlPropertyInstance.balanceOf(accounts[0], {from: accounts[0]})
//    }).then(function(balance) {
//      assert.equal(balance, 400, "Contract owner gets a second 2% cut of 10000 PXL"); //Ownership changed
//    });
//    //User0 has 400 PXL
//    //User1 owns property [2,3] with 19600 PXL
//    //User2 owns property [0,1] with 0 PXL
//  });
//  //#Can delist sales that are still open
//  it("After a property is listed, it can be delisted and set back to 0 price", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.listForSale(2, 10000, { from: accounts[1] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[1], "Should be owned by account0 (to delist)")
//      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
//      return pixelPropertyInstance.delist(2, { from: accounts[1] });
//    }).then(function() {
//      return pixelPropertyInstance.getPropertyData(2, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[1], 0, "Should be delisted and back to 0 wei" ); //For sale
//    });
//    //NO-CHANGE
//  });
//  it("After delisting, it can be listed again and sold", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[1] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[1], "Should be owned by account1 (to delist)")
//      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
//      return pixelPropertyInstance.delist(3, { from: accounts[1] });
//    }).then(function() {
//      return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[2], 0, "Should be delisted and back to 0 wei" ); //For sale
//      return pixelPropertyInstance.listForSale(3, 10000, { from: accounts[1] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.addCoin(accounts[2], 10000, {from: accounts[0]});
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[2], 10000, "Should be listed for sale for 10000 wei" ); //For sale
//      return pixelPropertyInstance.buyPropertyInPXL(3, 10000, {from: accounts[2] });
//    }).then(function() {
//      return pixelPropertyInstance.getPropertyData(3, { from: accounts[1] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[2], "Should now be owned by account2"); //Ownership change
//      return pxlPropertyInstance.balanceOf(accounts[1], {from: accounts[1]});
//    }).then(function(amount) {
//      assert.equal(amount, 29400, "This should be the third 10k test with a sale at 2% fee so 29400"); //Coin change
//    });
//    //User0 has 600 PXL
//    //User1 owns property [2] with 29400 PXL
//    //User2 owns property [0,1,3] with 0 PXL
//  });
//  it("User2 can transfer property 0 to User0 as a gift", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.transferProperty(0, accounts[0], { from: accounts[2] }); 
//    }).then(function(result) {
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[0], accounts[0], "Should be owned by account 0" );
//    });
//    //User0 owns property [0] with 600 PXL
//    //User1 owns property [2] with 29400 PXL
//    //User2 owns property [1,3] with 0 PXL
//  });
//  it("User3 can buy a property with some PXL and some ETH", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pxlPropertyInstance.balanceOf(accounts[3]);
//    }).then(function(balance) {
//      user5InitialBalance = balance;
//      return pixelPropertyInstance.getForSalePrices(75, {from: accounts[3]});
//    }).then(function(prices) {
//      assert.equal(prices[0] > 0, true, "ETH price should be set for default property purchase");
//      assert.equal(prices[1] > 0, true, "PXL price should be set for default property purchase");
//      initialPricesForPXLETHBuy = prices;
//      return pixelPropertyInstance.addCoin(accounts[3], prices[1] / 2);
//    }).then(function() {
//      return pixelPropertyInstance.buyProperty(75, initialPricesForPXLETHBuy[1] / 2, { from: accounts[3], value: initialPricesForPXLETHBuy[0] / 2})
//    }).then(function() {
//      ownerETH += initialPricesForPXLETHBuy[0] / 2;
//      return pxlPropertyInstance.balanceOf(accounts[3]);
//    }).then(function(balance) {
//      assert.equal(balance - user5InitialBalance, 0, "Should have spent the same amount earned");
//    });
//    //User0 owns property [0] with 600 PXL
//    //User1 owns property [2] with 29400 PXL
//    //User2 owns property [1,3] with 0 PXL
//    //User3 owns property [75] with 0 PXL
//  });
//  //it("Purchasing with ETH increases ETH price, PXL increases PXL, and partial buy (30% PXL 70% ETH) raises price appropriately (30% for PXL, 70% for ETH)", function() {
   
//  //});
 
//  //####SETTING COLOR & COIN DISTRIBUTION####
//  //#Changing the colour pays out 2 coins per hour to the last person who changed the colour for unpurchased properties
//  it("You can change the colours for free", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setColors(10, [5, 7234, 5, 5, 55], 0, { from: accounts[2] });
//    }).then(function(setColors) {
//      return pxlPropertyInstance.getPropertyColors(10, { from: accounts[0] });
//    }).then(function(coloursReturned) {
//      assert.equal(coloursReturned[0].toNumber(), 5, "Should return 5 from the array of 5's" );
//      assert.equal(coloursReturned[1].toNumber(), 7234, "Should return 5 from the array of 5's" );
//      assert.equal(coloursReturned[3].toNumber(), 5, "Should return 5 from the array of 5's" );
//      assert.equal(coloursReturned[4].toNumber(), 55, "Should return 5 from the array of 5's" );
//    });
//    //NO-CHANGE
//  });
//  it("Changing the colour pays out 1 coins per second since last change to the last colour changer and 1 to the owner of the property", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setColors(75, [0, 0, 0, 0, 0], 0, { from: accounts[4] });
//    }).then(function(setColors) {
//      return pxlPropertyInstance.getPropertyColors(75, { from: accounts[3] });
//    }).then(function(coloursReturned) {
//      assert.equal(coloursReturned[0].toNumber(), 0, "Should return 0 from the array of 0's" );
//      return new Promise((resolve, reject) => {
//        let wait = setTimeout(() => {
//          resolve("Delay Finished");
//        }, 4001);
//      });
//    }).then(function(s) {
//      return pixelPropertyInstance.setColors(75, [5, 5, 5, 5, 5], 0, { from: accounts[6] });
//    }).then(function(setColors) {
//      return pxlPropertyInstance.getPropertyColors(75, { from: accounts[0] });
//    }).then(function(coloursReturned) {
//      assert.equal(coloursReturned[0].toNumber(), 5, "Should return 5 from the array of 5's" );
//      return pxlPropertyInstance.balanceOf(accounts[4], { from: accounts[0] });
//    }).then(function(balance) {
//      assert.equal(balance.toNumber(), 29, "Should have earned 29 coins from setting it and having it set for four seconds (+25 bonus)");
//      return pxlPropertyInstance.balanceOf(accounts[3], { from: accounts[0] });
//    }).then(function(balance) {
//      assert.equal(balance, 4, "User3 should have earned the same amount if coins as owner that the setter got");
//    });
//    //User0 owns property [0] with 600 PXL
//    //User1 owns property [2] with 29400 PXL
//    //User2 owns property [1,3] with 0 PXL
//    //User3 owns property [75] with 4 PXL
//    //User4 owns property [] with 4 PXL
//  });
//  it("Users can choose to pay more more should they desire, which burns the coin and locks for longer/awards more", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pxlPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
//    }).then(function(balance) {
//      user0Balance = balance;
//      return pixelPropertyInstance.setColors(25, [1,2,3,4,5], 10, {from: accounts[0]});
//    }).then(function(s) {
//      return pxlPropertyInstance.balanceOf(accounts[0], {from: accounts[0]});
//    }).then(function(balance) {
//      assert.equal(balance - user0Balance, 15, "Burnt 10 coins, but bonus +25 for being first setter. 15 coin difference");
//    });
//  });

//  //#Changing the colour costs 1 coin for owned properties (burnt)
//  //DO IN SEPERATE ITERATION//#Changing the colour is free on the first day

//  //####SETTING TEST & HOVER LINKS####
//  it("A user can set their hover text", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setHoverText(byteArrayOnes, { from: accounts[0] });
//    }).then(function() {
//      return pxlPropertyInstance.getOwnerHoverText(accounts[0], { from: accounts[0] });
//    }).then(function(hoverText) {
//      assert.equal( hoverText[0], 1, "Should match byteArrayOnes");
//    });
//  });

//  it("A user can set their link", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setLink(byteArrayTwos, { from: accounts[0] });
//    }).then(function(setText) {
//      return pxlPropertyInstance.getOwnerLink(accounts[0], { from: accounts[0] });
//    }).then(function(link) {
//      assert.equal(link[1], 2, "Should match byteArrayTwos");
//    });
//  });
//  it("A user can change their hover text", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pxlPropertyInstance.getOwnerHoverText(accounts[0], { from: accounts[0] });
//    }).then(function(hoverText) {
//      assert.equal(hoverText[0], 1, "Should still match byteArrayOnes");
//      return pixelPropertyInstance.setHoverText(byteArrayTwos, { from: accounts[0] });
//    }).then(function(setText) {
//      return pxlPropertyInstance.getOwnerHoverText(accounts[0], { from: accounts[0] });
//    }).then(function(hoverText) {
//      assert.equal(hoverText[0], 2, "Should now match byteArrayTwos");
//    });
//  });

//  it("A user can change their link text", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pxlPropertyInstance.getOwnerLink(accounts[0], { from: accounts[0] });
//    }).then(function(link) {
//      assert.equal(link[0], 2, "Should still match byteArrayTwos");
//      return pixelPropertyInstance.setLink(byteArrayLong, { from: accounts[0] });
//    }).then(function(setLink) {
//      return pxlPropertyInstance.getOwnerLink(accounts[0], { from: accounts[0] });
//    }).then(function(link) {
//      assert.equal(link[0], 3, "Should now match byteArrayLong");
//    });
//  });
//  it("A user can change their hover text with strings (Version 1)", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setHoverText(stringToBigInts("1234567890123456789012345678901234567890123456789012345678901234"), { from: accounts[0] });
//    }).then(function(setText) {
//      return pxlPropertyInstance.getOwnerHoverText(accounts[0], { from: accounts[0] });
//    }).then(function(hoverText) {
//      assert.equal(bigIntsToString(hoverText), "1234567890123456789012345678901234567890123456789012345678901234", "Should say 123...");
//    });
//  });

//  it("A user can change their hover text with strings (Version 2)", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setHoverText(stringToBigInts("This string is short"), { from: accounts[0] });
//    }).then(function(setText) {
//      return pxlPropertyInstance.getOwnerHoverText(accounts[0], { from: accounts[0] });
//    }).then(function(hoverText) {
//      assert.equal(bigIntsToString(hoverText), "This string is short", "Should match the short string");
//    });
//  });

//  //####PROPERTY MODES####
//  it("Owners of properties can change the property mode", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pxlPropertyInstance.balanceOf(accounts[0], { from: accounts[0] });
//    }).then(function(balance)  {
//      privPubBeforeSet = balance.toNumber(); // Balance before making private
//      return new Promise((resolve, reject) => { //Wait a second for the setColors to wear off
//       let wait = setTimeout(() => {
//         resolve("Delay Finished");
//       }, 1000);
//     });
//   }).then(function() {
//      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Set to private
//    }).then(function(s) {
//     return pxlPropertyInstance.balanceOf(accounts[0], { from: accounts[0] });
//   }).then(function(balance)  {
//      privPubAfterSet = balance.toNumber();
//      assert.equal(privPubBeforeSet, privPubAfterSet + 1, "Should have burned one coin when setting it private");
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[4], true, "Should be in private mode");
//      return pixelPropertyInstance.setPropertyMode(0, false, 0, { from: accounts[0] }); //Set to public
//    }).then(function(s) {
//     return pxlPropertyInstance.balanceOf(accounts[0], { from: accounts[0] });
//   }).then(function(balanceAfter)  {
//      privPubResetPub = balanceAfter.toNumber(); //0 coins should be refunded
//      assert.equal(privPubAfterSet, balanceAfter, "Should have not gotten that one returned as it should truncate");
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[4], false, "Should be in public mode");
//    });
//  });
//  it("Owners can make it private, wait a bit, then cancel and be refunded appropriately", function() {
//   return VirtualRealEstate.deployed().then(function(instance) {
//     pixelPropertyInstance = instance;
//     return pixelPropertyInstance.setPropertyMode(0, true, 5, { from: accounts[0] }); //Set to private for 10 seconds
//   }).then(function(s) {
//     return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//   }).then(function(propertyData) {
//     assert.equal(propertyData[4], true, "Should be in private mode");
//     return pxlPropertyInstance.balanceOf(accounts[0], { from: accounts[0] });
//   }).then(function(balance) {
//     privPubRefundBefore = balance.toNumber();
//     return new Promise((resolve, reject) => {
//       let wait = setTimeout(() => {
//         resolve("Delay Finished");
//       }, 2000);
//     });
//   }).then(function() {
//     return pixelPropertyInstance.setPropertyMode(0, false, 0, { from: accounts[0] }); //Set to private for 10 seconds
//   }).then(function() {
//     return pxlPropertyInstance.balanceOf(accounts[0], { from: accounts[0] });
//   }).then(function(balance) {
//     assert.equal(privPubRefundBefore + 2, balance.toNumber(), "Should have refunded 2 coins");
//   });
//  });
//  it("SetColor on PrivateMode property that's expired changes it to Free-use mode", function() {
//    return VirtualRealEstate.deployed().then(function(instance) {
//      pixelPropertyInstance = instance;
//      return pixelPropertyInstance.setPropertyMode(0, true, 1, { from: accounts[0] }); //Set to private, but for zero time
//    }).then(function(s) {
//      return pixelPropertyInstance.getPropertyData(0, { from: accounts[0] });
//    }).then(function(propertyData) {
//      assert.equal(propertyData[4], true, "Should be in private mode");
//      return new Promise((resolve, reject) => {
//        let wait = setTimeout(() => {
//          resolve("Delay Finished");
//        }, 5000);
//      });
//    }).then(function() {
//      return pixelPropertyInstance.setColors(0, [9,8,7,6,5,4,3,2,1,0], 0, { from: accounts[1] }); //Change the colour
//    }).then(function(s) {
//      return pxlPropertyInstance.getPropertyColors(0, { from: accounts[0] });
//    }).then(function(propertyColors) {
//      assert.equal(propertyColors[0], 9, "Colour should have been set despite being in private as it expired");
//    });
//  });



 //Owner can withdraw money
 /*it("Contract owner can withdraw earned ETH", function() {
   return VirtualRealEstate.deployed().then(function(instance) {
     pixelPropertyInstance = instance;
     return web3.eth.getBalance(accounts[0]);
   }).then(function(balance) {
     ownerBalanceBefore = balance.toNumber();
     return pixelPropertyInstance.withdrawAll({from: accounts[0]});
    }).then(function() {
     return web3.eth.getBalance(accounts[0]);
   }).then(function(balance) {
     console.log(ownerBalanceBefore);
     assert.equal(ownerBalanceBefore + ownerETH, balance.toNumber(), "Can withdraw all earned currency");
   });
 });*/
});

/*
contract('PixelPropertyToken', function(accounts) {
  it("PixelPropertyToken Deployent & Migration", function() {
    return PixelPropertyToken.deployed(pxlPropertyInstance.address).then(function(instance) {
      PixelPropertyTokenInstance = instance;
      console.log("PixelPropertyToken - Test colors for zeros");
      return PixelPropertyTokenInstance.getPropertyColors(0, {from: accounts[0]});
    }).then(function(result) {
      console.log(result, "PixelPropertyToken - About To Migrate");
      return PixelPropertyTokenInstance.migratePropertyOwnership([0,1,2,3,4,5,6,7,8,9], {from: accounts[0]});
    }).then(function(result) {
      console.info("Post Migrate", result);
      return PixelPropertyTokenInstance.getPropertyData(0, { from: accounts[0] });
    }).then(function(result) {
      console.info(result);
      return PixelPropertyTokenInstance.getPropertyData(1, { from: accounts[0] });
    }).then(function(result) {
      console.info(result);
      return PixelPropertyTokenInstance.getPropertyData(2, { from: accounts[0] });
    }).then(function(result) {
      console.info(result);
      return PixelPropertyTokenInstance.getPropertyData(3, { from: accounts[0] });
    }).then(function(result) {
      console.info(result);
      return PixelPropertyTokenInstance.getPropertyData(4, { from: accounts[0] });
    });
  });
});
*/

