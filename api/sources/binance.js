import {get} from '../request.js';

export let BinanceClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://api.binance.com/api/v3/ticker/24hr?symbol=';
      const res = await get(url + name + vol);

      const jsonRes = JSON.parse(res.body);
      if (jsonRes.code) return { price: jsonRes.msg.slice(0, 30) + '...', change: 0 };

      const price = +jsonRes.lastPrice;
      const change = +jsonRes.priceChangePercent;
      return { price, change };
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.binance.com/en/trade';
    let formattedPair = symbol.replace('/', '_').toUpperCase();

    return `${exchangeUrl}/${formattedPair}`;
  }
}
