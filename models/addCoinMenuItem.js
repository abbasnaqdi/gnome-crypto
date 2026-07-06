import GObject from 'gi://GObject';
import St from 'gi://St';

import * as SourceClient from '../api/sourceClient.js';
import * as CryptoUtil from '../utils/cryptoUtil.js';
import * as Settings from '../settings.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { AddCoinSourceBoxLayout } from './addCoinSourceBoxLayout.js';

export let AddCoinMenuItem = GObject.registerClass(
  class AddCoinMenuItem extends PopupMenu.PopupBaseMenuItem {
    constructor(panelMenu, Me) {
      super({
        reactive: false,
        can_focus: false,
      });
      this.panelMenu = panelMenu;
      this.current_exchange = SourceClient.get_exchange();
      this.Me = Me;

      let vbox = new St.BoxLayout({
        style_class: 'add-coin-vbox',
        vertical: true,
        x_expand: true,
      });

      this.add_child(vbox);

      let sourceBoxLayout = new AddCoinSourceBoxLayout(this);
      vbox.add_child(sourceBoxLayout);

      let hbox = new St.BoxLayout({ x_expand: true });
      vbox.add_child(hbox);

      this.coinSymbol = new St.Entry({
        name: 'symbol',
        hint_text: 'e.g., BTC/USDT',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add_child(this.coinSymbol);

      this.coinTitle = new St.Entry({
        name: 'title',
        hint_text: 'Label (optional)',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add_child(this.coinTitle);

      this.saveIcon = new St.Icon({
        icon_name: 'list-add-symbolic',
        style_class: 'popup-menu-icon',
      });
      let addBtn = new St.Button({
        child: this.saveIcon,
        style_class: 'crypto-input btn',
      });
      addBtn.connect(
        'clicked',
        () => this._addCoin().catch(console.error)
      );
      hbox.add_child(addBtn);
    }

    async _addCoin() {
      let symbolText = this.coinSymbol.text;
      let titleText = this.coinTitle.text;

      if (symbolText === '' || !symbolText.includes('/')) {
        Main.notifyError('Crypto Tracker', 'Please enter a valid pair with a slash (e.g., BTC/USDT)');
        return;
      }

      let coingecko_id = '';
      if (this.current_exchange === SourceClient.exchanges.coingecko) {
        try {
          coingecko_id = await CryptoUtil.coingecko_symbol_to_id(
            symbolText.split('/')[0],
            this.Me
          );
        } catch (error) {
          console.log(error);
        }
      }

      let coin = {
        id: this.editing_id || `${CryptoUtil.createUUID()}`,
        symbol: `${symbolText}`,
        active: this.editing_id ? (this.editing_active || false) : true,
        title: `${titleText}`,
        exchange: `${this.current_exchange}`,
        coingecko_id,
      };

      try {
        let result = false;
        if (this.editing_id) {
          Settings.updateCoin(coin);
          result = true;
          this.editing_id = null; // reset after edit
        } else {
          result = Settings.addCoin(coin);
        }

        if (result) this.panelMenu._buildCoinsSection();
      } catch (error) {
        console.log(error);
      }

      this.coinTitle.text = '';
      this.coinSymbol.text = '';
      if (this.saveIcon) {
        this.saveIcon.icon_name = 'list-add-symbolic';
      }
    }
  }
);
