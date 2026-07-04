import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CryptoTrackerPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings('org.gnome.shell.extensions.crypto-tracker');
    window.search_enabled = true;

    const page = new Adw.PreferencesPage({
      title: 'General',
      icon_name: 'dialog-information-symbolic',
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: 'Appearance and Behavior',
      description: 'Configure how the extension looks and behaves',
    });
    page.add(group);

    // Update Interval
    const updateIntervalRow = new Adw.ActionRow({
      title: 'Update Interval (Seconds)',
      subtitle: 'How often to refresh prices (1 to 3600 seconds)',
    });
    const updateIntervalSpin = new Gtk.SpinButton({
      valign: Gtk.Align.CENTER,
      adjustment: new Gtk.Adjustment({
        lower: 1,
        upper: 3600,
        step_increment: 1,
      }),
    });
    updateIntervalRow.add_suffix(updateIntervalSpin);
    updateIntervalRow.activatable_widget = updateIntervalSpin;
    group.add(updateIntervalRow);
    settings.bind(
      'update-interval',
      updateIntervalSpin,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    // Font Size
    const fontSizeRow = new Adw.ActionRow({
      title: 'Font Size',
      subtitle: 'Set to 0 to use GNOME default font size',
    });
    const fontSizeSpin = new Gtk.SpinButton({
      valign: Gtk.Align.CENTER,
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
      }),
    });
    fontSizeRow.add_suffix(fontSizeSpin);
    fontSizeRow.activatable_widget = fontSizeSpin;
    group.add(fontSizeRow);
    settings.bind(
      'font-size',
      fontSizeSpin,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    // Panel Position
    const positionRow = new Adw.ComboRow({
      title: 'Panel Position',
      subtitle: 'Which side of the top bar to place the indicator',
      model: Gtk.StringList.new(['Left', 'Center', 'Right']),
    });
    group.add(positionRow);

    const positions = ['left', 'center', 'right'];
    let currentPos = settings.get_string('panel-position');
    positionRow.selected = Math.max(0, positions.indexOf(currentPos));

    positionRow.connect('notify::selected', () => {
      settings.set_string('panel-position', positions[positionRow.selected]);
    });

    // Panel Index
    const indexRow = new Adw.ActionRow({
      title: 'Panel Position Index',
      subtitle: 'Order of the item within the selected side (0 is closest to edge)',
    });
    const indexSpin = new Gtk.SpinButton({
      valign: Gtk.Align.CENTER,
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
      }),
    });
    indexRow.add_suffix(indexSpin);
    indexRow.activatable_widget = indexSpin;
    group.add(indexRow);
    settings.bind(
      'panel-box-index',
      indexSpin,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    // Panel Display Mode
    const displayModeRow = new Adw.ComboRow({
      title: 'Top Panel Display Mode',
      subtitle: 'Static shows all coins, Ticker rotates through them',
      model: Gtk.StringList.new(['Static', 'Ticker']),
    });
    group.add(displayModeRow);

    const displayModes = ['static', 'ticker'];
    let currentMode = settings.get_string('panel-display-mode');
    displayModeRow.selected = Math.max(0, displayModes.indexOf(currentMode));

    displayModeRow.connect('notify::selected', () => {
      settings.set_string('panel-display-mode', displayModes[displayModeRow.selected]);
    });

    // Ticker Interval
    const tickerIntervalRow = new Adw.ActionRow({
      title: 'Ticker Rotation Speed (Seconds)',
      subtitle: 'How long to show each coin before rotating',
    });
    const tickerIntervalSpin = new Gtk.SpinButton({
      valign: Gtk.Align.CENTER,
      adjustment: new Gtk.Adjustment({
        lower: 1,
        upper: 60,
        step_increment: 1,
      }),
    });
    tickerIntervalRow.add_suffix(tickerIntervalSpin);
    tickerIntervalRow.activatable_widget = tickerIntervalSpin;
    group.add(tickerIntervalRow);
    settings.bind(
      'ticker-interval',
      tickerIntervalSpin,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
