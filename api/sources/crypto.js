import {get} from '../request.js';

export let CryptoClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://api.crypto.com/v2/public/get-ticker?instrument_name=';
      const res = await get(url + name + '_' + vol);

      const jsonRes = JSON.parse(res.body);
      if (jsonRes.result?.data.length === 0) return { price: -1, change: 0 };

      const price = +jsonRes.result.data[0].a;
      const change = (+jsonRes.result.data[0].c) * 100; // Crypto.com gives fraction, convert to percentage
      return { price, change };
    } catch (error) {
      console.debug( error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://crypto.com/exchange/trade';
    let formattedPair = symbol.replace('/', '_').toUpperCase();

    return `${exchangeUrl}/${formattedPair}`;
  }
}
