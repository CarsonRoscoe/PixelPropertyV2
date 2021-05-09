pragma solidity ^0.4.2;
import "./PXLProperty.sol";
import "./VirtualRealEstate.sol";

contract PXLPropertyReferralDistributor {
    address owner;
    address authorizedSender;
    PXLProperty pxlProperty;
    
    constructor(address pxlPropertyAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
        owner = msg.sender;
        authorizedSender = msg.sender;
    }
    
    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    modifier authorizedSenderOnly() {
        require(msg.sender == authorizedSender);
        _;
    }
    
    function distributePXL(address[] recipients, uint256[] recipientsTokens) public authorizedSenderOnly() {
        require(recipients.length == recipientsTokens.length);
        for(uint256 i = 0; i < recipients.length; i++)
        {
            pxlProperty.transfer(recipients[i], recipientsTokens[i]);
        }
    }
    
    function transferPXL(address recipient, uint256 amount) public authorizedSenderOnly() {
        pxlProperty.transfer(recipient, amount);
    }
    
    function migrateOwner(address newOwner) public ownerOnly() {
        owner = newOwner;
    }
    
    function migrateAuthorizedSender(address newAuthorizedSender) public ownerOnly() {
        authorizedSender = newAuthorizedSender;
    }
}