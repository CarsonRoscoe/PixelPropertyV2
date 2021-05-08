pragma solidity ^0.8.3;

interface IUsePXLProperty {
    function setPXLPropertyContract(address pxlPropertyContract) external;
    
    // Contract owner can change who is the contract owner
    function changeOwners(address newOwner) external;
}