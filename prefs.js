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
    const updateIntervalRow = new Adw.SpinRow({
      title: 'Update Interval (Seconds)',
      subtitle: 'How often to refresh prices (1 to 3600 seconds)',
      adjustment: new Gtk.Adjustment({
        lower: 1,
        upper: 3600,
        step_increment: 1,
      }),
    });
    group.add(updateIntervalRow);
    settings.bind(
      'update-interval',
      updateIntervalRow,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );

    // Font Size
    const fontSizeRow = new Adw.SpinRow({
      title: 'Font Size',
      subtitle: 'Set to 0 to use GNOME default font size',
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
      }),
    });
    group.add(fontSizeRow);
    settings.bind(
      'font-size',
      fontSizeRow,
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
    const indexRow = new Adw.SpinRow({
      title: 'Panel Position Index',
      subtitle: 'Order of the item within the selected side (0 is closest to edge)',
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
      }),
    });
    group.add(indexRow);
    settings.bind(
      'panel-box-index',
      indexRow,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
