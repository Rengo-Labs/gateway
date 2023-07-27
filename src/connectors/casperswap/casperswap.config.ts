import { ConfigManagerV2 } from '../../services/config-manager-v2';
import { AvailableNetworks } from '../../services/config-manager-types';

export namespace CasperswapConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    ttl: number;
    sushiswapRouterAddress: (chain: string, network: string) => string;
    tradingTypes: Array<string>;
    chainType: string;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get(
      'casperswap.allowedSlippage'
    ),
    gasLimitEstimate: ConfigManagerV2.getInstance().get(
      'casperswap.gasLimitEstimate'
    ),
    ttl: ConfigManagerV2.getInstance().get('casperswap.ttl'),
    sushiswapRouterAddress: (chain: string, network: string) =>
      ConfigManagerV2.getInstance().get(
        'casperswap.contractAddresses.' +
          chain +
          '.' +
          network +
          '.casperswapRouterAddress'
      ),
    tradingTypes: ['AMM'],
    chainType: 'EVM',
    availableNetworks: [
      {
        chain: 'casper',
        networks: ['mainnet', 'integrationtest', 'testnet'],
      }
    ],
  };
}
