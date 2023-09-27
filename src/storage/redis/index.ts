import Redis from 'ioredis';
import { loadPairs } from '../pairs';
import { PairData, Token } from '../../utils/pathFinder';
import { loadTokens } from '../tokens';

export class RedisConnection {
  private static _instance?: RedisConnection;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private _client: Redis;
  private _pairKeys: string[] = [];
  private _tokenKeys: string[] = [];

  public static get instance(): RedisConnection {
    if (!this._instance) {
      this._instance = new this();
    }

    return this._instance;
  }

  public async start() {
    this._client = new Redis({
      host: '127.0.0.1',
      port: 6379,
      username: 'default',
      password: 'password',
    });

    return loadPairs(this._client);
  }

  public async loadPairs() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await loadPairs(this._client);
    this._pairKeys = await this._client.keys('pair-contract:*');

    await loadTokens(this._client);
    this._tokenKeys = await this._client.keys('token-contract:*');
  }

  public async getPairKeys() {
    return this._client.keys('pair-contract:*');
  }

  public async getTokenKeys() {
    return this._client.keys('token-contract:*');
  }

  public async pairs() {
    return Promise.all(
      this._pairKeys.map(async (k) => {
        const pair = await this._client.get(k);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return JSON.parse(pair) as PairData;
      })
    );
  }

  public async tokens() {
    const tokenList: Record<string, Token> = {};
    await Promise.all(
      this._tokenKeys.map(async (k) => {
        const data = await this._client.get(k);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const token = JSON.parse(data);
        tokenList[token.symbol] = token;
        return data;
      })
    );

    return tokenList;
  }

  public async setPair(pair: PairData) {
    return this._client.set(`pair-contract:${pair.name}`, JSON.stringify(pair));
  }

  public async setToken(token: Token) {
    return this._client.set(`token-contract:${token}`, JSON.stringify(token));
  }
}
