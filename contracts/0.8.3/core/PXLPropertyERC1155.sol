// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/IPXLPropertyCanvasTokens.sol";
import "./Constants.sol";

contract PXLPropertyERC1155 is ERC1155, AccessControl, IPXLPropertyCanvasTokens {
    /* Flags Constants */
    uint8 constant FLAG_NSFW = 1;
    uint8 constant FLAG_BAN = 2;
    
    // Mapping of PropertyID to Property
    mapping (uint16 => Property) public override properties;
    // Property Owner's website
    mapping (address => uint256[2]) public ownerWebsite;
    // Property Owner's hover text
    mapping (address => uint256[2]) public ownerHoverText;

    constructor() public ERC1155("https://pixelproperty.io/nft/{id}.json") {
        super._setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        for(uint i = 0; i < 1000; ++i) {
            _mint(msg.sender, i, 1, "");
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override (AccessControl, ERC1155) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId
            || super.supportsInterface(interfaceId);
    }
    
    /* ### PropertyDapp Functions ### */
    function setPropertyColors(uint16 propertyID, uint256[5] calldata colors) public override {
        require(super.hasRole(Constants.LEVEL_PROPERTY_DAPPS, msg.sender));
        for(uint256 i = 0; i < 5; i++) {
            if (properties[propertyID].colors[i] != colors[i]) {
                properties[propertyID].colors[i] = colors[i];
            }
        }
    }
    
    function setPropertyRowColor(uint16 propertyID, uint8 row, uint256 rowColor) public override {
        require(super.hasRole(Constants.LEVEL_PROPERTY_DAPPS, msg.sender));
        if (properties[propertyID].colors[row] != rowColor) {
            properties[propertyID].colors[row] = rowColor;
        }
    }
    
    function setOwnerHoverText(address textOwner, uint256[2] calldata hoverText) public override {
        require(super.hasRole(Constants.LEVEL_PROPERTY_DAPPS, msg.sender));
        require (textOwner != address(0));
        ownerHoverText[textOwner] = hoverText;
    }
    
    function setOwnerLink(address websiteOwner, uint256[2] calldata website) public override {
        require(super.hasRole(Constants.LEVEL_PROPERTY_DAPPS, msg.sender));
        require (websiteOwner != address(0));
        ownerWebsite[websiteOwner] = website;
    }

    /* ### PixelProperty Property Functions ### */
    function setPropertyPrivateMode(uint16 propertyID, bool isInPrivateMode) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].isInPrivateMode != isInPrivateMode) {
            properties[propertyID].isInPrivateMode = isInPrivateMode;
        }
    }
    
    function setPropertyOwner(uint16 propertyID, address propertyOwner) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].owner != propertyOwner) {
            properties[propertyID].owner = propertyOwner;
        }
    }
    
    function setPropertyLastUpdater(uint16 propertyID, address lastUpdater) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].lastUpdater != lastUpdater) {
            properties[propertyID].lastUpdater = lastUpdater;
        }
    }
    
    function setPropertySalePrice(uint16 propertyID, uint256 salePrice) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].salePrice != salePrice) {
            properties[propertyID].salePrice = salePrice;
        }
    }
    
    function setPropertyLastUpdate(uint16 propertyID, uint256 lastUpdate) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].lastUpdate = lastUpdate;
    }
    
    function setPropertyBecomePublic(uint16 propertyID, uint256 becomePublic) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].becomePublic = becomePublic;
    }
    
    function setPropertyEarnUntil(uint16 propertyID, uint256 earnUntil) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].earnUntil = earnUntil;
    }
    
    function setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(uint16 propertyID, bool privateMode, uint256 earnUntil, uint256 lastUpdate, uint256 becomePublic) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].isInPrivateMode != privateMode) {
            properties[propertyID].isInPrivateMode = privateMode;
        }
        properties[propertyID].earnUntil = earnUntil;
        properties[propertyID].lastUpdate = lastUpdate;
        properties[propertyID].becomePublic = becomePublic;
    }
    
    function setPropertyLastUpdaterLastUpdate(uint16 propertyID, address lastUpdater, uint256 lastUpdate) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].lastUpdater != lastUpdater) {
            properties[propertyID].lastUpdater = lastUpdater;
        }
        properties[propertyID].lastUpdate = lastUpdate;
    }
    
    function setPropertyBecomePublicEarnUntil(uint16 propertyID, uint256 becomePublic, uint256 earnUntil) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].becomePublic = becomePublic;
        properties[propertyID].earnUntil = earnUntil;
    }
    
    function setPropertyOwnerSalePricePrivateModeFlag(uint16 propertyID, address owner, uint256 salePrice, bool privateMode, uint8 flag) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].owner != owner) {
            properties[propertyID].owner = owner;
        }
        if (properties[propertyID].salePrice != salePrice) {
            properties[propertyID].salePrice = salePrice;
        }
        if (properties[propertyID].isInPrivateMode != privateMode) {
            properties[propertyID].isInPrivateMode = privateMode;
        }
        if (properties[propertyID].flag != flag) {
            properties[propertyID].flag = flag;
        }
    }
    
    function setPropertyOwnerSalePrice(uint16 propertyID, address owner, uint256 salePrice) public override {
        require(super.hasRole(Constants.LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].owner != owner) {
            properties[propertyID].owner = owner;
        }
        if (properties[propertyID].salePrice != salePrice) {
            properties[propertyID].salePrice = salePrice;
        }
    }
    
   
    
    /* ### All Getters/Views ### */
    function getOwnerHoverText(address user) public override view returns(uint256[2] memory) {
        return ownerHoverText[user];
    }
    
    function getOwnerLink(address user) public override view returns(uint256[2] memory) {
        return ownerWebsite[user];
    }
    
    function getPropertyFlag(uint16 propertyID) public override view returns(uint8) {
        return properties[propertyID].flag;
    }
    
    function getPropertyPrivateMode(uint16 propertyID) public override view returns(bool) {
        return properties[propertyID].isInPrivateMode;
    }
    
    function getPropertyOwner(uint16 propertyID) public override view returns(address) {
        return properties[propertyID].owner;
    }
    
    function getPropertyLastUpdater(uint16 propertyID) public override view returns(address) {
        return properties[propertyID].lastUpdater;
    }
    
    function getPropertyColors(uint16 propertyID) public override view returns(uint256[5] memory) {
        return properties[propertyID].colors;
    }

    function getPropertyColorsOfRow(uint16 propertyID, uint8 rowIndex) public override view returns(uint256) {
        require(rowIndex <= 9);
        return getPropertyColors(propertyID)[rowIndex];
    }
    
    function getPropertySalePrice(uint16 propertyID) public override view returns(uint256) {
        return properties[propertyID].salePrice;
    }
    
    function getPropertyLastUpdate(uint16 propertyID) public override view returns(uint256) {
        return properties[propertyID].lastUpdate;
    }
    
    function getPropertyBecomePublic(uint16 propertyID) public override view returns(uint256) {
        return properties[propertyID].becomePublic;
    }
    
    function getPropertyEarnUntil(uint16 propertyID) public override view returns(uint256) {
        return properties[propertyID].earnUntil;
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID, uint256 systemSalePriceETH, uint256 systemSalePricePXL) public override view returns(address, uint256, uint256, uint256, bool, uint256, uint8) {
        Property memory property = properties[propertyID];
        bool isInPrivateMode = property.isInPrivateMode;
        //If it's in private, but it has expired and should be public, set our bool to be public
        if (isInPrivateMode && property.becomePublic <= block.timestamp) { 
            isInPrivateMode = false;
        }
        if (properties[propertyID].owner == address(0)) {
            return (address(0), systemSalePriceETH, systemSalePricePXL, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        }
    }
    
    function getPropertyPrivateModeBecomePublic(uint16 propertyID) public override view returns (bool, uint256) {
        return (properties[propertyID].isInPrivateMode, properties[propertyID].becomePublic);
    }
    
    function getPropertyLastUpdaterBecomePublic(uint16 propertyID) public override view returns (address, uint256) {
        return (properties[propertyID].lastUpdater, properties[propertyID].becomePublic);
    }
    
    function getPropertyOwnerSalePrice(uint16 propertyID) public override view returns (address, uint256) {
        return (properties[propertyID].owner, properties[propertyID].salePrice);
    }
    
    function getPropertyPrivateModeLastUpdateEarnUntil(uint16 propertyID) public override view returns (bool, uint256, uint256) {
        return (properties[propertyID].isInPrivateMode, properties[propertyID].lastUpdate, properties[propertyID].earnUntil);
    }
}