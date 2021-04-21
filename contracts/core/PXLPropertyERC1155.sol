// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PXLPropertyERC1155 is ERC1155, AccessControl {
    /* Access Level Constants */
    bytes32 public constant LEVEL_OWNER = keccak256("LEVEL_ROOT"); // Can set pixelPropertyContract
    bytes32 public constant LEVEL_ROOT = keccak256("LEVEL_ROOT"); // Can set property dapps
    bytes32 public constant LEVEL_ADMIN = keccak256("LEVEL_ADMIN"); // Can manager moderators
    bytes32 public constant LEVEL_MODERATOR = keccak256("LEVEL_MODERATOR"); // ban power
    bytes32 public constant LEVEL_FLAGGER = keccak256("LEVEL_FLAGGER"); // nsfw/flagging
    bytes32 public constant LEVEL_PIXEL_PROPERTY = keccak256("LEVEL_PIXEL_PROPERTY"); // Power over PXL generation/burning & Property ownership 
    bytes32 public constant LEVEL_PROPERTY_DAPPS = keccak256("MINLEVEL_PROPERTY_DAPPSTER_ROLE"); // Power over manipulating property data
    
    /* Flags Constants */
    uint8 constant FLAG_NSFW = 1;
    uint8 constant FLAG_BAN = 2;
    
    // Mapping of PropertyID to Property
    mapping (uint16 => Property) public properties;
    // Property Owner's website
    mapping (address => uint256[2]) public ownerWebsite;
    // Property Owner's hover text
    mapping (address => uint256[2]) public ownerHoverText;


    /* ### Ownable Property Structure ### */
    struct Property {
        uint8 flag;
        bool isInPrivateMode; //Whether in private mode for owner-only use or free-use mode to be shared
        address owner; //Who owns the Property. If its zero (0), then no owner and known as a "system-Property"
        address lastUpdater; //Who last changed the color of the Property
        uint256[5] colors; //10x10 rgb pixel colors per property. colors[0] is the top row, colors[9] is the bottom row
        uint256 salePrice; //PXL price the owner has the Property on sale for. If zero, then its not for sale.
        uint256 lastUpdate; //Timestamp of when it had its color last updated
        uint256 becomePublic; //Timestamp on when to become public
        uint256 earnUntil; //Timestamp on when Property token generation will stop
    }

    constructor() public ERC1155("https://pixelproperty.io/nft/{id}.json") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        for(uint i = 0; i < 1000; ++i) {
            _mint(msg.sender, i, 1, "");
        }
    }


    
    /* ### PropertyDapp Functions ### */
    function setPropertyColors(uint16 propertyID, uint256[5] colors) public {
        require(hasRole(LEVEL_PROPERTY_DAPPS, msg.sender));
        for(uint256 i = 0; i < 5; i++) {
            if (properties[propertyID].colors[i] != colors[i]) {
                properties[propertyID].colors[i] = colors[i];
            }
        }
    }
    
    function setPropertyRowColor(uint16 propertyID, uint8 row, uint256 rowColor) public {
        require(hasRole(LEVEL_PROPERTY_DAPPS, msg.sender));
        if (properties[propertyID].colors[row] != rowColor) {
            properties[propertyID].colors[row] = rowColor;
        }
    }
    
    function setOwnerHoverText(address textOwner, uint256[2] hoverText) public {
        require(hasRole(LEVEL_PROPERTY_DAPPS, msg.sender));
        require (textOwner != 0);
        ownerHoverText[textOwner] = hoverText;
    }
    
    function setOwnerLink(address websiteOwner, uint256[2] website) public {
        require(hasRole(LEVEL_PROPERTY_DAPPS, msg.sender));
        require (websiteOwner != 0);
        ownerWebsite[websiteOwner] = website;
    }

    /* ### PixelProperty Property Functions ### */
    function setPropertyPrivateMode(uint16 propertyID, bool isInPrivateMode) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].isInPrivateMode != isInPrivateMode) {
            properties[propertyID].isInPrivateMode = isInPrivateMode;
        }
    }
    
    function setPropertyOwner(uint16 propertyID, address propertyOwner) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].owner != propertyOwner) {
            properties[propertyID].owner = propertyOwner;
        }
    }
    
    function setPropertyLastUpdater(uint16 propertyID, address lastUpdater) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].lastUpdater != lastUpdater) {
            properties[propertyID].lastUpdater = lastUpdater;
        }
    }
    
    function setPropertySalePrice(uint16 propertyID, uint256 salePrice) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].salePrice != salePrice) {
            properties[propertyID].salePrice = salePrice;
        }
    }
    
    function setPropertyLastUpdate(uint16 propertyID, uint256 lastUpdate) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].lastUpdate = lastUpdate;
    }
    
    function setPropertyBecomePublic(uint16 propertyID, uint256 becomePublic) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].becomePublic = becomePublic;
    }
    
    function setPropertyEarnUntil(uint16 propertyID, uint256 earnUntil) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].earnUntil = earnUntil;
    }
    
    function setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(uint16 propertyID, bool privateMode, uint256 earnUntil, uint256 lastUpdate, uint256 becomePublic) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].isInPrivateMode != privateMode) {
            properties[propertyID].isInPrivateMode = privateMode;
        }
        properties[propertyID].earnUntil = earnUntil;
        properties[propertyID].lastUpdate = lastUpdate;
        properties[propertyID].becomePublic = becomePublic;
    }
    
    function setPropertyLastUpdaterLastUpdate(uint16 propertyID, address lastUpdater, uint256 lastUpdate) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].lastUpdater != lastUpdater) {
            properties[propertyID].lastUpdater = lastUpdater;
        }
        properties[propertyID].lastUpdate = lastUpdate;
    }
    
    function setPropertyBecomePublicEarnUntil(uint16 propertyID, uint256 becomePublic, uint256 earnUntil) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        properties[propertyID].becomePublic = becomePublic;
        properties[propertyID].earnUntil = earnUntil;
    }
    
    function setPropertyOwnerSalePricePrivateModeFlag(uint16 propertyID, address owner, uint256 salePrice, bool privateMode, uint8 flag) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
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
    
    function setPropertyOwnerSalePrice(uint16 propertyID, address owner, uint256 salePrice) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        if (properties[propertyID].owner != owner) {
            properties[propertyID].owner = owner;
        }
        if (properties[propertyID].salePrice != salePrice) {
            properties[propertyID].salePrice = salePrice;
        }
    }
    
   
    
    /* ### All Getters/Views ### */
    function getOwnerHoverText(address user) public view returns(uint256[2]) {
        return ownerHoverText[user];
    }
    
    function getOwnerLink(address user) public view returns(uint256[2]) {
        return ownerWebsite[user];
    }
    
    function getPropertyFlag(uint16 propertyID) public view returns(uint8) {
        return properties[propertyID].flag;
    }
    
    function getPropertyPrivateMode(uint16 propertyID) public view returns(bool) {
        return properties[propertyID].isInPrivateMode;
    }
    
    function getPropertyOwner(uint16 propertyID) public view returns(address) {
        return properties[propertyID].owner;
    }
    
    function getPropertyLastUpdater(uint16 propertyID) public view returns(address) {
        return properties[propertyID].lastUpdater;
    }
    
    function getPropertyColors(uint16 propertyID) public view returns(uint256[5]) {
        if (properties[propertyID].colors[0] != 0 || properties[propertyID].colors[1] != 0 || properties[propertyID].colors[2] != 0 || properties[propertyID].colors[3] != 0 || properties[propertyID].colors[4] != 0) {
            return properties[propertyID].colors;
        } else {
            return oldPXLProperty.getPropertyColors(propertyID);
        }
    }

    function getPropertyColorsOfRow(uint16 propertyID, uint8 rowIndex) public view returns(uint256) {
        require(rowIndex <= 9);
        return getPropertyColors(propertyID)[rowIndex];
    }
    
    function getPropertySalePrice(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].salePrice;
    }
    
    function getPropertyLastUpdate(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].lastUpdate;
    }
    
    function getPropertyBecomePublic(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].becomePublic;
    }
    
    function getPropertyEarnUntil(uint16 propertyID) public view returns(uint256) {
        return properties[propertyID].earnUntil;
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID, uint256 systemSalePriceETH, uint256 systemSalePricePXL) public view returns(address, uint256, uint256, uint256, bool, uint256, uint8) {
        Property memory property = properties[propertyID];
        bool isInPrivateMode = property.isInPrivateMode;
        //If it's in private, but it has expired and should be public, set our bool to be public
        if (isInPrivateMode && property.becomePublic <= now) { 
            isInPrivateMode = false;
        }
        if (properties[propertyID].owner == 0) {
            return (0, systemSalePriceETH, systemSalePricePXL, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        } else {
            return (property.owner, 0, property.salePrice, property.lastUpdate, isInPrivateMode, property.becomePublic, property.flag);
        }
    }
    
    function getPropertyPrivateModeBecomePublic(uint16 propertyID) public view returns (bool, uint256) {
        return (properties[propertyID].isInPrivateMode, properties[propertyID].becomePublic);
    }
    
    function getPropertyLastUpdaterBecomePublic(uint16 propertyID) public view returns (address, uint256) {
        return (properties[propertyID].lastUpdater, properties[propertyID].becomePublic);
    }
    
    function getPropertyOwnerSalePrice(uint16 propertyID) public view returns (address, uint256) {
        return (properties[propertyID].owner, properties[propertyID].salePrice);
    }
    
    function getPropertyPrivateModeLastUpdateEarnUntil(uint16 propertyID) public view returns (bool, uint256, uint256) {
        return (properties[propertyID].isInPrivateMode, properties[propertyID].lastUpdate, properties[propertyID].earnUntil);
    }
}