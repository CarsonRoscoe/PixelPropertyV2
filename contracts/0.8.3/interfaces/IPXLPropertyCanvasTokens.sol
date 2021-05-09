// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "./IPXLPropertyCanvas.sol";

interface IPXLPropertyCanvasTokens is IPXLPropertyCanvas {
    /* ### PropertyDapp Functions ### */
    function setOwnerHoverText(address textOwner, uint256[2] memory hoverText) external;
    function setOwnerLink(address websiteOwner, uint256[2] memory website) external;

    /* ### PixelProperty Property Functions ### */
    function setPropertyOwner(uint16 propertyID, address propertyOwner) external;
    function setPropertySalePrice(uint16 propertyID, uint256 salePrice) external;
    function setPropertyBecomePublic(uint16 propertyID, uint256 becomePublic) external;
    function setPropertyOwnerSalePricePrivateModeFlag(uint16 propertyID, address owner, uint256 salePrice, bool privateMode, uint8 flag) external;
    function setPropertyOwnerSalePrice(uint16 propertyID, address owner, uint256 salePrice) external;
    
    /* ### All Getters/Views ### */
    function getOwnerHoverText(address user) external view returns( uint256[2] memory);
    function getOwnerLink(address user) external view returns(uint256[2] memory);
    function getPropertyOwner(uint16 propertyID) external view returns(address);
    function getPropertySalePrice(uint16 propertyID) external view returns(uint256);
    function getPropertyData(uint16 propertyID, uint256 systemSalePriceETH, uint256 systemSalePricePXL) external view returns(address, uint256, uint256, uint256, bool, uint256, uint8);
    function getPropertyPrivateModeBecomePublic(uint16 propertyID) external view returns (bool, uint256);
    function getPropertyOwnerSalePrice(uint16 propertyID) external view returns (address, uint256);

    function getPropertyPrivateModeLastUpdateEarnUntil(uint16 propertyID) external override view returns (bool, uint256, uint256);
    function getPropertyFlag(uint16 propertyID) external override view returns(uint8);
    function getPropertyPrivateMode(uint16 propertyID) external override view returns(bool);
}