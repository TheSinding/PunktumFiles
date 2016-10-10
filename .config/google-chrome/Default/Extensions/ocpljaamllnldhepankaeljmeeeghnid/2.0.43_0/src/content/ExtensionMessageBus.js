// Listen to events from background page.
chrome.runtime.onMessage.addListener(function(request, sender) {
  // Forward to the extension source.
  window.postMessage({
    sender: '__MIXMAX_MESSAGING_EXTENSION',
    version: 1, // In case we need to know if the source is out of sync with the extension.
    method: request.method,
    payload: request.payload
  }, '*');
});

// Listen to events from extension source.
$(window).on('message', function(e) {
  var data = e.originalEvent.data;
  if (data.sender !== '__MIXMAX_MESSAGING_SOURCE') return;

  // Send to background page.
  chrome.runtime.sendMessage({
    canonicalUrl: data.canonicalUrl,
    invocationId: data.invocationId,
    method: data.method,
    payload: data.payload
  });
});
