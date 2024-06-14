// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import "./config/BaseTest.t.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { GlobalPauser } from "../GlobalPauser.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";

import "forge-std/console.sol";

contract DevTesting is BaseTest {
  address poolDirectory = 0x39C353Cf9041CcF467A04d0e78B63d961E81458a;

  address pauseGuardian = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;
  address multisig = 0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2;
  GlobalPauser pauser;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    pauser = new GlobalPauser(poolDirectory);
  }

  function testPauseNotGuardian(address sender) public debuggingOnly forkAtBlock(MODE_MAINNET, 9110133) {
    vm.assume(sender != pauseGuardian);
    vm.expectRevert(bytes("!guardian"));
    pauser.pauseAll(true);
  }

  function testPauseAll() public debuggingOnly forkAtBlock(MODE_MAINNET, 9110133) {
    (, PoolDirectory.Pool[] memory pools) = PoolDirectory(poolDirectory).getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
      }
    }
    vm.prank(pauseGuardian);
    pauser.pauseAll(true);
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        assertEq(isPaused, true);
        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        assertEq(isPaused, true);
      }
    }
    vm.prank(pauseGuardian);
    pauser.pauseAll(false);
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        assertEq(isPaused, false);
      }
    }
  }
}
