import { CasperClient, DeployUtil, GetDeployResult } from 'casper-js-sdk';

import { Network } from './types';
import { sleep } from './utils';

/**
 * Client for working with Casper network
 */
export class Client {
  // Casper sdk client
  casperClient: CasperClient;

  /**
   * Create a casper client
   *
   * @param _network network type
   * @param _node node address
   */
  constructor(private _network: Network, private _node = '') {
    this.casperClient = new CasperClient(_node);
  }

  /**
   * @returns network
   */
  get network(): Network {
    return this._network;
  }

  /**
   * @returns node addres
   */
  get node(): string {
    return this._node;
  }

  /**
   * Async attempt to retrieve the state root hash
   *
   * @returns the state root hash or throw error
   */
  async getStateRootHash(): Promise<string> {
    const casperService = this.casperClient.nodeClient;

    return casperService.getStateRootHash();
  }

  /**
   * Async attempt to retrieve deploy
   *
   * @param deployHash string deploy hash
   *
   * @returns the an array with deploy and deploy result or throw error
   */
  async getDeploy(
    deployHash: string,
    ticks = 5
  ): Promise<[DeployUtil.Deploy, GetDeployResult]> {
    try {
      let deployCheck = 0;
      // Get the deploy hash from the network

      while (deployCheck < ticks) {
        try {
          const casperClient = this.casperClient;
          return await casperClient.getDeploy(deployHash);
        } catch (e) {
          deployCheck++;
          await sleep(1000);
        }
      }
      throw new Error('Could not confirm deploy.');
    } catch (err) {
      console.error(`Casper Client - getDeploy error: ${err}`);

      // rethrow error
      throw err;
    }
  }
}
