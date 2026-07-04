import {get} from '../request.js';

export let NobitexClient = {
  async _getPrice(name, vol) {
    try {
      let isIrt = vol.toLowerCase() === 'irt';
      let mappedVol = isIrt ? 'rls' : vol.toLowerCase();
      
      const url = `https://api.nobitex.ir/market/stats?srcCurrency=${name.toLowerCase()}&dstCurrency=${mappedVol}`;
      const res = await get(url);

      const jsonRes = JSON.parse(res.body);

      if (jsonRes.status !== 'ok') return { price: 'Error', change: 0 };

      if (!jsonRes.stats) return { price: 'Error', change: 0 };

      // Nobitex returns e.g. "btc-rls" or "btc-usdt"
      const key = `${name}-${mappedVol}`.toLowerCase();
      let stats = jsonRes.stats[key];
      
      if (!stats) {
          stats = Object.values(jsonRes.stats)[0];
      }

      if (!stats) return { price: 'Error', change: 0 };

      let price = +(stats.latest || 0);
      let open = +(stats.dayOpen || 0);
      let change = 0;

      if (isIrt) {
        price = price / 10;
        open = open / 10;
      }

      if (open > 0) {
        change = ((price - open) / open) * 100;
      }

      return { price, change };
    } catch (error) {
      console.debug(error);
      return { price: 'Error', change: 0 };
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://nobitex.ir/trade';
    let formattedPair = symbol.replace('/', '-').toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
