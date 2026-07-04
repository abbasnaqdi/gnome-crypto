# Crypto Bar for GNOME Shell

<p align="center">
 <a href="https://github.com/abbasnaqdi/crypto-bar/blob/main/LICENSE">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg">
 </a>
 <a href="https://github.com/abbasnaqdi/crypto-bar">
  <img src="https://badges.frapsoft.com/os/v2/open-source.png?v=103">
 </a>
 </p>
 <br />
 
A powerful, minimalist, and highly customizable extension for GNOME Shell to track live cryptocurrency prices and profit/loss directly on your top panel.

> **Note:** This project is a hard fork and massive continuation of the original [Crypto Price Tracker for Gnome-Shell](https://github.com/alipirpiran/Crypto-Price-Tracker-for-Gnome-Shell) project. This version features a new minimalist UI, GNOME 45+ compatibility, 24h Profit/Loss tracking, memory optimizations, and expanded exchange support.

## New Features & Upgrades

* **24h Profit & Loss (P/L) Tracking**: Instantly see your coin's 24h performance with dynamic minimalist colors (`crypto-up` / `crypto-down`).
* **Expanded Exchange Support**: Now natively tracks **Nobitex** and **Crypto.com** alongside Binance, OKX, and CoinGecko.
* **Top Panel Ticker Rotation**: Configurable display mode to smoothly rotate through tracked coins on the top panel instead of crowding the screen.
* **Minimalist UI Redesign**: Translucent overlays and compact margins allow the extension to flawlessly integrate with any third-party GNOME shell theme (Dark or Light mode).
* **Memory & CPU Optimized**: Uses batched GNOME Shell timer polling to drastically reduce CPU wakeups and battery drain.
* **Modern GNOME Compatibility**: Rebuilt preferences engine using `Adw.ActionRow` to natively support GTK4 and GNOME 45-47+.

## Installation

### Quick Automatic Install (Recommended)

1. Clone the repository anywhere on your system:
```bash
git clone https://github.com/abbasnaqdi/crypto-bar.git
cd crypto-bar
```

2. Run the automated installation script:
```bash
./install.sh
```

3. **Restart your GNOME Shell** (Press `ALT+F2`, type `r`, and press `Enter`). On Wayland, you may need to log out and log back in.
4. Enable the extension via **GNOME Extensions** or **GNOME Tweaks**.

## Supported Sources

* ### Binance
    Example: `BTC/USDT`

* ### Nobitex (New!)
    Ideal for Iranian users tracking local pairs.
    Example: `BTC/IRT` or `BTC/USDT`

* ### OKX
    Example: `BTC/USDT`

* ### Crypto.com (New!)
    Example: `BTC/USDT`

* ### Coingecko
    Example: `BTC/USD`

## Display & Manage Coins
Activate multiple coins from the menu by toggling the switch next to them. Depending on your Settings, they will display continuously in the top bar or rotate smoothly using Ticker Mode, alongside their current 24-hour P/L percentage.

To **Edit** an existing coin, simply click the pencil (Edit) icon next to it. Its details will automatically populate into the form section where you can adjust the symbol or title and save the changes instantly.

## License
[MIT](https://github.com/abbasnaqdi/crypto-bar/blob/main/LICENSE)
