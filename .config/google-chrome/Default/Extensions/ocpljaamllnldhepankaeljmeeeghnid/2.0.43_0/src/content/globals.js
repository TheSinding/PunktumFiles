chrome.storage.local.get(null  , function(storage) {
  var domain;

  // Gmail uses multiple frames so only inject this in the top-most frame.
  var isInIframe = top.document !== document;
  if (isInIframe) return;

  // Don't run if two copies are running.
  var anotherCopyRunning = document.querySelector('script[data-mixmax-globals]');
  if (anotherCopyRunning) {
    alert('Running two copies of Mixmax. Please disable one in chrome://extensions');
    return;
  }

  // Inject variables into the app.
    var globalDefinitions = document.createElement('script');

  // Just for detecting two copies of the extension.
  globalDefinitions.setAttribute('data-mixmax-globals', '');

  // Share contents of Chrome storage and other information with the app. Used by `Storage.js`
  // inside the extension source.
  storage.extensionVersion = chrome.runtime.getManifest().version;
  globalDefinitions.innerHTML = 'MIXMAX_STORAGE = ' + JSON.stringify(storage) + ';';

  document.head.appendChild(globalDefinitions);
});
