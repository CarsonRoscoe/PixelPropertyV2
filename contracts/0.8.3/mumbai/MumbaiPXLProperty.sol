pragma solidity ^0.8.3;

import "../core/PXLPropertyERC20Canvas.sol";

contract MumbaiPXLProperty is PXLPropertyERC20Canvas {
    constructor(uint256 bridgePXLStartingAmount) PXLPropertyERC20Canvas(bridgePXLStartingAmount)
    {
        
    }
}