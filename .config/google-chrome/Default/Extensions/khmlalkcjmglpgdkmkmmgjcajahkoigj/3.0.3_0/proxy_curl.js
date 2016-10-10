(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/base64-js/lib/b64.js","/../node_modules/base64-js/lib")
},{"buffer":3,"pBGvAp":5}],2:[function(require,module,exports){

},{"buffer":3,"pBGvAp":5}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/buffer/index.js","/../node_modules/buffer")
},{"base64-js":1,"buffer":3,"ieee754":4,"pBGvAp":5}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/ieee754/index.js","/../node_modules/ieee754")
},{"buffer":3,"pBGvAp":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/process/browser.js","/../node_modules/process")
},{"buffer":3,"pBGvAp":5}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
//
//   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0
//
// The library can be used in node.js app to connect to STOMP brokers over TCP 
// or Web sockets.

// Root of the `stompjs module`

var Stomp = require('./lib/stomp.js');
var StompNode = require('./lib/stomp-node.js');

module.exports = Stomp.Stomp;
module.exports.overTCP = StompNode.overTCP;
module.exports.overWS = StompNode.overWS;
}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/stompjs/index.js","/../node_modules/stompjs")
},{"./lib/stomp-node.js":7,"./lib/stomp.js":8,"buffer":3,"pBGvAp":5}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2013 [Jeff Mesnil](http://jmesnil.net/)
 */

(function() {
  var Stomp, net, overTCP, overWS, wrapTCP, wrapWS;

  Stomp = require('./stomp');

  net = require('net');

  Stomp.Stomp.setInterval = function(interval, f) {
    return setInterval(f, interval);
  };

  Stomp.Stomp.clearInterval = function(id) {
    return clearInterval(id);
  };

  wrapTCP = function(port, host) {
    var socket, ws;
    socket = null;
    ws = {
      url: 'tcp:// ' + host + ':' + port,
      send: function(d) {
        return socket.write(d);
      },
      close: function() {
        return socket.end();
      }
    };
    socket = net.connect(port, host, function(e) {
      return ws.onopen();
    });
    socket.on('error', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('close', function(e) {
      return typeof ws.onclose === "function" ? ws.onclose(e) : void 0;
    });
    socket.on('data', function(data) {
      var event;
      event = {
        'data': data.toString()
      };
      return ws.onmessage(event);
    });
    return ws;
  };

  wrapWS = function(url) {
    var WebSocketClient, connection, socket, ws;
    WebSocketClient = require('websocket').client;
    connection = null;
    ws = {
      url: url,
      send: function(d) {
        return connection.sendUTF(d);
      },
      close: function() {
        return connection.close();
      }
    };
    socket = new WebSocketClient();
    socket.on('connect', function(conn) {
      connection = conn;
      ws.onopen();
      connection.on('error', function(error) {
        return typeof ws.onclose === "function" ? ws.onclose(error) : void 0;
      });
      connection.on('close', function() {
        return typeof ws.onclose === "function" ? ws.onclose() : void 0;
      });
      return connection.on('message', function(message) {
        var event;
        if (message.type === 'utf8') {
          event = {
            'data': message.utf8Data
          };
          return ws.onmessage(event);
        }
      });
    });
    socket.connect(url);
    return ws;
  };

  overTCP = function(host, port) {
    var socket;
    socket = wrapTCP(port, host);
    return Stomp.Stomp.over(socket);
  };

  overWS = function(url) {
    var socket;
    socket = wrapWS(url);
    return Stomp.Stomp.over(socket);
  };

  exports.overTCP = overTCP;

  exports.overWS = overWS;

}).call(this);

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/stompjs/lib/stomp-node.js","/../node_modules/stompjs/lib")
},{"./stomp":8,"buffer":3,"net":2,"pBGvAp":5,"websocket":9}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// Generated by CoffeeScript 1.7.1

/*
   Stomp Over WebSocket http://www.jmesnil.net/stomp-websocket/doc/ | Apache License V2.0

   Copyright (C) 2010-2013 [Jeff Mesnil](http://jmesnil.net/)
   Copyright (C) 2012 [FuseSource, Inc.](http://fusesource.com)
 */

(function() {
  var Byte, Client, Frame, Stomp,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  Byte = {
    LF: '\x0A',
    NULL: '\x00'
  };

  Frame = (function() {
    var unmarshallSingle;

    function Frame(command, headers, body) {
      this.command = command;
      this.headers = headers != null ? headers : {};
      this.body = body != null ? body : '';
    }

    Frame.prototype.toString = function() {
      var lines, name, skipContentLength, value, _ref;
      lines = [this.command];
      skipContentLength = this.headers['content-length'] === false ? true : false;
      if (skipContentLength) {
        delete this.headers['content-length'];
      }
      _ref = this.headers;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        value = _ref[name];
        lines.push("" + name + ":" + value);
      }
      if (this.body && !skipContentLength) {
        lines.push("content-length:" + (Frame.sizeOfUTF8(this.body)));
      }
      lines.push(Byte.LF + this.body);
      return lines.join(Byte.LF);
    };

    Frame.sizeOfUTF8 = function(s) {
      if (s) {
        return encodeURI(s).match(/%..|./g).length;
      } else {
        return 0;
      }
    };

    unmarshallSingle = function(data) {
      var body, chr, command, divider, headerLines, headers, i, idx, len, line, start, trim, _i, _j, _len, _ref, _ref1;
      divider = data.search(RegExp("" + Byte.LF + Byte.LF));
      headerLines = data.substring(0, divider).split(Byte.LF);
      command = headerLines.shift();
      headers = {};
      trim = function(str) {
        return str.replace(/^\s+|\s+$/g, '');
      };
      _ref = headerLines.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        idx = line.indexOf(':');
        headers[trim(line.substring(0, idx))] = trim(line.substring(idx + 1));
      }
      body = '';
      start = divider + 2;
      if (headers['content-length']) {
        len = parseInt(headers['content-length']);
        body = ('' + data).substring(start, start + len);
      } else {
        chr = null;
        for (i = _j = start, _ref1 = data.length; start <= _ref1 ? _j < _ref1 : _j > _ref1; i = start <= _ref1 ? ++_j : --_j) {
          chr = data.charAt(i);
          if (chr === Byte.NULL) {
            break;
          }
          body += chr;
        }
      }
      return new Frame(command, headers, body);
    };

    Frame.unmarshall = function(datas) {
      var data;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = datas.split(RegExp("" + Byte.NULL + Byte.LF + "*"));
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          if ((data != null ? data.length : void 0) > 0) {
            _results.push(unmarshallSingle(data));
          }
        }
        return _results;
      })();
    };

    Frame.marshall = function(command, headers, body) {
      var frame;
      frame = new Frame(command, headers, body);
      return frame.toString() + Byte.NULL;
    };

    return Frame;

  })();

  Client = (function() {
    var now;

    function Client(ws) {
      this.ws = ws;
      this.ws.binaryType = "arraybuffer";
      this.counter = 0;
      this.connected = false;
      this.heartbeat = {
        outgoing: 10000,
        incoming: 10000
      };
      this.maxWebSocketFrameSize = 16 * 1024;
      this.subscriptions = {};
    }

    Client.prototype.debug = function(message) {
      var _ref;
      return typeof window !== "undefined" && window !== null ? (_ref = window.console) != null ? _ref.log(message) : void 0 : void 0;
    };

    now = function() {
      if (Date.now) {
        return Date.now();
      } else {
        return new Date().valueOf;
      }
    };

    Client.prototype._transmit = function(command, headers, body) {
      var out;
      out = Frame.marshall(command, headers, body);
      if (typeof this.debug === "function") {
        this.debug(">>> " + out);
      }
      while (true) {
        if (out.length > this.maxWebSocketFrameSize) {
          this.ws.send(out.substring(0, this.maxWebSocketFrameSize));
          out = out.substring(this.maxWebSocketFrameSize);
          if (typeof this.debug === "function") {
            this.debug("remaining = " + out.length);
          }
        } else {
          return this.ws.send(out);
        }
      }
    };

    Client.prototype._setupHeartbeat = function(headers) {
      var serverIncoming, serverOutgoing, ttl, v, _ref, _ref1;
      if ((_ref = headers.version) !== Stomp.VERSIONS.V1_1 && _ref !== Stomp.VERSIONS.V1_2) {
        return;
      }
      _ref1 = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = headers['heart-beat'].split(",");
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          _results.push(parseInt(v));
        }
        return _results;
      })(), serverOutgoing = _ref1[0], serverIncoming = _ref1[1];
      if (!(this.heartbeat.outgoing === 0 || serverIncoming === 0)) {
        ttl = Math.max(this.heartbeat.outgoing, serverIncoming);
        if (typeof this.debug === "function") {
          this.debug("send PING every " + ttl + "ms");
        }
        this.pinger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            _this.ws.send(Byte.LF);
            return typeof _this.debug === "function" ? _this.debug(">>> PING") : void 0;
          };
        })(this));
      }
      if (!(this.heartbeat.incoming === 0 || serverOutgoing === 0)) {
        ttl = Math.max(this.heartbeat.incoming, serverOutgoing);
        if (typeof this.debug === "function") {
          this.debug("check PONG every " + ttl + "ms");
        }
        return this.ponger = Stomp.setInterval(ttl, (function(_this) {
          return function() {
            var delta;
            delta = now() - _this.serverActivity;
            if (delta > ttl * 2) {
              if (typeof _this.debug === "function") {
                _this.debug("did not receive server activity for the last " + delta + "ms");
              }
              return _this.ws.close();
            }
          };
        })(this));
      }
    };

    Client.prototype._parseConnect = function() {
      var args, connectCallback, errorCallback, headers;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      headers = {};
      switch (args.length) {
        case 2:
          headers = args[0], connectCallback = args[1];
          break;
        case 3:
          if (args[1] instanceof Function) {
            headers = args[0], connectCallback = args[1], errorCallback = args[2];
          } else {
            headers.login = args[0], headers.passcode = args[1], connectCallback = args[2];
          }
          break;
        case 4:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3];
          break;
        default:
          headers.login = args[0], headers.passcode = args[1], connectCallback = args[2], errorCallback = args[3], headers.host = args[4];
      }
      return [headers, connectCallback, errorCallback];
    };

    Client.prototype.connect = function() {
      var args, errorCallback, headers, out;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      out = this._parseConnect.apply(this, args);
      headers = out[0], this.connectCallback = out[1], errorCallback = out[2];
      if (typeof this.debug === "function") {
        this.debug("Opening Web Socket...");
      }
      this.ws.onmessage = (function(_this) {
        return function(evt) {
          var arr, c, client, data, frame, messageID, onreceive, subscription, _i, _len, _ref, _results;
          data = typeof ArrayBuffer !== 'undefined' && evt.data instanceof ArrayBuffer ? (arr = new Uint8Array(evt.data), typeof _this.debug === "function" ? _this.debug("--- got data length: " + arr.length) : void 0, ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = arr.length; _i < _len; _i++) {
              c = arr[_i];
              _results.push(String.fromCharCode(c));
            }
            return _results;
          })()).join('')) : evt.data;
          _this.serverActivity = now();
          if (data === Byte.LF) {
            if (typeof _this.debug === "function") {
              _this.debug("<<< PONG");
            }
            return;
          }
          if (typeof _this.debug === "function") {
            _this.debug("<<< " + data);
          }
          _ref = Frame.unmarshall(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            frame = _ref[_i];
            switch (frame.command) {
              case "CONNECTED":
                if (typeof _this.debug === "function") {
                  _this.debug("connected to server " + frame.headers.server);
                }
                _this.connected = true;
                _this._setupHeartbeat(frame.headers);
                _results.push(typeof _this.connectCallback === "function" ? _this.connectCallback(frame) : void 0);
                break;
              case "MESSAGE":
                subscription = frame.headers.subscription;
                onreceive = _this.subscriptions[subscription] || _this.onreceive;
                if (onreceive) {
                  client = _this;
                  messageID = frame.headers["message-id"];
                  frame.ack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.ack(messageID, subscription, headers);
                  };
                  frame.nack = function(headers) {
                    if (headers == null) {
                      headers = {};
                    }
                    return client.nack(messageID, subscription, headers);
                  };
                  _results.push(onreceive(frame));
                } else {
                  _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled received MESSAGE: " + frame) : void 0);
                }
                break;
              case "RECEIPT":
                _results.push(typeof _this.onreceipt === "function" ? _this.onreceipt(frame) : void 0);
                break;
              case "ERROR":
                _results.push(typeof errorCallback === "function" ? errorCallback(frame) : void 0);
                break;
              default:
                _results.push(typeof _this.debug === "function" ? _this.debug("Unhandled frame: " + frame) : void 0);
            }
          }
          return _results;
        };
      })(this);
      this.ws.onclose = (function(_this) {
        return function() {
          var msg;
          msg = "Whoops! Lost connection to " + _this.ws.url;
          if (typeof _this.debug === "function") {
            _this.debug(msg);
          }
          _this._cleanUp();
          return typeof errorCallback === "function" ? errorCallback(msg) : void 0;
        };
      })(this);
      return this.ws.onopen = (function(_this) {
        return function() {
          if (typeof _this.debug === "function") {
            _this.debug('Web Socket Opened...');
          }
          headers["accept-version"] = Stomp.VERSIONS.supportedVersions();
          headers["heart-beat"] = [_this.heartbeat.outgoing, _this.heartbeat.incoming].join(',');
          return _this._transmit("CONNECT", headers);
        };
      })(this);
    };

    Client.prototype.disconnect = function(disconnectCallback, headers) {
      if (headers == null) {
        headers = {};
      }
      this._transmit("DISCONNECT", headers);
      this.ws.onclose = null;
      this.ws.close();
      this._cleanUp();
      return typeof disconnectCallback === "function" ? disconnectCallback() : void 0;
    };

    Client.prototype._cleanUp = function() {
      this.connected = false;
      if (this.pinger) {
        Stomp.clearInterval(this.pinger);
      }
      if (this.ponger) {
        return Stomp.clearInterval(this.ponger);
      }
    };

    Client.prototype.send = function(destination, headers, body) {
      if (headers == null) {
        headers = {};
      }
      if (body == null) {
        body = '';
      }
      headers.destination = destination;
      return this._transmit("SEND", headers, body);
    };

    Client.prototype.subscribe = function(destination, callback, headers) {
      var client;
      if (headers == null) {
        headers = {};
      }
      if (!headers.id) {
        headers.id = "sub-" + this.counter++;
      }
      headers.destination = destination;
      this.subscriptions[headers.id] = callback;
      this._transmit("SUBSCRIBE", headers);
      client = this;
      return {
        id: headers.id,
        unsubscribe: function() {
          return client.unsubscribe(headers.id);
        }
      };
    };

    Client.prototype.unsubscribe = function(id) {
      delete this.subscriptions[id];
      return this._transmit("UNSUBSCRIBE", {
        id: id
      });
    };

    Client.prototype.begin = function(transaction) {
      var client, txid;
      txid = transaction || "tx-" + this.counter++;
      this._transmit("BEGIN", {
        transaction: txid
      });
      client = this;
      return {
        id: txid,
        commit: function() {
          return client.commit(txid);
        },
        abort: function() {
          return client.abort(txid);
        }
      };
    };

    Client.prototype.commit = function(transaction) {
      return this._transmit("COMMIT", {
        transaction: transaction
      });
    };

    Client.prototype.abort = function(transaction) {
      return this._transmit("ABORT", {
        transaction: transaction
      });
    };

    Client.prototype.ack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("ACK", headers);
    };

    Client.prototype.nack = function(messageID, subscription, headers) {
      if (headers == null) {
        headers = {};
      }
      headers["message-id"] = messageID;
      headers.subscription = subscription;
      return this._transmit("NACK", headers);
    };

    return Client;

  })();

  Stomp = {
    VERSIONS: {
      V1_0: '1.0',
      V1_1: '1.1',
      V1_2: '1.2',
      supportedVersions: function() {
        return '1.1,1.0';
      }
    },
    client: function(url, protocols) {
      var klass, ws;
      if (protocols == null) {
        protocols = ['v10.stomp', 'v11.stomp'];
      }
      klass = Stomp.WebSocketClass || WebSocket;
      ws = new klass(url, protocols);
      return new Client(ws);
    },
    over: function(ws) {
      return new Client(ws);
    },
    Frame: Frame
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.Stomp = Stomp;
  }

  if (typeof window !== "undefined" && window !== null) {
    Stomp.setInterval = function(interval, f) {
      return window.setInterval(f, interval);
    };
    Stomp.clearInterval = function(id) {
      return window.clearInterval(id);
    };
    window.Stomp = Stomp;
  } else if (!exports) {
    self.Stomp = Stomp;
  }

}).call(this);

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/stompjs/lib/stomp.js","/../node_modules/stompjs/lib")
},{"buffer":3,"pBGvAp":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var _global = (function() { return this; })();
var nativeWebSocket = _global.WebSocket || _global.MozWebSocket;
var websocket_version = require('./version');


/**
 * Expose a W3C WebSocket class with just one or two arguments.
 */
function W3CWebSocket(uri, protocols) {
	var native_instance;

	if (protocols) {
		native_instance = new nativeWebSocket(uri, protocols);
	}
	else {
		native_instance = new nativeWebSocket(uri);
	}

	/**
	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
	 * class). Since it is an Object it will be returned as it is when creating an
	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
	 *
	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
	 */
	return native_instance;
}


/**
 * Module exports.
 */
module.exports = {
    'w3cwebsocket' : nativeWebSocket ? W3CWebSocket : null,
    'version'      : websocket_version
};

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/websocket/lib/browser.js","/../node_modules/websocket/lib")
},{"./version":10,"buffer":3,"pBGvAp":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
module.exports = require('../package.json').version;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/websocket/lib/version.js","/../node_modules/websocket/lib")
},{"../package.json":11,"buffer":3,"pBGvAp":5}],11:[function(require,module,exports){
module.exports={
  "_args": [
    [
      "websocket@latest",
      "/Users/nubela/Workspace/picturebook-chrome-extension/node_modules/stompjs"
    ]
  ],
  "_from": "websocket@latest",
  "_id": "websocket@1.0.23",
  "_inCache": true,
  "_installable": true,
  "_location": "/websocket",
  "_nodeVersion": "0.10.45",
  "_npmOperationalInternal": {
    "host": "packages-16-east.internal.npmjs.com",
    "tmp": "tmp/websocket-1.0.23.tgz_1463625793005_0.4532310354989022"
  },
  "_npmUser": {
    "email": "brian@worlize.com",
    "name": "theturtle32"
  },
  "_npmVersion": "2.15.1",
  "_phantomChildren": {},
  "_requested": {
    "name": "websocket",
    "raw": "websocket@latest",
    "rawSpec": "latest",
    "scope": null,
    "spec": "latest",
    "type": "tag"
  },
  "_requiredBy": [
    "/stompjs"
  ],
  "_resolved": "https://registry.npmjs.org/websocket/-/websocket-1.0.23.tgz",
  "_shasum": "20de8ec4a7126b09465578cd5dbb29a9c296aac6",
  "_shrinkwrap": null,
  "_spec": "websocket@latest",
  "_where": "/Users/nubela/Workspace/picturebook-chrome-extension/node_modules/stompjs",
  "author": {
    "email": "brian@worlize.com",
    "name": "Brian McKelvey",
    "url": "https://www.worlize.com/"
  },
  "browser": "lib/browser.js",
  "bugs": {
    "url": "https://github.com/theturtle32/WebSocket-Node/issues"
  },
  "config": {
    "verbose": false
  },
  "contributors": [
    {
      "name": "Iñaki Baz Castillo",
      "email": "ibc@aliax.net",
      "url": "http://dev.sipdoc.net"
    }
  ],
  "dependencies": {
    "debug": "^2.2.0",
    "nan": "^2.3.3",
    "typedarray-to-buffer": "^3.1.2",
    "yaeti": "^0.0.4"
  },
  "description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
  "devDependencies": {
    "buffer-equal": "^0.0.1",
    "faucet": "^0.0.1",
    "gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
    "gulp-jshint": "^1.11.2",
    "jshint-stylish": "^1.0.2",
    "tape": "^4.0.1"
  },
  "directories": {
    "lib": "./lib"
  },
  "dist": {
    "shasum": "20de8ec4a7126b09465578cd5dbb29a9c296aac6",
    "tarball": "https://registry.npmjs.org/websocket/-/websocket-1.0.23.tgz"
  },
  "engines": {
    "node": ">=0.8.0"
  },
  "gitHead": "ba2fa7e9676c456bcfb12ad160655319af66faed",
  "homepage": "https://github.com/theturtle32/WebSocket-Node",
  "keywords": [
    "RFC-6455",
    "client",
    "comet",
    "networking",
    "push",
    "realtime",
    "server",
    "socket",
    "websocket",
    "websockets"
  ],
  "license": "Apache-2.0",
  "main": "index",
  "maintainers": [
    {
      "name": "theturtle32",
      "email": "brian@worlize.com"
    }
  ],
  "name": "websocket",
  "optionalDependencies": {},
  "readme": "ERROR: No README data found!",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/theturtle32/WebSocket-Node.git"
  },
  "scripts": {
    "gulp": "gulp",
    "install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
    "test": "faucet test/unit"
  },
  "version": "1.0.23"
}

},{}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var config;

