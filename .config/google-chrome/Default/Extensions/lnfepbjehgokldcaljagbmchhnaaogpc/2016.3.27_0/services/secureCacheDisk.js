/*! CKP - KeePass integration for Chrome™, Copyright 2016 Steven Campbell
*/
/**

The MIT License (MIT)

Copyright (c) 2015 Steven Campbell.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

"use strict";

/**
 * Storage on disk using a key derived from a temporary 3rd party-provided secret.
 * If a 3rd-party secret is not available, falls back to storing in-memory (still
 * encrypted though).
 *
 * Our secret is the access token for google drive.  It is secret from other
 * extensions, and it is cached in-memory by Chrome.
 *
 * Max storage time is 40 minutes, which is the expected TTL of the secret.  You
 * can see details of the expiry time in chrome://identity-internals/
 */
function SecureCacheDisk(protectedMemory, secureCacheMemory, settings) {
  var exports = {
    save: set,
    get: get,
    clear: clear
  }

  var AES = {
    name: "AES-CBC",
    iv: new Uint8Array([0x18, 0x37, 0xC9, 0x4C, 0x1F, 0x42, 0x61, 0x73, 0x92, 0x5A, 0x1D, 0xC3, 0x44, 0x0A, 0x24, 0x40])
  };
  var salt = new Uint8Array([0xC9, 0x04, 0xF5, 0x6B, 0xCE, 0x60, 0x66, 0x24, 0xE5, 0xAA, 0xA3, 0x60, 0xDD, 0x8E, 0xDD, 0xE8]);

  function getTokenPromise() {
	  return new Promise(function(resolve, reject) {
	    settings.getDiskCacheFlag().then(function(enabled) {
	      if (!enabled) {
	        reject(new Error('Disk cache is not enabled'));
	        return;
	      }

	      if (chrome.extension.inIncognitoContext) {
	        reject(new Error('Secure cache cannot work in incognito mode'));
	      	return;
	      }

	      chrome.identity.getAuthToken({interactive: false}, function(token) {
	        if (token) {
	          var encoder = new TextEncoder();
	          var tokenBytes = encoder.encode(token);

	          //try PBKDF2 if available:
	          window.crypto.subtle.importKey("raw", tokenBytes, {name: "PBKDF2"}, false, ["deriveKey"]).then(function(key){
							var wantedKeyType = {"name": "PBKDF2",salt: salt,iterations: 100000,hash: {name: "SHA-256"}};
							var wantedEncryptType = {name: "AES-CBC", length: 256};
							return window.crypto.subtle.deriveKey(wantedKeyType, key, wantedEncryptType, false, ["encrypt", "decrypt"]);
						}).catch(function(err) {
							//fallback to SHA-256 hash if PBKDF2 not supported (ChromeOS, why???)
							return window.crypto.subtle.digest({name: 'SHA-256'}, tokenBytes).then(function(hash) {		
		           	return window.crypto.subtle.importKey("raw", hash, AES, false, ['encrypt', 'decrypt']);		
	          	});
						}).then(function(aesKey) {
							resolve(aesKey);
						});
	        } else {
	          reject(new Error('Failed to get a 3rd party secret, cache not possible.'));
	        }
	      });
	    });
	  });
  }

  exports.ready = function() {
    return getTokenPromise().then(function() {
      return true;
    }).catch(function(err) {
      //can still use memory
      return secureCacheMemory.ready().then(function(val) {
        return val;
      }).catch(function(err) {
        return false;
      });
    });
  }

  function set(key, data) {
    key = 'secureCache.' + key;
    var preppedData = protectedMemory.serialize(data);
    return new Promise(function(resolve, reject) {
      getTokenPromise().then(function(aesKey) {
        var encoder = new TextEncoder();
        return window.crypto.subtle.encrypt(AES, aesKey, encoder.encode(preppedData));
      }).then(function(encData) {
        preppedData = protectedMemory.serialize(encData);
        var obj = {};
        obj[key] = preppedData;
        chrome.storage.local.set(obj, function() {
          //data saved
          resolve();
        });
      }).catch(function(err) {
        //fallback to in-memory
        secureCacheMemory.save(key, data).then(function() {
          resolve();
        }).catch(function(err) {
          reject(err);
        });
      });
    });
  }

  function get(key) {
    key = 'secureCache.' + key;
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get(key, function(encSerializedData) {
        var encData = protectedMemory.hydrate(encSerializedData[key]);

        getTokenPromise().then(function(aesKey) {
          return window.crypto.subtle.decrypt(AES, aesKey, encData).then(function(decryptedBytes) {
            var decoder = new TextDecoder();
            var serialized = decoder.decode(new Uint8Array(decryptedBytes));
            var data = protectedMemory.hydrate(serialized);

            resolve(data);
          });
        }).catch(function(err) {
          //fallback to in-memory
          secureCacheMemory.get(key).then(function(data) {
            resolve(data);
          }).catch(function(err) {
            reject(err);
          })
        });
      });
    });
  }

  function clear(key) {
    chrome.storage.local.remove('secureCache.' + key);
    secureCacheMemory.clear();
  }

  return exports;
}
