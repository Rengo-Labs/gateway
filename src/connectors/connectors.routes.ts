/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import { ConnectorsResponse } from './connectors.request';
import { CasperswapConfig } from './casperswap/casperswap.config';

export namespace ConnectorsRoutes {
  export const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res: Response<ConnectorsResponse, {}>) => {
      res.status(200).json({
        connectors: [
          {
            name: 'casperswap',
            trading_type: CasperswapConfig.config.tradingTypes,
            chain_type: CasperswapConfig.config.chainType,
            available_networks: CasperswapConfig.config.availableNetworks,
          },
        ],
      });
    })
  );
}
