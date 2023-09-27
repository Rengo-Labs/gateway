import PairsResponsibilities from '../PairsResponsibilities';
import { RedisConnection } from '../../storage/redis';
import { BLOCKCHAIN_NETWORK } from '../constants';

export class CasperDaemon {
  private static _instance?: CasperDaemon;

  public static get instance() {
    if (!this._instance) {
      this._instance = new this();
    }

    return this._instance;
  }

  public async run(ms = 3000) {
    console.log('Starting Casper Daemon');
    const pairs = await RedisConnection.instance.pairs();
    const tokens = await RedisConnection.instance.tokens();
    await PairsResponsibilities(pairs, tokens, BLOCKCHAIN_NETWORK).loadPairs();
    await new Promise((resolve) => setTimeout(resolve, ms));
    console.log('Ended Casper Daemon');
    this.run();
  }
}
