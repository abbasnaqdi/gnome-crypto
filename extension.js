/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import { Extension as Ex } from 'resource:///org/gnome/shell/extensions/extension.js';

import * as SourceClient from './api/sourceClient.js';
import * as CryptoUtil from './utils/cryptoUtil.js';

import * as Settings from './settings.js';
import { CoinMenuItem } from './models/coinMenuItem.js';
import { AddCoinMenuItem } from './models/addCoinMenuItem.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    constructor(metadata) {
      super(0.0, `${metadata.name} Indicator`, false);
      this.coins = [];
      this.menuItem = new St.Label({
        text: '₿',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'menu-item-text',
      });
      this.menuItem.clutter_text.use_markup = true;
      this.add_child(this.menuItem);

      this.coinSection = new PopupMenu.PopupMenuSection();
      this.menu.addMenuItem(this.coinSection);

      this.coinsScrollViewVbox = new St.BoxLayout({
        vertical: true,
        x_expand: false,
      });
      this.coinsCountChangeToScroll = 0;
      const baseMenuItem = new PopupMenu.PopupBaseMenuItem({
        hover: false,
        can_focus: false,
        activate: false,
        reactive: false,
      });
      this.coinSection.addMenuItem(baseMenuItem);

      this._coinsScrollview = new St.ScrollView({
        enable_mouse_scrolling: true,
      });
      this._coinsScrollview.set_policy(
        St.PolicyType.NEVER,
        St.PolicyType.AUTOMATIC,
      );
      this._coinsScrollview.add_child(this.coinsScrollViewVbox);
      baseMenuItem.add_child(this._coinsScrollview);
    }

    _buildAddCoinSection(Me) {
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this.addCoinSubMenu = new AddCoinMenuItem(this, Me);
      this.menu.addMenuItem(this.addCoinSubMenu);

      this.menu.connect('open-state-changed', (menu, open) => {
        if (!open && this.addCoinSubMenu) {
          this.addCoinSubMenu.editing_id = null;
          this.addCoinSubMenu.editing_active = false;
          if (this.addCoinSubMenu.coinSymbol) this.addCoinSubMenu.coinSymbol.text = '';
          if (this.addCoinSubMenu.coinTitle) this.addCoinSubMenu.coinTitle.text = '';
          if (this.addCoinSubMenu.saveIcon) this.addCoinSubMenu.saveIcon.icon_name = 'list-add-symbolic';
        }
      });
    }

    _buildCoinsSection() {
      this._setCoinsFromSettings();

      for (const coin of this.coins) {
        this.coinsScrollViewVbox.add_child(coin);
      }
      this._coinsScrollview.set_height(
        CryptoUtil.getHeight(this.coinsScrollViewVbox.height),
      );
    }

    _setCoinsFromSettings() {
      let current_exchange = SourceClient.get_exchange();
      let _coins = Settings.getCoins();

      for (const c of this.coins) c.destroy();
      this.coins = [];
      this.menuItem.text = '₿';

      for (const coin of _coins) {
        if (!coin.id) {
          coin.id = CryptoUtil.createUUID();
          Settings.setCoinId(coin);
        }
        if (!coin.exchange) {
          coin.exchange = current_exchange;
          Settings.updateCoin(coin);
        }
        let _coin = new CoinMenuItem(coin, this.menuItem, this.coins, this);
        this.coins.push(_coin);
      }
      this._startTicker();
    }

    _startTicker() {
      this._stopTicker();
      this.tickerIndex = 0;
      let displayMode = Settings.get_panel_display_mode();
      if (displayMode === 'ticker') {
        let interval = Settings.get_ticker_interval() || 5;
        this.tickerTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
          this._advanceTicker();
          return true;
        });
      }
      this._updateTopPanelText();
    }

    _stopTicker() {
      if (this.tickerTimeout) {
        GLib.source_remove(this.tickerTimeout);
        this.tickerTimeout = 0;
      }
    }

    _advanceTicker() {
      let activeCoins = this.coins.filter(({ activeCoin }) => activeCoin);
      if (activeCoins.length > 0) {
        this.tickerIndex = (this.tickerIndex + 1) % activeCoins.length;
      }
      this._updateTopPanelText();
    }

    _updateTopPanelText() {
      let activeCoins = this.coins.filter(({ activeCoin }) => activeCoin);
      if (activeCoins.length === 0) {
        this.menuItem.text = '₿';
        return;
      }

      let displayMode = Settings.get_panel_display_mode();

      if (displayMode === 'ticker') {
        this.tickerIndex = (this.tickerIndex || 0) % activeCoins.length;
        let coin = activeCoins[this.tickerIndex];
        let changeStr = '';
        if (coin.current_change) {
          let color = coin.current_change > 0 ? '#2ec27e' : (coin.current_change < 0 ? '#e01b24' : 'inherit');
          let sign = coin.current_change > 0 ? '+' : '';
          changeStr = ` (<span foreground="${color}">${sign}${coin.current_change.toFixed(1)}%</span>)`;
        }
        let safeTitle = GLib.markup_escape_text(coin.title || coin.symbol, -1);
        this.menuItem.clutter_text.set_markup(`${safeTitle} ${coin.current_price || '...'}${changeStr}`);
      } else {
        let markupText = activeCoins
          .map((coin) => {
             let changeStr = '';
             if (coin.current_change) {
               let color = coin.current_change > 0 ? '#2ec27e' : (coin.current_change < 0 ? '#e01b24' : 'inherit');
               let sign = coin.current_change > 0 ? '+' : '';
               changeStr = ` (<span foreground="${color}">${sign}${coin.current_change.toFixed(1)}%</span>)`;
             }
             let safeTitle = GLib.markup_escape_text(coin.title || coin.symbol, -1);
             return `${safeTitle} ${coin.current_price || '...'}${changeStr}`;
          })
          .join(' | ');
        this.menuItem.clutter_text.set_markup(markupText);
      }
    }

    destroy() {
      this._stopTicker();
      super.destroy();
    }
  },
);

