pragma solidity ^0.4.2;
import "./PXLProperty.sol";

contract PXLPropertyUnitTests {
    PXLProperty_PixelPropertyAccess_UnitTests fullAccessUnitTests;
    PXLProperty_PropertyDAppAccess_UnitTests dappAccessUnitTests;
    PXLProperty pxlProperty;
    
    
    PXLProperty_Regulator mod1;
    PXLProperty_Regulator mod2;
    PXLProperty_Regulator admin1;
    PXLProperty_Regulator admin2;
    
    function PXLPropertyUnitTests() public {
        
    }
    
    function LoadUnitTests(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
        fullAccessUnitTests = new PXLProperty_PixelPropertyAccess_UnitTests(address(pxlProperty));
        pxlProperty.setPixelPropertyContract(address(fullAccessUnitTests));
        dappAccessUnitTests = new PXLProperty_PropertyDAppAccess_UnitTests(address(pxlProperty));
        pxlProperty.setPropertyDAppContract(address(dappAccessUnitTests), true);
        mod1 = new PXLProperty_Regulator(address(pxlProperty));
        mod2 = new PXLProperty_Regulator(address(pxlProperty));
        admin1 = new PXLProperty_Regulator(address(pxlProperty));
        admin2 = new PXLProperty_Regulator(address(pxlProperty));
    }
    
    function RunPixelPropertyAccessUnitTests() public returns(bool) {
        
        assert(fullAccessUnitTests.setPropertyPrivateMode_Test());
        assert(fullAccessUnitTests.setPropertyOwner_Test());
        assert(fullAccessUnitTests.setPropertyLastUpdater_Test());
        assert(fullAccessUnitTests.setPropertySalePrice_Test());
        assert(fullAccessUnitTests.setPropertyLastUpdate_Test());
        assert(fullAccessUnitTests.setPropertyBecomePublic_Test());
        assert(fullAccessUnitTests.setPropertyEarnUntil_Test());
        assert(fullAccessUnitTests.setPropertyPrivateModeEarnUntilLastUpdateBecomePublic_Test());
        assert(fullAccessUnitTests.setPropertyLastUpdaterLastUpdate_Test());
        assert(fullAccessUnitTests.setPropertyBecomePublicEarnUntil_Test());
        assert(fullAccessUnitTests.setPropertyOwnerSalePricePrivateModeFlag_Test());
        assert(fullAccessUnitTests.rewardPXLburnPXL_Test());
        assert(fullAccessUnitTests.setOwnerHoverText_Test());
        
        return true;
    }
    
    function RunPropertyDAppAccessUnitTests() public returns(bool) {
        
        assert(dappAccessUnitTests.setPropertyColors_Test());
        //assert(dappAccessUnitTests.setPropertyRowColor_Test());
        //assert(dappAccessUnitTests.setOwnerHoverText_Test());
        //assert(dappAccessUnitTests.setOwnerLink_Test());
        
        return true;
    }
    
    function RunModerationUnitTests() public returns(bool) {
        //Root3 (owner) can give admin2
        pxlProperty.setRegulatorAccessLevel(address(admin2), 4);
        
        //Admin2 can give Admin1
        admin2.setRegulatorAccessLevel(address(admin1), 3);
        
        //Admin1 can mod mods1&2
        admin1.setRegulatorAccessLevel(address(mod1), 1);
        admin1.setRegulatorAccessLevel(address(mod2), 2);
        
        //Mod1 can NSFW
        assert(mod1.setPropertyFlag(15, 1));
        
        //Mod2 can BAN
        fullAccessUnitTests.setPropertyPrivateModeToBan(15);
        assert(mod2.setPropertyFlag(15, 2));
        
        //Mod2 can unban
        assert(mod2.setPropertyFlag(15, 0));
        return true;
    }
    
    function RunContractUpdateUnitTests() public returns(bool) {
        PXLProperty_PixelPropertyAccess_Replacement replacement = new PXLProperty_PixelPropertyAccess_Replacement(address(pxlProperty));
        pxlProperty.setPixelPropertyContract(address(replacement)); //Can replace PixelProperty DApp
        assert(replacement.modifyPXLPropertyState()); //New PixelProperty can modify state
        fullAccessUnitTests = new PXLProperty_PixelPropertyAccess_UnitTests(address(pxlProperty)); 
        pxlProperty.setPixelPropertyContract(address(fullAccessUnitTests)); // Update PXLProperty again but a "new" version of old one
        RunPixelPropertyAccessUnitTests();
        return true;
    }
}

