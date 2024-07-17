import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, parseAbiParameters, publicActions, zeroAddress } from "viem";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("comptroller", "address of comptroller", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("pluginAddress", "The address of plugin which is supposed to used", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const { implementationAddress, comptroller: comptrollerAddress, underlying, signer: namedSigner } = taskArgs;
    let { pluginAddress } = taskArgs;

    const comptroller = await viem.getContractAt("IonicComptroller", comptrollerAddress as Address);

    const allMarkets = await comptroller.read.getAllMarkets();

    const cTokenInstances = await Promise.all(
      allMarkets.map(async (marketAddress) => {
        return await viem.getContractAt("ICErc20PluginRewards", marketAddress);
      })
    );

    let cTokenInstance;

    for (let index = 0; index < cTokenInstances.length; index++) {
      const thisUnderlying = await cTokenInstances[index].read.underlying();
      console.log({
        underlying: thisUnderlying,
        market: cTokenInstances[index].address
      });
      if (!cTokenInstance && thisUnderlying === underlying) {
        cTokenInstance = cTokenInstances[index];
      }
    }
    if (!cTokenInstance) {
      throw Error(`No market corresponds to this underlying: ${underlying}`);
    }

    if (!pluginAddress) {
      pluginAddress = zeroAddress;
    }

    const implementationData = encodeAbiParameters(parseAbiParameters("address"), [pluginAddress]);

    console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);
    const setImplementationTx = await cTokenInstance.write._setImplementationSafe([
      implementationAddress,
      implementationData
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: setImplementationTx
    });
    if (receipt.status !== "success") {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(
      `Implementation successfully set to ${implementationAddress} with plugin ${await cTokenInstance.read.plugin()}`
    );
  });

task("market:upgrade:safe", "Upgrades a market's implementation")
  .addParam("marketAddress", "market", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("pluginAddress", "The address of plugin which is supposed to used", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const { implementationAddress, marketAddress, signer: namedSigner } = taskArgs;
    let { pluginAddress } = taskArgs;

    const cTokenDelegator = await viem.getContractAt("CErc20Delegator", marketAddress);

    const cfe = await viem.getContractAt(
      "CTokenFirstExtension",
      (await deployments.get("CTokenFirstExtension")).address as Address
    );
    const impl = await cTokenDelegator.read.implementation();
    const extensions = await cTokenDelegator.read._listExtensions();

    if (
      impl.toLowerCase() != implementationAddress.toLowerCase() ||
      extensions.length == 0 ||
      extensions[0].toLowerCase() != cfe.address.toLowerCase()
    ) {
      if (!pluginAddress) {
        pluginAddress = zeroAddress;
      }

      const implementationData = encodeAbiParameters(parseAbiParameters("address"), [pluginAddress]);

      console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);
      const setImplementationTx = await cTokenDelegator.write._setImplementationSafe([
        implementationAddress,
        implementationData
      ]);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: setImplementationTx
      });
      if (receipt.status !== "success") {
        throw `Failed set implementation to ${implementationAddress}`;
      }
      console.log(`Implementation successfully set to ${implementationAddress}`);
      if (pluginAddress != zeroAddress) {
        const cTokenPluginInstance = await viem.getContractAt("ICErc20Plugin", marketAddress);
        console.log(`with plugin ${await cTokenPluginInstance.read.plugin()}`);
      }
    } else {
      console.log(
        `market ${marketAddress} impl ${impl} already eq ${implementationAddress} and extension ${cfe.address} eq ${extensions[0]}`
      );
    }
  });

task("markets:setAddressesProvider", "Upgrades all pools comptroller implementations whose autoimplementatoins are on")
  .addFlag("forceUpgrade", "If the pool upgrade should be forced")
  .setAction(async ({ forceUpgrade }, { viem, getChainId, deployments, run }) => {
    const publicClient = await viem.getPublicClient();

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );

    await run("market:set-latest");

    const [, pools] = await poolDirectory.read.getActivePools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool", { name: pool.name, address: pool.comptroller });

      try {
        const comptrollerAsExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);
        const markets = await comptrollerAsExtension.read.getAllMarkets();
        for (let j = 0; j < markets.length; j++) {
          const market = markets[j];
          console.log(`market address ${market}`);
          const cTokenInstance = await viem.getContractAt("ICErc20", market);
          const [latestImpl] = await feeDistributor.read.latestCErc20Delegate([
            await cTokenInstance.read.delegateType()
          ]);
          await run("market:upgrade:safe", {
            marketAddress: market,
            implementationAddress: latestImpl,
          });
          const ap = await viem.getContractAt(
            "AddressesProvider",
            (await deployments.get("AddressesProvider")).address as Address
          );
          const ctokenAsExt = await viem.getContractAt("CTokenFirstExtension", market)
          const setAPTX = await ctokenAsExt.write._setAddressesProvider(ap);
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: setAPTX
          });
          if (receipt.status !== "success") {
            throw `Failed to set AddressesProvider`;
          }
          console.log(`AddressesProvider successfully set to ${ap}`);
        }
      } catch (e) {
        console.error(`error while upgrading the pool ${JSON.stringify(pool)}`, e);
      }
    }
  });