config = {
  RATE_EXT_URL: "https://chrome.google.com/webstore/detail/khmlalkcjmglpgdkmkmmgjcajahkoigj/reviews",
  CHROME_EXT_ID: "ckiahbcmlmkpfiijecbpflfahoimklke",
  API_URL: "http://api.getpicturebook.com",
  RABBITMQ_HOST: 'proxies-rabbitmq.nubela.co',
  RABBITMQ_USERNAME: 'proxy-consumer',
  RABBITMQ_PASSWD: '^03<DcE/(2?%@q0i'
};

module.exports = config;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/config.js","/")
},{"buffer":3,"pBGvAp":5}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var constants;

constants = {
  AJAX_TIMEOUT_MS: 5000
};

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/constants.js","/enum")
},{"buffer":3,"pBGvAp":5}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var keys;

keys = {
  SERVICE_TOKEN: "service_token",
  HAS_SHOWN_GUIDE: "has_shown_guide",
  COMPUTER_CODE: "computer_code",
  IS_ACTIVATED: "is_activated",
  INSTALL_EPOCH: "install_epoch",
  GENERATED_TRIES: "generated_tries",
  HAS_RATED_EXT: "has_rated_ext",
  CACHED_PAYPAL_PAYMENT_URL: "paypal_payment_url",
  CACHED_SAASY_PAYMENT_URL: "saasy_payment_url",
  CACHED_PRICING: "quotation_pricing"
};

module.exports = keys;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/keys.js","/enum")
},{"buffer":3,"pBGvAp":5}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var JOB_QUEUE_SUBSCRIPTION, RABBITMQ_CLIENT, RABBITMQ_HOST_URI, Stomp, config, createIframe, curl, iced, main, onIframeMsgReceived, onNewJob, onRabbitMQconnected, purgeFrameOptions, util, __iced_k, __iced_k_noop,
  __slice = [].slice;

iced = {
  Deferrals: (function() {
    function _Class(_arg) {
      this.continuation = _arg;
      this.count = 1;
      this.ret = null;
    }

    _Class.prototype._fulfill = function() {
      if (!--this.count) {
        return this.continuation(this.ret);
      }
    };

    _Class.prototype.defer = function(defer_params) {
      ++this.count;
      return (function(_this) {
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      })(this);
    };

    return _Class;

  })(),
  findDeferral: function() {
    return null;
  },
  trampoline: function(_fn) {
    return _fn();
  }
};
__iced_k = __iced_k_noop = function() {};

Stomp = require('stompjs');

config = require('./config');

util = require('./util');

RABBITMQ_HOST_URI = "ws://" + config.RABBITMQ_HOST + ":15674/ws";

RABBITMQ_CLIENT = Stomp.client(RABBITMQ_HOST_URI);

JOB_QUEUE_SUBSCRIPTION = null;

createIframe = function(url) {
  var iframe, iframeId;
  iframe = document.body.appendChild(document.createElement('iframe'));
  iframe.src = url;
  iframeId = util.genUuid();
  $(iframe).attr("id", iframeId);
  return iframeId;
};

onIframeMsgReceived = function(deferredCallback, iframeId, timer) {
  return (function(deferredCallback, iframeId, timer) {
    return function(req, sender, responder) {
      if (sender.id === chrome.runtime.id) {
        deferredCallback(req.html);
      }
      $("\#" + iframeId).remove();
      if (timer != null) {
        return clearTimeout(timer);
      }
    };
  })(deferredCallback, iframeId, timer);
};

curl = function(url, deferredCallback, timeoutSecs) {
  var iframeId, listener, timer;
  if (timeoutSecs == null) {
    timeoutSecs = 30;
  }
  iframeId = createIframe(url);
  timer = null;
  listener = onIframeMsgReceived(deferredCallback, iframeId, timer);
  chrome.runtime.onMessage.addListener(listener);
  return timer = setTimeout(function() {
    chrome.runtime.onMessage.removeListener(listener);
    return deferredCallback(null);
  }, timeoutSecs * 1000);
};

purgeFrameOptions = function(info) {
  var header, idx, _i, _len, _ref;
  _ref = info.responseHeaders;
  for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
    header = _ref[idx];
    if (header == null) {
      continue;
    }
    if ((header.name != null) && header.name.toLowerCase() === 'x-frame-options') {
      info.responseHeaders.splice(idx, 1);
    }
    if ((header.name != null) && header.name.toLowerCase() === 'frame-options') {
      info.responseHeaders.splice(idx, 1);
    }
  }
  return {
    responseHeaders: info.responseHeaders
  };
};

onNewJob = function(msg) {
  var html, jobDic, ___iced_passed_deferral, __iced_deferrals, __iced_k;
  __iced_k = __iced_k_noop;
  ___iced_passed_deferral = iced.findDeferral(arguments);
  if (JOB_QUEUE_SUBSCRIPTION != null) {
    JOB_QUEUE_SUBSCRIPTION.unsubscribe();
    JOB_QUEUE_SUBSCRIPTION = null;
  }
  chrome.webRequest.onHeadersReceived.addListener(purgeFrameOptions, {
    urls: ['*://*/*'],
    types: ['sub_frame']
  }, ['blocking', 'responseHeaders']);
  jobDic = JSON.parse(msg.body);
  (function(_this) {
    return (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/proxy_curl.coffee"
      });
      curl(jobDic.url, __iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return html = arguments[0];
          };
        })(),
        lineno: 58
      }), jobDic.timeout);
      __iced_deferrals._fulfill();
    });
  })(this)((function(_this) {
    return function() {
      RABBITMQ_CLIENT.send(jobDic.id, {}, JSON.stringify({
        html: html
      }));
      chrome.webRequest.onHeadersReceived.removeListener(purgeFrameOptions);
      return JOB_QUEUE_SUBSCRIPTION = RABBITMQ_CLIENT.subscribe(config.RABBITMQ_JOB_QUEUE, onNewJob, {
        ack: 'client-individual'
      });
    };
  })(this));
};

onRabbitMQconnected = function() {
  return JOB_QUEUE_SUBSCRIPTION = RABBITMQ_CLIENT.subscribe(config.RABBITMQ_JOB_QUEUE, onNewJob);
};

main = function() {
  return RABBITMQ_CLIENT.connect(config.RABBITMQ_USERNAME, config.RABBITMQ_PASSWD, onRabbitMQconnected);
};

$(document).ready(function() {
  return main();
});

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_641d2a42.js","/")
},{"./config":12,"./util":16,"buffer":3,"pBGvAp":5,"stompjs":6}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var config, constants, iced, keys, util, __iced_k, __iced_k_noop,
  __slice = [].slice;

iced = {
  Deferrals: (function() {
    function _Class(_arg) {
      this.continuation = _arg;
      this.count = 1;
      this.ret = null;
    }

    _Class.prototype._fulfill = function() {
      if (!--this.count) {
        return this.continuation(this.ret);
      }
    };

    _Class.prototype.defer = function(defer_params) {
      ++this.count;
      return (function(_this) {
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      })(this);
    };

    return _Class;

  })(),
  findDeferral: function() {
    return null;
  },
  trampoline: function(_fn) {
    return _fn();
  }
};
__iced_k = __iced_k_noop = function() {};

keys = require('./enum/keys');

constants = require('./enum/constants');

config = require('./config');

