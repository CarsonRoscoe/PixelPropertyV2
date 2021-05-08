pragma solidity ^0.8.3;

import "./IUsePXLProperty.sol";

interface IUsePXLPropertyCanvas is IUsePXLProperty {
    /* ### Events ### */
    event PropertyColorUpdate(uint16 indexed property, uint256[5] colors, uint256 lastUpdate, address indexed lastUpdaterPayee, uint256 becomePublic, uint256 indexed rewardedCoins);
    
    /* USER FUNCTIONS */

    // Update the 10x10 image data for a Property, triggering potential payouts if it succeeds
    function setColors(uint16 propertyID, uint256[5] calldata newColors, uint256 PXLToSpend) external returns(bool);

    //Wrapper to call setColors 4 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX4(uint16[4] calldata propertyIDs, uint256[20] calldata newColors, uint256 PXLToSpendEach) external returns(bool[4] calldata);

    //Wrapper to call setColors 8 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX8(uint16[8] calldata propertyIDs, uint256[40] calldata newColors, uint256 PXLToSpendEach) external returns(bool[8] calldata);
    
    // Update a row of image data for a Property, triggering potential payouts if it succeeds
    function setRowColors(uint16 propertyID, uint8 row, uint256 newColorData, uint256 PXLToSpend) external returns(bool);
    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function getProjectedPayout(uint16 propertyID) external view returns(uint256);
    
    function getProjectedPayout(bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) external view returns(uint256);
}



