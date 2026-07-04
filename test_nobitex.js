import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

let session = new Soup.Session();
let url = 'https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls';
let message = Soup.Message.new('GET', url);
let bytes = session.send_and_read(message, null);
let decoder = new TextDecoder('utf-8');
let response = decoder.decode(bytes.get_data());
print(response.substring(0, 500));
