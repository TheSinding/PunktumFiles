/**
 * @requires raven-1.1.16.js
 */

var clientDSN = Environment.is(Environment.LOCAL) ? false /* Disable */ : 'https://401931fd121742ad9f5315a896298e64@app.getsentry.com/35671';
Raven.config(clientDSN, {
  // Whitelist of URLs that we gather logs from.
  // We don't strictly need to match the characters after 'chrome-extension://', but if we end the
  // regex like "\//" Sublime Text will think the rest of the line is a comment.
  whitelistUrls: [/^chrome-extension:\/\/.+/, /mail.google.com/, /inbox.google.com/],
  includePaths: [/^chrome-extension:\/\/.+/, /mail.google.com/, /inbox.google.com/],
  tags: {
    environment: Environment.get()
  },
});

// Suppress the 'Error: Raven not configured' when disabled within a local (unpacked) install.
// See https://github.com/getsentry/raven-js/issues/262
Raven.debug = false;

// Install window.onerror handler.
Raven.install();
