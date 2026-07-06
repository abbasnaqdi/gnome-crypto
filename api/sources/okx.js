import {get} from '../request.js';

export let OkxClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
      const res = await get(url + name + '-' + vol);

      const jsonRes = JSON.parse(res.body);

      if (jsonRes.data.length > 0) {
        const price = +jsonRes.data[0].last;
        const open = +jsonRes.data[0].sodUtc0;
        const change = ((price - open) / open) * 100;
        return { price, change };
      }
      return { price: -1, change: 0 };
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.okx.com/markets/spot-info';
    let formattedPair = symbol.replace('/', '-').toLowerCase();

    return `${exchangeUrl}/${formattedPair}`;
  }
}
