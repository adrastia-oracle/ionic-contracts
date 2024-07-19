import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-viem";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { config as dotenv } from "dotenv";

import "./tasks";

dotenv();

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: { default: 0 },
    multisig: {
      34443: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2"
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    local: {
      accounts: [process.env.DEPLOYER!],
      url: "http://localhost:8545",
      saveDeployments: false
    },
    mode: {
      url: "https://mainnet.mode.network",
      accounts: [process.env.DEPLOYER!]
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.DEPLOYER!]
    },
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts: [process.env.DEPLOYER!]
    }
  }
};

export default config;
