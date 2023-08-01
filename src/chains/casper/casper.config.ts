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
  transactionLamports: number;
  timeToLive: number;
  tokens: TokenConfig;
}

export function getCasperConfig(
  chainName: string,
  networkName: string
): Config {
  const configManager = ConfigManagerV2.getInstance();
  console.log('chainName', chainName, networkName);
  configManager.get('casper.contractAddresses.mainnet.nodeURL');
  //configManager.get(chainName + '.networks.' + networkName);
  //configManager.get(chainName);
  //configManager.get(chainName + '.networks.' + networkName + '.nodeURL');
  return {
    network: {
      name: networkName,
      nodeUrl: configManager.get(
        chainName + '.contractAddresses.' + networkName + '.nodeURL'
      ),
      //nodeUrl: '',
      //maxLRUCacheInstances: configManager.get(chainName + '.networks.' + networkName + '.maxLRUCacheInstances'),
      maxLRUCacheInstances: 10,
    },
    nativeCurrencySymbol: configManager.get(
      chainName + '.nativeCurrencySymbol'
    ),
    transactionLamports: configManager.get(chainName + '.transactionLamports'),
    timeToLive: configManager.get(chainName + '.timeToLive'),
    tokens: {
      url: configManager.get(
        chainName + '.contractAddresses.' + networkName + '.tokenURL'
      ),
    },
  };
}
