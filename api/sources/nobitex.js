import {get} from '../request.js';

export let NobitexClient = {
  async _getPrice(name, vol) {
    try {
      const url = `https://api.nobitex.ir/market/stats?srcCurrency=${name}&dstCurrency=${vol}`;
      const res = await get(url);

      const jsonRes = JSON.parse(res.body);

      if (jsonRes.status !== 'ok') return { price: -1, change: 0 };

      // Nobitex returns e.g. "btc-rls" or "btc-usdt"
      const key = `${name}-${vol}`.toLowerCase();
      let stats = jsonRes.stats[key];
      
      if (!stats) {
          // Fallback if the key format is different
          stats = Object.values(jsonRes.stats)[0];
      }

      if (!stats) return { price: -1, change: 0 };

      const price = +(stats.latest || 0);
      const open = +(stats.dayOpen || 0);
      let change = 0;

      if (open > 0) {
        change = ((price - open) / open) * 100;
      }

      return { price, change };
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://nobitex.ir/trade';
    let formattedPair = symbol.replace('/', '-').toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
