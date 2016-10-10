var Environment = (function() {
  var environment;

  function setEnv() {
    chrome.storage.local.get('environment', function(storage) {
      if (storage) environment = storage.environment;
    });
  }

  // Set now.
  setEnv();

  // Update when the storage has changed.
  chrome.storage.onChanged.addListener(setEnv);

  return {
    get: function() {
      return environment || Environment.PRODUCTION;
    },

    is: function(env) {
      if (!env) throw new Error('No environment passed to Environment.is()');
      return this.get() === env;
    },

    getAppUrl: function() {
      if (this.is(Environment.LOCAL)) return 'https://app-local.mixmax.com';
      else if (this.is(Environment.STAGING)) return 'https://app-staging.mixmax.com';
      else return 'https://app.mixmax.com';
    },

    getComposeUrl: function() {
      if (this.is(Environment.LOCAL)) return 'https://compose-local.mixmax.com';
      else if (this.is(Environment.STAGING)) return 'https://compose-staging.mixmax.com';
      else return 'https://compose.mixmax.com';
    },

    getWwwUrl: function() {
      if (this.is(Environment.LOCAL)) return 'https://www-local.mixmax.com';
      else if (this.is(Environment.STAGING)) return 'https://www-staging.mixmax.com';
      else return 'https://mixmax.com';
    }
  };
})();

Environment.PRODUCTION = 'production';

Environment.STAGING = 'staging';

Environment.LOCAL = 'local';