//Access as PixelProperty, which modifies ERC20 + Property Market + PropertyDApp
contract PXLProperty_PixelPropertyAccess_UnitTests {
    uint16 constant PROPERTY_1 = 10;
    PXLProperty pxlProperty;
    
    function PXLProperty_PixelPropertyAccess_UnitTests(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
    }
    
    function setPropertyPrivateMode_Test() public returns(bool) {
        pxlProperty.setPropertyPrivateMode(PROPERTY_1, true);
        assert(pxlProperty.getPropertyPrivateMode(PROPERTY_1) == true); // We can set to private mode
        pxlProperty.setPropertyPrivateMode(PROPERTY_1, false);
        assert(pxlProperty.getPropertyPrivateMode(PROPERTY_1) == false); // We can update it to false
        return true;
    }
    
    function setPropertyOwner_Test() public returns(bool) {
        pxlProperty.setPropertyOwner(PROPERTY_1, msg.sender);
        assert(pxlProperty.getPropertyOwner(PROPERTY_1) == msg.sender); // We can set the owner
        pxlProperty.setPropertyOwner(PROPERTY_1, address(this));
        assert(pxlProperty.getPropertyOwner(PROPERTY_1) == address(this)); // We can update the owner
        return true;
    }
    
    function setPropertyLastUpdater_Test() public returns(bool) {
        pxlProperty.setPropertyLastUpdater(PROPERTY_1, msg.sender); 
        assert(pxlProperty.getPropertyLastUpdater(PROPERTY_1) == msg.sender); // We can set the lastUpdater
        pxlProperty.setPropertyLastUpdater(PROPERTY_1, address(this));
        assert(pxlProperty.getPropertyLastUpdater(PROPERTY_1) == address(this)); // We can update the lastUpdater
        return true;
    }
    
    function setPropertySalePrice_Test() public returns(bool) {
        pxlProperty.setPropertySalePrice(PROPERTY_1, 10000);
        assert(pxlProperty.getPropertySalePrice(PROPERTY_1) == 10000); // We can set the sale price
        pxlProperty.setPropertySalePrice(PROPERTY_1, 555);
        assert(pxlProperty.getPropertySalePrice(PROPERTY_1) == 555); // We can update the sale price
        return true;
    }
    
    function setPropertyLastUpdate_Test() public returns(bool) {
        uint256 timestamp1 = now;
        uint256 timestamp2 = timestamp1 + 50;
        pxlProperty.setPropertyLastUpdate(PROPERTY_1, timestamp1);
        assert(pxlProperty.getPropertyLastUpdate(PROPERTY_1) == timestamp1); // We can set the lastUpdate
        pxlProperty.setPropertyLastUpdate(PROPERTY_1, timestamp2);
        assert(pxlProperty.getPropertyLastUpdate(PROPERTY_1) == timestamp2); // We can update the lastUpdate
        return true;
    }
    
    function setPropertyBecomePublic_Test() public returns(bool) {
        uint256 timestamp1 = now;
        uint256 timestamp2 = timestamp1 + 9999;
        pxlProperty.setPropertyBecomePublic(PROPERTY_1, timestamp1);
        assert(pxlProperty.getPropertyBecomePublic(PROPERTY_1) == timestamp1); // We can set the becomePublic
        pxlProperty.setPropertyBecomePublic(PROPERTY_1, timestamp2);
        assert(pxlProperty.getPropertyBecomePublic(PROPERTY_1) == timestamp2); // We can update the becomePublic
        return true;
    }
    
    function setPropertyEarnUntil_Test() public returns(bool) {
        uint256 timestamp1 = now;
        uint256 timestamp2 = timestamp1 + 555;
        pxlProperty.setPropertyEarnUntil(PROPERTY_1, timestamp1);
        assert(pxlProperty.getPropertyEarnUntil(PROPERTY_1) == timestamp1); // We can set the earnUntil
        pxlProperty.setPropertyEarnUntil(PROPERTY_1, timestamp2);
        assert(pxlProperty.getPropertyEarnUntil(PROPERTY_1) == timestamp2); // We can update the earnUntil
        return true;
    }
    
    function setPropertyPrivateModeEarnUntilLastUpdateBecomePublic_Test() public returns(bool) {
        bool currentPrivateMode = pxlProperty.getPropertyPrivateMode(PROPERTY_1);
        
        pxlProperty.setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(PROPERTY_1, (!currentPrivateMode), 1000, 3000, 5000);
        
        assert(pxlProperty.getPropertyPrivateMode(PROPERTY_1) == (!currentPrivateMode));
        assert(pxlProperty.getPropertyEarnUntil(PROPERTY_1) == 1000);
        assert(pxlProperty.getPropertyLastUpdate(PROPERTY_1) == 3000);
        assert(pxlProperty.getPropertyBecomePublic(PROPERTY_1) == 5000);
        return true;
    }
    
    function setPropertyLastUpdaterLastUpdate_Test() public returns(bool) {
        uint256 timestamp = now;
        
        pxlProperty.setPropertyLastUpdaterLastUpdate(PROPERTY_1, msg.sender, timestamp);
        
        assert(pxlProperty.getPropertyLastUpdater(PROPERTY_1) == msg.sender);
        assert(pxlProperty.getPropertyLastUpdate(PROPERTY_1) == timestamp);
        return true;
    }
    
    function setPropertyBecomePublicEarnUntil_Test() public returns(bool) {
        pxlProperty.setPropertyBecomePublicEarnUntil(PROPERTY_1, 50000, 60000);
        
        assert(pxlProperty.getPropertyBecomePublic(PROPERTY_1) == 50000);
        assert(pxlProperty.getPropertyEarnUntil(PROPERTY_1) == 60000);
        return true;
    }
    
    function setPropertyOwnerSalePricePrivateModeFlag_Test() public returns(bool) {
        bool currentPrivateMode = pxlProperty.getPropertyPrivateMode(PROPERTY_1);
        
        pxlProperty.setPropertyOwnerSalePricePrivateModeFlag(PROPERTY_1, msg.sender, 1000, (!currentPrivateMode), 3);
        
        assert(pxlProperty.getPropertyOwner(PROPERTY_1) == msg.sender);
        assert(pxlProperty.getPropertySalePrice(PROPERTY_1) == 1000);
        assert(pxlProperty.getPropertyPrivateMode(PROPERTY_1) == (!currentPrivateMode));
        assert(pxlProperty.getPropertyFlag(PROPERTY_1) == 3);
        return true;
    }
    
    function rewardPXLburnPXL_Test() public returns(bool) {
        uint256 totalSupply = pxlProperty.totalSupply();
        uint256 senderOriginalPXL = pxlProperty.balanceOf(msg.sender);
        uint256 thisOriginalPXL = pxlProperty.balanceOf(address(this));
        
        pxlProperty.rewardPXL(msg.sender, 10000);
        pxlProperty.rewardPXL(msg.sender, 200);
        pxlProperty.rewardPXL(address(this), 5000);
        pxlProperty.burnPXL(msg.sender, 1000);
        pxlProperty.rewardPXL(msg.sender, 50);
        pxlProperty.burnPXL(address(this), 3000);
        pxlProperty.rewardPXL(address(this), 100);
        pxlProperty.burnPXL(address(this), 50);
        pxlProperty.burnPXLRewardPXLx2(address(this), 10, address(this), 100, msg.sender, 100);
        
        uint256 senderPXL = 10000 + 200 - 1000 + 50 + 100;
        uint256 thisPXL = 5000 - 3000 + 100 - 50 - 10 + 100;
        uint256 properSupply = totalSupply + senderPXL + thisPXL;
        
        assert(pxlProperty.totalSupply() == properSupply);
        assert(pxlProperty.balanceOf(msg.sender) == senderOriginalPXL + senderPXL);
        assert(pxlProperty.balanceOf(address(this)) == thisOriginalPXL + thisPXL);
        return true;
    }
    
    //Proves that we have DApp access as well
    function setOwnerHoverText_Test() public returns(bool) {
        uint256[2] memory oldHoverText = pxlProperty.getOwnerHoverText(msg.sender);
        uint256[2] memory newHoverText;
        newHoverText[0] = 55555;
        newHoverText[1] = 63453;
        pxlProperty.setOwnerHoverText(msg.sender, newHoverText);
        assert(pxlProperty.getOwnerHoverText(msg.sender)[0] == newHoverText[0]);
        assert(pxlProperty.getOwnerHoverText(msg.sender)[1] == newHoverText[1]);
        return true;
    }

    
    //Needed for moderation test
    function setPropertyPrivateModeToBan(uint16 propertyID) public {
        pxlProperty.setPropertyPrivateMode(propertyID, true);
        uint256[5] memory newColors;
        for(uint256 i = 0; i < 5; i++) {
            newColors[i] = 777;
        }
        pxlProperty.setPropertyColors(propertyID, newColors);
    }
}

