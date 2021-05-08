pragma solidity ^0.8.3;

import "../core/PXLPropertyERC20.sol";

contract KovanPXLProperty is PXLPropertyERC20 {
    constructor(uint256 bridgePXLStartingAmount) PXLPropertyERC20(bridgePXLStartingAmount)
    {
        
    }
}