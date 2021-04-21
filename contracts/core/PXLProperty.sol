pragma solidity ^0.8.4;

import "./PXLPropertyERC20.sol";
import "./PXLPropertyERC1155.sol";

contract PixelPropertyToken is PXLPropertyERC20, PXLPropertyERC1155 {
    constructor()
        PXLPropertyERC20()
        PXLPropertyERC1155()
    {
    }

}