util = {
  openPage: function(page, focus_on_tab) {
    if (focus_on_tab == null) {
      focus_on_tab = true;
    }
    return chrome.tabs.create({
      url: page,
      active: focus_on_tab
    });
  },
  setLocalData: function(dic_key, val, defer_cb) {
    var dic;
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    dic = {};
    dic[dic_key] = val;
    return chrome.storage.local.set(dic, (function() {
      return defer_cb();
    }));
  },
  getLocalData: function(key, default_value, defer_cb) {
    var items, potential_res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        chrome.storage.local.get(key, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return items = arguments[0];
            };
          })(),
          lineno: 18
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (key in items) {
          defer_cb(items[key]);
          return;
        }
        potential_res = localStorage.getItem(key);
        if (potential_res != null) {
          defer_cb(potential_res);
          chrome.storage.local.set({
            key: potential_res
          }, (function() {}));
          return;
        }
        return defer_cb(default_value);
      };
    })(this));
  },
  genUuid: function() {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = (c === "x" ? r : r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  isLetter: function(c) {
    return "abcdefghijklmnopqrstuvwxyz".indexOf(c) !== -1;
  },
  isNumber: function(c) {
    return "0123456789".indexOf(c) !== -1;
  },
  letterToNumber: function(c) {
    return "abcdefghijklmnopqrstuvwxyz".indexOf(c);
  },
  numberToLetter: function(i) {
    return "abcdefghijklmnopqrstuvwxyz"[i];
  },
  lastDigit: function(i) {
    var digit_str;
    digit_str = String(i);
    return parseInt(digit_str[digit_str.length - 1]);
  },
  makeSerialFromUuid: function(uuid) {
    var char, char_no, i, serial, total, _i, _j, _k, _len;
    uuid = uuid.toLowerCase();
    serial = "";
    for (_i = 0, _len = uuid.length; _i < _len; _i++) {
      char = uuid[_i];
      if (isLetter(char)) {
        char_no = letterToNumber(char);
        for (i = _j = 0; _j <= 9; i = ++_j) {
          total = char_no + i;
          if (lastDigit(total) === 1) {
            serial += numberToLetter(i);
            break;
          }
        }
      } else if (isNumber(char)) {
        char_no = parseInt(char);
        for (i = _k = 0; _k <= 9; i = ++_k) {
          total = char_no + i;
          if (lastDigit(total) === 1) {
            serial += String(i);
            break;
          }
        }
      }
    }
    return serial;
  },
  isSerialValid: function(uuid, serial) {
    var idx, serial_char, serial_no, total, uuid_char, uuid_no, _i, _ref;
    uuid = uuid.toLowerCase();
    serial = serial.toLowerCase();
    if (uuid.length !== serial.length) {
      return false;
    }
    for (idx = _i = 0, _ref = uuid.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; idx = 0 <= _ref ? ++_i : --_i) {
      uuid_char = uuid[idx];
      serial_char = serial[idx];
      if (isLetter(uuid_char) && isLetter(serial_char)) {
        uuid_no = letterToNumber(uuid_char);
        serial_no = letterToNumber(serial_char);
        total = uuid_no + serial_no;
        if (lastDigit(total) !== 1) {
          return false;
        }
      } else if (isNumber(uuid_char) && isNumber(serial_char)) {
        uuid_no = parseInt(uuid_char);
        serial_no = parseInt(serial_char);
        total = uuid_no + serial_no;
        if (lastDigit(total) !== 1) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  },
  getFbGraphId: function(username, cb) {
    return $.ajax({
      timeout: AJAX_TIMEOUT_MS,
      type: "GET",
      url: "http://graph.facebook.com/" + username,
      dataType: "json",
      crossDomain: true,
      success: function(data) {
        return cb(data["id"]);
      },
      error: function() {
        return cb(null);
      }
    });
  },
  getParameterByName: function(url, name) {
    var regex, results;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(url);
    if (results === null) {
      return "";
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  },
  facebookProfileId: function(url, cb) {
    var profile_id, username, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    url = util.cleanUrl(url);
    if (url.substring(0, "facebook.com/profile.php?".length) === "facebook.com/profile.php?") {
      cb(getParameterByName(url, "id"));
      return;
    }
    if (url.substring(0, "facebook.com/".length) === "facebook.com/") {
      username = url.substring("facebook.com/".length, url.length);
      if (username.indexOf("?") !== -1) {
        username = username.substring(0, username.indexOf("?"));
      }
      (function(_this) {
        return (function(__iced_k) {
          if (username.indexOf("/") === -1 && username.indexOf("?") === -1 && username.indexOf("=") === -1 && username.indexOf("&") === -1) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
              });
              getFbGraphId(username, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return profile_id = arguments[0];
                  };
                })(),
                lineno: 133
              }));
              __iced_deferrals._fulfill();
            })(function() {
              cb(profile_id);
              return;
              return __iced_k();
            });
          } else {
            return __iced_k();
          }
        });
      })(this)(__iced_k);
    } else {
      return __iced_k();
    }
  },
  cleanUrl: function(url) {
    if (url == null) {
      return "";
    }
    url = url.replace("http://www.", "");
    url = url.replace("https://www.", "");
    url = url.replace("http://", "");
    url = url.replace("https://", "");
    return url;
  },
  isUrlAProfilePage: function(url) {
    var cleaned_url, username;
    cleaned_url = util.cleanUrl(url);
    if (cleaned_url.substring(0, "facebook.com/profile.php?".length) === "facebook.com/profile.php?") {
      return true;
    }
    if (cleaned_url.substring(0, "facebook.com/".length) === "facebook.com/") {
      username = cleaned_url.substring("facebook.com/".length, cleaned_url.length);
      if (username.indexOf("?") !== -1) {
        username = username.substring(0, username.indexOf("?"));
      }
      if (username.indexOf("/") === -1 && username.indexOf("?") === -1 && username.indexOf("=") === -1 && username.indexOf("&") === -1 && username.length > 0) {
        return true;
      }
    }
    return false;
  },
  daysSinceInstall: function(cb) {
    var epoch_now, install_epoch, seconds_in_a_day, total_secs_elapsed, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        util.getLocalData(keys.INSTALL_EPOCH, 0, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return install_epoch = arguments[0];
            };
          })(),
          lineno: 163
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        epoch_now = Math.round(new Date().getTime() / 1000);
        total_secs_elapsed = epoch_now - install_epoch;
        seconds_in_a_day = 86400;
        return cb(parseInt(total_secs_elapsed / seconds_in_a_day));
      };
    })(this));
  },
  isActivated: function(cb) {
    var is_activated, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        util.getLocalData(keys.IS_ACTIVATED, false, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return is_activated = arguments[0];
            };
          })(),
          lineno: 170
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return cb(is_activated);
      };
    })(this));
  },
  isValidForUse: function(cb) {
    var activation_days_left, days_since_install, is_activated, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        util.daysSinceInstall(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return days_since_install = arguments[0];
            };
          })(),
          lineno: 174
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
          });
          util.isActivated(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return is_activated = arguments[0];
              };
            })(),
            lineno: 175
          }));
          __iced_deferrals._fulfill();
        })(function() {
          activation_days_left = TRIAL_DAYS - days_since_install;
          return cb(activation_days_left > 0 || is_activated);
        });
      };
    })(this));
  },
  showRichNotification: function(title, body, btns) {
    var b, bindButtonClickEvent, btns_lis, i, _i, _len;
    if (btns == null) {
      btns = [];
    }

    /*
    Uses the new Chrome (rich) notifications API
    
    `buttons` -- is a list of dicts with 3 values.
    
    example:
        [{
            "title": "Title of the button",
            "icon": "images/rabbit.png",
            "next": function() {..}
        }]
     */
    bindButtonClickEvent = function(idx, id) {
      return chrome.notifications.onButtonClicked.addListener(function(notification_id, btn_idx) {
        if (notification_id === id && btn_idx === idx) {
          return b.next();
        }
      });
    };
    btns_lis = [];
    i = 0;
    for (_i = 0, _len = btns.length; _i < _len; _i++) {
      b = btns[_i];
      btns_lis.push({
        title: b.title,
        iconUrl: b.icon
      });
      bindButtonClickEvent(i, title);
      i += 1;
    }
    chrome.notifications.clear(title, (function() {}));
    return chrome.notifications.create(title, {
      type: "basic",
      title: title,
      message: body,
      iconUrl: "/resources/imgs/icon128.png",
      buttons: btns_lis
    }, (function() {}));
  },
  getFbId: function(tab_id, cb) {
    return chrome.tabs.executeScript(tab_id, {
      file: "inject.js"
    }, function() {
      return (function(cb) {
        return chrome.tabs.sendMessage(tab_id, {
          method: "get-fb-id"
        }, function(r) {
          return cb(r.fbid);
        });
      })(cb);
    });
  },
  fetchFacebookUrl: function(fbProfileId, callbackDefer) {
    var serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    console.log(config.API_URL);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        util.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 229
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return $.ajax({
          timeout: constants.AJAX_TIMEOUT_MS,
          type: "GET",
          url: "" + config.API_URL + "/v1/urls",
          data: {
            service_token: serviceToken,
            fb_profile_id: fbProfileId
          },
          dataType: "json",
          crossDomain: true,
          success: function(data) {
            return callbackDefer(data.direct, data.url);
          },
          error: function() {
            return callbackDefer(false, null);
          }
        });
      };
    })(this));
  },
  makeToast: function(msg, durationMs) {
    if (durationMs == null) {
      durationMs = 4000;
    }
    if (msg == null) {
      return;
    }
    return $.snackbar({
      content: msg,
      style: "toast",
      timeout: durationMs
    });
  },
  redirect: function(url) {
    return document.location.href = url;
  },
  signInViaOauth: function(accessToken, deferredCallback) {
    return $.ajax({
      timeout: constants.AJAX_TIMEOUT_MS,
      type: "POST",
      url: "" + config.API_URL + "/v1/users/oauth",
      data: {
        oauth_token: accessToken
      },
      dataType: "json",
      crossDomain: true,
      success: function(data) {
        var serviceToken;
        serviceToken = data["service_token"];
        return deferredCallback(serviceToken);
      },
      error: function() {
        return deferredCallback(null);
      }
    });
  },
  getQuotationAndUrls: function(deferredCallback) {
    var serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/picturebook-chrome-extension/src/util.coffee"
        });
        util.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 272
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (typeof serviceToken === "undefined" || serviceToken === null) {
          deferredCallback(null, null, null);
        }
        return $.ajax({
          timeout: constants.AJAX_TIMEOUT_MS,
          type: "GET",
          url: "" + config.API_URL + "/v1/payments/url",
          data: {
            service_token: serviceToken
          },
          dataType: "json",
          crossDomain: true,
          success: function(data) {
            var paypalUrl, priceObj, saasyUrl;
            console.log(data);
            priceObj = data["price"];
            paypalUrl = data["paypal"].monthly;
            saasyUrl = data["saasy"].monthly;
            return deferredCallback(priceObj, paypalUrl, saasyUrl);
          },
          error: function() {
            return deferredCallback(null, null, null);
          }
        });
      };
    })(this));
  },
  fetchLatestPricing: function(deferredCallback) {
    return $.ajax({
      timeout: constants.AJAX_TIMEOUT_MS,
      type: "GET",
      url: "" + config.API_URL + "/v1/payments/pricing",
      dataType: "json",
      crossDomain: true,
      success: function(data) {
        return deferredCallback(data['monthly']);
      },
      error: function() {
        return deferredCallback(null);
      }
    });
  }
};