export default class Extension extends Ex {
  constructor(meta) {
    super(meta);
  }

  enable() {
    this._indicator = new Indicator(this.metadata);
    this._indicator._buildCoinsSection();
    this._indicator._buildAddCoinSection(this);
    this._settings = this.getSettings(
      'org.gnome.shell.extensions.crypto-tracker',
    );

    let pos = Settings.get_panel_position();
    let index = Settings.get_panel_box_index();
    Main.panel.addToStatusArea(this.uuid, this._indicator, index, pos);
    this._applyFontSize();

    this._settingsId = this._settings.connect('changed', (settings, key) => {
      if (key === 'panel-position' || key === 'panel-box-index') {
        if (this._indicator?.coins?.length) {
          for (const c of this._indicator.coins) {
            c.destroy();
          }
        }
        this._indicator.destroy();
        this._indicator = new Indicator(this.metadata);
        this._indicator._buildCoinsSection();
        this._indicator._buildAddCoinSection(this);
        let pos = Settings.get_panel_position();
        let index = Settings.get_panel_box_index();
        Main.panel.addToStatusArea(this.uuid, this._indicator, index, pos);
        this._applyFontSize();
      }
      if (key === 'font-size') {
        this._applyFontSize();
      }
      if (key === 'update-interval') {
        this._indicator._buildCoinsSection();
      }
      if (key === 'panel-display-mode' || key === 'ticker-interval') {
        this._indicator._startTicker();
      }
    });
  }

  _applyFontSize() {
    let fontSize = Settings.get_font_size();
    if (fontSize > 0) {
      this._indicator.menuItem.style = `font-size: ${fontSize}px;`;
    } else {
      this._indicator.menuItem.style = null;
    }
  }

  disable() {
    if (this._settingsId) {
      this._settings.disconnect(this._settingsId);
      this._settingsId = null;
    }
    if (this._indicator?.coins?.length) {
      for (const c of this._indicator.coins) {
        c.destroy();
      }
    }
    this._indicator?.destroy();
    this._indicator = null;
    this._settings = null;
    CryptoUtil.destroy();
  }
}
