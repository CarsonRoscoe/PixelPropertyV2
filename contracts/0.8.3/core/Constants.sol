pragma solidity ^0.8.3;

library Constants {
    /* Access Level Constants */
    bytes32 public constant LEVEL_OWNER = keccak256("LEVEL_OWNER"); // Can set pixelPropertyContract
    bytes32 public constant LEVEL_ROOT = keccak256("LEVEL_ROOT"); // Can set property dapps
    bytes32 public constant LEVEL_ADMIN = keccak256("LEVEL_ADMIN"); // Can manager moderators
    bytes32 public constant LEVEL_MODERATOR = keccak256("LEVEL_MODERATOR"); // ban power
    bytes32 public constant LEVEL_FLAGGER = keccak256("LEVEL_FLAGGER"); // nsfw/flagging
    bytes32 public constant LEVEL_PIXEL_PROPERTY = keccak256("LEVEL_PIXEL_PROPERTY"); // Power over PXL generation/burning & Property ownership 
    bytes32 public constant LEVEL_PROPERTY_DAPPS = keccak256("MINLEVEL_PROPERTY_DAPPSTER_ROLE"); // Power over manipulating property data
}