// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

interface IPXLPropertyCanvas {
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

    function properties(uint16 propertyID) external view returns (uint8 flag, bool isInPrivateMode, address owner, address lastUpdater, uint256 salePrice, uint256 lastUpdate, uint256 becomePublic, uint256 earnUntil);

    /* ### PropertyDapp Functions ### */
    function setPropertyPrivateMode(uint16 propertyID, bool isInPrivateMode) external;
    function setPropertyColors(uint16 propertyID, uint256[5] memory colors) external;
    function setPropertyRowColor(uint16 propertyID, uint8 row, uint256 rowColor) external;
    
    /* ### PixelProperty Property Functions ### */
    function setPropertyLastUpdate(uint16 propertyID, uint256 lastUpdate) external;
    function setPropertyLastUpdater(uint16 propertyID, address lastUpdater) external;
    function setPropertyEarnUntil(uint16 propertyID, uint256 earnUntil) external;
    function setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(uint16 propertyID, bool privateMode, uint256 earnUntil, uint256 lastUpdate, uint256 becomePublic) external;
    function setPropertyLastUpdaterLastUpdate(uint16 propertyID, address lastUpdater, uint256 lastUpdate) external;
    function setPropertyBecomePublicEarnUntil(uint16 propertyID, uint256 becomePublic, uint256 earnUntil) external;
    
    /* ### All Getters/Views ### */
    function getPropertyLastUpdater(uint16 propertyID) external view returns(address);
    function getPropertyColors(uint16 propertyID) external view returns(uint256[5] memory);
    function getPropertyColorsOfRow(uint16 propertyID, uint8 rowIndex) external view returns(uint256);
    function getPropertyLastUpdate(uint16 propertyID) external view returns(uint256);
    function getPropertyBecomePublic(uint16 propertyID) external view returns(uint256);
    function getPropertyEarnUntil(uint16 propertyID) external view returns(uint256);
    function getPropertyLastUpdaterBecomePublic(uint16 propertyID) external view returns (address, uint256);
    function getPropertyPrivateModeLastUpdateEarnUntil(uint16 propertyID) external view returns (bool, uint256, uint256);
    function getPropertyFlag(uint16 propertyID) external view returns(uint8);
    function getPropertyPrivateMode(uint16 propertyID) external view returns(bool);
}