import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

let _sessionV3 = null;
let _sessionV2 = null;

export function get(url) {
  switch (Soup.MAJOR_VERSION) {
    case 2:
      return get_soup_v2(url);
    case 3:
      return get_soup_v3(url);
  }
}

function get_soup_v3(url) {
  return new Promise((resolve, reject) => {
    if (!_sessionV3) {
      _sessionV3 = new Soup.Session();
      _sessionV3.timeout = 10;
      _sessionV3.user_agent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0';
    }

    let message = Soup.Message.new('GET', url);

    _sessionV3.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      function (session, result) {
        if (message.status_code === 200) {
          try {
            let bytes = session.send_and_read_finish(result);
            let decoder = new TextDecoder('utf-8');
            let response = decoder.decode(bytes.get_data());

            resolve({
              code: message.status_code,
              body: response,
            });
          } catch (e) {
            resolve({
              code: message.status_code,
              body: null,
            });
          }
        } else {
          resolve({
            code: message.status_code,
            body: null,
          });
        }
      }
    );
  });
}

function get_soup_v2(url) {
  return new Promise((resolve, reject) => {
    if (!_sessionV2) {
      _sessionV2 = new Soup.SessionAsync();
      Soup.Session.prototype.add_feature.call(
        _sessionV2,
        new Soup.ProxyResolverDefault()
      );
      _sessionV2.timeout = 10;
      _sessionV2.user_agent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0';
    }

    let message = Soup.Message.new('GET', url);

    _sessionV2.queue_message(message, function (_httpSession, result) {
      resolve({
        code: result.status_code,
        body: message.response_body.data,
      });
    });
  });
}
