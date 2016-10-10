function translateUI() {
    var replace = ColorZilla.ChromeUtils.i18nReplace;
    replace('head title', 'colorzilla_options');
    replace('div.heading h1', 'colorzilla_options');
    replace('#eyedropper-options th', 'eyedropper');
    replace('label.cz-autostart', 'auto_start_eyedropper_when_button_clicked');
    replace('#cz-outline-label', 'outline_hovered_elements');
    replace('#cz-cursor-crosshair-label', 'change_cursor_to_crosshair');
    replace('#autocopy-options th', 'auto_copy');        
    replace('#cz-autocopy-label', 'auto_copy_picked_to_clipboard');       
    replace('#cz-autocopy-format-label', 'auto_copy_format');
    replace('#color-format-options th', 'color_format');            
    replace('#cz-hex-lowercase-label', 'show_hex_codes_lowercase');           
    replace('#keyboard-shortcut-options th', 'keyboard_shortcuts');
    replace('#cz-keyboard-shortcuts-enabled-label', 'enable_keyboard_shortcuts');
    replace('#cz-keyboard-shortcuts-char-label', 'keyboard_shortcut_label');
    replace('#save-button', 'save_button_label');
}
        
function get(id) {
    return document.getElementById(id);
}

function readOption(key, defaultVal) {
    return (key in localStorage) ? localStorage[key] : defaultVal;
}

function loadOptions() {
    get("cz-autostart").checked = readOption('option-autostart-eyedropper', 'true') == 'true';
    if (!ColorZilla.ChromeUtils.platformSupportsNonForegroundHover()) {
        $(".cz-autostart").hide();
    }

    get("cz-outline").checked = readOption('option-outline-hovered', 'true') == 'true';
    get("cz-cursor-crosshair").checked = readOption('option-cursor-crosshair', 'true') == 'true';

    function updateAutocopyFormatEnable() {
        var autocopyEnabled = get("cz-autocopy").checked;
        get("cz-autocopy-format").disabled = !autocopyEnabled;
        get("cz-autocopy-show-message").disabled = !autocopyEnabled;
        if (!autocopyEnabled) {
            $('#cz-autocopy-format-label').addClass('disabled');
        } else {
            $('#cz-autocopy-format-label').removeClass('disabled');
        }
    }
    get("cz-autocopy").checked = readOption('option-autocopy-to-clipboard', 'true') == 'true';
    get("cz-autocopy-show-message").checked = readOption('option-autocopy-show-message', 'true') == 'true';
    get("cz-autocopy-format").value = readOption('option-autocopy-color-format', 'hex');
    updateAutocopyFormatEnable();
    get("cz-autocopy").onchange = updateAutocopyFormatEnable;

    function onLowercaseHexaChange() {
        var lowerCaseHexa = get("cz-hex-lowercase").checked;
        $('#cz-autocopy-format option[value="hex"]').text(lowerCaseHexa ? '#rrggbb' : '#RRGGBB');
        $('#cz-autocopy-format option[value="hex-no-hash"]').text(lowerCaseHexa ? 'rrggbb' : 'RRGGBB');
    }
    get("cz-hex-lowercase").checked = readOption('option-lowercase-hexa', 'false') == 'true';
    get("cz-hex-lowercase").onchange = onLowercaseHexaChange;
    onLowercaseHexaChange();


    get("cz-keyboard-shortcuts-enabled").checked = readOption('option-keyboard-shortcuts-enabled', 'false') == 'true';

    var isMac = ColorZilla.ChromeUtils.getPlatform() == 'mac';
    get('cz-keyboard-shortcut-modifier-label').innerHTML = isMac ? 'Cmd+Opt+' : 'Ctrl+Alt+';
    var keyboardShortcutSelect = $('#cz-keyboard-shortcuts-char');

    var charCodeOfA = 65;
    var charCodeOfZ = 90;

    for (var i = charCodeOfA; i <= charCodeOfZ; i++) {
        var letter = String.fromCharCode(i);
        $('<option value="' + letter + '">' + letter + '</option>').appendTo(keyboardShortcutSelect);
    }
    keyboardShortcutSelect.val(readOption('option-keyboard-shortcuts-char', 'Z'));
    function updateKeyboardShortcutsEnable() {
        var shortcutsEnabled = get("cz-keyboard-shortcuts-enabled").checked;
        get("cz-keyboard-shortcuts-char").disabled = !shortcutsEnabled;
        if (!shortcutsEnabled) {
            $("#cz-keyboard-shortcuts-char-label, #cz-keyboard-shortcut-modifier-label").addClass('disabled');
        } else {
            $("#cz-keyboard-shortcuts-char-label, #cz-keyboard-shortcut-modifier-label").removeClass('disabled');
        }
    }
    updateKeyboardShortcutsEnable();
    get("cz-keyboard-shortcuts-enabled").onchange = updateKeyboardShortcutsEnable;
}

function saveOptions() {
    localStorage['option-autostart-eyedropper'] = get("cz-autostart").checked ? 'true' : 'false';

    localStorage['option-outline-hovered'] = get("cz-outline").checked ? 'true' : 'false';
    localStorage['option-cursor-crosshair'] = get("cz-cursor-crosshair").checked ? 'true' : 'false';

    localStorage['option-autocopy-to-clipboard'] = get("cz-autocopy").checked ? 'true' : 'false';
    localStorage['option-autocopy-show-message'] = get("cz-autocopy-show-message").checked ? 'true' : 'false';
    localStorage['option-autocopy-color-format'] = get("cz-autocopy-format").value;

    localStorage['option-lowercase-hexa'] = get("cz-hex-lowercase").checked ? 'true' : 'false';

    localStorage['option-keyboard-shortcuts-enabled'] = get("cz-keyboard-shortcuts-enabled").checked ? 'true' : 'false';
    localStorage['option-keyboard-shortcuts-char'] = get("cz-keyboard-shortcuts-char").value;


    var status = document.getElementById("status");
    status.innerHTML = chrome.i18n.getMessage('options_saved');
    setTimeout(function() {
        status.innerHTML = '';
    }, 2000);

    chrome.extension.sendRequest( {
        op: 'options-changed'
    } );
}

translateUI();
loadOptions();

document.getElementById('save-button').addEventListener('click', function() { saveOptions() }, false);