import { ConfigManagerV2 } from '../../services/config-manager-v2';
import { AvailableNetworks } from '../../services/config-manager-types';

export namespace CasperswapConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    ttl: number;
    tradingTypes: Array<string>;
    chainType: string;
    availableNetworks: Array<AvailableNetworks>;
    casperswapRouterAddress: (chain: string) => string;
  }

  export const config: NetworkConfig = {
    casperswapRouterAddress: (chain: string) =>
      ConfigManagerV2.getInstance().get(
        'casperswap.contractAddresses.' + chain + '.routerAddress'
      ),
    allowedSlippage: '0.5',
    gasLimitEstimate: 100000000,
    ttl: 180000,
    tradingTypes: ['CSPR'],
    chainType: 'CASPERSWAP',
    availableNetworks: [
      {
        chain: 'casperswap',
        networks: ['mainnet', 'testnet', 'integrationnet'],
      },
    ],
  };
}
