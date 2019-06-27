const DEFAULT_TEXT = `
Welcome to newtabtext!
======================

This is a simple text file that lives in your new tab page.
You can use it to keep track of things you need to do, or as
a second clipboard, or just save some ASCII art for you to see.
Your text is auto-saved as you type.
https://github.com/equokka/newtabtext
https://addons.mozilla.org/en-US/firefox/addon/newtabtext/

WARNING: All the text here is lost if you uninstall the extension or
your localStorage is otherwise wiped (unlikely to happen)
Keep a backup of any critically important information you write here.
`;

window.onload = function() {
  // Error handling
  // eslint-disable-next-line no-console
  const err = e => { console.error(e); };

  // Saving
  window.current_text = "";
  const save = (text) => {
    browser.storage.local.set({save: text});
    window.current_text = text;
  };

  // Loading
  const load = () => {
    browser.storage.local.get(null).then(c => {
      // Initialize Ace Editor
      window.aceEditor = ace.edit("editor");

      // set Ace Editor options
      window.aceEditor.setOptions({
        theme: "ace/theme/monokai",
        mode: "ace/mode/text",
        cursorStyle: "slim",
        showPrintMargin: false,
        animatedScroll: false,
        vScrollBarAlwaysVisible: true,
        tabSize: 2,
        useSoftTabs: true,
        behavioursEnabled: false,
        useWorker: false,
        showFoldWidgets: false,
        newLineMode: "unix"
      });

      if (c.save === undefined) {
        // If nothing is saved, write some default text.
        save(DEFAULT_TEXT);
        window.aceEditor.setValue(DEFAULT_TEXT);
      } else {
        // Set contents of editor to what's saved on local storage
        window.aceEditor.setValue(c.save);
      }

      // After calling setValue() everything added is selected,
      // so we clear the selection:
      window.aceEditor.selection.clearSelection();

      // Start at line 1
      window.aceEditor.gotoLine(1);

      // Save on changes
      window.aceEditor.on("change", () => save(window.aceEditor.getValue()));
    }, err);
  };

  // Initial load
  load();

  // Focus the editor
  window.aceEditor.focus();

  // Check every second for changes to the save and load if there are any
  setInterval(() => {
    browser.storage.local.get(null)
      .then(c => {
        if (c.save !== window.current_text) load();
      });
  }, 1 * 1000);
};