module.exports = util;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/util.js","/")
},{"./config":12,"./enum/constants":13,"./enum/keys":14,"buffer":3,"pBGvAp":5}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9saWIvX2VtcHR5LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vbm9kZV9tb2R1bGVzL3N0b21wanMvaW5kZXguanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL25vZGVfbW9kdWxlcy9zdG9tcGpzL2xpYi9zdG9tcC1ub2RlLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9ub2RlX21vZHVsZXMvc3RvbXBqcy9saWIvc3RvbXAuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL25vZGVfbW9kdWxlcy93ZWJzb2NrZXQvbGliL2Jyb3dzZXIuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL25vZGVfbW9kdWxlcy93ZWJzb2NrZXQvbGliL3ZlcnNpb24uanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL25vZGVfbW9kdWxlcy93ZWJzb2NrZXQvcGFja2FnZS5qc29uIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi90bXAvY29uZmlnLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi90bXAvZW51bS9jb25zdGFudHMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL3RtcC9lbnVtL2tleXMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL3RtcC9mYWtlXzY0MWQyYTQyLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi90bXAvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLG51bGwsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9idWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gQ29weXJpZ2h0IChDKSAyMDEzIFtKZWZmIE1lc25pbF0oaHR0cDovL2ptZXNuaWwubmV0Lylcbi8vXG4vLyAgIFN0b21wIE92ZXIgV2ViU29ja2V0IGh0dHA6Ly93d3cuam1lc25pbC5uZXQvc3RvbXAtd2Vic29ja2V0L2RvYy8gfCBBcGFjaGUgTGljZW5zZSBWMi4wXG4vL1xuLy8gVGhlIGxpYnJhcnkgY2FuIGJlIHVzZWQgaW4gbm9kZS5qcyBhcHAgdG8gY29ubmVjdCB0byBTVE9NUCBicm9rZXJzIG92ZXIgVENQIFxuLy8gb3IgV2ViIHNvY2tldHMuXG5cbi8vIFJvb3Qgb2YgdGhlIGBzdG9tcGpzIG1vZHVsZWBcblxudmFyIFN0b21wID0gcmVxdWlyZSgnLi9saWIvc3RvbXAuanMnKTtcbnZhciBTdG9tcE5vZGUgPSByZXF1aXJlKCcuL2xpYi9zdG9tcC1ub2RlLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RvbXAuU3RvbXA7XG5tb2R1bGUuZXhwb3J0cy5vdmVyVENQID0gU3RvbXBOb2RlLm92ZXJUQ1A7XG5tb2R1bGUuZXhwb3J0cy5vdmVyV1MgPSBTdG9tcE5vZGUub3ZlcldTO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvc3RvbXBqcy9pbmRleC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9zdG9tcGpzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjcuMVxuXG4vKlxuICAgU3RvbXAgT3ZlciBXZWJTb2NrZXQgaHR0cDovL3d3dy5qbWVzbmlsLm5ldC9zdG9tcC13ZWJzb2NrZXQvZG9jLyB8IEFwYWNoZSBMaWNlbnNlIFYyLjBcblxuICAgQ29weXJpZ2h0IChDKSAyMDEzIFtKZWZmIE1lc25pbF0oaHR0cDovL2ptZXNuaWwubmV0LylcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBTdG9tcCwgbmV0LCBvdmVyVENQLCBvdmVyV1MsIHdyYXBUQ1AsIHdyYXBXUztcblxuICBTdG9tcCA9IHJlcXVpcmUoJy4vc3RvbXAnKTtcblxuICBuZXQgPSByZXF1aXJlKCduZXQnKTtcblxuICBTdG9tcC5TdG9tcC5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKGludGVydmFsLCBmKSB7XG4gICAgcmV0dXJuIHNldEludGVydmFsKGYsIGludGVydmFsKTtcbiAgfTtcblxuICBTdG9tcC5TdG9tcC5jbGVhckludGVydmFsID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gY2xlYXJJbnRlcnZhbChpZCk7XG4gIH07XG5cbiAgd3JhcFRDUCA9IGZ1bmN0aW9uKHBvcnQsIGhvc3QpIHtcbiAgICB2YXIgc29ja2V0LCB3cztcbiAgICBzb2NrZXQgPSBudWxsO1xuICAgIHdzID0ge1xuICAgICAgdXJsOiAndGNwOi8vICcgKyBob3N0ICsgJzonICsgcG9ydCxcbiAgICAgIHNlbmQ6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHNvY2tldC53cml0ZShkKTtcbiAgICAgIH0sXG4gICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzb2NrZXQuZW5kKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBzb2NrZXQgPSBuZXQuY29ubmVjdChwb3J0LCBob3N0LCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gd3Mub25vcGVuKCk7XG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygd3Mub25jbG9zZSA9PT0gXCJmdW5jdGlvblwiID8gd3Mub25jbG9zZShlKSA6IHZvaWQgMDtcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ2Nsb3NlJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB3cy5vbmNsb3NlID09PSBcImZ1bmN0aW9uXCIgPyB3cy5vbmNsb3NlKGUpIDogdm9pZCAwO1xuICAgIH0pO1xuICAgIHNvY2tldC5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBldmVudDtcbiAgICAgIGV2ZW50ID0ge1xuICAgICAgICAnZGF0YSc6IGRhdGEudG9TdHJpbmcoKVxuICAgICAgfTtcbiAgICAgIHJldHVybiB3cy5vbm1lc3NhZ2UoZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiB3cztcbiAgfTtcblxuICB3cmFwV1MgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgV2ViU29ja2V0Q2xpZW50LCBjb25uZWN0aW9uLCBzb2NrZXQsIHdzO1xuICAgIFdlYlNvY2tldENsaWVudCA9IHJlcXVpcmUoJ3dlYnNvY2tldCcpLmNsaWVudDtcbiAgICBjb25uZWN0aW9uID0gbnVsbDtcbiAgICB3cyA9IHtcbiAgICAgIHVybDogdXJsLFxuICAgICAgc2VuZDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbi5zZW5kVVRGKGQpO1xuICAgICAgfSxcbiAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXRDbGllbnQoKTtcbiAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbihjb25uKSB7XG4gICAgICBjb25uZWN0aW9uID0gY29ubjtcbiAgICAgIHdzLm9ub3BlbigpO1xuICAgICAgY29ubmVjdGlvbi5vbignZXJyb3InLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHdzLm9uY2xvc2UgPT09IFwiZnVuY3Rpb25cIiA/IHdzLm9uY2xvc2UoZXJyb3IpIDogdm9pZCAwO1xuICAgICAgfSk7XG4gICAgICBjb25uZWN0aW9uLm9uKCdjbG9zZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHdzLm9uY2xvc2UgPT09IFwiZnVuY3Rpb25cIiA/IHdzLm9uY2xvc2UoKSA6IHZvaWQgMDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbm5lY3Rpb24ub24oJ21lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBldmVudDtcbiAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ3V0ZjgnKSB7XG4gICAgICAgICAgZXZlbnQgPSB7XG4gICAgICAgICAgICAnZGF0YSc6IG1lc3NhZ2UudXRmOERhdGFcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiB3cy5vbm1lc3NhZ2UoZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzb2NrZXQuY29ubmVjdCh1cmwpO1xuICAgIHJldHVybiB3cztcbiAgfTtcblxuICBvdmVyVENQID0gZnVuY3Rpb24oaG9zdCwgcG9ydCkge1xuICAgIHZhciBzb2NrZXQ7XG4gICAgc29ja2V0ID0gd3JhcFRDUChwb3J0LCBob3N0KTtcbiAgICByZXR1cm4gU3RvbXAuU3RvbXAub3Zlcihzb2NrZXQpO1xuICB9O1xuXG4gIG92ZXJXUyA9IGZ1bmN0aW9uKHVybCkge1xuICAgIHZhciBzb2NrZXQ7XG4gICAgc29ja2V0ID0gd3JhcFdTKHVybCk7XG4gICAgcmV0dXJuIFN0b21wLlN0b21wLm92ZXIoc29ja2V0KTtcbiAgfTtcblxuICBleHBvcnRzLm92ZXJUQ1AgPSBvdmVyVENQO1xuXG4gIGV4cG9ydHMub3ZlcldTID0gb3ZlcldTO1xuXG59KS5jYWxsKHRoaXMpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9zdG9tcGpzL2xpYi9zdG9tcC1ub2RlLmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL3N0b21wanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjcuMVxuXG4vKlxuICAgU3RvbXAgT3ZlciBXZWJTb2NrZXQgaHR0cDovL3d3dy5qbWVzbmlsLm5ldC9zdG9tcC13ZWJzb2NrZXQvZG9jLyB8IEFwYWNoZSBMaWNlbnNlIFYyLjBcblxuICAgQ29weXJpZ2h0IChDKSAyMDEwLTIwMTMgW0plZmYgTWVzbmlsXShodHRwOi8vam1lc25pbC5uZXQvKVxuICAgQ29weXJpZ2h0IChDKSAyMDEyIFtGdXNlU291cmNlLCBJbmMuXShodHRwOi8vZnVzZXNvdXJjZS5jb20pXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgQnl0ZSwgQ2xpZW50LCBGcmFtZSwgU3RvbXAsXG4gICAgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gICAgX19zbGljZSA9IFtdLnNsaWNlO1xuXG4gIEJ5dGUgPSB7XG4gICAgTEY6ICdcXHgwQScsXG4gICAgTlVMTDogJ1xceDAwJ1xuICB9O1xuXG4gIEZyYW1lID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bm1hcnNoYWxsU2luZ2xlO1xuXG4gICAgZnVuY3Rpb24gRnJhbWUoY29tbWFuZCwgaGVhZGVycywgYm9keSkge1xuICAgICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICAgIHRoaXMuaGVhZGVycyA9IGhlYWRlcnMgIT0gbnVsbCA/IGhlYWRlcnMgOiB7fTtcbiAgICAgIHRoaXMuYm9keSA9IGJvZHkgIT0gbnVsbCA/IGJvZHkgOiAnJztcbiAgICB9XG5cbiAgICBGcmFtZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsaW5lcywgbmFtZSwgc2tpcENvbnRlbnRMZW5ndGgsIHZhbHVlLCBfcmVmO1xuICAgICAgbGluZXMgPSBbdGhpcy5jb21tYW5kXTtcbiAgICAgIHNraXBDb250ZW50TGVuZ3RoID0gdGhpcy5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddID09PSBmYWxzZSA/IHRydWUgOiBmYWxzZTtcbiAgICAgIGlmIChza2lwQ29udGVudExlbmd0aCkge1xuICAgICAgICBkZWxldGUgdGhpcy5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddO1xuICAgICAgfVxuICAgICAgX3JlZiA9IHRoaXMuaGVhZGVycztcbiAgICAgIGZvciAobmFtZSBpbiBfcmVmKSB7XG4gICAgICAgIGlmICghX19oYXNQcm9wLmNhbGwoX3JlZiwgbmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICB2YWx1ZSA9IF9yZWZbbmFtZV07XG4gICAgICAgIGxpbmVzLnB1c2goXCJcIiArIG5hbWUgKyBcIjpcIiArIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJvZHkgJiYgIXNraXBDb250ZW50TGVuZ3RoKSB7XG4gICAgICAgIGxpbmVzLnB1c2goXCJjb250ZW50LWxlbmd0aDpcIiArIChGcmFtZS5zaXplT2ZVVEY4KHRoaXMuYm9keSkpKTtcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goQnl0ZS5MRiArIHRoaXMuYm9keSk7XG4gICAgICByZXR1cm4gbGluZXMuam9pbihCeXRlLkxGKTtcbiAgICB9O1xuXG4gICAgRnJhbWUuc2l6ZU9mVVRGOCA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzKSB7XG4gICAgICAgIHJldHVybiBlbmNvZGVVUkkocykubWF0Y2goLyUuLnwuL2cpLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB1bm1hcnNoYWxsU2luZ2xlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIGJvZHksIGNociwgY29tbWFuZCwgZGl2aWRlciwgaGVhZGVyTGluZXMsIGhlYWRlcnMsIGksIGlkeCwgbGVuLCBsaW5lLCBzdGFydCwgdHJpbSwgX2ksIF9qLCBfbGVuLCBfcmVmLCBfcmVmMTtcbiAgICAgIGRpdmlkZXIgPSBkYXRhLnNlYXJjaChSZWdFeHAoXCJcIiArIEJ5dGUuTEYgKyBCeXRlLkxGKSk7XG4gICAgICBoZWFkZXJMaW5lcyA9IGRhdGEuc3Vic3RyaW5nKDAsIGRpdmlkZXIpLnNwbGl0KEJ5dGUuTEYpO1xuICAgICAgY29tbWFuZCA9IGhlYWRlckxpbmVzLnNoaWZ0KCk7XG4gICAgICBoZWFkZXJzID0ge307XG4gICAgICB0cmltID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgfTtcbiAgICAgIF9yZWYgPSBoZWFkZXJMaW5lcy5yZXZlcnNlKCk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbGluZSA9IF9yZWZbX2ldO1xuICAgICAgICBpZHggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICAgICAgaGVhZGVyc1t0cmltKGxpbmUuc3Vic3RyaW5nKDAsIGlkeCkpXSA9IHRyaW0obGluZS5zdWJzdHJpbmcoaWR4ICsgMSkpO1xuICAgICAgfVxuICAgICAgYm9keSA9ICcnO1xuICAgICAgc3RhcnQgPSBkaXZpZGVyICsgMjtcbiAgICAgIGlmIChoZWFkZXJzWydjb250ZW50LWxlbmd0aCddKSB7XG4gICAgICAgIGxlbiA9IHBhcnNlSW50KGhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10pO1xuICAgICAgICBib2R5ID0gKCcnICsgZGF0YSkuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIGxlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaHIgPSBudWxsO1xuICAgICAgICBmb3IgKGkgPSBfaiA9IHN0YXJ0LCBfcmVmMSA9IGRhdGEubGVuZ3RoOyBzdGFydCA8PSBfcmVmMSA/IF9qIDwgX3JlZjEgOiBfaiA+IF9yZWYxOyBpID0gc3RhcnQgPD0gX3JlZjEgPyArK19qIDogLS1faikge1xuICAgICAgICAgIGNociA9IGRhdGEuY2hhckF0KGkpO1xuICAgICAgICAgIGlmIChjaHIgPT09IEJ5dGUuTlVMTCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJvZHkgKz0gY2hyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEZyYW1lKGNvbW1hbmQsIGhlYWRlcnMsIGJvZHkpO1xuICAgIH07XG5cbiAgICBGcmFtZS51bm1hcnNoYWxsID0gZnVuY3Rpb24oZGF0YXMpIHtcbiAgICAgIHZhciBkYXRhO1xuICAgICAgcmV0dXJuIChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgX3JlZiA9IGRhdGFzLnNwbGl0KFJlZ0V4cChcIlwiICsgQnl0ZS5OVUxMICsgQnl0ZS5MRiArIFwiKlwiKSk7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIGRhdGEgPSBfcmVmW19pXTtcbiAgICAgICAgICBpZiAoKGRhdGEgIT0gbnVsbCA/IGRhdGEubGVuZ3RoIDogdm9pZCAwKSA+IDApIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godW5tYXJzaGFsbFNpbmdsZShkYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgfTtcblxuICAgIEZyYW1lLm1hcnNoYWxsID0gZnVuY3Rpb24oY29tbWFuZCwgaGVhZGVycywgYm9keSkge1xuICAgICAgdmFyIGZyYW1lO1xuICAgICAgZnJhbWUgPSBuZXcgRnJhbWUoY29tbWFuZCwgaGVhZGVycywgYm9keSk7XG4gICAgICByZXR1cm4gZnJhbWUudG9TdHJpbmcoKSArIEJ5dGUuTlVMTDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEZyYW1lO1xuXG4gIH0pKCk7XG5cbiAgQ2xpZW50ID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3c7XG5cbiAgICBmdW5jdGlvbiBDbGllbnQod3MpIHtcbiAgICAgIHRoaXMud3MgPSB3cztcbiAgICAgIHRoaXMud3MuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5oZWFydGJlYXQgPSB7XG4gICAgICAgIG91dGdvaW5nOiAxMDAwMCxcbiAgICAgICAgaW5jb21pbmc6IDEwMDAwXG4gICAgICB9O1xuICAgICAgdGhpcy5tYXhXZWJTb2NrZXRGcmFtZVNpemUgPSAxNiAqIDEwMjQ7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBDbGllbnQucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgdmFyIF9yZWY7XG4gICAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cgIT09IG51bGwgPyAoX3JlZiA9IHdpbmRvdy5jb25zb2xlKSAhPSBudWxsID8gX3JlZi5sb2cobWVzc2FnZSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gICAgfTtcblxuICAgIG5vdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKERhdGUubm93KSB7XG4gICAgICAgIHJldHVybiBEYXRlLm5vdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkudmFsdWVPZjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5fdHJhbnNtaXQgPSBmdW5jdGlvbihjb21tYW5kLCBoZWFkZXJzLCBib2R5KSB7XG4gICAgICB2YXIgb3V0O1xuICAgICAgb3V0ID0gRnJhbWUubWFyc2hhbGwoY29tbWFuZCwgaGVhZGVycywgYm9keSk7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuZGVidWcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLmRlYnVnKFwiPj4+IFwiICsgb3V0KTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGlmIChvdXQubGVuZ3RoID4gdGhpcy5tYXhXZWJTb2NrZXRGcmFtZVNpemUpIHtcbiAgICAgICAgICB0aGlzLndzLnNlbmQob3V0LnN1YnN0cmluZygwLCB0aGlzLm1heFdlYlNvY2tldEZyYW1lU2l6ZSkpO1xuICAgICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcodGhpcy5tYXhXZWJTb2NrZXRGcmFtZVNpemUpO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5kZWJ1ZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKFwicmVtYWluaW5nID0gXCIgKyBvdXQubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMud3Muc2VuZChvdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX3NldHVwSGVhcnRiZWF0ID0gZnVuY3Rpb24oaGVhZGVycykge1xuICAgICAgdmFyIHNlcnZlckluY29taW5nLCBzZXJ2ZXJPdXRnb2luZywgdHRsLCB2LCBfcmVmLCBfcmVmMTtcbiAgICAgIGlmICgoX3JlZiA9IGhlYWRlcnMudmVyc2lvbikgIT09IFN0b21wLlZFUlNJT05TLlYxXzEgJiYgX3JlZiAhPT0gU3RvbXAuVkVSU0lPTlMuVjFfMikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBfcmVmMSA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmMSwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZWYxID0gaGVhZGVyc1snaGVhcnQtYmVhdCddLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmMS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgIHYgPSBfcmVmMVtfaV07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChwYXJzZUludCh2KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKSwgc2VydmVyT3V0Z29pbmcgPSBfcmVmMVswXSwgc2VydmVySW5jb21pbmcgPSBfcmVmMVsxXTtcbiAgICAgIGlmICghKHRoaXMuaGVhcnRiZWF0Lm91dGdvaW5nID09PSAwIHx8IHNlcnZlckluY29taW5nID09PSAwKSkge1xuICAgICAgICB0dGwgPSBNYXRoLm1heCh0aGlzLmhlYXJ0YmVhdC5vdXRnb2luZywgc2VydmVySW5jb21pbmcpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuZGVidWcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHRoaXMuZGVidWcoXCJzZW5kIFBJTkcgZXZlcnkgXCIgKyB0dGwgKyBcIm1zXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGluZ2VyID0gU3RvbXAuc2V0SW50ZXJ2YWwodHRsLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfdGhpcy53cy5zZW5kKEJ5dGUuTEYpO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBfdGhpcy5kZWJ1ZyA9PT0gXCJmdW5jdGlvblwiID8gX3RoaXMuZGVidWcoXCI+Pj4gUElOR1wiKSA6IHZvaWQgMDtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSk7XG4gICAgICB9XG4gICAgICBpZiAoISh0aGlzLmhlYXJ0YmVhdC5pbmNvbWluZyA9PT0gMCB8fCBzZXJ2ZXJPdXRnb2luZyA9PT0gMCkpIHtcbiAgICAgICAgdHRsID0gTWF0aC5tYXgodGhpcy5oZWFydGJlYXQuaW5jb21pbmcsIHNlcnZlck91dGdvaW5nKTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmRlYnVnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0aGlzLmRlYnVnKFwiY2hlY2sgUE9ORyBldmVyeSBcIiArIHR0bCArIFwibXNcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucG9uZ2VyID0gU3RvbXAuc2V0SW50ZXJ2YWwodHRsLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZGVsdGE7XG4gICAgICAgICAgICBkZWx0YSA9IG5vdygpIC0gX3RoaXMuc2VydmVyQWN0aXZpdHk7XG4gICAgICAgICAgICBpZiAoZGVsdGEgPiB0dGwgKiAyKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMuZGVidWcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIF90aGlzLmRlYnVnKFwiZGlkIG5vdCByZWNlaXZlIHNlcnZlciBhY3Rpdml0eSBmb3IgdGhlIGxhc3QgXCIgKyBkZWx0YSArIFwibXNcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLndzLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLl9wYXJzZUNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBjb25uZWN0Q2FsbGJhY2ssIGVycm9yQ2FsbGJhY2ssIGhlYWRlcnM7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIGhlYWRlcnMgPSB7fTtcbiAgICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGhlYWRlcnMgPSBhcmdzWzBdLCBjb25uZWN0Q2FsbGJhY2sgPSBhcmdzWzFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgaWYgKGFyZ3NbMV0gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICAgICAgaGVhZGVycyA9IGFyZ3NbMF0sIGNvbm5lY3RDYWxsYmFjayA9IGFyZ3NbMV0sIGVycm9yQ2FsbGJhY2sgPSBhcmdzWzJdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkZXJzLmxvZ2luID0gYXJnc1swXSwgaGVhZGVycy5wYXNzY29kZSA9IGFyZ3NbMV0sIGNvbm5lY3RDYWxsYmFjayA9IGFyZ3NbMl07XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgaGVhZGVycy5sb2dpbiA9IGFyZ3NbMF0sIGhlYWRlcnMucGFzc2NvZGUgPSBhcmdzWzFdLCBjb25uZWN0Q2FsbGJhY2sgPSBhcmdzWzJdLCBlcnJvckNhbGxiYWNrID0gYXJnc1szXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBoZWFkZXJzLmxvZ2luID0gYXJnc1swXSwgaGVhZGVycy5wYXNzY29kZSA9IGFyZ3NbMV0sIGNvbm5lY3RDYWxsYmFjayA9IGFyZ3NbMl0sIGVycm9yQ2FsbGJhY2sgPSBhcmdzWzNdLCBoZWFkZXJzLmhvc3QgPSBhcmdzWzRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtoZWFkZXJzLCBjb25uZWN0Q2FsbGJhY2ssIGVycm9yQ2FsbGJhY2tdO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBlcnJvckNhbGxiYWNrLCBoZWFkZXJzLCBvdXQ7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIG91dCA9IHRoaXMuX3BhcnNlQ29ubmVjdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIGhlYWRlcnMgPSBvdXRbMF0sIHRoaXMuY29ubmVjdENhbGxiYWNrID0gb3V0WzFdLCBlcnJvckNhbGxiYWNrID0gb3V0WzJdO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmRlYnVnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyhcIk9wZW5pbmcgV2ViIFNvY2tldC4uLlwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMud3Mub25tZXNzYWdlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICB2YXIgYXJyLCBjLCBjbGllbnQsIGRhdGEsIGZyYW1lLCBtZXNzYWdlSUQsIG9ucmVjZWl2ZSwgc3Vic2NyaXB0aW9uLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgZGF0YSA9IHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgZXZ0LmRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA/IChhcnIgPSBuZXcgVWludDhBcnJheShldnQuZGF0YSksIHR5cGVvZiBfdGhpcy5kZWJ1ZyA9PT0gXCJmdW5jdGlvblwiID8gX3RoaXMuZGVidWcoXCItLS0gZ290IGRhdGEgbGVuZ3RoOiBcIiArIGFyci5sZW5ndGgpIDogdm9pZCAwLCAoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGFyci5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICBjID0gYXJyW19pXTtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICB9KSgpKS5qb2luKCcnKSkgOiBldnQuZGF0YTtcbiAgICAgICAgICBfdGhpcy5zZXJ2ZXJBY3Rpdml0eSA9IG5vdygpO1xuICAgICAgICAgIGlmIChkYXRhID09PSBCeXRlLkxGKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIF90aGlzLmRlYnVnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgX3RoaXMuZGVidWcoXCI8PDwgUE9OR1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBfdGhpcy5kZWJ1ZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBfdGhpcy5kZWJ1ZyhcIjw8PCBcIiArIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcmVmID0gRnJhbWUudW5tYXJzaGFsbChkYXRhKTtcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgZnJhbWUgPSBfcmVmW19pXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZnJhbWUuY29tbWFuZCkge1xuICAgICAgICAgICAgICBjYXNlIFwiQ09OTkVDVEVEXCI6XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfdGhpcy5kZWJ1ZyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5kZWJ1ZyhcImNvbm5lY3RlZCB0byBzZXJ2ZXIgXCIgKyBmcmFtZS5oZWFkZXJzLnNlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3NldHVwSGVhcnRiZWF0KGZyYW1lLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godHlwZW9mIF90aGlzLmNvbm5lY3RDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gX3RoaXMuY29ubmVjdENhbGxiYWNrKGZyYW1lKSA6IHZvaWQgMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJNRVNTQUdFXCI6XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uID0gZnJhbWUuaGVhZGVycy5zdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgb25yZWNlaXZlID0gX3RoaXMuc3Vic2NyaXB0aW9uc1tzdWJzY3JpcHRpb25dIHx8IF90aGlzLm9ucmVjZWl2ZTtcbiAgICAgICAgICAgICAgICBpZiAob25yZWNlaXZlKSB7XG4gICAgICAgICAgICAgICAgICBjbGllbnQgPSBfdGhpcztcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJRCA9IGZyYW1lLmhlYWRlcnNbXCJtZXNzYWdlLWlkXCJdO1xuICAgICAgICAgICAgICAgICAgZnJhbWUuYWNrID0gZnVuY3Rpb24oaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGVycyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaGVhZGVycyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQuYWNrKG1lc3NhZ2VJRCwgc3Vic2NyaXB0aW9uLCBoZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICBmcmFtZS5uYWNrID0gZnVuY3Rpb24oaGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGVhZGVycyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaGVhZGVycyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjbGllbnQubmFjayhtZXNzYWdlSUQsIHN1YnNjcmlwdGlvbiwgaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChvbnJlY2VpdmUoZnJhbWUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0eXBlb2YgX3RoaXMuZGVidWcgPT09IFwiZnVuY3Rpb25cIiA/IF90aGlzLmRlYnVnKFwiVW5oYW5kbGVkIHJlY2VpdmVkIE1FU1NBR0U6IFwiICsgZnJhbWUpIDogdm9pZCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgXCJSRUNFSVBUXCI6XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0eXBlb2YgX3RoaXMub25yZWNlaXB0ID09PSBcImZ1bmN0aW9uXCIgPyBfdGhpcy5vbnJlY2VpcHQoZnJhbWUpIDogdm9pZCAwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSBcIkVSUk9SXCI6XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0eXBlb2YgZXJyb3JDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gZXJyb3JDYWxsYmFjayhmcmFtZSkgOiB2b2lkIDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godHlwZW9mIF90aGlzLmRlYnVnID09PSBcImZ1bmN0aW9uXCIgPyBfdGhpcy5kZWJ1ZyhcIlVuaGFuZGxlZCBmcmFtZTogXCIgKyBmcmFtZSkgOiB2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHRoaXMud3Mub25jbG9zZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIG1zZztcbiAgICAgICAgICBtc2cgPSBcIldob29wcyEgTG9zdCBjb25uZWN0aW9uIHRvIFwiICsgX3RoaXMud3MudXJsO1xuICAgICAgICAgIGlmICh0eXBlb2YgX3RoaXMuZGVidWcgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgX3RoaXMuZGVidWcobXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXMuX2NsZWFuVXAoKTtcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIGVycm9yQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIiA/IGVycm9yQ2FsbGJhY2sobXNnKSA6IHZvaWQgMDtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgcmV0dXJuIHRoaXMud3Mub25vcGVuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIF90aGlzLmRlYnVnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIF90aGlzLmRlYnVnKCdXZWIgU29ja2V0IE9wZW5lZC4uLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoZWFkZXJzW1wiYWNjZXB0LXZlcnNpb25cIl0gPSBTdG9tcC5WRVJTSU9OUy5zdXBwb3J0ZWRWZXJzaW9ucygpO1xuICAgICAgICAgIGhlYWRlcnNbXCJoZWFydC1iZWF0XCJdID0gW190aGlzLmhlYXJ0YmVhdC5vdXRnb2luZywgX3RoaXMuaGVhcnRiZWF0LmluY29taW5nXS5qb2luKCcsJyk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl90cmFuc21pdChcIkNPTk5FQ1RcIiwgaGVhZGVycyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oZGlzY29ubmVjdENhbGxiYWNrLCBoZWFkZXJzKSB7XG4gICAgICBpZiAoaGVhZGVycyA9PSBudWxsKSB7XG4gICAgICAgIGhlYWRlcnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3RyYW5zbWl0KFwiRElTQ09OTkVDVFwiLCBoZWFkZXJzKTtcbiAgICAgIHRoaXMud3Mub25jbG9zZSA9IG51bGw7XG4gICAgICB0aGlzLndzLmNsb3NlKCk7XG4gICAgICB0aGlzLl9jbGVhblVwKCk7XG4gICAgICByZXR1cm4gdHlwZW9mIGRpc2Nvbm5lY3RDYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gZGlzY29ubmVjdENhbGxiYWNrKCkgOiB2b2lkIDA7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuX2NsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5waW5nZXIpIHtcbiAgICAgICAgU3RvbXAuY2xlYXJJbnRlcnZhbCh0aGlzLnBpbmdlcik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wb25nZXIpIHtcbiAgICAgICAgcmV0dXJuIFN0b21wLmNsZWFySW50ZXJ2YWwodGhpcy5wb25nZXIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkZXN0aW5hdGlvbiwgaGVhZGVycywgYm9keSkge1xuICAgICAgaWYgKGhlYWRlcnMgPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzID0ge307XG4gICAgICB9XG4gICAgICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSAnJztcbiAgICAgIH1cbiAgICAgIGhlYWRlcnMuZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgICAgIHJldHVybiB0aGlzLl90cmFuc21pdChcIlNFTkRcIiwgaGVhZGVycywgYm9keSk7XG4gICAgfTtcblxuICAgIENsaWVudC5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oZGVzdGluYXRpb24sIGNhbGxiYWNrLCBoZWFkZXJzKSB7XG4gICAgICB2YXIgY2xpZW50O1xuICAgICAgaWYgKGhlYWRlcnMgPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzID0ge307XG4gICAgICB9XG4gICAgICBpZiAoIWhlYWRlcnMuaWQpIHtcbiAgICAgICAgaGVhZGVycy5pZCA9IFwic3ViLVwiICsgdGhpcy5jb3VudGVyKys7XG4gICAgICB9XG4gICAgICBoZWFkZXJzLmRlc3RpbmF0aW9uID0gZGVzdGluYXRpb247XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnNbaGVhZGVycy5pZF0gPSBjYWxsYmFjaztcbiAgICAgIHRoaXMuX3RyYW5zbWl0KFwiU1VCU0NSSUJFXCIsIGhlYWRlcnMpO1xuICAgICAgY2xpZW50ID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBoZWFkZXJzLmlkLFxuICAgICAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGNsaWVudC51bnN1YnNjcmliZShoZWFkZXJzLmlkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25zW2lkXTtcbiAgICAgIHJldHVybiB0aGlzLl90cmFuc21pdChcIlVOU1VCU0NSSUJFXCIsIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5iZWdpbiA9IGZ1bmN0aW9uKHRyYW5zYWN0aW9uKSB7XG4gICAgICB2YXIgY2xpZW50LCB0eGlkO1xuICAgICAgdHhpZCA9IHRyYW5zYWN0aW9uIHx8IFwidHgtXCIgKyB0aGlzLmNvdW50ZXIrKztcbiAgICAgIHRoaXMuX3RyYW5zbWl0KFwiQkVHSU5cIiwge1xuICAgICAgICB0cmFuc2FjdGlvbjogdHhpZFxuICAgICAgfSk7XG4gICAgICBjbGllbnQgPSB0aGlzO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IHR4aWQsXG4gICAgICAgIGNvbW1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGNsaWVudC5jb21taXQodHhpZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGFib3J0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gY2xpZW50LmFib3J0KHR4aWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uKHRyYW5zYWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdHJhbnNtaXQoXCJDT01NSVRcIiwge1xuICAgICAgICB0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb25cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24odHJhbnNhY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl90cmFuc21pdChcIkFCT1JUXCIsIHtcbiAgICAgICAgdHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgQ2xpZW50LnByb3RvdHlwZS5hY2sgPSBmdW5jdGlvbihtZXNzYWdlSUQsIHN1YnNjcmlwdGlvbiwgaGVhZGVycykge1xuICAgICAgaWYgKGhlYWRlcnMgPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzID0ge307XG4gICAgICB9XG4gICAgICBoZWFkZXJzW1wibWVzc2FnZS1pZFwiXSA9IG1lc3NhZ2VJRDtcbiAgICAgIGhlYWRlcnMuc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zbWl0KFwiQUNLXCIsIGhlYWRlcnMpO1xuICAgIH07XG5cbiAgICBDbGllbnQucHJvdG90eXBlLm5hY2sgPSBmdW5jdGlvbihtZXNzYWdlSUQsIHN1YnNjcmlwdGlvbiwgaGVhZGVycykge1xuICAgICAgaWYgKGhlYWRlcnMgPT0gbnVsbCkge1xuICAgICAgICBoZWFkZXJzID0ge307XG4gICAgICB9XG4gICAgICBoZWFkZXJzW1wibWVzc2FnZS1pZFwiXSA9IG1lc3NhZ2VJRDtcbiAgICAgIGhlYWRlcnMuc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zbWl0KFwiTkFDS1wiLCBoZWFkZXJzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIENsaWVudDtcblxuICB9KSgpO1xuXG4gIFN0b21wID0ge1xuICAgIFZFUlNJT05TOiB7XG4gICAgICBWMV8wOiAnMS4wJyxcbiAgICAgIFYxXzE6ICcxLjEnLFxuICAgICAgVjFfMjogJzEuMicsXG4gICAgICBzdXBwb3J0ZWRWZXJzaW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnMS4xLDEuMCc7XG4gICAgICB9XG4gICAgfSxcbiAgICBjbGllbnQ6IGZ1bmN0aW9uKHVybCwgcHJvdG9jb2xzKSB7XG4gICAgICB2YXIga2xhc3MsIHdzO1xuICAgICAgaWYgKHByb3RvY29scyA9PSBudWxsKSB7XG4gICAgICAgIHByb3RvY29scyA9IFsndjEwLnN0b21wJywgJ3YxMS5zdG9tcCddO1xuICAgICAgfVxuICAgICAga2xhc3MgPSBTdG9tcC5XZWJTb2NrZXRDbGFzcyB8fCBXZWJTb2NrZXQ7XG4gICAgICB3cyA9IG5ldyBrbGFzcyh1cmwsIHByb3RvY29scyk7XG4gICAgICByZXR1cm4gbmV3IENsaWVudCh3cyk7XG4gICAgfSxcbiAgICBvdmVyOiBmdW5jdGlvbih3cykge1xuICAgICAgcmV0dXJuIG5ldyBDbGllbnQod3MpO1xuICAgIH0sXG4gICAgRnJhbWU6IEZyYW1lXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiICYmIGV4cG9ydHMgIT09IG51bGwpIHtcbiAgICBleHBvcnRzLlN0b21wID0gU3RvbXA7XG4gIH1cblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cgIT09IG51bGwpIHtcbiAgICBTdG9tcC5zZXRJbnRlcnZhbCA9IGZ1bmN0aW9uKGludGVydmFsLCBmKSB7XG4gICAgICByZXR1cm4gd2luZG93LnNldEludGVydmFsKGYsIGludGVydmFsKTtcbiAgICB9O1xuICAgIFN0b21wLmNsZWFySW50ZXJ2YWwgPSBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5jbGVhckludGVydmFsKGlkKTtcbiAgICB9O1xuICAgIHdpbmRvdy5TdG9tcCA9IFN0b21wO1xuICB9IGVsc2UgaWYgKCFleHBvcnRzKSB7XG4gICAgc2VsZi5TdG9tcCA9IFN0b21wO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL3N0b21wanMvbGliL3N0b21wLmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL3N0b21wanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIF9nbG9iYWwgPSAoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSgpO1xudmFyIG5hdGl2ZVdlYlNvY2tldCA9IF9nbG9iYWwuV2ViU29ja2V0IHx8IF9nbG9iYWwuTW96V2ViU29ja2V0O1xudmFyIHdlYnNvY2tldF92ZXJzaW9uID0gcmVxdWlyZSgnLi92ZXJzaW9uJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYSBXM0MgV2ViU29ja2V0IGNsYXNzIHdpdGgganVzdCBvbmUgb3IgdHdvIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gVzNDV2ViU29ja2V0KHVyaSwgcHJvdG9jb2xzKSB7XG5cdHZhciBuYXRpdmVfaW5zdGFuY2U7XG5cblx0aWYgKHByb3RvY29scykge1xuXHRcdG5hdGl2ZV9pbnN0YW5jZSA9IG5ldyBuYXRpdmVXZWJTb2NrZXQodXJpLCBwcm90b2NvbHMpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdG5hdGl2ZV9pbnN0YW5jZSA9IG5ldyBuYXRpdmVXZWJTb2NrZXQodXJpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAnbmF0aXZlX2luc3RhbmNlJyBpcyBhbiBpbnN0YW5jZSBvZiBuYXRpdmVXZWJTb2NrZXQgKHRoZSBicm93c2VyJ3MgV2ViU29ja2V0XG5cdCAqIGNsYXNzKS4gU2luY2UgaXQgaXMgYW4gT2JqZWN0IGl0IHdpbGwgYmUgcmV0dXJuZWQgYXMgaXQgaXMgd2hlbiBjcmVhdGluZyBhblxuXHQgKiBpbnN0YW5jZSBvZiBXM0NXZWJTb2NrZXQgdmlhICduZXcgVzNDV2ViU29ja2V0KCknLlxuXHQgKlxuXHQgKiBFQ01BU2NyaXB0IDU6IGh0dHA6Ly9iY2xhcnkuY29tLzIwMDQvMTEvMDcvI2EtMTMuMi4yXG5cdCAqL1xuXHRyZXR1cm4gbmF0aXZlX2luc3RhbmNlO1xufVxuXG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgICd3M2N3ZWJzb2NrZXQnIDogbmF0aXZlV2ViU29ja2V0ID8gVzNDV2ViU29ja2V0IDogbnVsbCxcbiAgICAndmVyc2lvbicgICAgICA6IHdlYnNvY2tldF92ZXJzaW9uXG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy93ZWJzb2NrZXQvbGliL2Jyb3dzZXIuanNcIixcIi8uLi9ub2RlX21vZHVsZXMvd2Vic29ja2V0L2xpYlwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbjtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvd2Vic29ja2V0L2xpYi92ZXJzaW9uLmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL3dlYnNvY2tldC9saWJcIikiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiX2FyZ3NcIjogW1xuICAgIFtcbiAgICAgIFwid2Vic29ja2V0QGxhdGVzdFwiLFxuICAgICAgXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL25vZGVfbW9kdWxlcy9zdG9tcGpzXCJcbiAgICBdXG4gIF0sXG4gIFwiX2Zyb21cIjogXCJ3ZWJzb2NrZXRAbGF0ZXN0XCIsXG4gIFwiX2lkXCI6IFwid2Vic29ja2V0QDEuMC4yM1wiLFxuICBcIl9pbkNhY2hlXCI6IHRydWUsXG4gIFwiX2luc3RhbGxhYmxlXCI6IHRydWUsXG4gIFwiX2xvY2F0aW9uXCI6IFwiL3dlYnNvY2tldFwiLFxuICBcIl9ub2RlVmVyc2lvblwiOiBcIjAuMTAuNDVcIixcbiAgXCJfbnBtT3BlcmF0aW9uYWxJbnRlcm5hbFwiOiB7XG4gICAgXCJob3N0XCI6IFwicGFja2FnZXMtMTYtZWFzdC5pbnRlcm5hbC5ucG1qcy5jb21cIixcbiAgICBcInRtcFwiOiBcInRtcC93ZWJzb2NrZXQtMS4wLjIzLnRnel8xNDYzNjI1NzkzMDA1XzAuNDUzMjMxMDM1NDk4OTAyMlwiXG4gIH0sXG4gIFwiX25wbVVzZXJcIjoge1xuICAgIFwiZW1haWxcIjogXCJicmlhbkB3b3JsaXplLmNvbVwiLFxuICAgIFwibmFtZVwiOiBcInRoZXR1cnRsZTMyXCJcbiAgfSxcbiAgXCJfbnBtVmVyc2lvblwiOiBcIjIuMTUuMVwiLFxuICBcIl9waGFudG9tQ2hpbGRyZW5cIjoge30sXG4gIFwiX3JlcXVlc3RlZFwiOiB7XG4gICAgXCJuYW1lXCI6IFwid2Vic29ja2V0XCIsXG4gICAgXCJyYXdcIjogXCJ3ZWJzb2NrZXRAbGF0ZXN0XCIsXG4gICAgXCJyYXdTcGVjXCI6IFwibGF0ZXN0XCIsXG4gICAgXCJzY29wZVwiOiBudWxsLFxuICAgIFwic3BlY1wiOiBcImxhdGVzdFwiLFxuICAgIFwidHlwZVwiOiBcInRhZ1wiXG4gIH0sXG4gIFwiX3JlcXVpcmVkQnlcIjogW1xuICAgIFwiL3N0b21wanNcIlxuICBdLFxuICBcIl9yZXNvbHZlZFwiOiBcImh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnL3dlYnNvY2tldC8tL3dlYnNvY2tldC0xLjAuMjMudGd6XCIsXG4gIFwiX3NoYXN1bVwiOiBcIjIwZGU4ZWM0YTcxMjZiMDk0NjU1NzhjZDVkYmIyOWE5YzI5NmFhYzZcIixcbiAgXCJfc2hyaW5rd3JhcFwiOiBudWxsLFxuICBcIl9zcGVjXCI6IFwid2Vic29ja2V0QGxhdGVzdFwiLFxuICBcIl93aGVyZVwiOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vbm9kZV9tb2R1bGVzL3N0b21wanNcIixcbiAgXCJhdXRob3JcIjoge1xuICAgIFwiZW1haWxcIjogXCJicmlhbkB3b3JsaXplLmNvbVwiLFxuICAgIFwibmFtZVwiOiBcIkJyaWFuIE1jS2VsdmV5XCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL3d3dy53b3JsaXplLmNvbS9cIlxuICB9LFxuICBcImJyb3dzZXJcIjogXCJsaWIvYnJvd3Nlci5qc1wiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RoZXR1cnRsZTMyL1dlYlNvY2tldC1Ob2RlL2lzc3Vlc1wiXG4gIH0sXG4gIFwiY29uZmlnXCI6IHtcbiAgICBcInZlcmJvc2VcIjogZmFsc2VcbiAgfSxcbiAgXCJjb250cmlidXRvcnNcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIknDsWFraSBCYXogQ2FzdGlsbG9cIixcbiAgICAgIFwiZW1haWxcIjogXCJpYmNAYWxpYXgubmV0XCIsXG4gICAgICBcInVybFwiOiBcImh0dHA6Ly9kZXYuc2lwZG9jLm5ldFwiXG4gICAgfVxuICBdLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJkZWJ1Z1wiOiBcIl4yLjIuMFwiLFxuICAgIFwibmFuXCI6IFwiXjIuMy4zXCIsXG4gICAgXCJ0eXBlZGFycmF5LXRvLWJ1ZmZlclwiOiBcIl4zLjEuMlwiLFxuICAgIFwieWFldGlcIjogXCJeMC4wLjRcIlxuICB9LFxuICBcImRlc2NyaXB0aW9uXCI6IFwiV2Vic29ja2V0IENsaWVudCAmIFNlcnZlciBMaWJyYXJ5IGltcGxlbWVudGluZyB0aGUgV2ViU29ja2V0IHByb3RvY29sIGFzIHNwZWNpZmllZCBpbiBSRkMgNjQ1NS5cIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYnVmZmVyLWVxdWFsXCI6IFwiXjAuMC4xXCIsXG4gICAgXCJmYXVjZXRcIjogXCJeMC4wLjFcIixcbiAgICBcImd1bHBcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL2d1bHBqcy9ndWxwLmdpdCM0LjBcIixcbiAgICBcImd1bHAtanNoaW50XCI6IFwiXjEuMTEuMlwiLFxuICAgIFwianNoaW50LXN0eWxpc2hcIjogXCJeMS4wLjJcIixcbiAgICBcInRhcGVcIjogXCJeNC4wLjFcIlxuICB9LFxuICBcImRpcmVjdG9yaWVzXCI6IHtcbiAgICBcImxpYlwiOiBcIi4vbGliXCJcbiAgfSxcbiAgXCJkaXN0XCI6IHtcbiAgICBcInNoYXN1bVwiOiBcIjIwZGU4ZWM0YTcxMjZiMDk0NjU1NzhjZDVkYmIyOWE5YzI5NmFhYzZcIixcbiAgICBcInRhcmJhbGxcIjogXCJodHRwczovL3JlZ2lzdHJ5Lm5wbWpzLm9yZy93ZWJzb2NrZXQvLS93ZWJzb2NrZXQtMS4wLjIzLnRnelwiXG4gIH0sXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiPj0wLjguMFwiXG4gIH0sXG4gIFwiZ2l0SGVhZFwiOiBcImJhMmZhN2U5Njc2YzQ1NmJjZmIxMmFkMTYwNjU1MzE5YWY2NmZhZWRcIixcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aGV0dXJ0bGUzMi9XZWJTb2NrZXQtTm9kZVwiLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcIlJGQy02NDU1XCIsXG4gICAgXCJjbGllbnRcIixcbiAgICBcImNvbWV0XCIsXG4gICAgXCJuZXR3b3JraW5nXCIsXG4gICAgXCJwdXNoXCIsXG4gICAgXCJyZWFsdGltZVwiLFxuICAgIFwic2VydmVyXCIsXG4gICAgXCJzb2NrZXRcIixcbiAgICBcIndlYnNvY2tldFwiLFxuICAgIFwid2Vic29ja2V0c1wiXG4gIF0sXG4gIFwibGljZW5zZVwiOiBcIkFwYWNoZS0yLjBcIixcbiAgXCJtYWluXCI6IFwiaW5kZXhcIixcbiAgXCJtYWludGFpbmVyc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwidGhldHVydGxlMzJcIixcbiAgICAgIFwiZW1haWxcIjogXCJicmlhbkB3b3JsaXplLmNvbVwiXG4gICAgfVxuICBdLFxuICBcIm5hbWVcIjogXCJ3ZWJzb2NrZXRcIixcbiAgXCJvcHRpb25hbERlcGVuZGVuY2llc1wiOiB7fSxcbiAgXCJyZWFkbWVcIjogXCJFUlJPUjogTm8gUkVBRE1FIGRhdGEgZm91bmQhXCIsXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3RoZXR1cnRsZTMyL1dlYlNvY2tldC1Ob2RlLmdpdFwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJndWxwXCI6IFwiZ3VscFwiLFxuICAgIFwiaW5zdGFsbFwiOiBcIihub2RlLWd5cCByZWJ1aWxkIDI+IGJ1aWxkZXJyb3IubG9nKSB8fCAoZXhpdCAwKVwiLFxuICAgIFwidGVzdFwiOiBcImZhdWNldCB0ZXN0L3VuaXRcIlxuICB9LFxuICBcInZlcnNpb25cIjogXCIxLjAuMjNcIlxufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbmZpZztcblxuY29uZmlnID0ge1xuICBSQVRFX0VYVF9VUkw6IFwiaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwva2htbGFsa2NqbWdscGdka21rbW1namNhamFoa29pZ2ovcmV2aWV3c1wiLFxuICBDSFJPTUVfRVhUX0lEOiBcImNraWFoYmNtbG1rcGZpaWplY2JwZmxmYWhvaW1rbGtlXCIsXG4gIEFQSV9VUkw6IFwiaHR0cDovL2FwaS5nZXRwaWN0dXJlYm9vay5jb21cIixcbiAgUkFCQklUTVFfSE9TVDogJ3Byb3hpZXMtcmFiYml0bXEubnViZWxhLmNvJyxcbiAgUkFCQklUTVFfVVNFUk5BTUU6ICdwcm94eS1jb25zdW1lcicsXG4gIFJBQkJJVE1RX1BBU1NXRDogJ14wMzxEY0UvKDI/JUBxMGknXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbmZpZztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb25maWcuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29uc3RhbnRzO1xuXG5jb25zdGFudHMgPSB7XG4gIEFKQVhfVElNRU9VVF9NUzogNTAwMFxufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtL2NvbnN0YW50cy5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIga2V5cztcblxua2V5cyA9IHtcbiAgU0VSVklDRV9UT0tFTjogXCJzZXJ2aWNlX3Rva2VuXCIsXG4gIEhBU19TSE9XTl9HVUlERTogXCJoYXNfc2hvd25fZ3VpZGVcIixcbiAgQ09NUFVURVJfQ09ERTogXCJjb21wdXRlcl9jb2RlXCIsXG4gIElTX0FDVElWQVRFRDogXCJpc19hY3RpdmF0ZWRcIixcbiAgSU5TVEFMTF9FUE9DSDogXCJpbnN0YWxsX2Vwb2NoXCIsXG4gIEdFTkVSQVRFRF9UUklFUzogXCJnZW5lcmF0ZWRfdHJpZXNcIixcbiAgSEFTX1JBVEVEX0VYVDogXCJoYXNfcmF0ZWRfZXh0XCIsXG4gIENBQ0hFRF9QQVlQQUxfUEFZTUVOVF9VUkw6IFwicGF5cGFsX3BheW1lbnRfdXJsXCIsXG4gIENBQ0hFRF9TQUFTWV9QQVlNRU5UX1VSTDogXCJzYWFzeV9wYXltZW50X3VybFwiLFxuICBDQUNIRURfUFJJQ0lORzogXCJxdW90YXRpb25fcHJpY2luZ1wiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bS9rZXlzLmpzXCIsXCIvZW51bVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBKT0JfUVVFVUVfU1VCU0NSSVBUSU9OLCBSQUJCSVRNUV9DTElFTlQsIFJBQkJJVE1RX0hPU1RfVVJJLCBTdG9tcCwgY29uZmlnLCBjcmVhdGVJZnJhbWUsIGN1cmwsIGljZWQsIG1haW4sIG9uSWZyYW1lTXNnUmVjZWl2ZWQsIG9uTmV3Sm9iLCBvblJhYmJpdE1RY29ubmVjdGVkLCBwdXJnZUZyYW1lT3B0aW9ucywgdXRpbCwgX19pY2VkX2ssIF9faWNlZF9rX25vb3AsXG4gIF9fc2xpY2UgPSBbXS5zbGljZTtcblxuaWNlZCA9IHtcbiAgRGVmZXJyYWxzOiAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX0NsYXNzKF9hcmcpIHtcbiAgICAgIHRoaXMuY29udGludWF0aW9uID0gX2FyZztcbiAgICAgIHRoaXMuY291bnQgPSAxO1xuICAgICAgdGhpcy5yZXQgPSBudWxsO1xuICAgIH1cblxuICAgIF9DbGFzcy5wcm90b3R5cGUuX2Z1bGZpbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghLS10aGlzLmNvdW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRpbnVhdGlvbih0aGlzLnJldCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF9DbGFzcy5wcm90b3R5cGUuZGVmZXIgPSBmdW5jdGlvbihkZWZlcl9wYXJhbXMpIHtcbiAgICAgICsrdGhpcy5jb3VudDtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBpbm5lcl9wYXJhbXMsIF9yZWY7XG4gICAgICAgICAgaW5uZXJfcGFyYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgICBpZiAoZGVmZXJfcGFyYW1zICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmICgoX3JlZiA9IGRlZmVyX3BhcmFtcy5hc3NpZ25fZm4pICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgX3JlZi5hcHBseShudWxsLCBpbm5lcl9wYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3RoaXMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gX0NsYXNzO1xuXG4gIH0pKCksXG4gIGZpbmREZWZlcnJhbDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG4gIHRyYW1wb2xpbmU6IGZ1bmN0aW9uKF9mbikge1xuICAgIHJldHVybiBfZm4oKTtcbiAgfVxufTtcbl9faWNlZF9rID0gX19pY2VkX2tfbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cblN0b21wID0gcmVxdWlyZSgnc3RvbXBqcycpO1xuXG5jb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG51dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cblJBQkJJVE1RX0hPU1RfVVJJID0gXCJ3czovL1wiICsgY29uZmlnLlJBQkJJVE1RX0hPU1QgKyBcIjoxNTY3NC93c1wiO1xuXG5SQUJCSVRNUV9DTElFTlQgPSBTdG9tcC5jbGllbnQoUkFCQklUTVFfSE9TVF9VUkkpO1xuXG5KT0JfUVVFVUVfU1VCU0NSSVBUSU9OID0gbnVsbDtcblxuY3JlYXRlSWZyYW1lID0gZnVuY3Rpb24odXJsKSB7XG4gIHZhciBpZnJhbWUsIGlmcmFtZUlkO1xuICBpZnJhbWUgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpKTtcbiAgaWZyYW1lLnNyYyA9IHVybDtcbiAgaWZyYW1lSWQgPSB1dGlsLmdlblV1aWQoKTtcbiAgJChpZnJhbWUpLmF0dHIoXCJpZFwiLCBpZnJhbWVJZCk7XG4gIHJldHVybiBpZnJhbWVJZDtcbn07XG5cbm9uSWZyYW1lTXNnUmVjZWl2ZWQgPSBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrLCBpZnJhbWVJZCwgdGltZXIpIHtcbiAgcmV0dXJuIChmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrLCBpZnJhbWVJZCwgdGltZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVxLCBzZW5kZXIsIHJlc3BvbmRlcikge1xuICAgICAgaWYgKHNlbmRlci5pZCA9PT0gY2hyb21lLnJ1bnRpbWUuaWQpIHtcbiAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhyZXEuaHRtbCk7XG4gICAgICB9XG4gICAgICAkKFwiXFwjXCIgKyBpZnJhbWVJZCkucmVtb3ZlKCk7XG4gICAgICBpZiAodGltZXIgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KShkZWZlcnJlZENhbGxiYWNrLCBpZnJhbWVJZCwgdGltZXIpO1xufTtcblxuY3VybCA9IGZ1bmN0aW9uKHVybCwgZGVmZXJyZWRDYWxsYmFjaywgdGltZW91dFNlY3MpIHtcbiAgdmFyIGlmcmFtZUlkLCBsaXN0ZW5lciwgdGltZXI7XG4gIGlmICh0aW1lb3V0U2VjcyA9PSBudWxsKSB7XG4gICAgdGltZW91dFNlY3MgPSAzMDtcbiAgfVxuICBpZnJhbWVJZCA9IGNyZWF0ZUlmcmFtZSh1cmwpO1xuICB0aW1lciA9IG51bGw7XG4gIGxpc3RlbmVyID0gb25JZnJhbWVNc2dSZWNlaXZlZChkZWZlcnJlZENhbGxiYWNrLCBpZnJhbWVJZCwgdGltZXIpO1xuICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICByZXR1cm4gdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gIH0sIHRpbWVvdXRTZWNzICogMTAwMCk7XG59O1xuXG5wdXJnZUZyYW1lT3B0aW9ucyA9IGZ1bmN0aW9uKGluZm8pIHtcbiAgdmFyIGhlYWRlciwgaWR4LCBfaSwgX2xlbiwgX3JlZjtcbiAgX3JlZiA9IGluZm8ucmVzcG9uc2VIZWFkZXJzO1xuICBmb3IgKGlkeCA9IF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IGlkeCA9ICsrX2kpIHtcbiAgICBoZWFkZXIgPSBfcmVmW2lkeF07XG4gICAgaWYgKGhlYWRlciA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKChoZWFkZXIubmFtZSAhPSBudWxsKSAmJiBoZWFkZXIubmFtZS50b0xvd2VyQ2FzZSgpID09PSAneC1mcmFtZS1vcHRpb25zJykge1xuICAgICAgaW5mby5yZXNwb25zZUhlYWRlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgfVxuICAgIGlmICgoaGVhZGVyLm5hbWUgIT0gbnVsbCkgJiYgaGVhZGVyLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZyYW1lLW9wdGlvbnMnKSB7XG4gICAgICBpbmZvLnJlc3BvbnNlSGVhZGVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICByZXNwb25zZUhlYWRlcnM6IGluZm8ucmVzcG9uc2VIZWFkZXJzXG4gIH07XG59O1xuXG5vbk5ld0pvYiA9IGZ1bmN0aW9uKG1zZykge1xuICB2YXIgaHRtbCwgam9iRGljLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICBpZiAoSk9CX1FVRVVFX1NVQlNDUklQVElPTiAhPSBudWxsKSB7XG4gICAgSk9CX1FVRVVFX1NVQlNDUklQVElPTi51bnN1YnNjcmliZSgpO1xuICAgIEpPQl9RVUVVRV9TVUJTQ1JJUFRJT04gPSBudWxsO1xuICB9XG4gIGNocm9tZS53ZWJSZXF1ZXN0Lm9uSGVhZGVyc1JlY2VpdmVkLmFkZExpc3RlbmVyKHB1cmdlRnJhbWVPcHRpb25zLCB7XG4gICAgdXJsczogWycqOi8vKi8qJ10sXG4gICAgdHlwZXM6IFsnc3ViX2ZyYW1lJ11cbiAgfSwgWydibG9ja2luZycsICdyZXNwb25zZUhlYWRlcnMnXSk7XG4gIGpvYkRpYyA9IEpTT04ucGFyc2UobXNnLmJvZHkpO1xuICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vc3JjL3Byb3h5X2N1cmwuY29mZmVlXCJcbiAgICAgIH0pO1xuICAgICAgY3VybChqb2JEaWMudXJsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWwgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoKSxcbiAgICAgICAgbGluZW5vOiA1OFxuICAgICAgfSksIGpvYkRpYy50aW1lb3V0KTtcbiAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICB9KTtcbiAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgUkFCQklUTVFfQ0xJRU5ULnNlbmQoam9iRGljLmlkLCB7fSwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBodG1sOiBodG1sXG4gICAgICB9KSk7XG4gICAgICBjaHJvbWUud2ViUmVxdWVzdC5vbkhlYWRlcnNSZWNlaXZlZC5yZW1vdmVMaXN0ZW5lcihwdXJnZUZyYW1lT3B0aW9ucyk7XG4gICAgICByZXR1cm4gSk9CX1FVRVVFX1NVQlNDUklQVElPTiA9IFJBQkJJVE1RX0NMSUVOVC5zdWJzY3JpYmUoY29uZmlnLlJBQkJJVE1RX0pPQl9RVUVVRSwgb25OZXdKb2IsIHtcbiAgICAgICAgYWNrOiAnY2xpZW50LWluZGl2aWR1YWwnXG4gICAgICB9KTtcbiAgICB9O1xuICB9KSh0aGlzKSk7XG59O1xuXG5vblJhYmJpdE1RY29ubmVjdGVkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBKT0JfUVVFVUVfU1VCU0NSSVBUSU9OID0gUkFCQklUTVFfQ0xJRU5ULnN1YnNjcmliZShjb25maWcuUkFCQklUTVFfSk9CX1FVRVVFLCBvbk5ld0pvYik7XG59O1xuXG5tYWluID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBSQUJCSVRNUV9DTElFTlQuY29ubmVjdChjb25maWcuUkFCQklUTVFfVVNFUk5BTUUsIGNvbmZpZy5SQUJCSVRNUV9QQVNTV0QsIG9uUmFiYml0TVFjb25uZWN0ZWQpO1xufTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBtYWluKCk7XG59KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzY0MWQyYTQyLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbmZpZywgY29uc3RhbnRzLCBpY2VkLCBrZXlzLCB1dGlsLCBfX2ljZWRfaywgX19pY2VkX2tfbm9vcCxcbiAgX19zbGljZSA9IFtdLnNsaWNlO1xuXG5pY2VkID0ge1xuICBEZWZlcnJhbHM6IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfQ2xhc3MoX2FyZykge1xuICAgICAgdGhpcy5jb250aW51YXRpb24gPSBfYXJnO1xuICAgICAgdGhpcy5jb3VudCA9IDE7XG4gICAgICB0aGlzLnJldCA9IG51bGw7XG4gICAgfVxuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5fZnVsZmlsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEtLXRoaXMuY291bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGludWF0aW9uKHRoaXMucmV0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5kZWZlciA9IGZ1bmN0aW9uKGRlZmVyX3BhcmFtcykge1xuICAgICAgKyt0aGlzLmNvdW50O1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGlubmVyX3BhcmFtcywgX3JlZjtcbiAgICAgICAgICBpbm5lcl9wYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgICAgIGlmIChkZWZlcl9wYXJhbXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKChfcmVmID0gZGVmZXJfcGFyYW1zLmFzc2lnbl9mbikgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfcmVmLmFwcGx5KG51bGwsIGlubmVyX3BhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5fZnVsZmlsbCgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIHJldHVybiBfQ2xhc3M7XG5cbiAgfSkoKSxcbiAgZmluZERlZmVycmFsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcbiAgdHJhbXBvbGluZTogZnVuY3Rpb24oX2ZuKSB7XG4gICAgcmV0dXJuIF9mbigpO1xuICB9XG59O1xuX19pY2VkX2sgPSBfX2ljZWRfa19ub29wID0gZnVuY3Rpb24oKSB7fTtcblxua2V5cyA9IHJlcXVpcmUoJy4vZW51bS9rZXlzJyk7XG5cbmNvbnN0YW50cyA9IHJlcXVpcmUoJy4vZW51bS9jb25zdGFudHMnKTtcblxuY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxudXRpbCA9IHtcbiAgb3BlblBhZ2U6IGZ1bmN0aW9uKHBhZ2UsIGZvY3VzX29uX3RhYikge1xuICAgIGlmIChmb2N1c19vbl90YWIgPT0gbnVsbCkge1xuICAgICAgZm9jdXNfb25fdGFiID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICB1cmw6IHBhZ2UsXG4gICAgICBhY3RpdmU6IGZvY3VzX29uX3RhYlxuICAgIH0pO1xuICB9LFxuICBzZXRMb2NhbERhdGE6IGZ1bmN0aW9uKGRpY19rZXksIHZhbCwgZGVmZXJfY2IpIHtcbiAgICB2YXIgZGljO1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgZGljID0ge307XG4gICAgZGljW2RpY19rZXldID0gdmFsO1xuICAgIHJldHVybiBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoZGljLCAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmZXJfY2IoKTtcbiAgICB9KSk7XG4gIH0sXG4gIGdldExvY2FsRGF0YTogZnVuY3Rpb24oa2V5LCBkZWZhdWx0X3ZhbHVlLCBkZWZlcl9jYikge1xuICAgIHZhciBpdGVtcywgcG90ZW50aWFsX3JlcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vc3JjL3V0aWwuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChrZXksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXRlbXMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxOFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5IGluIGl0ZW1zKSB7XG4gICAgICAgICAgZGVmZXJfY2IoaXRlbXNba2V5XSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBvdGVudGlhbF9yZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICBpZiAocG90ZW50aWFsX3JlcyAhPSBudWxsKSB7XG4gICAgICAgICAgZGVmZXJfY2IocG90ZW50aWFsX3Jlcyk7XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgIGtleTogcG90ZW50aWFsX3Jlc1xuICAgICAgICAgIH0sIChmdW5jdGlvbigpIHt9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcl9jYihkZWZhdWx0X3ZhbHVlKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBnZW5VdWlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ4eHh4eHh4eHh4eHg0eHh4eXh4eHh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIsIHY7XG4gICAgICByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMDtcbiAgICAgIHYgPSAoYyA9PT0gXCJ4XCIgPyByIDogciAmIDB4MyB8IDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH0sXG4gIGlzTGV0dGVyOiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIi5pbmRleE9mKGMpICE9PSAtMTtcbiAgfSxcbiAgaXNOdW1iZXI6IGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gXCIwMTIzNDU2Nzg5XCIuaW5kZXhPZihjKSAhPT0gLTE7XG4gIH0sXG4gIGxldHRlclRvTnVtYmVyOiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIi5pbmRleE9mKGMpO1xuICB9LFxuICBudW1iZXJUb0xldHRlcjogZnVuY3Rpb24oaSkge1xuICAgIHJldHVybiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCJbaV07XG4gIH0sXG4gIGxhc3REaWdpdDogZnVuY3Rpb24oaSkge1xuICAgIHZhciBkaWdpdF9zdHI7XG4gICAgZGlnaXRfc3RyID0gU3RyaW5nKGkpO1xuICAgIHJldHVybiBwYXJzZUludChkaWdpdF9zdHJbZGlnaXRfc3RyLmxlbmd0aCAtIDFdKTtcbiAgfSxcbiAgbWFrZVNlcmlhbEZyb21VdWlkOiBmdW5jdGlvbih1dWlkKSB7XG4gICAgdmFyIGNoYXIsIGNoYXJfbm8sIGksIHNlcmlhbCwgdG90YWwsIF9pLCBfaiwgX2ssIF9sZW47XG4gICAgdXVpZCA9IHV1aWQudG9Mb3dlckNhc2UoKTtcbiAgICBzZXJpYWwgPSBcIlwiO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gdXVpZC5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgY2hhciA9IHV1aWRbX2ldO1xuICAgICAgaWYgKGlzTGV0dGVyKGNoYXIpKSB7XG4gICAgICAgIGNoYXJfbm8gPSBsZXR0ZXJUb051bWJlcihjaGFyKTtcbiAgICAgICAgZm9yIChpID0gX2ogPSAwOyBfaiA8PSA5OyBpID0gKytfaikge1xuICAgICAgICAgIHRvdGFsID0gY2hhcl9ubyArIGk7XG4gICAgICAgICAgaWYgKGxhc3REaWdpdCh0b3RhbCkgPT09IDEpIHtcbiAgICAgICAgICAgIHNlcmlhbCArPSBudW1iZXJUb0xldHRlcihpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc051bWJlcihjaGFyKSkge1xuICAgICAgICBjaGFyX25vID0gcGFyc2VJbnQoY2hhcik7XG4gICAgICAgIGZvciAoaSA9IF9rID0gMDsgX2sgPD0gOTsgaSA9ICsrX2spIHtcbiAgICAgICAgICB0b3RhbCA9IGNoYXJfbm8gKyBpO1xuICAgICAgICAgIGlmIChsYXN0RGlnaXQodG90YWwpID09PSAxKSB7XG4gICAgICAgICAgICBzZXJpYWwgKz0gU3RyaW5nKGkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZXJpYWw7XG4gIH0sXG4gIGlzU2VyaWFsVmFsaWQ6IGZ1bmN0aW9uKHV1aWQsIHNlcmlhbCkge1xuICAgIHZhciBpZHgsIHNlcmlhbF9jaGFyLCBzZXJpYWxfbm8sIHRvdGFsLCB1dWlkX2NoYXIsIHV1aWRfbm8sIF9pLCBfcmVmO1xuICAgIHV1aWQgPSB1dWlkLnRvTG93ZXJDYXNlKCk7XG4gICAgc2VyaWFsID0gc2VyaWFsLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHV1aWQubGVuZ3RoICE9PSBzZXJpYWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoaWR4ID0gX2kgPSAwLCBfcmVmID0gdXVpZC5sZW5ndGggLSAxOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaWR4ID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgIHV1aWRfY2hhciA9IHV1aWRbaWR4XTtcbiAgICAgIHNlcmlhbF9jaGFyID0gc2VyaWFsW2lkeF07XG4gICAgICBpZiAoaXNMZXR0ZXIodXVpZF9jaGFyKSAmJiBpc0xldHRlcihzZXJpYWxfY2hhcikpIHtcbiAgICAgICAgdXVpZF9ubyA9IGxldHRlclRvTnVtYmVyKHV1aWRfY2hhcik7XG4gICAgICAgIHNlcmlhbF9ubyA9IGxldHRlclRvTnVtYmVyKHNlcmlhbF9jaGFyKTtcbiAgICAgICAgdG90YWwgPSB1dWlkX25vICsgc2VyaWFsX25vO1xuICAgICAgICBpZiAobGFzdERpZ2l0KHRvdGFsKSAhPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc051bWJlcih1dWlkX2NoYXIpICYmIGlzTnVtYmVyKHNlcmlhbF9jaGFyKSkge1xuICAgICAgICB1dWlkX25vID0gcGFyc2VJbnQodXVpZF9jaGFyKTtcbiAgICAgICAgc2VyaWFsX25vID0gcGFyc2VJbnQoc2VyaWFsX2NoYXIpO1xuICAgICAgICB0b3RhbCA9IHV1aWRfbm8gKyBzZXJpYWxfbm87XG4gICAgICAgIGlmIChsYXN0RGlnaXQodG90YWwpICE9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBnZXRGYkdyYXBoSWQ6IGZ1bmN0aW9uKHVzZXJuYW1lLCBjYikge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdGltZW91dDogQUpBWF9USU1FT1VUX01TLFxuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogXCJodHRwOi8vZ3JhcGguZmFjZWJvb2suY29tL1wiICsgdXNlcm5hbWUsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGNiKGRhdGFbXCJpZFwiXSk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2IobnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGdldFBhcmFtZXRlckJ5TmFtZTogZnVuY3Rpb24odXJsLCBuYW1lKSB7XG4gICAgdmFyIHJlZ2V4LCByZXN1bHRzO1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XG4gICAgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFw/Jl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKTtcbiAgICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuICAgIGlmIChyZXN1bHRzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgIH1cbiAgfSxcbiAgZmFjZWJvb2tQcm9maWxlSWQ6IGZ1bmN0aW9uKHVybCwgY2IpIHtcbiAgICB2YXIgcHJvZmlsZV9pZCwgdXNlcm5hbWUsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIHVybCA9IHV0aWwuY2xlYW5VcmwodXJsKTtcbiAgICBpZiAodXJsLnN1YnN0cmluZygwLCBcImZhY2Vib29rLmNvbS9wcm9maWxlLnBocD9cIi5sZW5ndGgpID09PSBcImZhY2Vib29rLmNvbS9wcm9maWxlLnBocD9cIikge1xuICAgICAgY2IoZ2V0UGFyYW1ldGVyQnlOYW1lKHVybCwgXCJpZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh1cmwuc3Vic3RyaW5nKDAsIFwiZmFjZWJvb2suY29tL1wiLmxlbmd0aCkgPT09IFwiZmFjZWJvb2suY29tL1wiKSB7XG4gICAgICB1c2VybmFtZSA9IHVybC5zdWJzdHJpbmcoXCJmYWNlYm9vay5jb20vXCIubGVuZ3RoLCB1cmwubGVuZ3RoKTtcbiAgICAgIGlmICh1c2VybmFtZS5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcbiAgICAgICAgdXNlcm5hbWUgPSB1c2VybmFtZS5zdWJzdHJpbmcoMCwgdXNlcm5hbWUuaW5kZXhPZihcIj9cIikpO1xuICAgICAgfVxuICAgICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBpZiAodXNlcm5hbWUuaW5kZXhPZihcIi9cIikgPT09IC0xICYmIHVzZXJuYW1lLmluZGV4T2YoXCI/XCIpID09PSAtMSAmJiB1c2VybmFtZS5pbmRleE9mKFwiPVwiKSA9PT0gLTEgJiYgdXNlcm5hbWUuaW5kZXhPZihcIiZcIikgPT09IC0xKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9zcmMvdXRpbC5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgZ2V0RmJHcmFwaElkKHVzZXJuYW1lLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVfaWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgbGluZW5vOiAxMzNcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2IocHJvZmlsZV9pZCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pKHRoaXMpKF9faWNlZF9rKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgfVxuICB9LFxuICBjbGVhblVybDogZnVuY3Rpb24odXJsKSB7XG4gICAgaWYgKHVybCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoXCJodHRwOi8vd3d3LlwiLCBcIlwiKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZShcImh0dHBzOi8vd3d3LlwiLCBcIlwiKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZShcImh0dHA6Ly9cIiwgXCJcIik7XG4gICAgdXJsID0gdXJsLnJlcGxhY2UoXCJodHRwczovL1wiLCBcIlwiKTtcbiAgICByZXR1cm4gdXJsO1xuICB9LFxuICBpc1VybEFQcm9maWxlUGFnZTogZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIGNsZWFuZWRfdXJsLCB1c2VybmFtZTtcbiAgICBjbGVhbmVkX3VybCA9IHV0aWwuY2xlYW5VcmwodXJsKTtcbiAgICBpZiAoY2xlYW5lZF91cmwuc3Vic3RyaW5nKDAsIFwiZmFjZWJvb2suY29tL3Byb2ZpbGUucGhwP1wiLmxlbmd0aCkgPT09IFwiZmFjZWJvb2suY29tL3Byb2ZpbGUucGhwP1wiKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGNsZWFuZWRfdXJsLnN1YnN0cmluZygwLCBcImZhY2Vib29rLmNvbS9cIi5sZW5ndGgpID09PSBcImZhY2Vib29rLmNvbS9cIikge1xuICAgICAgdXNlcm5hbWUgPSBjbGVhbmVkX3VybC5zdWJzdHJpbmcoXCJmYWNlYm9vay5jb20vXCIubGVuZ3RoLCBjbGVhbmVkX3VybC5sZW5ndGgpO1xuICAgICAgaWYgKHVzZXJuYW1lLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuICAgICAgICB1c2VybmFtZSA9IHVzZXJuYW1lLnN1YnN0cmluZygwLCB1c2VybmFtZS5pbmRleE9mKFwiP1wiKSk7XG4gICAgICB9XG4gICAgICBpZiAodXNlcm5hbWUuaW5kZXhPZihcIi9cIikgPT09IC0xICYmIHVzZXJuYW1lLmluZGV4T2YoXCI/XCIpID09PSAtMSAmJiB1c2VybmFtZS5pbmRleE9mKFwiPVwiKSA9PT0gLTEgJiYgdXNlcm5hbWUuaW5kZXhPZihcIiZcIikgPT09IC0xICYmIHVzZXJuYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZGF5c1NpbmNlSW5zdGFsbDogZnVuY3Rpb24oY2IpIHtcbiAgICB2YXIgZXBvY2hfbm93LCBpbnN0YWxsX2Vwb2NoLCBzZWNvbmRzX2luX2FfZGF5LCB0b3RhbF9zZWNzX2VsYXBzZWQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL3NyYy91dGlsLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICB1dGlsLmdldExvY2FsRGF0YShrZXlzLklOU1RBTExfRVBPQ0gsIDAsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFsbF9lcG9jaCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDE2M1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBlcG9jaF9ub3cgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgICAgIHRvdGFsX3NlY3NfZWxhcHNlZCA9IGVwb2NoX25vdyAtIGluc3RhbGxfZXBvY2g7XG4gICAgICAgIHNlY29uZHNfaW5fYV9kYXkgPSA4NjQwMDtcbiAgICAgICAgcmV0dXJuIGNiKHBhcnNlSW50KHRvdGFsX3NlY3NfZWxhcHNlZCAvIHNlY29uZHNfaW5fYV9kYXkpKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0FjdGl2YXRlZDogZnVuY3Rpb24oY2IpIHtcbiAgICB2YXIgaXNfYWN0aXZhdGVkLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvcGljdHVyZWJvb2stY2hyb21lLWV4dGVuc2lvbi9zcmMvdXRpbC5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgdXRpbC5nZXRMb2NhbERhdGEoa2V5cy5JU19BQ1RJVkFURUQsIGZhbHNlLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGlzX2FjdGl2YXRlZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDE3MFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2IoaXNfYWN0aXZhdGVkKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc1ZhbGlkRm9yVXNlOiBmdW5jdGlvbihjYikge1xuICAgIHZhciBhY3RpdmF0aW9uX2RheXNfbGVmdCwgZGF5c19zaW5jZV9pbnN0YWxsLCBpc19hY3RpdmF0ZWQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL3NyYy91dGlsLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICB1dGlsLmRheXNTaW5jZUluc3RhbGwoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkYXlzX3NpbmNlX2luc3RhbGwgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxNzRcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vc3JjL3V0aWwuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB1dGlsLmlzQWN0aXZhdGVkKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNfYWN0aXZhdGVkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTc1XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYWN0aXZhdGlvbl9kYXlzX2xlZnQgPSBUUklBTF9EQVlTIC0gZGF5c19zaW5jZV9pbnN0YWxsO1xuICAgICAgICAgIHJldHVybiBjYihhY3RpdmF0aW9uX2RheXNfbGVmdCA+IDAgfHwgaXNfYWN0aXZhdGVkKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc2hvd1JpY2hOb3RpZmljYXRpb246IGZ1bmN0aW9uKHRpdGxlLCBib2R5LCBidG5zKSB7XG4gICAgdmFyIGIsIGJpbmRCdXR0b25DbGlja0V2ZW50LCBidG5zX2xpcywgaSwgX2ksIF9sZW47XG4gICAgaWYgKGJ0bnMgPT0gbnVsbCkge1xuICAgICAgYnRucyA9IFtdO1xuICAgIH1cblxuICAgIC8qXG4gICAgVXNlcyB0aGUgbmV3IENocm9tZSAocmljaCkgbm90aWZpY2F0aW9ucyBBUElcbiAgICBcbiAgICBgYnV0dG9uc2AgLS0gaXMgYSBsaXN0IG9mIGRpY3RzIHdpdGggMyB2YWx1ZXMuXG4gICAgXG4gICAgZXhhbXBsZTpcbiAgICAgICAgW3tcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJUaXRsZSBvZiB0aGUgYnV0dG9uXCIsXG4gICAgICAgICAgICBcImljb25cIjogXCJpbWFnZXMvcmFiYml0LnBuZ1wiLFxuICAgICAgICAgICAgXCJuZXh0XCI6IGZ1bmN0aW9uKCkgey4ufVxuICAgICAgICB9XVxuICAgICAqL1xuICAgIGJpbmRCdXR0b25DbGlja0V2ZW50ID0gZnVuY3Rpb24oaWR4LCBpZCkge1xuICAgICAgcmV0dXJuIGNocm9tZS5ub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbihub3RpZmljYXRpb25faWQsIGJ0bl9pZHgpIHtcbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbl9pZCA9PT0gaWQgJiYgYnRuX2lkeCA9PT0gaWR4KSB7XG4gICAgICAgICAgcmV0dXJuIGIubmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGJ0bnNfbGlzID0gW107XG4gICAgaSA9IDA7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBidG5zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBiID0gYnRuc1tfaV07XG4gICAgICBidG5zX2xpcy5wdXNoKHtcbiAgICAgICAgdGl0bGU6IGIudGl0bGUsXG4gICAgICAgIGljb25Vcmw6IGIuaWNvblxuICAgICAgfSk7XG4gICAgICBiaW5kQnV0dG9uQ2xpY2tFdmVudChpLCB0aXRsZSk7XG4gICAgICBpICs9IDE7XG4gICAgfVxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNsZWFyKHRpdGxlLCAoZnVuY3Rpb24oKSB7fSkpO1xuICAgIHJldHVybiBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUodGl0bGUsIHtcbiAgICAgIHR5cGU6IFwiYmFzaWNcIixcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgIG1lc3NhZ2U6IGJvZHksXG4gICAgICBpY29uVXJsOiBcIi9yZXNvdXJjZXMvaW1ncy9pY29uMTI4LnBuZ1wiLFxuICAgICAgYnV0dG9uczogYnRuc19saXNcbiAgICB9LCAoZnVuY3Rpb24oKSB7fSkpO1xuICB9LFxuICBnZXRGYklkOiBmdW5jdGlvbih0YWJfaWQsIGNiKSB7XG4gICAgcmV0dXJuIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiX2lkLCB7XG4gICAgICBmaWxlOiBcImluamVjdC5qc1wiXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgIHJldHVybiBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJfaWQsIHtcbiAgICAgICAgICBtZXRob2Q6IFwiZ2V0LWZiLWlkXCJcbiAgICAgICAgfSwgZnVuY3Rpb24ocikge1xuICAgICAgICAgIHJldHVybiBjYihyLmZiaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKGNiKTtcbiAgICB9KTtcbiAgfSxcbiAgZmV0Y2hGYWNlYm9va1VybDogZnVuY3Rpb24oZmJQcm9maWxlSWQsIGNhbGxiYWNrRGVmZXIpIHtcbiAgICB2YXIgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLmxvZyhjb25maWcuQVBJX1VSTCk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL3BpY3R1cmVib29rLWNocm9tZS1leHRlbnNpb24vc3JjL3V0aWwuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIHV0aWwuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyMjlcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgIHVybDogXCJcIiArIGNvbmZpZy5BUElfVVJMICsgXCIvdjEvdXJsc1wiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHNlcnZpY2VfdG9rZW46IHNlcnZpY2VUb2tlbixcbiAgICAgICAgICAgIGZiX3Byb2ZpbGVfaWQ6IGZiUHJvZmlsZUlkXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrRGVmZXIoZGF0YS5kaXJlY3QsIGRhdGEudXJsKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFja0RlZmVyKGZhbHNlLCBudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIG1ha2VUb2FzdDogZnVuY3Rpb24obXNnLCBkdXJhdGlvbk1zKSB7XG4gICAgaWYgKGR1cmF0aW9uTXMgPT0gbnVsbCkge1xuICAgICAgZHVyYXRpb25NcyA9IDQwMDA7XG4gICAgfVxuICAgIGlmIChtc2cgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gJC5zbmFja2Jhcih7XG4gICAgICBjb250ZW50OiBtc2csXG4gICAgICBzdHlsZTogXCJ0b2FzdFwiLFxuICAgICAgdGltZW91dDogZHVyYXRpb25Nc1xuICAgIH0pO1xuICB9LFxuICByZWRpcmVjdDogZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gIH0sXG4gIHNpZ25JblZpYU9hdXRoOiBmdW5jdGlvbihhY2Nlc3NUb2tlbiwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgdXJsOiBcIlwiICsgY29uZmlnLkFQSV9VUkwgKyBcIi92MS91c2Vycy9vYXV0aFwiLFxuICAgICAgZGF0YToge1xuICAgICAgICBvYXV0aF90b2tlbjogYWNjZXNzVG9rZW5cbiAgICAgIH0sXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHNlcnZpY2VUb2tlbjtcbiAgICAgICAgc2VydmljZVRva2VuID0gZGF0YVtcInNlcnZpY2VfdG9rZW5cIl07XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHNlcnZpY2VUb2tlbik7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgZ2V0UXVvdGF0aW9uQW5kVXJsczogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBzZXJ2aWNlVG9rZW4sIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9waWN0dXJlYm9vay1jaHJvbWUtZXh0ZW5zaW9uL3NyYy91dGlsLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICB1dGlsLmdldExvY2FsRGF0YShrZXlzLlNFUlZJQ0VfVE9LRU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VydmljZVRva2VuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjcyXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VydmljZVRva2VuID09PSBcInVuZGVmaW5lZFwiIHx8IHNlcnZpY2VUb2tlbiA9PT0gbnVsbCkge1xuICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sobnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgIHVybDogXCJcIiArIGNvbmZpZy5BUElfVVJMICsgXCIvdjEvcGF5bWVudHMvdXJsXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgc2VydmljZV90b2tlbjogc2VydmljZVRva2VuXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHBheXBhbFVybCwgcHJpY2VPYmosIHNhYXN5VXJsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICBwcmljZU9iaiA9IGRhdGFbXCJwcmljZVwiXTtcbiAgICAgICAgICAgIHBheXBhbFVybCA9IGRhdGFbXCJwYXlwYWxcIl0ubW9udGhseTtcbiAgICAgICAgICAgIHNhYXN5VXJsID0gZGF0YVtcInNhYXN5XCJdLm1vbnRobHk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhwcmljZU9iaiwgcGF5cGFsVXJsLCBzYWFzeVVybCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGZldGNoTGF0ZXN0UHJpY2luZzogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICB1cmw6IFwiXCIgKyBjb25maWcuQVBJX1VSTCArIFwiL3YxL3BheW1lbnRzL3ByaWNpbmdcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhkYXRhWydtb250aGx5J10pO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi91dGlsLmpzXCIsXCIvXCIpIl19
