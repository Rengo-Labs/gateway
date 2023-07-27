import { ConfigManagerV2 } from '../../services/config-manager-v2';

export interface NetworkConfig {
  name: string;
  nodeUrl: string;
  maxLRUCacheInstances: number;
}

export interface TokenConfig {
  url: string;
}

export interface Config {
  network: NetworkConfig;
  nativeCurrencySymbol: string;
  tokenProgram: string;
  transactionLamports: number;
  lamportsToSol: number;
  timeToLive: number;
  customNodeUrl: string | undefined;
  tokens: TokenConfig;
}

export function getCasperConfig(
  chainName: string,
  networkName: string
): Config {
  const configManager = ConfigManagerV2.getInstance();
  console.log("chainName", chainName, networkName);
  return {
    network: {
      name: networkName,
      nodeUrl: configManager.get(
        chainName + '.networks.' + networkName + '.nodeURL'
      ),
      maxLRUCacheInstances: configManager.get(
        chainName + '.networks.' + networkName + '.maxLRUCacheInstances'
      ),
    },
    nativeCurrencySymbol: configManager.get(
      chainName + '.networks.' + networkName + '.nativeCurrencySymbol'
    ),
    tokenProgram: configManager.get(chainName + '.tokenProgram'),
    transactionLamports: configManager.get(chainName + '.transactionLamports'),
    lamportsToSol: configManager.get(chainName + '.lamportsToSol'),
    timeToLive: configManager.get(chainName + '.timeToLive'),
    customNodeUrl: configManager.get(chainName + '.customNodeUrl'),
    tokens: {
      url: configManager.get(chainName + '.tokens.url'),
    },
  };
}
