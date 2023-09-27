import { Avalanche } from '../chains/avalanche/avalanche';
import { Cronos } from '../chains/cronos/cronos';
import { Ethereum } from '../chains/ethereum/ethereum';
import { BinanceSmartChain } from '../chains/binance-smart-chain/binance-smart-chain';
import { Harmony } from '../chains/harmony/harmony';
import { Polygon } from '../chains/polygon/polygon';
import { Xdc } from '../chains/xdc/xdc';
import { InjectiveClobPerp } from '../connectors/injective_perpetual/injective.perp';
import { Injective } from '../chains/injective/injective';
import {
  CLOBish,
  Ethereumish,
  Nearish,
  Perpish,
  RefAMMish,
  Uniswapish,
  UniswapLPish,
  Xdcish,
} from './common-interfaces';
import { Near } from '../chains/near/near';
import { Algorand } from '../chains/algorand/algorand';
import { Cosmos } from '../chains/cosmos/cosmos';
import { Tinyman } from '../connectors/tinyman/tinyman';
import { Casper } from '../chains/casper/casper';
import { Casperswap } from '../connectors/casperswap/casperswap';

export type ChainUnion =
  | Algorand
  | Cosmos
  | Ethereumish
  | Nearish
  | Injective
  | Xdcish
  | Casper;

export type Chain<T> = T extends Algorand
  ? Algorand
  : T extends Cosmos
  ? Cosmos
  : T extends Ethereumish
  ? Ethereumish
  : T extends Nearish
  ? Nearish
  : T extends Xdcish
  ? Xdcish
  : T extends Injective
  ? Casper
  : T extends Casper
  ? Injective
  : never;

export class UnsupportedChainException extends Error {
  constructor(message?: string) {
    message =
      message !== undefined
        ? message
        : 'Please provide a supported chain name.';
    super(message);
    this.name = 'UnsupportedChainError';
    this.stack = (<any>new Error()).stack;
  }
}

export async function getInitializedChain<T>(
  chain: string,
  network: string
): Promise<Chain<T>> {
  const chainInstance = getChainInstance(chain, network);

  if (chainInstance === undefined) {
    throw new UnsupportedChainException(`unsupported chain ${chain}`);
  }

  if (!chainInstance.ready()) {
    await chainInstance.init();
  }

  return chainInstance as Chain<T>;
}

export function getChainInstance(
  chain: string,
  network: string
): ChainUnion | undefined {
  let connection: ChainUnion | undefined;

  if (chain === 'algorand') {
    connection = Algorand.getInstance(network);
  } else if (chain === 'ethereum') {
    connection = Ethereum.getInstance(network);
  } else if (chain === 'avalanche') {
    connection = Avalanche.getInstance(network);
  } else if (chain === 'harmony') {
    connection = Harmony.getInstance(network);
  } else if (chain === 'polygon') {
    connection = Polygon.getInstance(network);
  } else if (chain === 'cronos') {
    connection = Cronos.getInstance(network);
  } else if (chain === 'cosmos') {
    connection = Cosmos.getInstance(network);
  } else if (chain === 'near') {
    connection = Near.getInstance(network);
  } else if (chain === 'binance-smart-chain') {
    connection = BinanceSmartChain.getInstance(network);
  } else if (chain === 'xdc') {
    connection = Xdc.getInstance(network);
  } else if (chain === 'injective') {
    connection = Injective.getInstance(network);
  } else if (chain === 'casper') {
    connection = Casper.getInstance(network);
  } else {
    connection = undefined;
  }

  return connection;
}

export type ConnectorUnion =
  | Uniswapish
  | UniswapLPish
  | Perpish
  | RefAMMish
  | CLOBish
  | InjectiveClobPerp
  | Tinyman
  | Casper;

export type Connector<T> = T extends Uniswapish
  ? Uniswapish
  : T extends UniswapLPish
  ? UniswapLPish
  : T extends Perpish
  ? Perpish
  : T extends RefAMMish
  ? RefAMMish
  : T extends CLOBish
  ? CLOBish
  : T extends InjectiveClobPerp
  ? InjectiveClobPerp
  : T extends Tinyman
  ? Tinyman
  : T extends Casper
  ? Casper
  : never;

export async function getConnector<T>(
  chain: string,
  network: string,
  connector: string | undefined,
  address?: string
): Promise<Connector<T>> {
  let connectorInstance: ConnectorUnion;
  console.log('Conector', connector, address);

  if (chain == 'casper') {
    connectorInstance = Casperswap.getInstance(chain, network);
  } else {
    throw new Error('unsupported chain or connector');
  }

  if (!connectorInstance.ready()) {
    await connectorInstance.init();
  }

  return connectorInstance as Connector<T>;
}
