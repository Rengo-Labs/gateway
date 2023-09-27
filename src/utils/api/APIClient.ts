import axios from 'axios';
import { CasperClient, CasperServiceByJsonRPC, Contracts } from 'casper-js-sdk';
import { PathResponse } from './types';
import { BLOCKCHAIN_NETWORK, NODE_ADDRESS } from '../constants';
import { getPath, PairData } from '../pathFinder';
import { ERC20Client } from 'casper-erc20-js-client';
const { Contract } = Contracts;

export const enum ERC20Keys {
  TOTAL_SUPPLY = 'total_supply',
}

export const enum ERC20Dictionaries {
  BALANCES = 'balances',
  ALLOWANCES = 'allowances',
}

export const enum PairKeys {
  RESERVE0 = 'reserve0',
  RESERVE1 = 'reserve1',
  LIQUIDITY = 'liquidity',
}

export interface PairDataResponse {
  reserve0: string;
  reserve1: string;
  totalSupply: string;
}

export interface PairUserDataResponse {
  balance: string;
  allowance: string;
}

/**
 * Client for working with Caspwerswap API
 */
export class APIClient {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private static _instance: APIClient = null;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private static _erc20Client: ERC20Client = null;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private _client: CasperClient = null;

  createInstance = () => {
    console.log('Node Address', NODE_ADDRESS, 'Network', BLOCKCHAIN_NETWORK);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._erc20Client = new ERC20Client(
      'https://proxy.casperswap.xyz/?url=https://testnet-node.casperswap.xyz/rpc',
      BLOCKCHAIN_NETWORK
    );
    this._client = new CasperClient(
      'https://proxy.casperswap.xyz/?url=https://testnet-node.casperswap.xyz/rpc'
    );
  };

  public static get instance() {
    if (this._instance == null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._instance = new this();
      this._instance.createInstance();
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._instance;
  }

  public static get erc20Client() {
    return this._erc20Client;
  }

  /**
   * Get the liquidity pair path for swapping
   * @param tokenASymbol first token
   * @param tokenBSymbol second token
   *
   * @returns the path for swapping
   */
  async getPath(
    tokenASymbol: string,
    tokenBSymbol: string,
    pairs: PairData[],
    tokens: Record<string, any>
  ): Promise<PathResponse> {
    const token0 = tokenASymbol === 'CSPR' ? 'WCSPR' : tokenASymbol;
    const token1 = tokenBSymbol === 'CSPR' ? 'WCSPR' : tokenBSymbol;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const path = getPath(token0, token1, tokens, pairs).map(
      (x) => tokens[x.id].packageHash
    );

    return {
      message: '',
      path,
      pathwithcontractHash: path,
      success: true,
    };
  }

  /**
   * Get the latest deploy wasm data
   *
   * @returns deploy wasm for special purse functions
   */
  async getDeployWasmData(): Promise<ArrayBuffer> {
    const response = await axios.get(`/session-code-router.wasm`, {
      responseType: 'arraybuffer',
    });

    //console.log('getDeployWasmData', response.data)

    return response.data;
  }

  /**
   * Get the user's balances
   *
   * @param wallet user wallet
   * @param contractHash contract hash
   * @param dictionaryKey dictionary's key
   * @param itemKey item's key in dictionary
   * @param stateRootHash optional state root hash
   *
   * @returns the dictionary item
   */
  async getDictionaryItem(
    contractHash: string,
    dictionaryKey: string,
    itemKey: string,
    stateRootHash?: string
  ): Promise<string> {
    // set up the contract client
    const contractClient = new Contract(this._client);
    contractClient.setContractHash(contractHash);

    let srh = stateRootHash ?? '';

    if (!srh) {
      srh = await this._client.nodeClient.getStateRootHash();
    }

    try {
      const result = await contractClient.queryContractDictionary(
        dictionaryKey,
        itemKey,
        srh
      );

      return result.toString();
    } catch (e) {
      //console.log(contractHash, dictionaryKey, itemKey, srh)
      console.log('get erc20 get dictionary error', e);
      throw e;
    }
  }

  /**
   * Get the user's balances
   *
   * @param wallet user wallet
   * @param contract hash contract hash
   * @param stateRootHash optional state root hash
   *
   * @returns the balance as a string
   */
  async getERC20Balance(
    addressWallet: any,
    contractHash: string
  ): Promise<string> {
    console.log('Get Balance');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const erc20 = APIClient.erc20Client;

    await erc20.setContractHash(contractHash);

    const result = await erc20.balanceOf(addressWallet);
    console.log('Get Balance', result);
    return result;
  }

  /**
   * Get the user's total supply
   *
   * @param wallet user wallet
   * @param contract hash contract hash
   * @param stateRootHash optional state root hash
   *
   * @returns the total supply as a string
   */
  async getERC20TotalSupply(contractHash: string): Promise<string> {
    if (contractHash == null) {
      return Promise.resolve('0');
    }

    const erc20 = APIClient.erc20Client;

    await erc20.setContractHash(contractHash.slice(5));

    return erc20.totalSupply();
  }

  /**
   * Get the pair data
   *
   * @param wallet user wallet
   * @param contract hash contract hash
   * @param stateRootHash optional state root hash
   *
   * @returns the a PairDataResponse
   */
  async getPairData(
    contractHash: string,
    stateRootHash?: string
  ): Promise<PairDataResponse> {
    // set up the service
    console.log('Node Address', NODE_ADDRESS);
    const casperService = new CasperServiceByJsonRPC(NODE_ADDRESS);

    let srh = stateRootHash ?? '';

    if (!srh) {
      srh = await this._client.nodeClient.getStateRootHash();
    }

    try {
      const [reserve0, reserve1, totalSupply]: any[] = await Promise.all([
        casperService.getBlockState(srh, contractHash, [PairKeys.RESERVE0]),
        casperService.getBlockState(srh, contractHash, [PairKeys.RESERVE1]),
        casperService.getBlockState(srh, contractHash, [
          ERC20Keys.TOTAL_SUPPLY,
        ]),
      ]);

      return {
        reserve0: reserve0?.CLValue?.isCLValue
          ? reserve0?.CLValue?.value().toString()
          : '0',
        reserve1: reserve1?.CLValue?.isCLValue
          ? reserve1?.CLValue?.value().toString()
          : '0',
        totalSupply: totalSupply?.CLValue?.isCLValue
          ? totalSupply?.CLValue?.value().toString()
          : '0',
      };
    } catch (e) {
      //console.log('get pair data error', e)

      return {
        reserve0: '0',
        reserve1: '0',
        totalSupply: '0',
      };
    }
  }

  /**
   * Get the latest deploy wasm data
   *
   * @returns deploy wasm for special purse functions
   */
  async getWCSPRWasmData(): Promise<ArrayBuffer> {
    const response = await axios.get(`/session-code-wcspr.wasm`, {
      responseType: 'arraybuffer',
    });

    return response.data;
  }
}