//Access as Property DApp
contract PXLProperty_PropertyDAppAccess_UnitTests {
    PXLProperty pxlProperty;
    uint16 constant PROPERTY_1 = 50;
    
    function PXLProperty_PropertyDAppAccess_UnitTests(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
    }
    
    function setPropertyColors_Test() public returns(bool) {
        uint256[5] memory defaultColors = pxlProperty.getPropertyColors(PROPERTY_1);
        assert(defaultColors[0] == 0 && defaultColors[2] == 0 && defaultColors[4] == 0); // There is no colors
        uint256[5] memory newColors;
        newColors[2] = 10;
        newColors[4] = 99;
        pxlProperty.setPropertyColors(PROPERTY_1, newColors);
        assert(pxlProperty.getPropertyColors(PROPERTY_1)[2] == 10); // We can set the colors
        assert(pxlProperty.getPropertyColors(PROPERTY_1)[4] == 99);
        newColors[2] = 66;
        pxlProperty.setPropertyColors(PROPERTY_1, newColors);
        assert(pxlProperty.getPropertyColors(PROPERTY_1)[2] == 66); // We can update the colors
        return true;
    }
    
    function setPropertyRowColor_Test() public returns(bool) {
        pxlProperty.setPropertyRowColor(PROPERTY_1, 3, 33);
        assert(pxlProperty.getPropertyColorsOfRow(PROPERTY_1, 3) == 33); // We can set the row
        return true;
    }
    
    function setOwnerHoverText_Test() public returns(bool) {
        uint256[2] memory newHoverText;
        newHoverText[0] = 55555;
        newHoverText[1] = 63453;
        pxlProperty.setOwnerHoverText(msg.sender, newHoverText);
        assert(pxlProperty.getOwnerHoverText(msg.sender)[0] == newHoverText[0]);
        assert(pxlProperty.getOwnerHoverText(msg.sender)[1] == newHoverText[1]);
        return true;
    }
    
    function setOwnerLink_Test() public returns(bool) {
        uint256[2] memory newLink;
        newLink[0] = 55555;
        newLink[1] = 63453;
        pxlProperty.setOwnerLink(msg.sender, newLink);
        assert(pxlProperty.getOwnerLink(msg.sender)[0] == newLink[0]);
        assert(pxlProperty.getOwnerLink(msg.sender)[1] == newLink[1]);
        return true;
    }
}

