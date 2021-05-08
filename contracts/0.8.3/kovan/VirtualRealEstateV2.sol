pragma solidity ^0.8.3;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IVirtualRealEstate.sol";
import "../interfaces/IPXLPropertyCanvasTokens.sol";
import "../interfaces/IPXLPropertyERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "hardhat/console.sol";

interface IPXLPropertyTokenComplete is IPXLPropertyERC20, IPXLPropertyCanvasTokens {}

/**
 * A PixelProperty customized implementation of ERC1155 based on OpenZeppelin's implementation.
 * 
 * @dev Implementation of the basic standard multi-token.
 * See https://eips.ethereum.org/EIPS/eip-1155
 * Originally based on code by Enjin: https://github.com/enjin/erc-1155
 *
 * _Available since v3.1._
 */
 contract VirtualRealEstateV2 is IVirtualRealEstate, Context, ERC165, IERC1155, IERC1155MetadataURI {
    using Address for address;
    
    /* ### Variables ### */
    // Contract owner
    address owner;
    
    mapping (uint16 => bool) hasBeenSet;
    
    // The amount in % for which a user is paid
    uint8 constant USER_BUY_CUT_PERCENT = 98;
    // Maximum amount of generated PXL a property can give away per minute
    uint8 constant PROPERTY_GENERATES_PER_MINUTE = 1;
    // The amount of time required for a Property to generate tokens for payouts
    uint256 constant PROPERTY_GENERATION_PAYOUT_INTERVAL = (1 minutes); //Generation amount
    
    uint256 ownerEth = 0; // Amount of ETH the contract owner is entitled to withdraw (only Root account can do withdraws)
    
    // The current system prices of ETH and PXL, for which unsold Properties are listed for sale at
    uint256 systemSalePriceETH;
    uint256 systemSalePricePXL;
    uint8 systemPixelIncreasePercent;
    uint8 systemPriceIncreaseStep;
    uint16 systemETHStepTally;
    uint16 systemPXLStepTally;
    uint16 systemETHStepCount;
    uint16 systemPXLStepCount;

    IPXLPropertyERC20 pxlPropertyTokens;
    IPXLPropertyCanvasTokens pxlPropertyCanvas;

    bool migrationCompleted;
    
    // Mapping from token ID to account balances
    mapping (uint256 => mapping(address => uint256)) private _balances;

    // Mapping from account to operator approvals
    mapping (address => mapping(address => bool)) private _operatorApprovals;
    

    // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
    string private _uri;
    
    
    
    /* ### MODIFIERS ### */

    // Only the contract owner can call these methods
    modifier ownerOnly() {
        require(owner == msg.sender);
        _;
    }
    
    // Can only be called on Properties referecing a valid PropertyID
    modifier validPropertyID(uint16 propertyID) {
        if (propertyID < 10000) {
            _;
        }
    }

    /* ### PUBLICALLY INVOKABLE FUNCTIONS ### */
    
    /* CONSTRUCTOR */
    
    constructor(string memory uri_, address virtualRealEstateV1, address pxlPropertyContract){
        _setURI(uri_);
        owner = msg.sender; // Default the owner to be whichever Ethereum account created the contract
        systemSalePricePXL = 1000; //Initial PXL system price
        systemSalePriceETH = 19500000000000000; //Initial ETH system price
        systemPriceIncreaseStep = 10;
        systemPixelIncreasePercent = 5;
        systemETHStepTally = 0;
        systemPXLStepTally = 0;
        systemETHStepCount = 1;
        systemPXLStepCount = 1;

        console.log("Before");

        pxlPropertyTokens = IPXLPropertyERC20(pxlPropertyContract);
        pxlPropertyCanvas = IPXLPropertyCanvasTokens(pxlPropertyContract);
        console.log("After");
        
        // <Mainnet migration code - unfinished>
        //IVirtualRealEstate oldVirtualRealEstate = IVirtualRealEstate(virtualRealEstateV1);
        //
        //(uint8 pixelIncreasePercent, uint8 priceIncreaseStep, uint16 ETHStepTally, uint16 PXLStepTally, uint16 ETHStepCount, uint16 PXLStepCount) = oldVirtualRealEstate.getSaleInformation();
        //(uint256 salePriceETH, uint256 salePricePXL) = oldVirtualRealEstate.getSystemSalePrices();
        //systemSalePricePXL = salePricePXL;
        //systemSalePriceETH = salePriceETH;
        //systemPriceIncreaseStep = priceIncreaseStep;
        //systemPixelIncreasePercent = pixelIncreasePercent;
        //systemETHStepTally = ETHStepTally;
        //systemPXLStepTally = PXLStepTally;
        //systemETHStepCount = ETHStepCount;
        //systemPXLStepCount = PXLStepCount;
        //
        //for(uint16 id = 0; id < 10000; ++id) {
        //    console.log("minting %s", id);
        //    console.log("owner %s", pxlProperty.getPropertyOwner(id));
        //    _mint(pxlProperty.getPropertyOwner(id), id, 1, "");
        //    console.log("minted");
        //}
    }
    
    // ## IVirtualRealEstate ##
    
    function setPXLPropertyContract(address pxlPropertyContract) external override ownerOnly() {
        console.log("In");

        pxlPropertyTokens = IPXLPropertyERC20(pxlPropertyContract);
        pxlPropertyCanvas = IPXLPropertyCanvasTokens(pxlPropertyContract);
        
        console.log("Out");

    }
    
    // Transfer ownership of a Property and reset their info
    function _transferProperty(uint16 propertyID, address newOwner, uint256 ethAmount, uint256 PXLAmount, uint8 flag, address oldOwner) internal {
        require(newOwner != address(0));
        pxlPropertyCanvas.setPropertyOwnerSalePricePrivateModeFlag(propertyID, newOwner, 0, false, flag);
        emit PropertyBought(propertyID, newOwner, ethAmount, PXLAmount, block.timestamp, oldOwner);
    }
    
    function getSaleInformation() external override view ownerOnly() returns(uint8, uint8, uint16, uint16, uint16, uint16) {
        return (systemPixelIncreasePercent, systemPriceIncreaseStep, systemETHStepTally, systemPXLStepTally, systemETHStepCount, systemPXLStepCount);
    }
    
    /* USER FUNCTIONS */
    
    // Property owners can change their hoverText for when a user mouses over their Properties
    function setHoverText(uint256[2] calldata text) external override {
        pxlPropertyCanvas.setOwnerHoverText(msg.sender, text);
        emit SetUserHoverText(msg.sender, text);
    }
    
    // Property owners can change the clickable link for when a user clicks on their Properties
    function setLink(uint256[2] calldata website) external override {
        pxlPropertyCanvas.setOwnerLink(msg.sender, website);
        emit SetUserSetLink(msg.sender, website);
    }
    
    // If a Property is private which has expired, make it public
    function tryForcePublic(uint16 propertyID) external override validPropertyID(propertyID) { 
        (bool isInPrivateMode, uint256 becomePublic) = pxlPropertyCanvas.getPropertyPrivateModeBecomePublic(propertyID);
        if (isInPrivateMode && becomePublic < block.timestamp) {
            pxlPropertyCanvas.setPropertyPrivateMode(propertyID, false);
        }
    }
    
    // Update the 10x10 image data for a Property, triggering potential payouts if it succeeds
    function setColors(uint16 propertyID, uint256[5] calldata newColors, uint256 PXLToSpend) external override validPropertyID(propertyID) returns(bool) {
        uint256 projectedPayout = this.getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlPropertyCanvas.setPropertyColors(propertyID, newColors);
            (address lastUpdater, uint256 becomePublic) = pxlPropertyCanvas.getPropertyLastUpdaterBecomePublic(propertyID);
            emit PropertyColorUpdate(propertyID, newColors, block.timestamp, lastUpdater, becomePublic, projectedPayout);
            // The first user to set a Properties color ever is awarded extra PXL due to eating the extra GAS cost of creating the uint256[5]
            if (!hasBeenSet[propertyID]) {
                pxlPropertyTokens.rewardPXL(msg.sender, 25);
                hasBeenSet[propertyID] = true;
            }
            return true;
        }
        return false;
    }

    //Wrapper to call setColors 4 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX4(uint16[4] calldata propertyIDs, uint256[20] calldata newColors, uint256 PXLToSpendEach) external override returns(bool[4] memory) {
        bool[4] memory results;
        for(uint256 i = 0; i < 4; i++) {
            require(propertyIDs[i] < 10000);
            results[i] = this.setColors(propertyIDs[i], [newColors[i * 5], newColors[i * 5 + 1], newColors[i * 5 + 2], newColors[i * 5 + 3], newColors[i * 5 + 4]], PXLToSpendEach);
        }
        return results;
    }

    //Wrapper to call setColors 8 times in one call. Reduces overhead, however still duplicate work everywhere to ensure
    function setColorsX8(uint16[8] calldata propertyIDs, uint256[40] calldata newColors, uint256 PXLToSpendEach) external override returns(bool[8] memory) {
        bool[8] memory results;
        for(uint256 i = 0; i < 8; i++) {
            require(propertyIDs[i] < 10000);
            results[i] = this.setColors(propertyIDs[i], [newColors[i * 5], newColors[i * 5 + 1], newColors[i * 5 + 2], newColors[i * 5 + 3], newColors[i * 5 + 4]], PXLToSpendEach);
        }
        return results;
    }
    
    // Update a row of image data for a Property, triggering potential payouts if it succeeds
    function setRowColors(uint16 propertyID, uint8 row, uint256 newColorData, uint256 PXLToSpend) external override validPropertyID(propertyID) returns(bool) {
        require(row < 10);
        uint256 projectedPayout = this.getProjectedPayout(propertyID);
        if (_tryTriggerPayout(propertyID, PXLToSpend)) {
            pxlPropertyCanvas.setPropertyRowColor(propertyID, row, newColorData);
            (address lastUpdater, uint256 becomePublic) = pxlPropertyCanvas.getPropertyLastUpdaterBecomePublic(propertyID);
            emit PropertyColorUpdate(propertyID, pxlPropertyCanvas.getPropertyColors(propertyID), block.timestamp, lastUpdater, becomePublic, projectedPayout);
            return true;
        }
        return false;
    }
    // Property owners can toggle their Properties between private mode and free-use mode
    function setPropertyMode(uint16 propertyID, bool setPrivateMode, uint32 numMinutesPrivate) external override validPropertyID(propertyID) {
        (uint8 propertyFlag, bool propertyIsInPrivateMode, address propertyOwner, address propertyLastUpdater, uint256 propertySalePrice, uint256 propertyLastUpdate, uint256 propertyBecomePublic, uint256 propertyEarnUntil) = pxlPropertyCanvas.properties(propertyID);
        
        require(msg.sender == propertyOwner);
        uint256 whenToBecomePublic = 0;
        uint256 rewardedAmount = 0;
        
        if (setPrivateMode) {
            //If inprivate, we can extend the duration, otherwise if becomePublic > now it means a free-use user locked it
            require(propertyIsInPrivateMode || propertyBecomePublic <= block.timestamp || propertyLastUpdater == msg.sender ); 
            require(numMinutesPrivate > 0);
            require(pxlPropertyTokens.balanceOf(msg.sender) >= numMinutesPrivate);
            // Determines when the Property becomes public, one payout interval per coin burned
            whenToBecomePublic = (block.timestamp < propertyBecomePublic ? propertyBecomePublic : block.timestamp) + PROPERTY_GENERATION_PAYOUT_INTERVAL * numMinutesPrivate;

            rewardedAmount = this.getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
            if (rewardedAmount > 0 && propertyLastUpdater != address(0)) {
                pxlPropertyTokens.burnPXLRewardPXLx2(msg.sender, numMinutesPrivate, propertyLastUpdater, rewardedAmount, msg.sender, rewardedAmount);
            } else {
                pxlPropertyTokens.burnPXL(msg.sender, numMinutesPrivate);
            }

        } else {
            // If its in private mode and still has time left, reimburse them for N-1 minutes tokens back
            if (propertyIsInPrivateMode && propertyBecomePublic > block.timestamp) {
                pxlPropertyTokens.rewardPXL(msg.sender, ((propertyBecomePublic - block.timestamp) / PROPERTY_GENERATION_PAYOUT_INTERVAL) - 1);
            }
        }
        
        pxlPropertyCanvas.setPropertyPrivateModeEarnUntilLastUpdateBecomePublic(propertyID, setPrivateMode, 0, 0, whenToBecomePublic);
        
        if (setPrivateMode) {
            emit SetPropertyPrivate(propertyID, numMinutesPrivate, propertyLastUpdater, rewardedAmount);
        } else {
            emit SetPropertyPublic(propertyID);
        }
    }
    // Transfer Property ownership between accounts. This has no cost, no cut and does not change flag status
    function transferProperty(uint16 propertyID, address newOwner) external override validPropertyID(propertyID) returns(bool) {
        require(pxlPropertyCanvas.getPropertyOwner(propertyID) == msg.sender);
        _transferProperty(propertyID, newOwner, 0, 0, pxlPropertyCanvas.getPropertyFlag(propertyID), msg.sender);
        _safeTransferFrom(msg.sender, newOwner, uint256(propertyID), 1, "");
        return true;
    }
    // Purchase a unowned system-Property in a combination of PXL and ETH
    function buyProperty(uint16 propertyID, uint256 pxlValue) external override validPropertyID(propertyID) payable returns(bool) {
        //Must be the first purchase, otherwise do it with PXL from another user
        require(pxlPropertyCanvas.getPropertyOwner(propertyID) == address(0));
        // Must be able to afford the given PXL
        require(pxlPropertyTokens.balanceOf(msg.sender) >= pxlValue);
        require(pxlValue != 0);
        
        // Protect against underflow
        require(pxlValue <= systemSalePricePXL);
        uint256 pxlLeft = systemSalePricePXL - pxlValue;
        uint256 ethLeft = systemSalePriceETH / systemSalePricePXL * pxlLeft;
        
        // Must have spent enough ETH to cover the ETH left after PXL price was subtracted
        require(msg.value >= ethLeft);
        
        pxlPropertyTokens.burnPXLRewardPXL(msg.sender, pxlValue, owner, pxlValue);
        
        systemPXLStepTally += uint16(100 * pxlValue / systemSalePricePXL);
        if (systemPXLStepTally >= 1000) {
             systemPXLStepCount++;
            systemSalePricePXL += systemSalePricePXL * 9 / systemPXLStepCount / 10;
            systemPXLStepTally -= 1000;
        }
        
        ownerEth += msg.value;

        systemETHStepTally += uint16(100 * pxlLeft / systemSalePricePXL);
        if (systemETHStepTally >= 1000) {
            systemETHStepCount++;
            systemSalePriceETH += systemSalePriceETH * 9 / systemETHStepCount / 10;
            systemETHStepTally -= 1000;
        }

        _transferProperty(propertyID, msg.sender, msg.value, pxlValue, 0, address(0));
        _safeTransferFrom(address(0), msg.sender, uint256(propertyID), 1, "");
        
        return true;
    }
    // Purchase a listed user-owner Property in PXL
    function buyPropertyInPXL(uint16 propertyID, uint256 PXLValue) external override validPropertyID(propertyID) {
        // If Property is system-owned
        (address propertyOwner, uint256 propertySalePrice) = pxlPropertyCanvas.getPropertyOwnerSalePrice(propertyID);
        address originalOwner = propertyOwner;
        if (propertyOwner == address(0)) {
            // Turn it into a user-owned at system price with contract owner as owner
            pxlPropertyCanvas.setPropertyOwnerSalePrice(propertyID, owner, systemSalePricePXL);
            propertyOwner = owner;
            propertySalePrice = systemSalePricePXL;
            // Increase system PXL price
            systemPXLStepTally += 100;
            if (systemPXLStepTally >= 1000) {
                systemPXLStepCount++;
                systemSalePricePXL += systemSalePricePXL * 9 / systemPXLStepCount / 10;
                systemPXLStepTally -= 1000;
            }
        }
        require(propertySalePrice <= PXLValue);
        uint256 amountTransfered = propertySalePrice * USER_BUY_CUT_PERCENT / 100;
        pxlPropertyTokens.burnPXLRewardPXLx2(msg.sender, propertySalePrice, propertyOwner, amountTransfered, owner, (propertySalePrice - amountTransfered));      
        _transferProperty(propertyID, msg.sender, 0, propertySalePrice, 0, originalOwner);
        _safeTransferFrom(address(0), msg.sender, uint256(propertyID), 1, "");
    }

    // Purchase a system-Property in pure ETH
    function buyPropertyInETH(uint16 propertyID) external override validPropertyID(propertyID) payable returns(bool) {
        require(pxlPropertyCanvas.getPropertyOwner(propertyID) == address(0));
        require(msg.value >= systemSalePriceETH);
        
        ownerEth += msg.value;
        systemETHStepTally += 100;
        if (systemETHStepTally >= 1000) {
            systemETHStepCount++;
            systemSalePriceETH += systemSalePriceETH * 9 / systemETHStepCount / 10;
            systemETHStepTally -= 1000;
        }
        _transferProperty(propertyID, msg.sender, msg.value, 0, 0, address(0));
        _safeTransferFrom(address(0), msg.sender, uint256(propertyID), 1, "");
        return true;
    }
    
    // Property owner lists their Property for sale at their preferred price
    function listForSale(uint16 propertyID, uint256 price) external override validPropertyID(propertyID) returns(bool) {
        require(price != 0);
        require(msg.sender == pxlPropertyCanvas.getPropertyOwner(propertyID));
        pxlPropertyCanvas.setPropertySalePrice(propertyID, price);
        emit PropertySetForSale(propertyID, price);
        return true;
    }
    
    // Property owner delists their Property from being for sale
    function delist(uint16 propertyID) external override validPropertyID(propertyID) returns(bool) {
        require(msg.sender == pxlPropertyCanvas.getPropertyOwner(propertyID));
        pxlPropertyCanvas.setPropertySalePrice(propertyID, 0);
        emit DelistProperty(propertyID);
        return true;
    }

    // Make a public bid and notify a Property owner of your bid. Burn 1 coin
    function makeBid(uint16 propertyID, uint256 bidAmount) external override validPropertyID(propertyID) {
        require(bidAmount > 0);
        require(pxlPropertyTokens.balanceOf(msg.sender) >= 1 + bidAmount);
        emit Bid(propertyID, bidAmount, block.timestamp);
        pxlPropertyTokens.burnPXL(msg.sender, 1);
    }
    
    /* CONTRACT OWNER FUNCTIONS */
    
    // Contract owner can withdraw up to ownerEth amount
    function withdraw(uint256 amount) external override ownerOnly() {
        if (amount <= ownerEth) {
            address payable _owner = payable(owner);
            _owner.transfer(amount);
            ownerEth -= amount;
        }
    }
    
    // Contract owner can withdraw ownerEth amount
    function withdrawAll() external override ownerOnly() {
        address payable _owner = payable(owner);
        _owner.transfer(ownerEth);
        ownerEth = 0;
    }
    
    // Contract owner can change who is the contract owner
    function changeOwners(address newOwner) external override ownerOnly() {
        owner = newOwner;
    }
    
    /* ## PRIVATE FUNCTIONS ## */
    
    // Function which wraps payouts for setColors
    function _tryTriggerPayout(uint16 propertyID, uint256 pxlToSpend) private returns(bool) {
        (uint8 propertyFlag, bool propertyIsInPrivateMode, address propertyOwner, address propertyLastUpdater, uint256 propertySalePrice, uint256 propertyLastUpdate, uint256 propertyBecomePublic, uint256 propertyEarnUntil) = pxlPropertyCanvas.properties(propertyID);
        
        //If the Property is in private mode and expired, make it public
        if (propertyIsInPrivateMode && propertyBecomePublic <= block.timestamp) {
            pxlPropertyCanvas.setPropertyPrivateMode(propertyID, false);
            propertyIsInPrivateMode = false;
        }
        //If its in private mode, only the owner can interact with it
        if (propertyIsInPrivateMode) {
            require(msg.sender == propertyOwner);
            require(propertyFlag != 2);
        //If if its in free-use mode
        } else if (propertyBecomePublic <= block.timestamp || propertyLastUpdater == msg.sender) {
            uint256 pxlSpent = pxlToSpend + 1; //All pxlSpent math uses N+1, so built in for convenience
            
            uint256 projectedAmount = this.getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
            pxlPropertyTokens.burnPXLRewardPXLx2(msg.sender, pxlToSpend, propertyLastUpdater, projectedAmount, propertyOwner, projectedAmount);
            
            //BecomePublic = (N+1)/2 minutes of user-private mode
            //EarnUntil = (N+1)*5 coins earned max/minutes we can earn from
            pxlPropertyCanvas.setPropertyBecomePublicEarnUntil(propertyID, block.timestamp + (pxlSpent * PROPERTY_GENERATION_PAYOUT_INTERVAL / 2), block.timestamp + (pxlSpent * 5 * PROPERTY_GENERATION_PAYOUT_INTERVAL));
        } else {
            return false;
        }
        pxlPropertyCanvas.setPropertyLastUpdaterLastUpdate(propertyID, msg.sender, block.timestamp);
        return true;
    }
    
    // Gets the (owners address, Ethereum sale price, PXL sale price, last update timestamp, whether its in private mode or not, when it becomes public timestamp, flag) for a Property
    function getPropertyData(uint16 propertyID) external override validPropertyID(propertyID) view returns(address, uint256, uint256, uint256, bool, uint256, uint32) {
        return pxlPropertyCanvas.getPropertyData(propertyID, systemSalePriceETH, systemSalePricePXL);
    }
    
    // Gets the system ETH and PXL prices
    function getSystemSalePrices() external override view returns(uint256, uint256) {
        return (systemSalePriceETH, systemSalePricePXL);
    }
    
    // Gets the sale prices of any Property in ETH and PXL
    function getForSalePrices(uint16 propertyID) external override validPropertyID(propertyID) view returns(uint256, uint256) {
        if (pxlPropertyCanvas.getPropertyOwner(propertyID) == address(0)) {
            return this.getSystemSalePrices();
        } else {
            return (0, pxlPropertyCanvas.getPropertySalePrice(propertyID));
        }
    }
    
    // Gets the projected sale price for a property should it be triggered at this very moment
    function getProjectedPayout(uint16 propertyID) external override view returns(uint256) {
        (bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) = pxlPropertyCanvas.getPropertyPrivateModeLastUpdateEarnUntil(propertyID);
        return this.getProjectedPayout(propertyIsInPrivateMode, propertyLastUpdate, propertyEarnUntil);
    }
    
    function getProjectedPayout(bool propertyIsInPrivateMode, uint256 propertyLastUpdate, uint256 propertyEarnUntil) external override view returns(uint256) {
        if (!propertyIsInPrivateMode && propertyLastUpdate != 0) {
            uint256 earnedUntil = (block.timestamp < propertyEarnUntil) ? block.timestamp : propertyEarnUntil;
            uint256 minutesSinceLastColourChange = (earnedUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL;
            return minutesSinceLastColourChange * PROPERTY_GENERATES_PER_MINUTE;
            //return (((now < propertyEarnUntil) ? now : propertyEarnUntil - propertyLastUpdate) / PROPERTY_GENERATION_PAYOUT_INTERVAL) * PROPERTY_GENERATES_PER_MINUTE; //Gave too high number wtf?
        }
        return 0;
    }
    

    // ## ERC1155 ##
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC1155).interfaceId
            || interfaceId == type(IERC1155MetadataURI).interfaceId
            || super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256) public view virtual override returns (string memory) {
        return _uri;
    }

    /**
     * @dev See {IERC1155-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id) public view virtual override returns (uint256) {
        require(account != address(0), "ERC1155: balance query for the zero address");
        return _balances[id][account];
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    )
        public
        view
        virtual
        override
        returns (uint256[] memory)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    /**
     * @dev See {IERC1155-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        require(_msgSender() != operator, "ERC1155: setting approval status for self");

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC1155-isApprovedForAll}.
     */
    function isApprovedForAll(address account, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[account][operator];
    }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        virtual
        override
    {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        public
        virtual
        override
    {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    /**
     * @dev Transfers `amount` tokens of token type `id` from `from` to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `from` must have a balance of tokens of type `id` of at least `amount`.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        internal
        virtual
    {
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, _asSingletonArray(id), _asSingletonArray(amount), data);

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;

        if (id < 10000 && amount == 1) {
            _transferProperty(uint16(id), to, 0, 0, 0, from);
        }

        emit TransferSingle(operator, from, to, id, amount);

        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_safeTransferFrom}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        virtual
    {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
            _balances[id][from] = fromBalance - amount;
            _balances[id][to] += amount;
            
            
            if (id < 10000 && amount == 1) {
                _transferProperty(uint16(id), to, 0, 0, 0, from);
            }
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
    }

    /**
     * @dev Sets a new URI for all token types, by relying on the token type ID
     * substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * By this mechanism, any occurrence of the `\{id\}` substring in either the
     * URI or any of the amounts in the JSON file at said URI will be replaced by
     * clients with the token type ID.
     *
     * For example, the `https://token-cdn-domain/\{id\}.json` URI would be
     * interpreted by clients as
     * `https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
     * for token type ID 0x4cce0.
     *
     * See {uri}.
     *
     * Because these URIs cannot be meaningfully represented by the {URI} event,
     * this function emits no events.
     */
    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `account`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - If `account` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _mint(address account, uint256 id, uint256 amount, bytes memory data) internal virtual {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), account, _asSingletonArray(id), _asSingletonArray(amount), data);

        _balances[id][account] += amount;
        emit TransferSingle(operator, address(0), account, id, amount);

        _doSafeTransferAcceptanceCheck(operator, address(0), account, id, amount, data);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function _mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        for (uint i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
        }

        emit TransferBatch(operator, address(0), to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(operator, address(0), to, ids, amounts, data);
    }

    /**
     * @dev Destroys `amount` tokens of token type `id` from `account`
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens of token type `id`.
     */
    function _burn(address account, uint256 id, uint256 amount) internal virtual {
        require(account != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, account, address(0), _asSingletonArray(id), _asSingletonArray(amount), "");

        uint256 accountBalance = _balances[id][account];
        require(accountBalance >= amount, "ERC1155: burn amount exceeds balance");
        
         if (id < 10000 && amount == 1) {
             require(pxlPropertyCanvas.getPropertyOwner(uint16(id)) == account);
            _transferProperty(uint16(id), address(0), 0, 0, 0, account);
        }
        
        _balances[id][account] = accountBalance - amount;
        

        emit TransferSingle(operator, account, address(0), id, amount);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     */
    function _burnBatch(address account, uint256[] memory ids, uint256[] memory amounts) internal virtual {
        require(account != address(0), "ERC1155: burn from the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, account, address(0), ids, amounts, "");

        for (uint i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 accountBalance = _balances[id][account];
            require(accountBalance >= amount, "ERC1155: burn amount exceeds balance");
            _balances[id][account] = accountBalance - amount;
            
            if (id < 10000 && amount == 1) {
                require(pxlPropertyCanvas.getPropertyOwner(uint16(id)) == account);
                _transferProperty(uint16(id), address(0), 0, 0, 0, account);
            }
        }

        emit TransferBatch(operator, account, address(0), ids, amounts);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning, as well as batched variants.
     *
     * The same hook is called on both single and batched variants. For single
     * transfers, the length of the `id` and `amount` arrays will be 1.
     *
     * Calling conditions (for each `id` and `amount` pair):
     *
     * - When `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * of token type `id` will be  transferred to `to`.
     * - When `from` is zero, `amount` tokens of token type `id` will be minted
     * for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens of token type `id`
     * will be burned.
     * - `from` and `to` are never both zero.
     * - `ids` and `amounts` have the same, non-zero length.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        internal
        virtual
    { }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        private
    {
        if (to.isContract()) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
                if (response != IERC1155Receiver(to).onERC1155Received.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        private
    {
        if (to.isContract()) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155Receiver(to).onERC1155BatchReceived.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _asSingletonArray(uint256 element) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }
}
