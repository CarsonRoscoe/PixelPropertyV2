pragma solidity ^0.8.3;

import "./IUsePXLPropertyCanvas.sol";

// PixelProperty
interface IVirtualRealEstate is IUsePXLPropertyCanvas {
    /* ### Events ### */
    event PropertyBought(uint16 indexed property, address indexed newOwner, uint256 nativeAmount, uint256 PXLAmount, uint256 timestamp, address indexed oldOwner);
    event SetUserHoverText(address indexed user, uint256[2] newHoverText);
    event SetUserSetLink(address indexed user, uint256[2] newLink);
    event PropertySetForSale(uint16 indexed property, uint256 forSalePrice);
    event DelistProperty(uint16 indexed property);
    event SetPropertyPublic(uint16 indexed property);
    event SetPropertyPrivate(uint16 indexed property, uint32 numMinutesPrivate, address indexed rewardedUser, uint256 indexed rewardedCoins);
    event Bid(uint16 indexed property, uint256 bid, uint256 timestamp);
    
    /* ### PUBLICALLY INVOKABLE FUNCTIONS ### */
    function getSaleInformation() external view returns(uint8, uint8, uint16, uint16, uint16, uint16);
    
    /* USER FUNCTIONS */
    
    // Property owners can change their hoverText for when a user mouses over their Properties
    function setHoverText(uint256[2] calldata text) external;
    
    // Property owners can change the clickable link for when a user clicks on their Properties
    function setLink(uint256[2] calldata website) external;
    
    // If a Property is private which has expired, make it public
    function tryForcePublic(uint16 propertyID) external;
    
    // Property owners can toggle their Properties between private mode and free-use mode
    function setPropertyMode(uint16 propertyID, bool setPrivateMode, uint32 numMinutesPrivate) external;
    
    // Transfer Property ownership between accounts. This has no cost, no cut and does not change flag status
    function transferProperty(uint16 propertyID, address newOwner) external returns(bool);
    
    // Purchase a unowned system-Property in a combination of PXL and ETH
    function buyProperty(uint16 propertyID, uint256 pxlValue) external payable returns(bool);
    
    // Purchase a listed user-owner Property in PXL
    function buyPropertyInPXL(uint16 propertyID, uint256 PXLValue) external;

    // Purchase a system-Property in pure ETH
    function buyPropertyInETH(uint16 propertyID) external payable returns(bool);
    
    // Property owner lists their Property for sale at their preferred price
    function listForSale(uint16 propertyID, uint256 price) external returns(bool);
    
    // Property owner delists their Property from being for sale
    function delist(uint16 propertyID) external returns(bool);

    // Make a public bid and notify a Property owner of your bid. Burn 1 coin
    function makeBid(uint16 propertyID, uint256 bidAmount) external;
    
    /* CONTRACT OWNER FUNCTIONS */
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID) external view returns(address, uint256, uint256, uint256, bool, uint256, uint32);
    
    // Gets the system ETH and PXL prices
    function getSystemSalePrices() external view returns(uint256, uint256);
    
    // Gets the sale prices of any Property in ETH and PXL
    function getForSalePrices(uint16 propertyID) external view returns(uint256, uint256);
    
    // Contract owner can withdraw up to ownerNativeCurrency amount
    function withdraw(uint256 amount) external;
    
    // Contract owner can withdraw ownerNativeCurrency amount
    function withdrawAll() external;
}

