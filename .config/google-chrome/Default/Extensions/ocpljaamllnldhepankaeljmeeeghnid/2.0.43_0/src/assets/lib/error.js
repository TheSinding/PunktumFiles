/**
 * Global function to report errors.
 */

/**
 * Legacy wrapper for Raven's captureMessage that automatically concatenates variable-length arguments.
 * If the last argument is an object with a 'extra', 'tags', or 'level' property, it will be
 * assed a Raven options object. This shouldn't be called in new code; instead, error.captureMessage
 * and error.captureError should be called.
 */
var errorLegacy = function( /* Variable arguments. */ ) {
  // Helper stringifies an error.
  function stringify(args) {
    return args.map(function(arg) {
      if (arg === undefined) return 'undefined';
      else if (arg === null) return 'null';
      else if ($.type(arg) === 'string') return arg;
      else if (arg.toString() !== '[object Object]') return arg.toString();
      else return JSON.stringify(arg);
    }).join(' ');
  }


  var args = [].slice.call(arguments);
  var ravenOptions;

  // If the last argument "looks" like raven parameters, then treat it as so.
  var lastArg = args[args.length - 1];
  if (typeof lastArg === 'object' && (lastArg.extra || lastArg.tags || lastArg.level)) ravenOptions = args.pop();

  var message = stringify(args);

  captureMessage(message, ravenOptions);
};


/**
 * Wrapper for Raven's captureMessage.
 */
var captureMessage = function(message, ravenOptions) {
  // Log to console to help debugging.
  console.error(message, ravenOptions);

  Raven.captureMessage.apply(Raven, arguments);
};

/**
 * Wrapper for Raven's captureError.
 */
var captureError = function(error, ravenOptions) {
  // Log to console to help debugging.
  console.error(error.stack || error, ravenOptions);

  Raven.captureError.apply(Raven, arguments);
};


var error = errorLegacy;
error.captureMessage = captureMessage;
error.captureError = captureError;

window.error = error;
