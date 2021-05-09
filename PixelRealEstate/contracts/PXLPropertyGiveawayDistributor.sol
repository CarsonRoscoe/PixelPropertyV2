pragma solidity ^0.4.2;
import "./PXLProperty.sol";
import "./VirtualRealEstate.sol";

contract PXLPropertyGiveawayDistributor {
    address owner;
    PXLProperty pxlProperty;
    VirtualRealEstate virtualRealEstate;
    
    event PXLGiveaway(address[] recipients, uint256[] recipientsTokens);
    event PXLGiveaway(address[] recipients, uint256 tokensPerRecipient);
    event PropertyGiveaway(address recipient, uint16 propertyID);
    
    constructor(address pxlPropertyAddress, address virtualRealEstateAddress) public {
        pxlProperty = PXLProperty(pxlPropertyAddress);
        virtualRealEstate = VirtualRealEstate(virtualRealEstateAddress);
        owner = msg.sender;
    }
    
    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }
    
    function distributePXL(address[] recipients, uint256 tokensPerRecipient) public ownerOnly() {
        require(pxlProperty.balanceOf(address(this)) >= tokensPerRecipient * recipients.length);
        for(uint256 i = 0; i < recipients.length; i++)
        {
            pxlProperty.transfer(recipients[i], tokensPerRecipient);
        }
        emit PXLGiveaway(recipients, tokensPerRecipient);
    }
    
    function distributePXL(address[] recipients, uint256[] recipientsTokens) public ownerOnly() {
        require(recipients.length == recipientsTokens.length);
        for(uint256 i = 0; i < recipients.length; i++)
        {
            pxlProperty.transfer(recipients[i], recipientsTokens[i]);
        }
        emit PXLGiveaway(recipients, recipientsTokens);
    }
    
    function distributeProperties(address[] recipients, uint16[] propertyIDs) public ownerOnly() {
        require(recipients.length == propertyIDs.length);
        for(uint256 i = 0; i < recipients.length; i++)
        {
            virtualRealEstate.transferProperty(propertyIDs[i], recipients[i]);
            emit PropertyGiveaway(recipients[i], propertyIDs[i]);
        }
    }
    
    function transferPXL(address recipient, uint256 amount) public ownerOnly() {
        pxlProperty.transfer(recipient, amount);
    }
    
    function transferProperty(address recipient, uint16 propertyID) public ownerOnly() {
        virtualRealEstate.transferProperty(propertyID, recipient);
    }
    
    function migrate(address newOwner) public ownerOnly() {
        owner = newOwner;
    }
}