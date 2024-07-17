import { DeployFunction } from "hardhat-deploy/types";
import { Address } from "viem";

const func: DeployFunction = async ({ run, viem, getNamedAccounts, deployments }) => {
  const publicClient = await viem.getPublicClient();

  const { deployer } = await getNamedAccounts();

  const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address);

  // NOTE: not all markets should be approved, so we hardcode market for which flywheel is deployed
  //const comptroller = await viem.getContractAt("Comptroller", (await deployments.get("Comptroller")).address as Address);
  //const markets = await comptroller.read.getAllMarkets();
  const markets = "MARKET1_ADDRESS,MARKET2_ADDRESS..."

  // NOTE: change name and reward token
  await run("flywheel:deploy-dynamic-rewards-fw", { name: "RSR", rewardToken: "RSR_TOKEN_ADDRESS", booster: "", strategies: markets, pool: fpd.address });

  const flywheel = await viem.getContractAt("IonicFlywheel", (await deployments.get("IonicFlywheel")).address as Address);
  await run("approve-market-flywheel", { fwAddress: flywheel.address, markets: markets });
  
  const tx = await flywheel.write.updateFeeSettings([0, deployer.address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });

  const booster = await run("flywheel:deploy-borrow-booster", { name: "Booster" });

  // NOTE: change name and reward token
  await run("flywheel:deploy-dynamic-rewards-fw", { name: "Borrow_RSR", rewardToken: "RSR_TOKEN_ADDRESS", booster: booster.address, strategies: markets, pool: fpd.address });

  const flywheelBorrow = await viem.getContractAt("IonicFlywheelBorrow", (await deployments.get("IonicFlywheelBorrow")).address as Address);
  await run("approve-market-flywheel", { fwAddress: flywheelBorrow.address, markets: markets });
  
  const txBorrow = await flywheelBorrow.write.updateFeeSettings([0, deployer.address]);
  await publicClient.waitForTransactionReceipt({ hash: txBorrow });
};

func.tags = ["prod", "deploy-ionic-flywheel"];

export default func;
