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
      if (!cTokenInstance && thisUnderlying.toLowerCase() === underlying.toLowerCase()) {
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
