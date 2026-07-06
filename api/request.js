import Soup from 'gi://Soup';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

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
      _sessionV3.timeout = 15;
      _sessionV3.user_agent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0';
    }

    let message = Soup.Message.new('GET', url);
    let cancellable = new Gio.Cancellable();
    let resolved = false;

    let timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 20, () => {
      if (resolved) return GLib.SOURCE_REMOVE;
      resolved = true;
      cancellable.cancel();
      timeoutId = 0;
      resolve({ code: 0, body: null });
      return GLib.SOURCE_REMOVE;
    });

    _sessionV3.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      cancellable,
      function (session, result) {
        let bytes = null;
        try {
          bytes = session.send_and_read_finish(result);
        } catch (e) {
          // If network is unreachable or cancelled, finish() will throw an error.
        }

        if (resolved) return;
        resolved = true;
        
        if (timeoutId) {
          GLib.source_remove(timeoutId);
          timeoutId = 0;
        }

        if (message.status_code === 200 && bytes) {
          try {
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
      _sessionV2.timeout = 15;
      _sessionV2.user_agent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0';
    }

    let message = Soup.Message.new('GET', url);
    let resolved = false;

    let timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 20, () => {
      if (resolved) return GLib.SOURCE_REMOVE;
      resolved = true;
      _sessionV2.cancel_message(message, Soup.Status.CANCELLED);
      timeoutId = 0;
      resolve({ code: 0, body: null });
      return GLib.SOURCE_REMOVE;
    });

    _sessionV2.queue_message(message, function (_httpSession, result) {
      if (resolved) return;
      resolved = true;
      if (timeoutId) {
        GLib.source_remove(timeoutId);
        timeoutId = 0;
      }
      resolve({
        code: result.status_code,
        body: message.response_body.data,
      });
    });
  });
}
