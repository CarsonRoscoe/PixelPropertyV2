// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPXLPropertyERC20 is IERC20 {
     /* ### PixelProperty PXL Functions ### */
    function rewardPXL(address rewardedUser, uint256 amount) external;
    function burnPXL(address burningUser, uint256 amount) external;
    function burnPXLRewardPXL(address burner, uint256 toBurn, address rewarder, uint256 toReward) external;
    function burnPXLRewardPXLx2(address burner, uint256 toBurn, address rewarder1, uint256 toReward1, address rewarder2, uint256 toReward2) external;
}