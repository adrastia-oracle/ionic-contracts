// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { ICErc20 } from "./compound/CTokenInterfaces.sol";

interface IPoolDirectory {
  struct Pool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
  }

  function getActivePools() external view returns (uint256, Pool[] memory);
}

contract GlobalPauser {
  IPoolDirectory public poolDirectory;

  constructor(address _poolDirectory) {
    poolDirectory = IPoolDirectory(_poolDirectory);
  }

  function pauseAll(bool paused) external {
    (, IPoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        if (paused != isPaused) {
          IonicComptroller(pools[i].comptroller)._setBorrowPaused(markets[j], paused);
        }

        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        if (paused != isPaused) {
          IonicComptroller(pools[i].comptroller)._setMintPaused(markets[j], paused);
        }
      }
    }
  }
}