contract PXLProperty_PixelPropertyAccess_Replacement {
    uint16 constant PROPERTY_1 = 10;
    PXLProperty pxlProperty;
    
    function PXLProperty_PixelPropertyAccess_Replacement(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
    }
    
    function modifyPXLPropertyState() public returns(bool) {
        pxlProperty.rewardPXL(address(this), 1000);
        pxlProperty.burnPXL(address(this), 500);
        for(uint256 i = 0; i < 25; i++) {
            pxlProperty.setPropertyPrivateMode(PROPERTY_1, true);
            pxlProperty.setPropertyLastUpdate(PROPERTY_1, now);
            pxlProperty.setPropertyEarnUntil(PROPERTY_1, now + i);
            pxlProperty.setPropertyLastUpdater(PROPERTY_1, msg.sender);
        }
        pxlProperty.rewardPXL(msg.sender, 1000);
        pxlProperty.burnPXL(msg.sender, 500);
        return true;
    }
}

contract PXLProperty_Regulator {
    PXLProperty pxlProperty;
    
    function PXLProperty_Regulator(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
    }
    
    function setPropertyFlag(uint16 propertyID, uint8 flag) public returns(bool) {
        pxlProperty.setPropertyFlag(propertyID, flag);
        assert(pxlProperty.getPropertyFlag(propertyID) == flag);
        if (flag == 2) {
            assert(pxlProperty.getPropertyColors(propertyID)[0] == 0);
        }
        return true;
    }
    
    function setRegulatorAccessLevel(address user, uint8 level) public returns(bool) {
        pxlProperty.setRegulatorAccessLevel(user, level);
        return true;
    }
}