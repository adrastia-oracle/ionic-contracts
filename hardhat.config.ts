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
    deployer: { default: 0 }
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
    }
  }
};

export default config;
