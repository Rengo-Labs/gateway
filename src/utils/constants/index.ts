export const NODE_ADDRESSES = process.env.REACT_APP_NODE_ADDRESSES || 'https://testnet-node.casperswap.xyz/rpc';
export const NODE_PROXY = process.env.REACT_APP_NODE_PROXY || 'https://proxy.casperswap.xyz/?url=';
// export const NODE_ADDRESS = NODE_PROXY + NODE_ADDRESSES[Math.floor(Math.random() * NODE_ADDRESSES.length)]
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const NODE_ADDRESS = NODE_PROXY + NODE_ADDRESSES;
export const DEADLINE = parseInt('1000000000');
export const ROUTER_PACKAGE_HASH = process.env.REACT_APP_ROUTER_PACKAGE_HASH || 'b6c26649540c59decbc53274a67336d0588f6ad2ae0863a8a636dddcc75689f0';
export const INFO_SWAP_URL = process.env.REACT_APP_INFO_SWAP_URL || 'https://info-api-test.casperswap.xyz/graphql';
export const INFO_BLOCK_URL = process.env.REACT_APP_INFO_BLOCK_URL || 'https://block-api-test.casperswap.xyz/graphql';
export const BLOCKCHAIN_NETWORK = process.env.REACT_APP_NETWORK_KEY || 'casper-test';

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Loading = 'loading',
}

export enum MenuMobileOptions {
  Settings = 'Settings',
  Community = 'Community',
}
