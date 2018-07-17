(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Itee = global.Itee || {}, global.Itee.Database = {})));
}(this, (function (exports) { 'use strict';

  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  // Split a filename into [root, dir, basename, ext], unix version
  // 'root' is just a slash, or nothing.
  var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var splitPath = function(filename) {
    return splitPathRe.exec(filename).slice(1);
  };

  // path.resolve([from ...], to)
  // posix version
  function resolve() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : '/';

      // Skip empty and invalid entries
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  }
  // path.normalize(path)
  // posix version
  function normalize(path) {
    var isPathAbsolute = isAbsolute(path),
        trailingSlash = substr(path, -1) === '/';

    // Normalize the path
    path = normalizeArray(filter(path.split('/'), function(p) {
      return !!p;
    }), !isPathAbsolute).join('/');

    if (!path && !isPathAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isPathAbsolute ? '/' : '') + path;
  }
  // posix version
  function isAbsolute(path) {
    return path.charAt(0) === '/';
  }

  // posix version
  function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(filter(paths, function(p, index) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'));
  }


  // path.relative(from, to)
  // posix version
  function relative(from, to) {
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
  }

  var sep = '/';
  var delimiter = ':';

  function dirname(path) {
    var result = splitPath(path),
        root = result[0],
        dir = result[1];

    if (!root && !dir) {
      // No dirname whatsoever
      return '.';
    }

    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  }

  function basename(path, ext) {
    var f = splitPath(path)[2];
    // TODO: make this comparison case-insensitive on windows?
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  }


  function extname(path) {
    return splitPath(path)[3];
  }
  var path$1 = {
    extname: extname,
    basename: basename,
    dirname: dirname,
    sep: sep,
    delimiter: delimiter,
    relative: relative,
    join: join,
    isAbsolute: isAbsolute,
    normalize: normalize,
    resolve: resolve
  };
  function filter (xs, f) {
      if (xs.filter) return xs.filter(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
          if (f(xs[i], i, xs)) res.push(xs[i]);
      }
      return res;
  }

  // String.prototype.substr - negative index don't work in IE8
  var substr = 'ab'.substr(-1) === 'b' ?
      function (str, start, len) { return str.substr(start, len) } :
      function (str, start, len) {
          if (start < 0) start = str.length + start;
          return str.substr(start, len);
      }
  ;

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/arrays
   * @description Export the utilities methods about Arrays
   *
   */

  /**
   * @static
   * @public
   * @memberOf TApplication
   */
  let diacriticsMap = (() => {

      /*
       Licensed under the Apache License, Version 2.0 (the "License");
       you may not use this file except in compliance with the License.
       You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing, software
       distributed under the License is distributed on an "AS IS" BASIS,
       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       See the License for the specific language governing permissions and
       limitations under the License.
       */

      const defaultDiacriticsRemovalMap = [
          {
              'base':    'A',
              'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'
          },
          {
              'base':    'AA',
              'letters': '\uA732'
          },
          {
              'base':    'AE',
              'letters': '\u00C6\u01FC\u01E2'
          },
          {
              'base':    'AO',
              'letters': '\uA734'
          },
          {
              'base':    'AU',
              'letters': '\uA736'
          },
          {
              'base':    'AV',
              'letters': '\uA738\uA73A'
          },
          {
              'base':    'AY',
              'letters': '\uA73C'
          },
          {
              'base':    'B',
              'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'
          },
          {
              'base':    'C',
              'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'
          },
          {
              'base':    'D',
              'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0'
          },
          {
              'base':    'DZ',
              'letters': '\u01F1\u01C4'
          },
          {
              'base':    'Dz',
              'letters': '\u01F2\u01C5'
          },
          {
              'base':    'E',
              'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'
          },
          {
              'base':    'F',
              'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'
          },
          {
              'base':    'G',
              'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'
          },
          {
              'base':    'H',
              'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'
          },
          {
              'base':    'I',
              'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'
          },
          {
              'base':    'J',
              'letters': '\u004A\u24BF\uFF2A\u0134\u0248'
          },
          {
              'base':    'K',
              'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'
          },
          {
              'base':    'L',
              'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'
          },
          {
              'base':    'LJ',
              'letters': '\u01C7'
          },
          {
              'base':    'Lj',
              'letters': '\u01C8'
          },
          {
              'base':    'M',
              'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'
          },
          {
              'base':    'N',
              'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'
          },
          {
              'base':    'NJ',
              'letters': '\u01CA'
          },
          {
              'base':    'Nj',
              'letters': '\u01CB'
          },
          {
              'base':    'O',
              'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'
          },
          {
              'base':    'OI',
              'letters': '\u01A2'
          },
          {
              'base':    'OO',
              'letters': '\uA74E'
          },
          {
              'base':    'OU',
              'letters': '\u0222'
          },
          {
              'base':    'OE',
              'letters': '\u008C\u0152'
          },
          {
              'base':    'oe',
              'letters': '\u009C\u0153'
          },
          {
              'base':    'P',
              'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'
          },
          {
              'base':    'Q',
              'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A'
          },
          {
              'base':    'R',
              'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'
          },
          {
              'base':    'S',
              'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'
          },
          {
              'base':    'T',
              'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'
          },
          {
              'base':    'TZ',
              'letters': '\uA728'
          },
          {
              'base':    'U',
              'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'
          },
          {
              'base':    'V',
              'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'
          },
          {
              'base':    'VY',
              'letters': '\uA760'
          },
          {
              'base':    'W',
              'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'
          },
          {
              'base':    'X',
              'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C'
          },
          {
              'base':    'Y',
              'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'
          },
          {
              'base':    'Z',
              'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'
          },
          {
              'base':    'a',
              'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'
          },
          {
              'base':    'aa',
              'letters': '\uA733'
          },
          {
              'base':    'ae',
              'letters': '\u00E6\u01FD\u01E3'
          },
          {
              'base':    'ao',
              'letters': '\uA735'
          },
          {
              'base':    'au',
              'letters': '\uA737'
          },
          {
              'base':    'av',
              'letters': '\uA739\uA73B'
          },
          {
              'base':    'ay',
              'letters': '\uA73D'
          },
          {
              'base':    'b',
              'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'
          },
          {
              'base':    'c',
              'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'
          },
          {
              'base':    'd',
              'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'
          },
          {
              'base':    'dz',
              'letters': '\u01F3\u01C6'
          },
          {
              'base':    'e',
              'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'
          },
          {
              'base':    'f',
              'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'
          },
          {
              'base':    'g',
              'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'
          },
          {
              'base':    'h',
              'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'
          },
          {
              'base':    'hv',
              'letters': '\u0195'
          },
          {
              'base':    'i',
              'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'
          },
          {
              'base':    'j',
              'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249'
          },
          {
              'base':    'k',
              'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'
          },
          {
              'base':    'l',
              'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'
          },
          {
              'base':    'lj',
              'letters': '\u01C9'
          },
          {
              'base':    'm',
              'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'
          },
          {
              'base':    'n',
              'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'
          },
          {
              'base':    'nj',
              'letters': '\u01CC'
          },
          {
              'base':    'o',
              'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'
          },
          {
              'base':    'oi',
              'letters': '\u01A3'
          },
          {
              'base':    'ou',
              'letters': '\u0223'
          },
          {
              'base':    'oo',
              'letters': '\uA74F'
          },
          {
              'base':    'p',
              'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'
          },
          {
              'base':    'q',
              'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759'
          },
          {
              'base':    'r',
              'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'
          },
          {
              'base':    's',
              'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'
          },
          {
              'base':    't',
              'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'
          },
          {
              'base':    'tz',
              'letters': '\uA729'
          },
          {
              'base':    'u',
              'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'
          },
          {
              'base':    'v',
              'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'
          },
          {
              'base':    'vy',
              'letters': '\uA761'
          },
          {
              'base':    'w',
              'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'
          },
          {
              'base':    'x',
              'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D'
          },
          {
              'base':    'y',
              'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'
          },
          {
              'base':    'z',
              'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'
          }
      ];

      let map = {};

      for ( let i = 0 ; i < defaultDiacriticsRemovalMap.length ; i++ ) {

          const letters = defaultDiacriticsRemovalMap [ i ].letters;

          for ( let j = 0 ; j < letters.length ; j++ ) {

              map[ letters[ j ] ] = defaultDiacriticsRemovalMap[ i ].base;

          }

      }

      return map

  })();

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/symbols
   * @description Export the utilities methods about symbols
   */

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/voids
   * @description Export the utilities methods about voids notions
   */

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/cores
   * @description This is the cores main export entry point.
   * It expose all exports of the voids, booleans, numbers, symbols, strings, arrays, objects and functions validators.
   *
   */

  var fs = {};

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   *
   * @file Todo
   *
   * @example Todo
   *
   */

  /**
   * Just an override of 'fs.existsSync' with more explicit name
   *
   * @param filePath the path to check
   * @private
   */
  function fileExistForPath ( filePath ) {

      return fs.existsSync( filePath )

  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/cores
   * @description This is the cores main export entry point.
   * It expose all exports of the voids, booleans, numbers, symbols, strings, arrays, objects and functions validators.
   *
   */

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/geomathics/trigonometries
   */

  const PI   = Math.PI;
  const PI_2 = Math.PI / 2;
  const PI_4 = Math.PI / 4;

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   *
   * @file Todo
   *
   * @example Todo
   *
   */

  class TAbstractDatabase {

      constructor ( driver, plugins = [], autoReconnectTimeout = 10000 ) {


          this.routes = {};

          this._driver = driver;
          this._plugins = plugins;
          this._autoReconnectTimeout = autoReconnectTimeout;
          this._autoConnectionTimer = null;

          this.__init();

      }

      __init () {

          const pluginsBasePath = path$1.join( __dirname, '..', 'node_modules' );
          const pluginsNames    = this._plugins;

          for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {
              const pluginName = pluginsNames[ index ];
              const pluginPath = path$1.join( pluginsBasePath, pluginsNames[ index ] );

              if(!fileExistForPath(pluginPath)) {
                  console.error(`Unable to register plugin ${pluginName} the package doesn't seem to exist ! Skip it.`);
                  continue
              }

              const plugin     = require( pluginPath );
              this.__registerPlugin( plugin );
          }

          this._init();

      }

      _init () {

          console.error( 'TAbstractDatabase._init: Need to be reimplemented in inherited class !' );

      }

      __registerPlugin ( plugin ) {

          const routes = plugin.routes;
          for ( let routeKey in routes ) {

              if ( this.routes[ routeKey ] ) {
                  console.warn( `Route controller for key ${routeKey} already exist, ignore it !` );
                  continue
              }

              this.routes[ routeKey ] = routes[ routeKey ];

          }

          this._registerPlugin( plugin );

      }

      _registerPlugin ( plugin ) {

          console.error( 'TAbstractDatabase._registerPlugin: Need to be reimplemented in inherited class !' );

      }

      connect () {

          console.error( 'TAbstractDatabase.connect: Need to be reimplemented in inherited class !' );

      }

      /**
       * startAutoConnect
       */
      startAutoConnect () {
          if ( this._autoConnectionTimer ) {
              return
          }

          this._autoConnectionTimer = setInterval( this.connect.bind( this ), this._autoReconnectTimeout );
      }

      /**
       * stopAutoConnect
       */
      stopAutoConnect () {
          if ( !this._autoConnectionTimer ) {
              return
          }

          clearInterval( this._autoConnectionTimer );
          this._autoConnectionTimer = null;
      }

      close ( callback ) {

          console.error( 'TAbstractDatabase.close: Need to be reimplemented in inherited class !' );

      }

      on ( eventName, callback ) {

          console.error( 'TAbstractDatabase.on: Need to be reimplemented in inherited class !' );

      }

  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   *
   * @file Todo
   *
   * @example Todo
   *
   */

  class TAbstractDatabasePlugin {

      constructor ( parameters ) {

          this.routes = {};

      }

  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/voids
   * @desc Export the validation methods about voids notions
   */

  /**
   * Check if given data is not null
   *
   * @param data {any} The data to check against the nullity
   * @returns {boolean} true if data is not null, false otherwise.
   */
  function isNotNull$1 ( data ) {
      return (data !== null)
  }

  /**
   * Check if given data is null or undefined
   *
   * @param data {any} The data to check against the existence
   * @returns {boolean} true if data is null or undefined, false otherwise.
   */
  function isNullOrUndefined$1 ( data ) {
      return ((data === null) || (typeof data === 'undefined'))
  }

  /**
   * Check if given data is not null and not undefined
   *
   * @param data {any} The data to check against the existence
   * @returns {boolean} true if data is not null and not undefined, false otherwise.
   */
  function isDefined ( data ) {
      return ((data !== null) && (typeof data !== 'undefined'))
  }

  /**
   * Check emptiness of given data
   *
   * See: https://stackoverflow.com/questions/4346186/how-to-determine-if-a-function-is-empty
   *
   * @param data {any} The data to check against the emptiness
   * @returns {boolean} true if data is considered as empty, false otherwise.
   */
  function isEmpty$1 ( data ) {

      // null and undefined are consider as "empty"
      if ( data === null ) {
          return true;
      }
      if ( data === undefined ) {
          return true;
      }

      // Assume if it has a length property with a non-zero value
      // that that property is correct.
      if ( data.length > 0 ) {
          return false;
      }
      if ( data.length === 0 ) {
          return true;
      }

      // Otherwise, does it have any properties of its own?
      for ( let key in data ) {
          if ( Object.prototype.hasOwnProperty.call( data, key ) ) {
              return false;
          }
      }

      return true;
  }

  /**
   * Check fullness of given data
   *
   * @param data {any} The data to check against the emptiness
   * @returns {boolean} true if data is considered as not empty, false otherwise.
   */
  function isNotEmpty$1 ( data ) {
      return !isEmpty$1( data );
  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/objects
   * @desc Export the validation methods about objects
   * @requires {@link module:sources/cores/voids/isNull}
   * @requires {@link module:sources/cores/voids/isEmpty}
   */

  /**
   * Check if given data is an object
   *
   * @param data {any} The data to check against the object type
   * @returns {boolean} true if data is object, false otherwise
   */
  function isObject$1 ( data ) {
      return ( isNotNull$1( data ) && (typeof data === 'object') && !Array.isArray( data ) )
  }

  /**
   * Check if given data is not an empty object
   *
   * @param data {any} The data to check against the emptiness of the object
   * @returns {boolean} true if data is not an empty object, false otherwise
   */
  function isNotEmptyObject ( data ) {
      return ( isObject$1( data ) && isNotEmpty$1( data ) )
  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [MIT]{@link https://opensource.org/licenses/MIT}
   *
   * @module sources/cores/arrays
   * @desc Export the validation methods about Arrays
   * @requires {@link module:sources/cores/voids}
   * @requires {@link module:sources/cores/strings}
   * @requires {@link module:sources/cores/objects}
   *
   */

  /**
   * Check if given data is an array
   *
   * @param data {any} The data to check against the array type
   * @returns {boolean} true if data is array, false otherwise
   */
  function isArray ( data ) {
      return Array.isArray( data )
  }

  /**
   * Check if given data is not an empty array
   *
   * @param data {any} The data to check against the empty array
   * @returns {boolean} true if data is not an empty array, false otherwise
   */
  function isNotEmptyArray ( data ) {
      return ( isArray( data ) && isNotEmpty$1( data ) )
  }

  /*
   MIT License

   Copyright (c) 2016 Tristan VALCKE

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
   */

  /**
   * This module allow to send response to user in an automatically way after requesting the mongodb database (if no options was provide),
   * and allow to handle every step on response return, and data/error state.
   * @module I-Return
   *
   * @author Tristan Valcke <https://github.com/TristanVALCKE>
   * @license MIT
   *
   */

  // Helpers
  /**
   * String discrimination function
   *
   * @param {*} variable - The variable to check
   * @returns {boolean} True if variable is a string, false otherwise
   * @private
   * @static
   */
  function _isString (variable) {
    return (typeof variable === 'string' || variable instanceof String)
  }

  /**
   * Filled array discrimination function
   *
   * @param {*} variable - The variable to check
   * @returns {boolean} True if variable is an array containing values, false otherwise
   * @private
   * @static
   */
  function _isNullOrEmptyArray (variable) {
    return (!variable || (variable.constructor === Array && variable.length === 0))
  }

  /**
   * Array discrimination function
   *
   * @param {*} variable - The variable to check
   * @returns {boolean} True if variable is a array, false otherwise
   * @private
   * @static
   */
  function _isArray (variable) {
    return (variable.constructor === Array)
  }

  /**
   * Object discrimination function
   *
   * @param {*} variable - The variable to check
   * @returns {boolean} True if variable is a object, false otherwise
   * @private
   * @static
   */
  function _isObject (variable) {
    return (variable === Object(variable))
  }

  /**
   * Normalize error that can be in different format like single string, object, array of string, or array of object.
   *
   * @example <caption>Normalized error are simple literal object like:</caption>
   * {
     *     title: 'error',
     *     message: 'the error message'
     * }
   *
   * @param {String|Object|Array.<String>|Array.<Object>} error - The error object to normalize
   * @returns {Array.<Object>}
   * @private
   */
  function _normalizeError (error) {
    var errorsList = [];

    if (_isArray(error)) {

      for (var i = 0, l = error.length; i < l; ++i) {
        errorsList = errorsList.concat(_normalizeError(error[ i ]));
      }

    } else if (_isObject(error)) {

      if (error.name === 'ValidationError') {

        var _message  = '';
        var subsError = error.errors;

        for (var property in subsError) {
          if (subsError.hasOwnProperty(property)) {
            _message += subsError[ property ].message + '<br>';
          }
        }

        errorsList.push({
          title:   'Erreur de validation',
          message: _message || 'Aucun message d\'erreur... Gloups !'
        });

      } else if (error.name === 'VersionError') {

        errorsList.push({
          title:   'Erreur de base de donnée',
          message: 'Aucun document correspondant n\'as put être trouvé pour la requete !'
        });

      } else {

        errorsList.push({
          title:   error.title || 'Erreur',
          message: error.message || 'Aucun message d\'erreur... Gloups !'
        });
        
      }

    } else if (_isString(error)) {

      errorsList.push({
        title:   'Erreur',
        message: error
      });

    } else {

      throw new Error('Unknown error type: ' + error + ', please report your issue at "https://github.com/TristanVALCKE/i-return/issues"')

    }

    return errorsList
  }

  // API
  /**
   * In case database call return nothing consider that is a not found.
   * If response parameter is a function consider this is a returnNotFound callback function to call,
   * else check if server response headers aren't send yet, and return response with status 204
   *
   * @param response - The server response or returnNotFound callback
   * @returns {*} callback call or response with status 204
   */
  function returnNotFound (response) {
    if (typeof (response) === 'function') {
      return response()
    }

    if (!response.headersSent) {
      return response.status(204).end()
    }
  }

  /**
   * In case database call return an error.
   * If response parameter is a function consider this is a returnError callback function to call,
   * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and return response with status 500 and
   * stringified error as content
   *
   * @param error - A server/database error
   * @param response - The server response or returnError callback
   * @returns {*} callback call or response with status 500 and associated error
   */
  function returnError (error, response) {
    if (typeof (response) === 'function') {
      return response(error, null)
    }

    if (!response.headersSent) {
      return response.status(500).end(JSON.stringify(error))
    }
  }

  /**
   * In case database call return some data.
   * If response parameter is a function consider this is a returnData callback function to call,
   * else check if server response headers aren't send yet, and return response with status 200 and
   * stringified data as content
   *
   * @param data - The server/database data
   * @param response - The server response or returnData callback
   * @returns {*} callback call or response with status 200 and associated data
   */
  function returnData (data, response) {
    if (typeof (response) === 'function') {
      return response(null, data)
    }

    if (!response.headersSent) {
      return response.status(200).end(JSON.stringify(data))
    }
  }

  /**
   * In case database call return some data AND error.
   * If response parameter is a function consider this is a returnErrorAndData callback function to call,
   * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and
   * return response with status 406 with stringified data and error in a literal object as content
   *
   * @param error - A server/database error
   * @param data - The server/database data
   * @param response - The server response or returnErrorAndData callback
   * @returns {*} callback call or response with status 406, associated error and data
   */
  function returnErrorAndData (error, data, response) {
    if (typeof (response) === 'function') {
      return response(error, data)
    }

    if (!response.headersSent) {
      return response.status(406).end(JSON.stringify({
        errors: error,
        data:   data
      }))
    }
  }

  /**
   * The main entry point of this module.
   * This function will be used as database callback and will call given handlers if they were set,
   * and redirect server response in an automatic way (if not handlers) in function of the database response type (nothing, data, error, data and error).
   *
   * Callback are in the form:
   *
   * @example <caption>Available callback are:</caption>
   * {
     *   beforeAll:    null,
     *   returnForAll: null,
     *   afterAll:     null,
     *
     *   beforeReturnErrorAndData: null,
     *   returnErrorAndData:       returnErrorAndData,
     *   afterReturnErrorAndData:  null,
     *
     *   beforeReturnError: null,
     *   returnError:       returnError,
     *   afterReturnError:  null,
     *
     *   beforeReturnData: null,
     *   returnData:       returnData,
     *   afterReturnData:  null,
     *
     *   beforeReturnNotFound: null,
     *   returnNotFound:       returnNotFound,
     *   afterReturnNotFound:  null
     * }
   *
   * @param response - The server response to return to end user
   * @param {Object} userCallbacks - A literal object containing returnMethod override or handler
   * @returns {Function} The provided database callback
   */
  function returnResponse (response, userCallbacks) {
    var _userCallbacks = userCallbacks || {};
    var _cb            = {
      beforeAll:    null,
      returnForAll: null,
      afterAll:     null,

      beforeReturnErrorAndData: null,
      returnErrorAndData:       returnErrorAndData,
      afterReturnErrorAndData:  null,

      beforeReturnError: null,
      returnError:       returnError,
      afterReturnError:  null,

      beforeReturnData: null,
      returnData:       returnData,
      afterReturnData:  null,

      beforeReturnNotFound: null,
      returnNotFound:       returnNotFound,
      afterReturnNotFound:  null
    };

    /**
     * Register user callback
     */
    for (var callback in _userCallbacks) {
      if (_userCallbacks.hasOwnProperty(callback) && _cb.hasOwnProperty(callback)) {
        _cb[ callback ] = _userCallbacks[ callback ];
      }
    }

    /**
     * Call provided callback for error and data case.
     *
     * @param error - The database receive error
     * @param data - The database retrieved data
     */
    function processErrorAndData (error, data) {
      if (_cb.beforeReturnErrorAndData) { _cb.beforeReturnErrorAndData(error, data); }
      if (_cb.returnErrorAndData) { _cb.returnErrorAndData(error, data, response); }
      if (_cb.afterReturnErrorAndData) { _cb.afterReturnErrorAndData(error, data); }
    }

    /**
     * Call provided callback for error case.
     *
     * @param error - The database receive error
     */
    function processError (error) {
      if (_cb.beforeReturnError) { _cb.beforeReturnError(error); }
      if (_cb.returnError) { _cb.returnError(error, response); }
      if (_cb.afterReturnError) { _cb.afterReturnError(error); }
    }

    /**
     * Call provided callback for data case.
     *
     * @param data - The database retrieved data
     */
    function processData (data) {
      if (_cb.beforeReturnData) { _cb.beforeReturnData(data); }
      if (_cb.returnData) { _cb.returnData(data, response); }
      if (_cb.afterReturnData) { _cb.afterReturnData(data); }
    }

    /**
     * Call provided callback for not found data case.
     */
    function processNotFound () {
      if (_cb.beforeReturnNotFound) { _cb.beforeReturnNotFound(); }
      if (_cb.returnNotFound) { _cb.returnNotFound(response); }
      if (_cb.afterReturnNotFound) { _cb.afterReturnNotFound(); }
    }

    /**
     * The callback that will be used for parse database response
     */
    function dispatchResult (error, data) {
      if (_cb.beforeAll) { _cb.beforeAll(); }

      if (_cb.returnForAll) {
        _cb.returnForAll(error, data);
      } else if (!_isNullOrEmptyArray(error)) {
        var _error = _normalizeError(error);
        if (!_isNullOrEmptyArray(data)) {
          processErrorAndData(_error, data);
        } else {
          processError(_error);
        }
      } else {
        if (!_isNullOrEmptyArray(data)) {
          processData(data);
        } else {
          processNotFound();
        }
      }

      if (_cb.afterAll) { _cb.afterAll(); }
    }

    return dispatchResult
  }

  var iReturn = {
    return:             returnResponse,
    returnError:        returnError,
    returnNotFound:     returnNotFound,
    returnData:         returnData,
    returnErrorAndData: returnErrorAndData
  };

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   *
   * @class TDatabaseController
   * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
   */

  class TAbstractDataController {

      constructor ( parameters ) {

          this._parameters = parameters;

      }

      /**
       * Check if requested params named 'dataName' exist in request.body, request.params or request.query
       *
       * @param dataName - The property name to looking for
       * @param request - The _server request
       * @param response - The _server response
       * @returns {*} - Return the property or return error to the end user if the property doesn't exist
       * @private
       */
      static __checkData ( dataName, request, response ) {

          const body = request.body;
          const params = request.params;
          const query = request.query;

          if ( isDefined(body) && body[ dataName ] ) {

              return body[ dataName ]

          } else if ( isDefined(params) && params[ dataName ] ) {

              return params[ dataName ]

          } else if ( isDefined(query) && query[ dataName ] ) {

              return query[ dataName ]

          } else {

              iReturn.returnError( {
                  title:   'Erreur de paramètre',
                  message: dataName + " n'existe pas dans les paramètres !"
              }, response );

          }
      }

      create ( request, response ) {

          const requestBody = request.body;
          if ( isNullOrUndefined$1( requestBody ) ) {

              iReturn.returnError( {
                  title:   'Erreur de paramètre',
                  message: 'Aucun paramètre n\'a été reçu !'
              }, response );
              return

          }

          if ( isArray( requestBody ) ) {

              this._createSome( requestBody, response );

          } else {

              this._createOne( requestBody, response );

          }

      }

      _createOne ( data, response ) {}

      _createSome ( datas, response ) {}

      read ( request, response ) {

          const requestBody = request.body;
          const idParam     = request.params[ 'id' ];

          response.set( "Content-Type", "application/json" );

          if ( isDefined( requestBody ) ) {

              if ( isNotEmptyObject( requestBody ) ) {

                  this._readByObject( requestBody, response );

              } else if ( isNotEmptyArray( requestBody ) ) {

                  this._readByArray( requestBody, response );

              } else {

                  iReturn.returnError( {
                      title:   'Erreur de paramètre',
                      message: 'La requête ne contient pas de données !'
                  }, response );

              }

          } else if ( isDefined( idParam ) ) {

              this._readById( idParam, response );

          } else {

              this._readAll( response );

          }

      }

      _readById ( id, response ) {}

      _readByArray ( array, response ) {}

      _readByObject ( object, response ) {}

      _readAll ( response ) {}

      update ( request, response ) {

          const requestBody = request.body;
          const idParam     = request.params[ 'id' ];

          if ( isDefined( requestBody ) ) {

              if ( isNotEmptyObject( requestBody ) ) {

                  this._updateByObject( requestBody, response );

              } else if ( isNotEmptyArray( requestBody ) ) {

                  this._updateByArray( requestBody, response );

              } else {

                  iReturn.returnError( {
                      title:   'Erreur de paramètre',
                      message: 'La requête ne contient pas de données !'
                  }, response );

              }

          } else if ( isDefined( idParam ) ) {

              this._updateById( idParam, response );

          } else {

              this._updateAll( response );

          }

      }

      _updateById ( id, response ) {}

      _updateByArray ( array, response ) {}

      _updateByObject ( object, response ) {}

      _updateAll ( response ) {}

      delete ( request, response ) {

          const requestBody = request.body;
          const idParam     = request.params[ 'id' ];

          if ( isDefined( requestBody ) ) {

              if ( isNotEmptyObject( requestBody ) ) {

                  this._deleteByObject( requestBody, response );

              } else if ( isNotEmptyArray( requestBody ) ) {

                  this._deleteByArray( requestBody, response );

              } else {

                  iReturn.returnError( {
                      title:   'Erreur de paramètre',
                      message: 'La requête ne contient pas de données !'
                  }, response );

              }

          } else if ( isDefined( idParam ) ) {

              this._deleteById( idParam, response );

          } else {

              this._deleteAll( response );

          }

      }

      _deleteById ( id, response ) {}

      _deleteByArray ( array, response ) {}

      _deleteByObject ( object, response ) {}

      _deleteAll ( response ) {}

  }

  /**
   * @author [Tristan Valcke]{@link https://github.com/Itee}
   * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
   *
   * @file Todo
   *
   * @example Todo
   *
   */

  exports.TAbstractDatabase = TAbstractDatabase;
  exports.TAbstractDatabasePlugin = TAbstractDatabasePlugin;
  exports.TAbstractDataController = TAbstractDataController;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
