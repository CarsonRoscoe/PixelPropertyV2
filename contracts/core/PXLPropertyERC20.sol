// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PXLPropertyERC20 is ERC20, ERC20Burnable, ERC20Snapshot, AccessControl, ERC20Permit {
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
    

    /* Access Level Constants */
    bytes32 public constant LEVEL_OWNER = keccak256("LEVEL_ROOT"); // Can set pixelPropertyContract
    bytes32 public constant LEVEL_ROOT = keccak256("LEVEL_ROOT"); // Can set property dapps
    bytes32 public constant LEVEL_ADMIN = keccak256("LEVEL_ADMIN"); // Can manager moderators
    bytes32 public constant LEVEL_MODERATOR = keccak256("LEVEL_MODERATOR"); // ban power
    bytes32 public constant LEVEL_FLAGGER = keccak256("LEVEL_FLAGGER"); // nsfw/flagging
    bytes32 public constant LEVEL_PIXEL_PROPERTY = keccak256("LEVEL_PIXEL_PROPERTY"); // Power over PXL generation/burning & Property ownership 
    bytes32 public constant LEVEL_PROPERTY_DAPPS = keccak256("LEVEL_PROPERTY_DAPPS"); // Power over manipulating property data
    bytes32 public constant LEVEL_ROUTER = keccak256("LEVEL_ROUTER"); // Power over manipulating property data



    constructor()
        ERC20("PixelPropertyToken", "PXL")
        ERC20Permit("PixelPropertyToken")
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(LEVEL_OWNER, msg.sender);
        _setupRole(LEVEL_ROOT, msg.sender);
        _setupRole(LEVEL_ADMIN, msg.sender);
        _setupRole(LEVEL_MODERATOR, msg.sender);
        _setupRole(LEVEL_FLAGGER, msg.sender);
        _mint(msg.sender, 1000000000); // For Connext bridge
    }

    function snapshot() public {
        require(hasRole(LEVEL_ROOT, msg.sender));
        _snapshot();
    }

    function mint(address to, uint256 amount) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

     /* ### PixelProperty PXL Functions ### */
    function rewardPXL(address rewardedUser, uint256 amount) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        require(rewardedUser != address(0));
        _mint(rewardedUser, amount);
    }
    
    function burnPXL(address burningUser, uint256 amount) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        require(burningUser != address(0));
        require(balanceOf(burningUser) >= amount);
        _burn(burningUser, amount);
    }
    
    function burnPXLRewardPXL(address burner, uint256 toBurn, address rewarder, uint256 toReward) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        require(balanceOf(burner) >= toBurn);
        if (toBurn > 0) {
            _burn(burner, toBurn);
        }
        if (rewarder != address(0)) {
            _mint(rewarder, toReward);
        }
    } 
    
    function burnPXLRewardPXLx2(address burner, uint256 toBurn, address rewarder1, uint256 toReward1, address rewarder2, uint256 toReward2) public {
        require(hasRole(LEVEL_PIXEL_PROPERTY, msg.sender));
        require(balanceOf(burner) >= toBurn);
        if (toBurn > 0) {
            _burn(burner, toBurn);
        }
        if (rewarder1 != address(0)) {
            _mint(rewarder1, toReward1);
        }
        if (rewarder2 != address(0)) {
            _mint(rewarder2, toReward2);
        }
    }
}