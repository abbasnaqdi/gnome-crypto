// noinspection DuplicatedCode
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as SourceClient from '../api/sourceClient.js';
import * as Settings from '../settings.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';

export let CoinMenuItem = GObject.registerClass(
  class CoinMenuItem extends PopupMenu.PopupBaseMenuItem {
    constructor(coin, menuItem, coins, panelMenu) {
      super({
        reactive: true,
        activate: true,
        hover: true,
        can_focus: true,
      });

      this.id = coin.id;
      this.symbol = coin.symbol;
      this.coingecko_id = coin.coingecko_id;
      this.activeCoin = coin.active;
      this.title = coin.title;
      this.exchange = coin.exchange;
      this.coins = coins;
      this.panelMenu = panelMenu;
      this.current_price = '...';
      this._isDestroyed = false;

      this.add_style_class_name('popup-submenu-menu-item');
      this._switch = new PopupMenu.Switch(this.activeCoin);

      this.checkAccessibleState();

      let viewIcon = new St.Icon({
        style_class: `popup-menu-icon exchange-icon ${this.exchange.toLowerCase()}`,
      });

      let viewBtn = new St.Button({
        child: viewIcon,
        style_class: 'btn m0',
      });
      viewBtn.connect('clicked', this._openChart.bind(this));
      this.add_child(viewBtn);

      this.nameLbl = new St.Label({
        text: this.title || this.symbol,
        style_class: 'itemLabel',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.nameLbl);

      let expander = new St.Bin({
        style_class: 'popup-menu-item-expander',
        x_expand: true,
      });
      this.add_child(expander);

      this.priceLbl = new St.Label({
        text: '...',
        style_class: 'itemLabel text-align-right',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.priceLbl);

      this.changeLbl = new St.Label({
        text: '',
        style_class: 'itemLabel text-align-right crypto-change',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.changeLbl);

      this._statusBtn = new St.Button({
        x_align: Clutter.ActorAlign.START,
        // x_expand: true,
        child: this._switch,
      });
      this._statusBtn.connect('clicked', this._toggle.bind(this, menuItem));
      this.add_child(this._statusBtn);

      let editIcon = new St.Icon({
        icon_name: 'document-edit-symbolic',
        style_class: 'popup-menu-icon',
      });
      let editBtn = new St.Button({
        child: editIcon,
        style_class: 'btn m0',
      });
      editBtn.connect('clicked', this._editCoin.bind(this));
      this.add_child(editBtn);

      let icon = new St.Icon({
        icon_name: 'edit-delete-symbolic',
        style_class: 'popup-menu-icon',
      });
      let delBtn = new St.Button({
        child: icon,
        style_class: 'btn m0',
      });
      delBtn.connect('clicked', this._delCoin.bind(this, menuItem));
      this.add_child(delBtn);

      let upIcon = new St.Icon({
        icon_name: 'go-up-symbolic',
        style_class: 'popup-menu-icon',
      });
      let upBtn = new St.Button({
        child: upIcon,
        style_class: 'btn m0',
      });
      upBtn.connect('clicked', this._moveUp.bind(this, menuItem));
      this.add_child(upBtn);

      let downIcon = new St.Icon({
        icon_name: 'go-down-symbolic',
        style_class: 'popup-menu-icon',
      });
      let downBtn = new St.Button({
        child: downIcon,
        style_class: 'btn m0',
      });
      downBtn.connect('clicked', this._moveDown.bind(this, menuItem));
      this.add_child(downBtn);

      if (this.activeCoin) this._activeCoin(menuItem, true);
      this._startTimer(menuItem);

      this.connect('enter-event', () => {
        if (this._isDestroyed) return;
        viewIcon.icon_name = 'external-link-symbolic';
        viewIcon.style_class = `popup-menu-icon w18`;
      });
      this.connect('leave-event', () => {
        if (this._isDestroyed) return;
        viewIcon.icon_name = '';
        viewIcon.style_class = `popup-menu-icon exchange-icon ${this.exchange.toLowerCase()}`;
      });
    }
    _activeCoin(menuItem, isInit) {
      this.activeCoin = true;

      if (!isInit) Settings.updateCoin(this._getJSON());

      this._updateMenuCoinItems(menuItem, isInit);
      this._refreshPrice(menuItem);
    }
    _disableCoin(menuItem) {
      this.activeCoin = false;
      Settings.updateCoin(this._getJSON());

      this._updateMenuCoinItems(menuItem);
    }
    _getJSON() {
      return {
        id: this.id,
        symbol: this.symbol,
        active: this.activeCoin,
        title: this.title,
        exchange: this.exchange,
      };
    }
    _getPrice() {
      let parts = this.symbol.split('/');
      if (this.exchange === SourceClient.exchanges.coingecko) {
        parts[0] = this.coingecko_id;
      }

      return SourceClient.getPrice(parts[0], parts[1], this.exchange);
    }

    _startTimer(menuItem) {
      this._refreshPrice(menuItem);

      let interval = Settings.get_update_interval() || 10;
      this.timeOutTag = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
        this._refreshPrice(menuItem);
        return true;
      });
    }
    async _refreshPrice(menuItem) {
      try {
        let result = await this._getPrice();
        if (this._isDestroyed) return;
        if (!result || !result.price) return; // if error happened, not change current price.

        this.current_price = result.price;
        this.current_change = result.change;
        this.nameLbl.text = `${this.title || this.symbol}`;
        this.priceLbl.text = `${result.price}`;

        if (result.change !== undefined && result.change !== 0) {
           let sign = result.change > 0 ? '+' : '';
           let colorClass = result.change > 0 ? 'crypto-up' : 'crypto-down';
           this.changeLbl.text = `${sign}${result.change.toFixed(2)}%`;
           this.changeLbl.style_class = `itemLabel text-align-right crypto-change ${colorClass}`;
        } else {
           this.changeLbl.text = '';
        }

        if (this.activeCoin) {
          this._updateMenuCoinItems(menuItem, false);
        }
      } catch (error) {}
    }
    get state() {
      return this._switch.state;
    }
    setToggleState(state) {
      this._switch.state = state;
      this.checkAccessibleState();
    }

    activate(event) {
      if (this._switch.mapped) return;

      // we allow pressing space to toggle the switch
      // without closing the menu
      if (
        event.type() === Clutter.EventType.KEY_PRESS &&
        event.get_key_symbol() === Clutter.KEY_space
      )
        return;

      super.activate(event);
    }

    _toggle(menu) {
      this._switch.toggle();
      this.toggleCoin(menu);
      this.checkAccessibleState();
    }

    checkAccessibleState() {
      // Atk is removed in newer GNOME versions. We can safely ignore these state updates.
    }

    toggleCoin(menuItem) {
      if (this.state) {
        this._activeCoin(menuItem);
      } else {
        this._disableCoin(menuItem);
      }
    }

    removeTimer() {
      if (this.timeOutTag) {
        GLib.source_remove(this.timeOutTag);
        this.timeOutTag = 0;
      }
    }

    _updateMenuCoinItems(menuItem, isInit) {
      if (this.panelMenu && typeof this.panelMenu._updateTopPanelText === 'function') {
        this.panelMenu._updateTopPanelText();
      }
    }

    _delCoin(menuItem) {
      Settings.delCoin({ id: this.id });
      this.panelMenu._buildCoinsSection();
    }

    _editCoin() {
      if (this.panelMenu && this.panelMenu.addCoinSubMenu) {
        let addCoinMenu = this.panelMenu.addCoinSubMenu;
        addCoinMenu.editing_id = this.id;
        addCoinMenu.editing_active = this.activeCoin;
        addCoinMenu.coinSymbol.text = this.symbol;
        addCoinMenu.coinTitle.text = this.title || '';
        if (addCoinMenu.saveIcon) {
          addCoinMenu.saveIcon.icon_name = 'document-save-symbolic';
        }
        
        // Open the parent SubMenuMenuItem if possible
        if (addCoinMenu._parent && addCoinMenu._parent.setOpenState) {
          addCoinMenu._parent.setOpenState(true);
        }
      }
    }

    _moveUp(menuItem) {
      Settings.moveCoinUp({ id: this.id });
      this.panelMenu._buildCoinsSection();
    }

    _moveDown(menuItem) {
      Settings.moveCoinDown({ id: this.id });
      this.panelMenu._buildCoinsSection();
    }

    _openChart() {
      let chartUrl = '';
      try {
        chartUrl = SourceClient.getChartUrl(
          this.coingecko_id || this.symbol,
          this.exchange,
        );
        Util.spawnCommandLine(`xdg-open ${chartUrl}`);
      } catch (err) {
        let title = _('Can not open %s').format(chartUrl);
        Main.notifyError(title, err);
      }
    }

    destroy() {
      this._isDestroyed = true;
      this.removeTimer();
      super.destroy();
    }
  },
);
