pragma solidity ^0.8.3;


import "../interfaces/IUsePXLPropertyCanvas.sol";
import "../interfaces/IPXLPropertyERC20.sol";
import "../interfaces/IPXLPropertyCanvasTokens.sol";
import "hardhat/console.sol";

contract VirtualCanvas is IUsePXLPropertyCanvas {
    /* ### Variables ### */
    // Contract owner
    address owner;

    // Maximum amount of generated PXL a property can give away per minute
    uint8 constant PROPERTY_GENERATES_PER_MINUTE = 1;
    // The amount of time required for a Property to generate tokens for payouts
    uint256 constant PROPERTY_GENERATION_PAYOUT_INTERVAL = (1 minutes); //Generation amount
    
    mapping (uint16 => bool) hasBeenSet;
    mapping (uint16 => uint256) propertyPXLBalances;

    IPXLPropertyERC20 pxlPropertyTokens;
    IPXLPropertyCanvas pxlPropertyCanvas;
     
    /* ### MODIFIERS ### */

    // Only the contract owner can call these methods
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }
    
    // Can only be called on Properties referecing a valid PropertyID
    modifier validPropertyID(uint16 propertyID) {
        if (propertyID < 10000) {
            _;
        }
    }

    constructor(address pxlPropertyContract) {
        owner = msg.sender;

        pxlPropertyTokens = IPXLPropertyERC20(pxlPropertyContract);
        pxlPropertyCanvas = IPXLPropertyCanvas(pxlPropertyContract);
    }

    function setPXLPropertyContract(address pxlPropertyContract) external override ownerOnly() {        
        pxlPropertyTokens = IPXLPropertyERC20(pxlPropertyContract);
        pxlPropertyCanvas = IPXLPropertyCanvas(pxlPropertyContract);
    }
    
    // Contract owner can change who is the contract owner
    function changeOwners(address newOwner) external override ownerOnly() {
        owner = newOwner;
    }

    /* USER FUNCTIONS */

    // Update the 10x10 image data for a Property, triggering potential payouts if it succeeds
    function setColors(uint16 propertyID, uint256[5] calldata newColors, uint256 PXLToSpend) external override validPropertyID(propertyID) returns(bool) {
        uint256 projectedPayout = this.getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlPropertyCanvas.setPropertyColors(propertyID, newColors);
            (address lastUpdater, uint256 becomePublic) = pxlPropertyCanvas.getPropertyLastUpdaterBecomePublic(propertyID);
            emit PropertyColorUpdate(propertyID, newColors, block.timestamp, lastUpdater, becomePublic, projectedPayout);
            // The first user to set a Properties color ever is awarded extra PXL due to eating the extra GAS cost of creating the uint256[5]
            if (!hasBeenSet[propertyID]) {
                pxlPropertyTokens.rewardPXL(msg.sender, 25);
                hasBeenSet[propertyID] = true;
            }
            return true;
        }
        return false;
    }

    //Wrapper to call setColors 4 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX4(uint16[4] calldata propertyIDs, uint256[20] calldata newColors, uint256 PXLToSpendEach) external override returns(bool[4] memory) {
        bool[4] memory results;
        for(uint256 i = 0; i < 4; i++) {
            require(propertyIDs[i] < 10000);
            results[i] = this.setColors(propertyIDs[i], [newColors[i * 5], newColors[i * 5 + 1], newColors[i * 5 + 2], newColors[i * 5 + 3], newColors[i * 5 + 4]], PXLToSpendEach);
        }
        return results;
    }

    //Wrapper to call setColors 8 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX8(uint16[8] calldata propertyIDs, uint256[40] calldata newColors, uint256 PXLToSpendEach) external override returns(bool[8] memory) {
        bool[8] memory results;
        for(uint256 i = 0; i < 8; i++) {
            require(propertyIDs[i] < 10000);
            results[i] = this.setColors(propertyIDs[i], [newColors[i * 5], newColors[i * 5 + 1], newColors[i * 5 + 2], newColors[i * 5 + 3], newColors[i * 5 + 4]], PXLToSpendEach);
        }
        return results;
    }
    
    // Update a row of image data for a Property, triggering potential payouts if it succeeds
    function setRowColors(uint16 propertyID, uint8 row, uint256 newColorData, uint256 PXLToSpend) external override validPropertyID(propertyID) returns(bool) {
        require(row < 10);
        uint256 projectedPayout = this.getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlPropertyCanvas.setPropertyRowColor(propertyID, row, newColorData);
            (address lastUpdater, uint256 becomePublic) = pxlPropertyCanvas.getPropertyLastUpdaterBecomePublic(propertyID);
            emit PropertyColorUpdate(propertyID, pxlPropertyCanvas.getPropertyColors(propertyID), block.timestamp, lastUpdater, becomePublic, projectedPayout);
            return true;
        }
        return false;
    }

    // Shortterm solution. Longterm solution is to deploy a contract that becomes the owner who can have this call triggered via the actual owner via a Mainnet oracle
    function transferPropertyPXL(uint16 propertyID, address to, uint256 amount) public validPropertyID(propertyID) ownerOnly() returns (bool) {
        require(propertyPXLBalances[propertyID] > 0);
        require(amount <= propertyPXLBalances[propertyID]);
        require(to != address(0));
        pxlPropertyTokens.rewardPXL(to, amount);
        propertyPXLBalances[propertyID] -= amount;
        return true;
    }

      
    /* ## PRIVATE FUNCTIONS ## */
    
    // Function which wraps payouts for setColors
    function _tryTriggerPayout(uint16 propertyID, uint256 pxlToSpend) private returns(bool) {
        (uint8 propertyFlag, bool propertyIsInPrivateMode, address propertyOwner, address propertyLastUpdater, uint256 propertySalePrice, uint256 propertyLastUpdate, uint256 propertyBecomePublic, uint256 propertyEarnUntil) = pxlPropertyCanvas.properties(propertyID);
        
        //If the Property is in private mode and expired, make it public
        if (propertyIsInPrivateMode && propertyBecomePublic <= block.timestamp) {
            pxlPropertyCanvas.setPropertyPrivateMode(propertyID, false);
            propertyIsInPrivateMode = false;
        }
        //If its in private mode, only the owner can interact with it
        if (propertyIsInPrivateMode) {
            require(msg.sender == propertyOwner);
            require(propertyFlag != 2);
        //If if its in free-use mode
        } else if (propertyBecomePublic <= block.timestamp || propertyLastUpdater == msg.sender) {
            uint256 pxlSpent = pxlToSpend + 1; //All pxlSpent math uses N+1, so built in for convenience
            
            uint256 projectedAmount = this.getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
            pxlPropertyTokens.burnPXLRewardPXL(msg.sender, pxlToSpend, propertyLastUpdater, projectedAmount);
            propertyPXLBalances[propertyID] += projectedAmount;
            
            //BecomePublic = (N+1)/2 minutes of user-private mode
            //EarnUntil = (N+1)*5 coins earned max/minutes we can earn from
            pxlPropertyCanvas.setPropertyBecomePublicEarnUntil(propertyID, block.timestamp + (pxlSpent * PROPERTY_GENERATION_PAYOUT_INTERVAL / 2), block.timestamp + (pxlSpent * 5 * PROPERTY_GENERATION_PAYOUT_INTERVAL));
        } else {
            return false;
        }
        pxlPropertyCanvas.setPropertyLastUpdaterLastUpdate(propertyID, msg.sender, block.timestamp);
        return true;
    }

    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function getProjectedPayout(uint16 propertyID) external override view returns(uint256) {
        (bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) = pxlPropertyCanvas.getPropertyPrivateModeLastUpdateEarnUntil(propertyID);
        return this.getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
    }

    function getProjectedPayout(bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) external override view returns(uint256) {
        if (!propertyIsInPrivateMode && propertyLastUpdate != 0) {
            uint256 earnedUntil = (block.timestamp < propertyEarnUntil) ? block.timestamp : propertyEarnUntil;
            uint256 minutesSinceLastColourChange = (earnedUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL;
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
            //return (((now < propertyEarnUntil) ? now : propertyEarnUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL) * PROPERTY_GENERATES_PER_MINUTE; //Gave too high number wtf?
        }
        return 0;
    }
}