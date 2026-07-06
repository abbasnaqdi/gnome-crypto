import {get} from '../request.js';

export let CoingeckoClient = {
  async _getPrice(name, vol) {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vol}&include_24hr_change=true`;
      const res = await get(url);

      name = name.toLowerCase();
      vol = vol.toLowerCase();
      const jsonRes = JSON.parse(res.body);

      if (Object.keys(jsonRes).length === 0) return { price: 'Not found', change: 0 };
      if (Object.keys(jsonRes[name]).length === 0) return { price: 'Not found', change: 0 };

      const price = +jsonRes[name][vol];
      const change = +jsonRes[name][`${vol}_24h_change`];
      return { price, change };
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.coingecko.com/en/coins';
    let formattedPair = symbol.toLowerCase();

    return `${exchangeUrl}/${formattedPair}`;
  }
}
