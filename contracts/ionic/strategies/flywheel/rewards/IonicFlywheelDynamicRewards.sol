// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.10;

import { FlywheelDynamicRewards } from "flywheel-v2/rewards/FlywheelDynamicRewards.sol";
import { FlywheelCore } from "flywheel-v2/FlywheelCore.sol";
import { SafeTransferLib, ERC20 } from "solmate/utils/SafeTransferLib.sol";

contract IonicFlywheelDynamicRewards is FlywheelDynamicRewards {
    using SafeTransferLib for ERC20;

    address public owner;
    mapping(address => address) public strategyVaults;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        FlywheelCore _flywheel,
        uint32 _cycleLength
    ) FlywheelDynamicRewards(_flywheel, _cycleLength) {
        owner = msg.sender;
    }

    function setVaults(address[] calldata _strategies, address[] calldata _vaults) external onlyOwner {
        uint256 length = _strategies.length;
        require(length == _vaults.length, "INVALID_ARGUMENTS");
        for(uint256 i=0; i<length; i++) {
            strategyVaults[_strategies[i]] = _vaults[i];
        }
    }

    function getNextCycleRewards(ERC20 strategy) internal override returns (uint192) {
        address vault = strategyVaults[address(strategy)];
        uint256 rewardAmount = rewardToken.balanceOf(vault);
        if (rewardAmount != 0) {
            rewardToken.safeTransferFrom(
                vault,
                address(this),
                rewardAmount
            );
        }
        return uint192(rewardAmount);
    }
}
