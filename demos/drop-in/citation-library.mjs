/*! cite-inator library v0.6.0-preview.5 | MIT | See THIRD_PARTY_LICENSES.txt */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name3 in all)
    __defProp(target, name3, { get: all[name3], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@citation-js/name/lib/input.js
var require_input = __commonJS({
  "node_modules/@citation-js/name/lib/input.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.parse = exports.types = exports.scope = void 0;
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
    function _iterableToArrayLimit(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = void 0;
      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    var punctutationMatcher = (string) => string.replace(/$|( )|(?!^)(?=[A-Z])/g, "\\.?$1");
    var getListMatcher = (list6) => `(?:${list6.join("|")})\\b`;
    var getSplittingRegex = (matcher, flags) => new RegExp(`(?:^| )(${matcher}$)`, flags);
    var titles = ["mr", "mrs", "ms", "miss", "dr", "herr", "monsieur", "hr", "frau", "a v m", "admiraal", "admiral", "air cdre", "air commodore", "air marshal", "air vice marshal", "alderman", "alhaji", "ambassador", "baron", "barones", "brig", "brig gen", "brig general", "brigadier", "brigadier general", "brother", "canon", "capt", "captain", "cardinal", "cdr", "chief", "cik", "cmdr", "coach", "col", "col dr", "colonel", "commandant", "commander", "commissioner", "commodore", "comte", "comtessa", "congressman", "conseiller", "consul", "conte", "contessa", "corporal", "councillor", "count", "countess", "crown prince", "crown princess", "dame", "datin", "dato", "datuk", "datuk seri", "deacon", "deaconess", "dean", "dhr", "dipl ing", "doctor", "dott", "dott sa", "dr", "dr ing", "dra", "drs", "embajador", "embajadora", "en", "encik", "eng", "eur ing", "exma sra", "exmo sr", "f o", "father", "first lieutient", "first officer", "flt lieut", "flying officer", "fr", "frau", "fraulein", "fru", "gen", "generaal", "general", "governor", "graaf", "gravin", "group captain", "grp capt", "h e dr", "h h", "h m", "h r h", "hajah", "haji", "hajim", "her highness", "her majesty", "herr", "high chief", "his highness", "his holiness", "his majesty", "hon", "hr", "hra", "ing", "ir", "jonkheer", "judge", "justice", "khun ying", "kolonel", "lady", "lcda", "lic", "lieut", "lieut cdr", "lieut col", "lieut gen", "lord", "m", "m l", "m r", "madame", "mademoiselle", "maj gen", "major", "master", "mevrouw", "miss", "mlle", "mme", "monsieur", "monsignor", "mr", "mrs", "ms", "mstr", "nti", "pastor", "president", "prince", "princess", "princesse", "prinses", "prof", "prof dr", "prof sir", "professor", "puan", "puan sri", "rabbi", "rear admiral", "rev", "rev canon", "rev dr", "rev mother", "reverend", "rva", "senator", "sergeant", "sheikh", "sheikha", "sig", "sig na", "sig ra", "sir", "sister", "sqn ldr", "sr", "sr d", "sra", "srta", "sultan", "tan sri", "tan sri dato", "tengku", "teuku", "than puying", "the hon dr", "the hon justice", "the hon miss", "the hon mr", "the hon mrs", "the hon ms", "the hon sir", "the very rev", "toh puan", "tun", "vice admiral", "viscount", "viscountess", "wg cdr"];
    var suffixes = ["I", "II", "III", "IV", "V", "Senior", "Junior", "Jr", "Sr", "PhD", "Ph\\.D", "APR", "RPh", "PE", "MD", "MA", "DMD", "CME", "BVM", "CFRE", "CLU", "CPA", "CSC", "CSJ", "DC", "DD", "DDS", "DO", "DVM", "EdD", "Esq", "JD", "LLD", "OD", "OSB", "PC", "Ret", "RGS", "RN", "RNC", "SHCJ", "SJ", "SNJM", "SSMO", "USA", "USAF", "USAFR", "USAR", "USCG", "USMC", "USMCR", "USN", "USNR"];
    var particles = ["Vere", "Von", "Van", "De", "Del", "Della", "Di", "Da", "Pietro", "Vanden", "Du", "St.", "St", "La", "Lo", "Ter", "O", "O'", "Mac", "Fitz"];
    var titleMatcher = getListMatcher(titles.map(punctutationMatcher));
    var suffixMatcher = getListMatcher(suffixes.map(punctutationMatcher));
    var particleMatcher = getListMatcher(particles);
    var titleSplitter = new RegExp(`^((?:${titleMatcher} )*)(.*)$`, "i");
    var suffixSplitter = getSplittingRegex(`(?:${suffixMatcher}, )*(?:${suffixMatcher})`, "i");
    var particleSplitter = getSplittingRegex(`${/(?:[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1C90-\u1CBA\u1CBD-\u1CBF\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uA7B8\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD81B[\uDE40-\uDE5F]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]|\uD83C[\uDD30-\uDD49\uDD50-\uDD69\uDD70-\uDD89])/.source}.*`);
    var endSplitter = getSplittingRegex(`(?:${/(?:[a-z\xAA\xB5\xBA\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02B8\u02C0\u02C1\u02E0-\u02E4\u0345\u0371\u0373\u0377\u037A-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0560-\u0588\u10D0-\u10FA\u10FD-\u10FF\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1DBF\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u2071\u207F\u2090-\u209C\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2170-\u217F\u2184\u24D0-\u24E9\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7D\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B-\uA69D\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7AF\uA7B5\uA7B7\uA7B9\uA7F8-\uA7FA\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD81B[\uDE60-\uDE7F]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43])/.source}.*|${particleMatcher}.*|\\S*)`);
    var parseName2 = function parseName3(name3 = "") {
      if (typeof name3 !== "string") {
        name3 = name3 + "";
      }
      let start = "";
      let mid = "";
      let end = "";
      if (/[^.], /.test(name3)) {
        const parts = name3.split(", ");
        end = parts.shift();
        const suffixMatch = RegExp(suffixMatcher).exec(parts.join(", "));
        start = parts.splice(suffixMatch && suffixMatch.index !== 0 ? 0 : -1, 1)[0];
        mid = parts.join(", ");
      } else {
        const parts = name3.split(suffixSplitter, 2);
        const main = parts.shift().split(endSplitter, 2);
        start = main[0];
        end = main[1];
        mid = parts.pop();
      }
      const _start$match = start.match(titleSplitter), _start$match2 = _slicedToArray(_start$match, 3), droppingParticle = _start$match2[1], given = _start$match2[2];
      const suffix = mid;
      const _end$split$reverse = end.split(particleSplitter, 2).reverse(), _end$split$reverse2 = _slicedToArray(_end$split$reverse, 2), family = _end$split$reverse2[0], nonDroppingParticle = _end$split$reverse2[1];
      if (!given && family) {
        return family.includes(" ") ? {
          literal: family
        } : {
          family
        };
      } else if (family) {
        const nameObject = {
          "dropping-particle": droppingParticle,
          given,
          suffix,
          "non-dropping-particle": nonDroppingParticle,
          family
        };
        Object.keys(nameObject).forEach((key) => {
          if (!nameObject[key]) {
            delete nameObject[key];
          }
        });
        return nameObject;
      } else {
        return {
          literal: name3
        };
      }
    };
    exports.default = exports.parse = parseName2;
    var scope = "@name";
    exports.scope = scope;
    var types4 = "@name";
    exports.types = types4;
  }
});

// node_modules/@citation-js/name/lib/output.js
var require_output = __commonJS({
  "node_modules/@citation-js/name/lib/output.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var startParts = ["dropping-particle", "given"];
    var suffixParts = ["suffix"];
    var endParts = ["non-dropping-particle", "family"];
    var getName2 = function getName3(name3, reversed = false) {
      const get5 = (parts) => parts.map((entry) => name3[entry] || "").filter(Boolean).join(" ");
      if (name3.literal) {
        return name3.literal;
      } else if (reversed) {
        const suffixPart = get5(suffixParts) ? `, ${get5(suffixParts)}` : "";
        const startPart = get5(startParts) ? `, ${get5(startParts)}` : "";
        return get5(endParts) + suffixPart + startPart;
      } else {
        return `${get5([...startParts, ...suffixParts, ...endParts])}`;
      }
    };
    var _default = getName2;
    exports.default = _default;
  }
});

// node_modules/@citation-js/name/lib/index.js
var require_lib = __commonJS({
  "node_modules/@citation-js/name/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "parse", {
      enumerable: true,
      get: function get5() {
        return _input.default;
      }
    });
    Object.defineProperty(exports, "format", {
      enumerable: true,
      get: function get5() {
        return _output.default;
      }
    });
    var _input = _interopRequireDefault(require_input());
    var _output = _interopRequireDefault(require_output());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// node_modules/sync-fetch-undici/browser.js
var require_browser = __commonJS({
  "node_modules/sync-fetch-undici/browser.js"(exports, module) {
    var textEncoder = new TextEncoder();
    var textDecoder = new TextDecoder();
    function syncFetch2(...args) {
      const request = new syncFetch2.Request(...args);
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = request.credentials === "include";
      xhr.timeout = request[INTERNALS].timeout;
      xhr.open(request.method, request.url, false);
      let useBinaryEncoding = false;
      try {
        xhr.responseType = "arraybuffer";
      } catch (e) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        useBinaryEncoding = true;
      }
      for (const header of request.headers) {
        xhr.setRequestHeader(...header);
      }
      xhr.send(request[INTERNALS].body || null);
      let headers = xhr.getAllResponseHeaders();
      headers = headers && headers.split("\r\n").filter(Boolean).map((header) => header.split(": ", 2));
      let body = xhr.response;
      if (useBinaryEncoding) {
        const buffer = new Uint8Array(body.length);
        for (let i = 0; i < body.length; i++) {
          buffer[i] = body.charCodeAt(i) & 255;
        }
        body = buffer;
      }
      const response = new syncFetch2.Response(body, {
        headers,
        status: xhr.status,
        statusText: xhr.statusText
      });
      response[INTERNALS].url = xhr.responseURL;
      response[INTERNALS].redirected = xhr.responseURL !== request.url;
      return response;
    }
    var INTERNALS = Symbol("SyncFetch Internals");
    var REQ_UNSUPPORTED = ["mode", "cache", "redirect", "referrer", "integrity"];
    var HTTP_STATUS = {
      100: "Continue",
      101: "Switching Protocols",
      200: "OK",
      201: "Created",
      202: "Accepted",
      203: "Non-Authoritative Information",
      204: "No Content",
      205: "Reset Content",
      206: "Partial Content",
      300: "Multiple Choices",
      301: "Moved Permanently",
      302: "Found",
      303: "See Other",
      304: "Not Modified",
      305: "Use Proxy",
      307: "Temporary Redirect",
      400: "Bad Request",
      401: "Unauthorized",
      402: "Payment Required",
      403: "Forbidden",
      404: "Not Found",
      405: "Method Not Allowed",
      406: "Not Acceptable",
      407: "Proxy Authentication Required",
      408: "Request Timeout",
      409: "Conflict",
      410: "Gone",
      411: "Length Required",
      412: "Precondition Failed",
      413: "Payload Too Large",
      414: "URI Too Long",
      415: "Unsupported Media Type",
      416: "Range Not Satisfiable",
      417: "Expectation Failed",
      426: "Upgrade Required",
      500: "Internal Server Error",
      501: "Not Implemented",
      502: "Bad Gateway",
      503: "Service Unavailable",
      504: "Gateway Timeout",
      505: "HTTP Version Not Supported"
    };
    var SyncRequest = class _SyncRequest {
      constructor(resource, init = {}) {
        for (const option of REQ_UNSUPPORTED) {
          if (option in init) {
            throw new TypeError(`option ${option} not supported`);
          }
        }
        if (init.credentials === "same-origin") {
          throw new TypeError("option credentials with value 'same-origin' not supported");
        }
        this[INTERNALS] = {
          method: init.method || "GET",
          headers: new syncFetch2.Headers(init.headers),
          body: parseBody(init.body),
          credentials: init.credentials || "omit",
          // Non-spec
          timeout: init.timeout || 0
        };
        if (typeof resource === "string") {
          this[INTERNALS].url = resource;
        } else if (resource instanceof _SyncRequest) {
          this[INTERNALS].url = resource.url;
          if (!init.method) {
            this[INTERNALS].method = resource.method;
          }
          if (!init.headers) {
            this[INTERNALS].headers = resource.headers;
          }
          if (!init.body) {
            this[INTERNALS].body = resource[INTERNALS].body;
          }
          if (!init.credentials) {
            this[INTERNALS].credentials = resource.credentials;
          }
        } else {
          throw new TypeError("Request input should be a URL string or a Request object");
        }
      }
      get cache() {
        return "default";
      }
      get credentials() {
        return this[INTERNALS].credentials;
      }
      get destination() {
        return "";
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get integrity() {
        return "";
      }
      get method() {
        return this[INTERNALS].method;
      }
      get mode() {
        return "cors";
      }
      get priority() {
        return "auto";
      }
      get redirect() {
        return "follow";
      }
      get referrer() {
        return "about:client";
      }
      get referrerPolicy() {
        return "";
      }
      get url() {
        return this[INTERNALS].url;
      }
      clone() {
        checkBody(this);
        return new _SyncRequest(this.url, this[INTERNALS]);
      }
    };
    var SyncResponse = class _SyncResponse {
      constructor(body, init = {}) {
        this[INTERNALS] = {
          body: parseBody(body),
          bodyUsed: false,
          headers: new syncFetch2.Headers(init.headers),
          status: init.status,
          statusText: init.statusText
        };
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get ok() {
        const status = this[INTERNALS].status;
        return status >= 200 && status < 300;
      }
      get redirected() {
        return this[INTERNALS].redirected;
      }
      get status() {
        return this[INTERNALS].status;
      }
      get statusText() {
        return this[INTERNALS].statusText;
      }
      get url() {
        return this[INTERNALS].url;
      }
      clone() {
        return this.redirect(this[INTERNALS].url, this[INTERNALS].status);
      }
      redirect(url, status) {
        checkBody(this);
        const response = new _SyncResponse(this[INTERNALS].body, {
          headers: this[INTERNALS].headers,
          status: status || this[INTERNALS].status,
          statusText: HTTP_STATUS[status] || this[INTERNALS].statusText
        });
        response[INTERNALS].url = url || this[INTERNALS].url;
        response[INTERNALS].redirected = this[INTERNALS].redirected;
        return response;
      }
    };
    var Body = class _Body {
      constructor(body) {
        this[INTERNALS] = {
          body: parseBody(body),
          bodyUsed: false
        };
      }
      get bodyUsed() {
        return this[INTERNALS].bodyUsed;
      }
      static mixin(prototype) {
        for (const name3 of Object.getOwnPropertyNames(_Body.prototype)) {
          if (name3 === "constructor") {
            continue;
          }
          const desc = Object.getOwnPropertyDescriptor(_Body.prototype, name3);
          Object.defineProperty(prototype, name3, { ...desc, enumerable: true });
        }
      }
      arrayBuffer() {
        const buffer = consumeBody(this);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      }
      blob() {
        const type2 = this.headers && this.headers.get("content-type");
        return new Blob([consumeBody(this)], type2 && { type: type2 });
      }
      text() {
        return textDecoder.decode(consumeBody(this));
      }
      json() {
        try {
          return JSON.parse(this.text());
        } catch (err) {
          throw new TypeError(`invalid json response body at ${this.url} reason: ${err.message}`, "invalid-json");
        }
      }
    };
    function checkBody(body) {
      if (body.bodyUsed) {
        throw new TypeError(`body used already for: ${body.url}`);
      }
    }
    function consumeBody(body) {
      checkBody(body);
      body[INTERNALS].bodyUsed = true;
      return body[INTERNALS].body || new Uint8Array();
    }
    function parseBody(body) {
      if (typeof body === "string") {
        return textEncoder.encode(body);
      } else if (body) {
        return body;
      } else {
        return null;
      }
    }
    Body.mixin(SyncRequest.prototype);
    Body.mixin(SyncResponse.prototype);
    var Headers2 = class {
      constructor(headers) {
        if (headers instanceof syncFetch2.Headers) {
          this[INTERNALS] = { ...headers[INTERNALS] };
        } else {
          this[INTERNALS] = {};
          if (Array.isArray(headers)) {
            for (const [name3, value] of headers) {
              this.append(name3, value);
            }
          } else if (typeof headers === "object") {
            for (const name3 in headers) {
              this.set(name3, headers[name3]);
            }
          }
        }
      }
      // modification
      append(name3, value) {
        name3 = name3.toLowerCase();
        if (!this[INTERNALS][name3]) {
          this[INTERNALS][name3] = [];
        }
        this[INTERNALS][name3].push(value);
      }
      delete(name3) {
        delete this[INTERNALS][name3.toLowerCase()];
      }
      set(name3, value) {
        this[INTERNALS][name3.toLowerCase()] = [value];
      }
      // access
      entries() {
        const pairs = [];
        for (const name3 in this[INTERNALS]) {
          for (const value of this[INTERNALS][name3]) {
            pairs.push([name3, value]);
          }
        }
        return pairs;
      }
      get(name3) {
        name3 = name3.toLowerCase();
        return name3 in this[INTERNALS] ? this[INTERNALS][name3].join(", ") : null;
      }
      keys() {
        return Object.keys(this[INTERNALS]);
      }
      has(name3) {
        return name3.toLowerCase() in this[INTERNALS];
      }
      values() {
        const values = [];
        for (const name3 in this[INTERNALS]) {
          for (const value of this[INTERNALS][name3]) {
            values.push(value);
          }
        }
        return values;
      }
      *[Symbol.iterator]() {
        for (const name3 in this[INTERNALS]) {
          for (const value of this[INTERNALS][name3]) {
            yield [name3, value];
          }
        }
      }
    };
    syncFetch2.Headers = Headers2;
    syncFetch2.Request = SyncRequest;
    syncFetch2.Response = SyncResponse;
    module.exports = syncFetch2;
  }
});

// node_modules/moo/moo.js
var require_moo = __commonJS({
  "node_modules/moo/moo.js"(exports, module) {
    (function(root, factory2) {
      if (typeof define === "function" && define.amd) {
        define([], factory2);
      } else if (typeof module === "object" && module.exports) {
        module.exports = factory2();
      } else {
        root.moo = factory2();
      }
    })(exports, function() {
      "use strict";
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var toString = Object.prototype.toString;
      var hasSticky = typeof new RegExp().sticky === "boolean";
      function isRegExp(o) {
        return o && toString.call(o) === "[object RegExp]";
      }
      function isObject(o) {
        return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
      }
      function reEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, function(x) {
          if (x === "-") return "\\x2d";
          return "\\" + x;
        });
      }
      function reGroups(s) {
        var re = new RegExp("|" + s);
        return re.exec("").length - 1;
      }
      function reCapture(s) {
        return "(" + s + ")";
      }
      function reUnion(regexps) {
        if (!regexps.length) return "(?!)";
        var source = regexps.map(function(s) {
          return "(?:" + s + ")";
        }).join("|");
        return "(?:" + source + ")";
      }
      function regexpOrLiteral(obj) {
        if (typeof obj === "string") {
          return "(?:" + reEscape(obj) + ")";
        } else if (isRegExp(obj)) {
          if (obj.ignoreCase) throw new Error("RegExp /i flag not allowed");
          if (obj.global) throw new Error("RegExp /g flag is implied");
          if (obj.sticky) throw new Error("RegExp /y flag is implied");
          if (obj.multiline) throw new Error("RegExp /m flag is implied");
          return obj.source;
        } else {
          throw new Error("Not a pattern: " + obj);
        }
      }
      function pad(s, length) {
        if (s.length > length) {
          return s;
        }
        return Array(length - s.length + 1).join(" ") + s;
      }
      function lastNLines(string, numLines) {
        var position = string.length;
        var lineBreaks = 0;
        while (true) {
          var idx = string.lastIndexOf("\n", position - 1);
          if (idx === -1) {
            break;
          } else {
            lineBreaks++;
          }
          position = idx;
          if (lineBreaks === numLines) {
            break;
          }
          if (position === 0) {
            break;
          }
        }
        var startPosition = lineBreaks < numLines ? 0 : position + 1;
        return string.substring(startPosition).split("\n");
      }
      function objectToRules(object) {
        var keys = Object.getOwnPropertyNames(object);
        var result = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var thing = object[key];
          var rules = [].concat(thing);
          if (key === "include") {
            for (var j = 0; j < rules.length; j++) {
              result.push({ include: rules[j] });
            }
            continue;
          }
          var match = [];
          rules.forEach(function(rule) {
            if (isObject(rule)) {
              if (match.length) result.push(ruleOptions(key, match));
              result.push(ruleOptions(key, rule));
              match = [];
            } else {
              match.push(rule);
            }
          });
          if (match.length) result.push(ruleOptions(key, match));
        }
        return result;
      }
      function arrayToRules(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
          var obj = array[i];
          if (obj.include) {
            var include = [].concat(obj.include);
            for (var j = 0; j < include.length; j++) {
              result.push({ include: include[j] });
            }
            continue;
          }
          if (!obj.type) {
            throw new Error("Rule has no type: " + JSON.stringify(obj));
          }
          result.push(ruleOptions(obj.type, obj));
        }
        return result;
      }
      function ruleOptions(type2, obj) {
        if (!isObject(obj)) {
          obj = { match: obj };
        }
        if (obj.include) {
          throw new Error("Matching rules cannot also include states");
        }
        var options2 = {
          defaultType: type2,
          lineBreaks: !!obj.error || !!obj.fallback,
          pop: false,
          next: null,
          push: null,
          error: false,
          fallback: false,
          value: null,
          type: null,
          shouldThrow: false
        };
        for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) {
            options2[key] = obj[key];
          }
        }
        if (typeof options2.type === "string" && type2 !== options2.type) {
          throw new Error("Type transform cannot be a string (type '" + options2.type + "' for token '" + type2 + "')");
        }
        var match = options2.match;
        options2.match = Array.isArray(match) ? match : match ? [match] : [];
        options2.match.sort(function(a, b) {
          return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
        });
        return options2;
      }
      function toRules(spec) {
        return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
      }
      var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
      function compileRules(rules, hasStates) {
        var errorRule = null;
        var fast = /* @__PURE__ */ Object.create(null);
        var fastAllowed = true;
        var unicodeFlag = null;
        var groups = [];
        var parts = [];
        for (var i = 0; i < rules.length; i++) {
          if (rules[i].fallback) {
            fastAllowed = false;
          }
        }
        for (var i = 0; i < rules.length; i++) {
          var options2 = rules[i];
          if (options2.include) {
            throw new Error("Inheritance is not allowed in stateless lexers");
          }
          if (options2.error || options2.fallback) {
            if (errorRule) {
              if (!options2.fallback === !errorRule.fallback) {
                throw new Error("Multiple " + (options2.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options2.defaultType + "')");
              } else {
                throw new Error("fallback and error are mutually exclusive (for token '" + options2.defaultType + "')");
              }
            }
            errorRule = options2;
          }
          var match = options2.match.slice();
          if (fastAllowed) {
            while (match.length && typeof match[0] === "string" && match[0].length === 1) {
              var word = match.shift();
              fast[word.charCodeAt(0)] = options2;
            }
          }
          if (options2.pop || options2.push || options2.next) {
            if (!hasStates) {
              throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options2.defaultType + "')");
            }
            if (options2.fallback) {
              throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options2.defaultType + "')");
            }
          }
          if (match.length === 0) {
            continue;
          }
          fastAllowed = false;
          groups.push(options2);
          for (var j = 0; j < match.length; j++) {
            var obj = match[j];
            if (!isRegExp(obj)) {
              continue;
            }
            if (unicodeFlag === null) {
              unicodeFlag = obj.unicode;
            } else if (unicodeFlag !== obj.unicode && options2.fallback === false) {
              throw new Error("If one rule is /u then all must be");
            }
          }
          var pat = reUnion(match.map(regexpOrLiteral));
          var regexp = new RegExp(pat);
          if (regexp.test("")) {
            throw new Error("RegExp matches empty string: " + regexp);
          }
          var groupCount = reGroups(pat);
          if (groupCount > 0) {
            throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
          }
          if (!options2.lineBreaks && regexp.test("\n")) {
            throw new Error("Rule should declare lineBreaks: " + regexp);
          }
          parts.push(reCapture(pat));
        }
        var fallbackRule = errorRule && errorRule.fallback;
        var flags = hasSticky && !fallbackRule ? "ym" : "gm";
        var suffix = hasSticky || fallbackRule ? "" : "|";
        if (unicodeFlag === true) flags += "u";
        var combined = new RegExp(reUnion(parts) + suffix, flags);
        return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
      }
      function compile(rules) {
        var result = compileRules(toRules(rules));
        return new Lexer({ start: result }, "start");
      }
      function checkStateGroup(g, name3, map) {
        var state = g && (g.push || g.next);
        if (state && !map[state]) {
          throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name3 + "')");
        }
        if (g && g.pop && +g.pop !== 1) {
          throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name3 + "')");
        }
      }
      function compileStates(states, start) {
        var all = states.$all ? toRules(states.$all) : [];
        delete states.$all;
        var keys = Object.getOwnPropertyNames(states);
        if (!start) start = keys[0];
        var ruleMap = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          ruleMap[key] = toRules(states[key]).concat(all);
        }
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var rules = ruleMap[key];
          var included = /* @__PURE__ */ Object.create(null);
          for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (!rule.include) continue;
            var splice = [j, 1];
            if (rule.include !== key && !included[rule.include]) {
              included[rule.include] = true;
              var newRules = ruleMap[rule.include];
              if (!newRules) {
                throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
              }
              for (var k = 0; k < newRules.length; k++) {
                var newRule = newRules[k];
                if (rules.indexOf(newRule) !== -1) continue;
                splice.push(newRule);
              }
            }
            rules.splice.apply(rules, splice);
            j--;
          }
        }
        var map = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          map[key] = compileRules(ruleMap[key], true);
        }
        for (var i = 0; i < keys.length; i++) {
          var name3 = keys[i];
          var state = map[name3];
          var groups = state.groups;
          for (var j = 0; j < groups.length; j++) {
            checkStateGroup(groups[j], name3, map);
          }
          var fastKeys = Object.getOwnPropertyNames(state.fast);
          for (var j = 0; j < fastKeys.length; j++) {
            checkStateGroup(state.fast[fastKeys[j]], name3, map);
          }
        }
        return new Lexer(map, start);
      }
      function keywordTransform(map) {
        var isMap = typeof Map !== "undefined";
        var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
        var types4 = Object.getOwnPropertyNames(map);
        for (var i = 0; i < types4.length; i++) {
          var tokenType = types4[i];
          var item = map[tokenType];
          var keywordList = Array.isArray(item) ? item : [item];
          keywordList.forEach(function(keyword) {
            if (typeof keyword !== "string") {
              throw new Error("keyword must be string (in keyword '" + tokenType + "')");
            }
            if (isMap) {
              reverseMap.set(keyword, tokenType);
            } else {
              reverseMap[keyword] = tokenType;
            }
          });
        }
        return function(k) {
          return isMap ? reverseMap.get(k) : reverseMap[k];
        };
      }
      var Lexer = function(states, state) {
        this.startState = state;
        this.states = states;
        this.buffer = "";
        this.stack = [];
        this.reset();
      };
      Lexer.prototype.reset = function(data2, info) {
        this.buffer = data2 || "";
        this.index = 0;
        this.line = info ? info.line : 1;
        this.col = info ? info.col : 1;
        this.queuedToken = info ? info.queuedToken : null;
        this.queuedText = info ? info.queuedText : "";
        this.queuedThrow = info ? info.queuedThrow : null;
        this.setState(info ? info.state : this.startState);
        this.stack = info && info.stack ? info.stack.slice() : [];
        return this;
      };
      Lexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.col,
          state: this.state,
          stack: this.stack.slice(),
          queuedToken: this.queuedToken,
          queuedText: this.queuedText,
          queuedThrow: this.queuedThrow
        };
      };
      Lexer.prototype.setState = function(state) {
        if (!state || this.state === state) return;
        this.state = state;
        var info = this.states[state];
        this.groups = info.groups;
        this.error = info.error;
        this.re = info.regexp;
        this.fast = info.fast;
      };
      Lexer.prototype.popState = function() {
        this.setState(this.stack.pop());
      };
      Lexer.prototype.pushState = function(state) {
        this.stack.push(this.state);
        this.setState(state);
      };
      var eat = hasSticky ? function(re, buffer) {
        return re.exec(buffer);
      } : function(re, buffer) {
        var match = re.exec(buffer);
        if (match[0].length === 0) {
          return null;
        }
        return match;
      };
      Lexer.prototype._getGroup = function(match) {
        var groupCount = this.groups.length;
        for (var i = 0; i < groupCount; i++) {
          if (match[i + 1] !== void 0) {
            return this.groups[i];
          }
        }
        throw new Error("Cannot find token type for matched text");
      };
      function tokenToString() {
        return this.value;
      }
      Lexer.prototype.next = function() {
        var index = this.index;
        if (this.queuedGroup) {
          var token = this._token(this.queuedGroup, this.queuedText, index);
          this.queuedGroup = null;
          this.queuedText = "";
          return token;
        }
        var buffer = this.buffer;
        if (index === buffer.length) {
          return;
        }
        var group = this.fast[buffer.charCodeAt(index)];
        if (group) {
          return this._token(group, buffer.charAt(index), index);
        }
        var re = this.re;
        re.lastIndex = index;
        var match = eat(re, buffer);
        var error = this.error;
        if (match == null) {
          return this._token(error, buffer.slice(index, buffer.length), index);
        }
        var group = this._getGroup(match);
        var text2 = match[0];
        if (error.fallback && match.index !== index) {
          this.queuedGroup = group;
          this.queuedText = text2;
          return this._token(error, buffer.slice(index, match.index), index);
        }
        return this._token(group, text2, index);
      };
      Lexer.prototype._token = function(group, text2, offset) {
        var lineBreaks = 0;
        if (group.lineBreaks) {
          var matchNL = /\n/g;
          var nl = 1;
          if (text2 === "\n") {
            lineBreaks = 1;
          } else {
            while (matchNL.exec(text2)) {
              lineBreaks++;
              nl = matchNL.lastIndex;
            }
          }
        }
        var token = {
          type: typeof group.type === "function" && group.type(text2) || group.defaultType,
          value: typeof group.value === "function" ? group.value(text2) : text2,
          text: text2,
          toString: tokenToString,
          offset,
          lineBreaks,
          line: this.line,
          col: this.col
        };
        var size = text2.length;
        this.index += size;
        this.line += lineBreaks;
        if (lineBreaks !== 0) {
          this.col = size - nl + 1;
        } else {
          this.col += size;
        }
        if (group.shouldThrow) {
          var err = new Error(this.formatError(token, "invalid syntax"));
          throw err;
        }
        if (group.pop) this.popState();
        else if (group.push) this.pushState(group.push);
        else if (group.next) this.setState(group.next);
        return token;
      };
      if (typeof Symbol !== "undefined" && Symbol.iterator) {
        var LexerIterator = function(lexer3) {
          this.lexer = lexer3;
        };
        LexerIterator.prototype.next = function() {
          var token = this.lexer.next();
          return { value: token, done: !token };
        };
        LexerIterator.prototype[Symbol.iterator] = function() {
          return this;
        };
        Lexer.prototype[Symbol.iterator] = function() {
          return new LexerIterator(this);
        };
      }
      Lexer.prototype.formatError = function(token, message) {
        if (token == null) {
          var text2 = this.buffer.slice(this.index);
          var token = {
            text: text2,
            offset: this.index,
            lineBreaks: text2.indexOf("\n") === -1 ? 0 : 1,
            line: this.line,
            col: this.col
          };
        }
        var numLinesAround = 2;
        var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
        var lastDisplayedLine = token.line + numLinesAround;
        var lastLineDigits = String(lastDisplayedLine).length;
        var displayedLines = lastNLines(
          this.buffer,
          this.line - token.line + numLinesAround + 1
        ).slice(0, 5);
        var errorLines = [];
        errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
        errorLines.push("");
        for (var i = 0; i < displayedLines.length; i++) {
          var line2 = displayedLines[i];
          var lineNo = firstDisplayedLine + i;
          errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line2);
          if (lineNo === token.line) {
            errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
          }
        }
        return errorLines.join("\n");
      };
      Lexer.prototype.clone = function() {
        return new Lexer(this.states, this.state);
      };
      Lexer.prototype.has = function(tokenType) {
        return true;
      };
      return {
        compile,
        states: compileStates,
        error: Object.freeze({ error: true }),
        fallback: Object.freeze({ fallback: true }),
        keywords: keywordTransform
      };
    });
  }
});

// node_modules/@citation-js/date/lib/input.js
var require_input2 = __commonJS({
  "node_modules/@citation-js/date/lib/input.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _s, _e;
      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    var monthMap = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12
    };
    var dateRangeDelimiters = / (?:to|[-/]) | ?(?:--|[–—]) ?/;
    var dateRangePattern = /^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/;
    function getMonth(monthName) {
      return monthMap[monthName.toLowerCase().slice(0, 3)];
    }
    function parseEpoch(date) {
      const epoch = new Date(date);
      if (typeof date === "number" && !isNaN(epoch.valueOf())) {
        return [epoch.getFullYear(), epoch.getMonth() + 1, epoch.getDate()];
      } else {
        return null;
      }
    }
    var parseIso8601 = function parseIso86012(date) {
      const pattern = /^(\d{4}|[-+]\d{6,})-(\d{2})(?:-(\d{2}))?/;
      if (typeof date !== "string" || !pattern.test(date)) {
        return null;
      }
      const _date$match = date.match(pattern), _date$match2 = _slicedToArray(_date$match, 4), year = _date$match2[1], month = _date$match2[2], day = _date$match2[3];
      if (!+month) {
        return [year];
      } else if (!+day) {
        return [year, month];
      } else {
        return [year, month, day];
      }
    };
    var parseRfc2822 = function parseRfc28222(date) {
      const pattern = /^(?:[a-z]{3},\s*)?(\d{1,2}) ([a-z]{3}) (\d{4,})/i;
      if (typeof date !== "string" || !pattern.test(date)) {
        return null;
      }
      let _date$match3 = date.match(pattern), _date$match4 = _slicedToArray(_date$match3, 4), day = _date$match4[1], month = _date$match4[2], year = _date$match4[3];
      month = getMonth(month);
      if (!month) {
        return null;
      }
      return [year, month, day];
    };
    function parseAmericanDay(date) {
      const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2}(?:\d{2})?)/;
      if (typeof date !== "string" || !pattern.test(date)) {
        return null;
      }
      const _date$match5 = date.match(pattern), _date$match6 = _slicedToArray(_date$match5, 4), month = _date$match6[1], day = _date$match6[2], year = _date$match6[3];
      const check = new Date(year, month, day);
      if (check.getMonth() === parseInt(month)) {
        return [year, month, day];
      } else {
        return null;
      }
    }
    function parseDay(date) {
      const pattern = /^(\d{1,2})[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](-?\d+)/i;
      const reversePattern = /^(-?\d+)[ .\-/](\d{1,2}|[a-z]{3,10})[ .\-/](\d{1,2})/i;
      let year;
      let month;
      let day;
      if (typeof date !== "string") {
        return null;
      } else if (pattern.test(date)) {
        var _date$match7 = date.match(pattern);
        var _date$match8 = _slicedToArray(_date$match7, 4);
        day = _date$match8[1];
        month = _date$match8[2];
        year = _date$match8[3];
      } else if (reversePattern.test(date)) {
        var _date$match9 = date.match(reversePattern);
        var _date$match10 = _slicedToArray(_date$match9, 4);
        year = _date$match10[1];
        month = _date$match10[2];
        day = _date$match10[3];
      } else {
        return null;
      }
      if (getMonth(month)) {
        month = getMonth(month);
      } else if (isNaN(month)) {
        return null;
      }
      return [year, month, day];
    }
    function parseMonth2(date) {
      const pattern = /^([a-z]{3,10}|-?\d+)[^\w-]+([a-z]{3,10}|-?\d+)$/i;
      if (typeof date === "string" && pattern.test(date)) {
        const values = date.match(pattern).slice(1, 3);
        let month;
        if (getMonth(values[1])) {
          month = getMonth(values.pop());
        } else if (getMonth(values[0])) {
          month = getMonth(values.shift());
        } else if (values.some(isNaN) || values.every((value) => +value < 0)) {
          return null;
        } else if (+values[0] < 0) {
          month = values.pop();
        } else if (+values[0] > +values[1] && +values[1] > 0) {
          month = values.pop();
        } else {
          month = values.shift();
        }
        const year = values.pop();
        return [year, month];
      } else {
        return null;
      }
    }
    function parseYear(date) {
      if (typeof date !== "string") {
        return null;
      }
      const adBc = date.match(/^(\d+) ?(a\.?d\.?|b\.?c\.?)$/i);
      if (adBc) {
        const _adBc$slice = adBc.slice(1), _adBc$slice2 = _slicedToArray(_adBc$slice, 2), date2 = _adBc$slice2[0], suffix = _adBc$slice2[1];
        return [date2 * (suffix.toLowerCase()[0] === "a" ? 1 : -1)];
      } else if (/^-?\d+$/.test(date)) {
        return [date];
      } else {
        return null;
      }
    }
    function parseDateParts(value) {
      const dateParts2 = parseEpoch(value) || parseIso8601(value) || parseRfc2822(value) || parseAmericanDay(value) || parseDay(value) || parseMonth2(value) || parseYear(value);
      return dateParts2 && dateParts2.map((string) => parseInt(string));
    }
    function splitDateRange(range) {
      if (dateRangePattern.test(range)) {
        return range.match(dateRangePattern).slice(1, 3);
      } else {
        return range.split(dateRangeDelimiters);
      }
    }
    function parseDate3(rangeStart, rangeEnd) {
      const range = [];
      const rangeStartAsRange = typeof rangeStart === "string" && splitDateRange(rangeStart);
      if (rangeEnd) {
        range.push(rangeStart, rangeEnd);
      } else if (rangeStartAsRange && rangeStartAsRange.length === 2) {
        range.push(...rangeStartAsRange);
      } else {
        range.push(rangeStart);
      }
      const dateParts2 = range.map(parseDateParts);
      if (dateParts2.filter(Boolean).length === range.length) {
        return {
          "date-parts": dateParts2
        };
      } else {
        return {
          raw: rangeEnd ? range.join("/") : rangeStart
        };
      }
    }
    var _default = parseDate3;
    exports.default = _default;
  }
});

// node_modules/@citation-js/date/lib/output.js
var require_output2 = __commonJS({
  "node_modules/@citation-js/date/lib/output.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    function padStart(str, len, chr) {
      if (str.length >= len) {
        return str;
      }
      while (str.length < len) {
        str = chr + str;
      }
      return str.slice(-len);
    }
    var getDate = function getDate2(date, delimiter = "-") {
      if (!date["date-parts"]) {
        return date.raw;
      }
      const dateParts2 = date["date-parts"][0].map((part) => part.toString());
      switch (dateParts2.length) {
        case 3:
          dateParts2[2] = padStart(dateParts2[2], 2, "0");
        case 2:
          dateParts2[1] = padStart(dateParts2[1], 2, "0");
        case 1:
          dateParts2[0] = padStart(dateParts2[0], 4, "0");
          break;
      }
      return dateParts2.join(delimiter);
    };
    var _default = getDate;
    exports.default = _default;
  }
});

// node_modules/@citation-js/date/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@citation-js/date/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "format", {
      enumerable: true,
      get: function get5() {
        return _output.default;
      }
    });
    Object.defineProperty(exports, "parse", {
      enumerable: true,
      get: function get5() {
        return _input.default;
      }
    });
    var _input = _interopRequireDefault(require_input2());
    var _output = _interopRequireDefault(require_output2());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// node_modules/@citation-js/core/lib-mjs/Cite/log.js
var log_exports = {};
__export(log_exports, {
  currentVersion: () => currentVersion,
  retrieveLastVersion: () => retrieveLastVersion,
  retrieveVersion: () => retrieveVersion,
  save: () => save,
  undo: () => undo
});
function currentVersion() {
  return this.log.length;
}
function retrieveVersion(versnum = 1) {
  if (versnum <= 0 || versnum > this.currentVersion()) {
    return null;
  } else {
    const [data2, options2] = this.log[versnum - 1];
    const image = new this.constructor(JSON.parse(data2), JSON.parse(options2));
    image.log = this.log.slice(0, versnum);
    return image;
  }
}
function undo(number = 1) {
  return this.retrieveVersion(this.currentVersion() - number);
}
function retrieveLastVersion() {
  return this.retrieveVersion(this.currentVersion());
}
function save() {
  this.log.push([JSON.stringify(this.data), JSON.stringify(this._options)]);
  return this;
}

// node_modules/@citation-js/core/lib-mjs/Cite/options.js
var options_exports = {};
__export(options_exports, {
  defaultOptions: () => defaultOptions,
  options: () => options
});

// node_modules/@citation-js/core/lib-mjs/Cite/validate.js
var formats = ["real", "string"];
var types = ["json", "html", "string", "rtf"];
var styles = ["csl", "bibtex", "bibtxt", "citation-*", "ris", "ndjson"];
var wrapperTypes = ["string", "function"];
function validateOutputOptions(options2) {
  if (typeof options2 !== "object") {
    throw new TypeError("Options not an object!");
  }
  const {
    format: format9,
    type: type2,
    style,
    lang,
    append,
    prepend
  } = options2;
  if (format9 && !formats.includes(format9)) {
    throw new TypeError(`Option format ("${format9}") should be one of: ${formats}`);
  } else if (type2 && !types.includes(type2)) {
    throw new TypeError(`Option type ("${type2}") should be one of: ${types}`);
  } else if (style && !styles.includes(style) && !/^citation/.test(style)) {
    throw new TypeError(`Option style ("${style}") should be one of: ${styles}`);
  } else if (lang && typeof lang !== "string") {
    throw new TypeError(`Option lang should be a string, but is a ${typeof lang}`);
  } else if (prepend && !wrapperTypes.includes(typeof prepend)) {
    throw new TypeError(`Option prepend should be a string or a function, but is a ${typeof prepend}`);
  } else if (append && !wrapperTypes.includes(typeof append)) {
    throw new TypeError(`Option append should be a string or a function, but is a ${typeof append}`);
  }
  if (/^citation/.test(style) && type2 === "json") {
    throw new Error(`Combination type/style of json/citation-* is not valid: ${type2}/${style}`);
  }
  return true;
}
function validateOptions(options2) {
  if (typeof options2 !== "object") {
    throw new TypeError("Options should be an object");
  }
  if (options2.output) {
    validateOutputOptions(options2.output);
  } else if (options2.maxChainLength && typeof options2.maxChainLength !== "number") {
    throw new TypeError("Option maxChainLength should be a number");
  } else if (options2.forceType && typeof options2.forceType !== "string") {
    throw new TypeError("Option forceType should be a string");
  } else if (options2.generateGraph != null && typeof options2.generateGraph !== "boolean") {
    throw new TypeError("Option generateGraph should be a boolean");
  } else if (options2.strict != null && typeof options2.strict !== "boolean") {
    throw new TypeError("Option strict should be a boolean");
  } else if (options2.target != null && typeof options2.target !== "string") {
    throw new TypeError("Option target should be a boolean");
  }
  return true;
}

// node_modules/@citation-js/core/lib-mjs/Cite/options.js
var defaultOptions = {
  format: "real",
  type: "json",
  style: "csl",
  lang: "en-US"
};
function options(options2, log) {
  validateOutputOptions(options2);
  if (log) {
    this.save();
  }
  Object.assign(this._options, options2);
  return this;
}

// node_modules/@citation-js/core/lib-mjs/Cite/set.js
var set_exports = {};
__export(set_exports, {
  add: () => add2,
  addAsync: () => addAsync,
  reset: () => reset,
  set: () => set,
  setAsync: () => setAsync
});

// node_modules/@citation-js/core/lib-mjs/plugins/input/index.js
var input_exports = {};
__export(input_exports, {
  add: () => add,
  addDataParser: () => addDataParser,
  addTypeParser: () => addTypeParser,
  chain: () => chain,
  chainAsync: () => chainAsync,
  chainLink: () => chainLink,
  chainLinkAsync: () => chainLinkAsync,
  data: () => data,
  dataAsync: () => dataAsync,
  get: () => get,
  has: () => has,
  hasDataParser: () => hasDataParser,
  hasTypeParser: () => hasTypeParser,
  list: () => list,
  listDataParser: () => listDataParser,
  listTypeParser: () => listTypeParser,
  remove: () => remove,
  removeDataParser: () => removeDataParser,
  removeTypeParser: () => removeTypeParser,
  treeTypeParser: () => treeTypeParser,
  type: () => type,
  typeMatcher: () => typeMatcher,
  util: () => util
});

// node_modules/@citation-js/core/lib-mjs/plugins/input/dataType.js
var dataType_exports = {};
__export(dataType_exports, {
  dataTypeOf: () => dataTypeOf,
  typeOf: () => typeOf
});
function typeOf(thing) {
  switch (thing) {
    case void 0:
      return "Undefined";
    case null:
      return "Null";
    default:
      return thing.constructor.name;
  }
}
function dataTypeOf(thing) {
  switch (typeof thing) {
    case "string":
      return "String";
    case "object":
      if (Array.isArray(thing)) {
        return "Array";
      } else if (typeOf(thing) === "Object") {
        return "SimpleObject";
      } else if (typeOf(thing) !== "Null") {
        return "ComplexObject";
      }
    default:
      return "Primitive";
  }
}

// node_modules/@citation-js/core/lib-mjs/plugins/input/graph.js
var graph_exports = {};
__export(graph_exports, {
  applyGraph: () => applyGraph,
  removeGraph: () => removeGraph
});
function applyGraph(entry, graph) {
  if (entry._graph) {
    const index = graph.findIndex(({
      type: type2
    }) => type2 === "@else/list+object");
    if (index !== -1) {
      graph.splice(index + 1, 0, ...entry._graph.slice(0, -1));
    }
  }
  entry._graph = graph;
  return entry;
}
function removeGraph(entry) {
  delete entry._graph;
  return entry;
}

// node_modules/@citation-js/core/lib-mjs/plugins/input/parser.js
var parser_exports = {};
__export(parser_exports, {
  DataParser: () => DataParser,
  FormatParser: () => FormatParser,
  TypeParser: () => TypeParser
});

// node_modules/@citation-js/core/lib-mjs/logger.js
var logger = {
  _output(level, scope, msg) {
    this._log.push(scope, msg);
    if (this._levels.indexOf(level) < this._levels.indexOf(this.level)) {
      return;
    }
    this._console.log(scope, ...msg);
  },
  _console: null,
  _log: [],
  _levels: ["http", "debug", "unmapped", "info", "warn", "error", "silent"],
  level: "silent"
};
for (const level of logger._levels) {
  logger[level] = (scope, ...msg) => logger._output(level, scope, msg);
}
if (typeof console.Console === "function") {
  logger._console = new console.Console(process.stderr);
} else {
  logger._console = console;
}
var logger_default = logger;

// node_modules/@citation-js/core/lib-mjs/plugins/input/type.js
var types2 = {};
var dataTypes = {};
var unregExts = {};
function parseNativeTypes(input, dataType) {
  switch (dataType) {
    case "Array":
      if (input.length === 0 || input.every((entry) => type(entry) === "@csl/object")) {
        return "@csl/list+object";
      } else {
        return "@else/list+object";
      }
    case "SimpleObject":
    case "ComplexObject":
      return "@csl/object";
    default:
      return "@invalid";
  }
}
function matchType(typeList = [], data2) {
  for (const type2 of typeList) {
    if (types2[type2].predicate(data2)) {
      return matchType(types2[type2].extensions, data2) || type2;
    }
  }
}
function type(input) {
  const dataType = dataTypeOf(input);
  if (dataType === "Array" && input.length === 0) {
    return parseNativeTypes(input, dataType);
  }
  const match = matchType(dataTypes[dataType], input);
  return match || parseNativeTypes(input, dataType);
}
function addTypeParser(format9, {
  dataType,
  predicate,
  extends: extend
}) {
  let extensions = [];
  if (format9 in unregExts) {
    extensions = unregExts[format9];
    delete unregExts[format9];
    logger_default.debug("[core]", `Subclasses "${extensions}" finally registered to parent type "${format9}"`);
  }
  const object = {
    predicate,
    extensions
  };
  types2[format9] = object;
  if (extend) {
    const parentTypeParser = types2[extend];
    if (parentTypeParser) {
      parentTypeParser.extensions.push(format9);
    } else {
      if (!unregExts[extend]) {
        unregExts[extend] = [];
      }
      unregExts[extend].push(format9);
      logger_default.debug("[core]", `Subclass "${format9}" is waiting on parent type "${extend}"`);
    }
  } else {
    const typeList = dataTypes[dataType] || (dataTypes[dataType] = []);
    typeList.push(format9);
  }
}
function hasTypeParser(type2) {
  return Object.prototype.hasOwnProperty.call(types2, type2);
}
function removeTypeParser(type2) {
  delete types2[type2];
  const typeLists = [...Object.keys(dataTypes).map((key) => dataTypes[key]), ...Object.keys(types2).map((type3) => types2[type3].extensions).filter((list6) => list6.length > 0)];
  typeLists.forEach((typeList) => {
    const index = typeList.indexOf(type2);
    if (index > -1) {
      typeList.splice(index, 1);
    }
  });
}
function listTypeParser() {
  return Object.keys(types2);
}
function treeTypeParser() {
  const attachNode = (name3) => ({
    name: name3,
    children: types2[name3].extensions.map(attachNode)
  });
  return {
    name: "Type tree",
    children: Object.keys(dataTypes).map((name3) => ({
      name: name3,
      children: dataTypes[name3].map(attachNode)
    }))
  };
}
var typeMatcher = /^(?:@(.+?))(?:\/(?:(.+?)\+)?(?:(.+)))?$/;

// node_modules/@citation-js/core/lib-mjs/plugins/input/parser.js
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var TypeParser = class {
  constructor(data2) {
    _defineProperty(this, "validDataTypes", ["String", "Array", "SimpleObject", "ComplexObject", "Primitive"]);
    this.data = data2;
  }
  validateDataType() {
    const dataType = this.data.dataType;
    if (dataType && !this.validDataTypes.includes(dataType)) {
      throw new RangeError(`dataType was ${dataType}; expected one of ${this.validDataTypes}`);
    }
  }
  validateParseType() {
    const predicate = this.data.predicate;
    if (predicate && !(predicate instanceof RegExp || typeof predicate === "function")) {
      throw new TypeError(`predicate was ${typeof predicate}; expected RegExp or function`);
    }
  }
  validateTokenList() {
    const tokenList = this.data.tokenList;
    if (tokenList && typeof tokenList !== "object") {
      throw new TypeError(`tokenList was ${typeof tokenList}; expected object or RegExp`);
    }
  }
  validatePropertyConstraint() {
    const propertyConstraint = this.data.propertyConstraint;
    if (propertyConstraint && typeof propertyConstraint !== "object") {
      throw new TypeError(`propertyConstraint was ${typeof propertyConstraint}; expected array or object`);
    }
  }
  validateElementConstraint() {
    const elementConstraint = this.data.elementConstraint;
    if (elementConstraint && typeof elementConstraint !== "string") {
      throw new TypeError(`elementConstraint was ${typeof elementConstraint}; expected string`);
    }
  }
  validateExtends() {
    const extend = this.data.extends;
    if (extend && typeof extend !== "string") {
      throw new TypeError(`extends was ${typeof extend}; expected string`);
    }
  }
  validate() {
    if (this.data === null || typeof this.data !== "object") {
      throw new TypeError(`typeParser was ${typeof this.data}; expected object`);
    }
    this.validateDataType();
    this.validateParseType();
    this.validateTokenList();
    this.validatePropertyConstraint();
    this.validateElementConstraint();
    this.validateExtends();
  }
  parseTokenList() {
    let tokenList = this.data.tokenList;
    if (!tokenList) {
      return [];
    } else if (tokenList instanceof RegExp) {
      tokenList = {
        token: tokenList
      };
    }
    const {
      token,
      split = /\s+/,
      trim = true,
      every = true
    } = tokenList;
    const trimInput = (input) => trim ? input.trim() : input;
    const testTokens = every ? "every" : "some";
    const predicate = (input) => trimInput(input).split(split)[testTokens]((part) => token.test(part));
    return [predicate];
  }
  parsePropertyConstraint() {
    const constraints = [].concat(this.data.propertyConstraint || []);
    return constraints.map(({
      props,
      match,
      value
    }) => {
      props = [].concat(props);
      switch (match) {
        case "any":
        case "some":
          return (input) => props.some((prop) => prop in input && (!value || value(input[prop])));
        case "none":
          return (input) => !props.some((prop) => prop in input && (!value || value(input[prop])));
        case "every":
        default:
          return (input) => props.every((prop) => prop in input && (!value || value(input[prop])));
      }
    });
  }
  parseElementConstraint() {
    const constraint = this.data.elementConstraint;
    return !constraint ? [] : [(input) => input.every((entry) => type(entry) === constraint)];
  }
  parsePredicate() {
    if (this.data.predicate instanceof RegExp) {
      return [this.data.predicate.test.bind(this.data.predicate)];
    } else if (this.data.predicate) {
      return [this.data.predicate];
    } else {
      return [];
    }
  }
  getCombinedPredicate() {
    const predicates = [...this.parsePredicate(), ...this.parseTokenList(), ...this.parsePropertyConstraint(), ...this.parseElementConstraint()];
    if (predicates.length === 0) {
      return () => true;
    } else if (predicates.length === 1) {
      return predicates[0];
    } else {
      return (input) => predicates.every((predicate) => predicate(input));
    }
  }
  getDataType() {
    if (this.data.dataType) {
      return this.data.dataType;
    } else if (this.data.predicate instanceof RegExp) {
      return "String";
    } else if (this.data.tokenList) {
      return "String";
    } else if (this.data.elementConstraint) {
      return "Array";
    } else {
      return "Primitive";
    }
  }
  get dataType() {
    return this.getDataType();
  }
  get predicate() {
    return this.getCombinedPredicate();
  }
  get extends() {
    return this.data.extends;
  }
};
var DataParser = class {
  constructor(parser, {
    async: async2
  } = {}) {
    this.parser = parser;
    this.async = async2;
  }
  validate() {
    const parser = this.parser;
    if (typeof parser !== "function") {
      throw new TypeError(`parser was ${typeof parser}; expected function`);
    }
  }
};
var FormatParser = class {
  constructor(format9, parsers2 = {}) {
    this.format = format9;
    if (parsers2.parseType) {
      this.typeParser = new TypeParser(parsers2.parseType);
    }
    if (parsers2.parse) {
      this.dataParser = new DataParser(parsers2.parse, {
        async: false
      });
    }
    if (parsers2.parseAsync) {
      this.asyncDataParser = new DataParser(parsers2.parseAsync, {
        async: true
      });
    }
  }
  validateFormat() {
    const format9 = this.format;
    if (!typeMatcher.test(format9)) {
      throw new TypeError(`format name was "${format9}"; didn't match expected pattern`);
    }
  }
  validate() {
    this.validateFormat();
    if (this.typeParser) {
      this.typeParser.validate();
    }
    if (this.dataParser) {
      this.dataParser.validate();
    }
    if (this.asyncDataParser) {
      this.asyncDataParser.validate();
    }
  }
};

// node_modules/@citation-js/core/lib-mjs/plugins/input/csl.js
var csl_exports = {};
__export(csl_exports, {
  clean: () => parseCsl
});
var import_name = __toESM(require_lib());
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty2(e, r, t) {
  return (r = _toPropertyKey2(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey2(t) {
  var i = _toPrimitive2(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive2(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var NAME = 1;
var NAME_LIST = 2;
var DATE = 3;
var TYPE = 4;
var entryTypes = {
  article: true,
  "article-journal": true,
  "article-magazine": true,
  "article-newspaper": true,
  bill: true,
  book: true,
  broadcast: true,
  chapter: true,
  classic: true,
  collection: true,
  dataset: true,
  document: true,
  entry: true,
  "entry-dictionary": true,
  "entry-encyclopedia": true,
  event: true,
  figure: true,
  graphic: true,
  hearing: true,
  interview: true,
  legal_case: true,
  legislation: true,
  manuscript: true,
  map: true,
  motion_picture: true,
  musical_score: true,
  pamphlet: true,
  "paper-conference": true,
  patent: true,
  performance: true,
  periodical: true,
  personal_communication: true,
  post: true,
  "post-weblog": true,
  regulation: true,
  report: true,
  review: true,
  "review-book": true,
  software: true,
  song: true,
  speech: true,
  standard: true,
  thesis: true,
  treaty: true,
  webpage: true,
  "journal-article": "article-journal",
  "book-chapter": "chapter",
  "posted-content": "manuscript",
  "proceedings-article": "paper-conference",
  dissertation: "thesis"
};
var fieldTypes = {
  author: NAME_LIST,
  chair: NAME_LIST,
  "collection-editor": NAME_LIST,
  compiler: NAME_LIST,
  composer: NAME_LIST,
  "container-author": NAME_LIST,
  contributor: NAME_LIST,
  curator: NAME_LIST,
  director: NAME_LIST,
  editor: NAME_LIST,
  "editorial-director": NAME_LIST,
  "executive-producer": NAME_LIST,
  guest: NAME_LIST,
  host: NAME_LIST,
  interviewer: NAME_LIST,
  illustrator: NAME_LIST,
  narrator: NAME_LIST,
  organizer: NAME_LIST,
  "original-author": NAME_LIST,
  performer: NAME_LIST,
  producer: NAME_LIST,
  "reviewed-author": NAME_LIST,
  recipient: NAME_LIST,
  "script-writer": NAME_LIST,
  "series-creator": NAME_LIST,
  translator: NAME_LIST,
  accessed: DATE,
  "available-date": DATE,
  container: DATE,
  "event-date": DATE,
  issued: DATE,
  "original-date": DATE,
  submitted: DATE,
  type: TYPE,
  categories: "object",
  custom: "object",
  id: ["string", "number"],
  language: "string",
  journalAbbreviation: "string",
  shortTitle: "string",
  abstract: "string",
  annote: "string",
  archive: "string",
  archive_collection: "string",
  archive_location: "string",
  "archive-place": "string",
  authority: "string",
  "call-number": "string",
  "chapter-number": "string",
  "citation-number": "string",
  "citation-key": "string",
  "citation-label": "string",
  "collection-number": "string",
  "collection-title": "string",
  "container-title": "string",
  "container-title-short": "string",
  dimensions: "string",
  division: "string",
  DOI: "string",
  edition: ["string", "number"],
  event: "string",
  "event-title": "string",
  "event-place": "string",
  "first-reference-note-number": "string",
  genre: "string",
  ISBN: "string",
  ISSN: "string",
  issue: ["string", "number"],
  jurisdiction: "string",
  keyword: "string",
  locator: "string",
  medium: "string",
  note: "string",
  number: ["string", "number"],
  "number-of-pages": "string",
  "number-of-volumes": ["string", "number"],
  "original-publisher": "string",
  "original-publisher-place": "string",
  "original-title": "string",
  page: "string",
  "page-first": "string",
  "part-number": ["string", "number"],
  "part-title": "string",
  PMCID: "string",
  PMID: "string",
  printing: "string",
  publisher: "string",
  "publisher-place": "string",
  references: "string",
  "reviewed-title": "string",
  "reviewed-genre": "string",
  scale: "string",
  section: "string",
  source: "string",
  status: "string",
  supplement: ["string", "number"],
  title: "string",
  "title-short": "string",
  URL: "string",
  version: "string",
  volume: ["string", "number"],
  "volume-title": "string",
  "volume-title-short": "string",
  "year-suffix": "string"
};
function correctName(name3, bestGuessConversions) {
  if (typeof name3 === "object" && name3 !== null && (name3.literal || name3.given || name3.family)) {
    if (name3.ORCID || name3.orcid || name3._ORCID) {
      name3 = _objectSpread({
        _orcid: name3.ORCID || name3.orcid || name3._ORCID
      }, name3);
      delete name3.ORCID;
      delete name3.orcid;
      delete name3._ORCID;
    }
    return name3;
  } else if (!bestGuessConversions) {
    return void 0;
  } else if (typeof name3 === "string") {
    return (0, import_name.parse)(name3);
  }
}
function correctNameList(nameList, bestGuessConversions) {
  if (nameList instanceof Array) {
    const names = nameList.map((name3) => correctName(name3, bestGuessConversions)).filter(Boolean);
    return names.length ? names : void 0;
  }
}
function correctDateParts(dateParts2, bestGuessConversions) {
  if (dateParts2.every((part) => typeof part === "number")) {
    return dateParts2;
  } else if (!bestGuessConversions || dateParts2.some((part) => isNaN(parseInt(part)))) {
    return void 0;
  } else {
    return dateParts2.map((part) => parseInt(part));
  }
}
function correctDate(date, bestGuessConversions) {
  const dp = "date-parts";
  if (typeof date !== "object" || date === null) {
    return void 0;
  } else if (date[dp] instanceof Array && date[dp].every((part) => part instanceof Array)) {
    const range = date[dp].map((dateParts2) => correctDateParts(dateParts2, bestGuessConversions)).filter(Boolean);
    return range.length ? _objectSpread(_objectSpread({}, date), {}, {
      "date-parts": range
    }) : void 0;
  } else if (date instanceof Array && date.every((part) => part[dp] instanceof Array)) {
    const range = date.map((dateParts2) => correctDateParts(dateParts2[dp], bestGuessConversions)).filter(Boolean);
    return range.length ? {
      "date-parts": range
    } : void 0;
  } else if (date[dp] instanceof Array) {
    const dateParts2 = correctDateParts(date[dp], bestGuessConversions);
    return dateParts2 && {
      "date-parts": [dateParts2]
    };
  } else if ("literal" in date || "raw" in date) {
    return date;
  }
}
function correctType(type2, bestGuessConversions) {
  type2 = correctField("language", type2, bestGuessConversions);
  if (entryTypes[type2] === true) {
    return type2;
  }
  if (bestGuessConversions) {
    if (type2 in entryTypes) {
      return entryTypes[type2];
    } else if (typeof type2 === "string" && type2.toLowerCase() !== type2) {
      return correctType(type2.toLowerCase(), bestGuessConversions);
    }
  }
  return void 0;
}
function correctField(fieldName, value, bestGuessConversions) {
  const fieldType = [].concat(fieldTypes[fieldName]);
  switch (fieldTypes[fieldName]) {
    case NAME:
      return correctName(value, bestGuessConversions);
    case NAME_LIST:
      return correctNameList(value, bestGuessConversions);
    case DATE:
      return correctDate(value, bestGuessConversions);
    case TYPE:
      return correctType(value, bestGuessConversions);
  }
  if (bestGuessConversions) {
    if (typeof value === "string" && fieldType.includes("number") && !fieldType.includes("string") && !isNaN(+value)) {
      return parseFloat(value);
    } else if (typeof value === "number" && fieldType.includes("string") && !fieldType.includes("number")) {
      return value.toString();
    } else if (Array.isArray(value) && value.length) {
      return correctField(fieldName, value[0], bestGuessConversions);
    }
  }
  if (fieldType.includes(typeof value)) {
    return value;
  }
}
function parseCsl(data2, bestGuessConversions = true) {
  return data2.map(function(entry) {
    const clean2 = {};
    for (const field in entry) {
      const correction = correctField(field, entry[field], bestGuessConversions);
      if (correction !== void 0) {
        clean2[field] = correction;
      }
    }
    return clean2;
  });
}

// node_modules/@citation-js/core/lib-mjs/plugins/input/data.js
var parsers = {};
var asyncParsers = {};
var nativeParsers = {
  "@csl/object": (input) => [input],
  "@csl/list+object": (input) => input,
  "@else/list+object": (input) => input.map((item) => {
    const type2 = type(item);
    return data(item, type2);
  }).flat(),
  "@invalid": () => {
    throw new Error("This format is not supported or recognized");
  }
};
var nativeAsyncParsers = {
  "@else/list+object": (input) => Promise.all(input.map((item) => {
    const type2 = type(item);
    return dataAsync(item, type2);
  })).then((input2) => input2.flat())
};
function data(input, type2) {
  if (typeof parsers[type2] === "function") {
    return parsers[type2](input);
  } else if (typeof nativeParsers[type2] === "function") {
    return nativeParsers[type2](input);
  } else {
    throw new TypeError(`No synchronous parser found for ${type2}`);
  }
}
async function dataAsync(input, type2) {
  if (typeof asyncParsers[type2] === "function") {
    return asyncParsers[type2](input);
  } else if (typeof nativeAsyncParsers[type2] === "function") {
    return nativeAsyncParsers[type2](input);
  } else if (hasDataParser(type2, false)) {
    return data(input, type2);
  } else {
    throw new TypeError(`No parser found for ${type2}`);
  }
}
function addDataParser(format9, {
  parser,
  async: async2
}) {
  if (async2) {
    asyncParsers[format9] = parser;
  } else {
    parsers[format9] = parser;
  }
}
function hasDataParser(type2, async2) {
  return async2 ? asyncParsers[type2] || nativeAsyncParsers[type2] : parsers[type2] || nativeParsers[type2];
}
function removeDataParser(type2, async2) {
  delete (async2 ? asyncParsers : parsers)[type2];
}
function listDataParser(async2) {
  return Object.keys(async2 ? asyncParsers : parsers);
}

// node_modules/@citation-js/core/lib-mjs/plugins/input/register.js
var formats2 = {};
function add(format9, parsers2) {
  const formatParser = new FormatParser(format9, parsers2);
  formatParser.validate();
  const index = formats2[format9] || (formats2[format9] = {});
  if (formatParser.typeParser) {
    addTypeParser(format9, formatParser.typeParser);
    index.type = true;
  }
  if (formatParser.dataParser) {
    addDataParser(format9, formatParser.dataParser);
    index.data = true;
  }
  if (formatParser.asyncDataParser) {
    addDataParser(format9, formatParser.asyncDataParser);
    index.asyncData = true;
  }
  if (parsers2.outputs) {
    index.outputs = parsers2.outputs;
  }
}
function get(format9) {
  return formats2[format9];
}
function remove(format9) {
  const index = formats2[format9];
  if (!index) {
    return;
  }
  if (index.type) {
    removeTypeParser(format9);
  }
  if (index.data) {
    removeDataParser(format9);
  }
  if (index.asyncData) {
    removeDataParser(format9, true);
  }
  delete formats2[format9];
}
function has(format9) {
  return format9 in formats2;
}
function list() {
  return Object.keys(formats2);
}

// node_modules/@citation-js/core/lib-mjs/util/index.js
var util_exports = {};
__export(util_exports, {
  Grammar: () => Grammar,
  Register: () => register_default,
  TokenStack: () => stack_default,
  Translator: () => Translator,
  deepCopy: () => deepCopy_default,
  downgradeCsl: () => downgradeCsl,
  fetchFile: () => fetchFile,
  fetchFileAsync: () => fetchFileAsync,
  fetchId: () => fetchId_default,
  setUserAgent: () => setUserAgent,
  upgradeCsl: () => upgradeCsl
});

// node_modules/@citation-js/core/lib-mjs/util/csl.js
function ownKeys2(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys2(Object(t), true).forEach(function(r2) {
      _defineProperty3(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty3(e, r, t) {
  return (r = _toPropertyKey3(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey3(t) {
  var i = _toPrimitive3(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive3(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function upgradeCsl(item) {
  if (Array.isArray(item)) {
    return item.map(upgradeCsl);
  }
  item = _objectSpread2({}, item);
  if ("event" in item) {
    item["event-title"] = item.event;
    delete item.event;
  }
  if (item.type === "book" && "version" in item) {
    item.type = "software";
  }
  return item;
}
function downgradeCsl(item) {
  if (Array.isArray(item)) {
    return item.map(downgradeCsl);
  }
  item = _objectSpread2({}, item);
  if ("event-title" in item) {
    item.event = item["event-title"];
    delete item["event-title"];
  }
  if (item.type === "software") {
    item.type = "book";
  }
  return item;
}

// node_modules/@citation-js/core/lib-mjs/util/deepCopy.js
function deepCopy(value, seen = /* @__PURE__ */ new Set()) {
  if (typeof value !== "object" || value === null || value.constructor !== Object && value.constructor !== Array) {
    return value;
  }
  if (seen.has(value)) {
    throw new TypeError("Recursively copying circular structure");
  }
  seen.add(value);
  let copy;
  if (value.constructor === Array) {
    copy = value.map((value2) => deepCopy(value2, seen));
  } else {
    const object = {};
    for (const key in value) {
      object[key] = deepCopy(value[key], seen);
    }
    copy = object;
  }
  seen.delete(value);
  return copy;
}
var deepCopy_default = deepCopy;

// node_modules/@citation-js/core/lib-mjs/util/fetchFile.js
var import_sync_fetch_undici = __toESM(require_browser());

// node_modules/@citation-js/core/package.json
var package_default = {
  name: "@citation-js/core",
  version: "0.9.0",
  description: "Convert different bibliographic metadata sources",
  keywords: [
    "citation-js",
    "citation",
    "bibliography"
  ],
  author: "Lars Willighagen <lars.willighagen@gmail.com>",
  license: "MIT",
  main: "lib/index.js",
  module: "lib-mjs/index.js",
  types: "index.d.ts",
  directories: {
    lib: "src",
    test: "__tests__"
  },
  homepage: "https://citation.js.org/",
  repository: {
    type: "git",
    url: "https://github.com/citation-js/citation-js.git",
    directory: "packages/core"
  },
  bugs: {
    url: "https://github.com/citation-js/citation-js/issues"
  },
  engines: {
    node: ">=22.12.0"
  },
  files: [
    "lib",
    "lib-mjs",
    "index.d.ts"
  ],
  scripts: {
    test: "mocha -c -R dot -r @babel/register test/*.spec.js",
    "test:live": "TEST_MOCK_HTTP=false npm test",
    coverage: "BABEL_ENV=coverage nyc npm test && nyc report --reporter=text-lcov > coverage.lcov"
  },
  dependencies: {
    "@citation-js/date": "^0.5.0",
    "@citation-js/name": "^0.4.2",
    "sync-fetch-undici": "^0.7.1"
  },
  gitHead: "51a37ce28fd3508e5cc2957b7d17794cdbad8ed0"
};

// node_modules/@citation-js/core/lib-mjs/util/fetchFile.js
var isBrowser = typeof location !== "undefined" && typeof navigator !== "undefined";
var userAgent = `Citation.js/${package_default.version}`;
if (typeof process !== "undefined" && process && process.release && process.release.name === "node" && process.version) {
  userAgent += ` Node.js/${process.version}`;
}
function normaliseHeaders(headers) {
  const result = {};
  const entries = headers instanceof Headers || headers instanceof import_sync_fetch_undici.default.Headers ? Array.from(headers) : Object.entries(headers);
  for (const [name3, header] of entries) {
    result[name3.toLowerCase()] = header.toString();
  }
  return result;
}
function parseOpts(opts = {}) {
  const reqOpts = {
    headers: {
      accept: "*/*"
    },
    method: "GET",
    checkContentType: opts.checkContentType
  };
  if (userAgent && !isBrowser) {
    reqOpts.headers["user-agent"] = userAgent;
  }
  if (opts.body) {
    reqOpts.method = "POST";
    const isJson = typeof opts.body !== "string";
    reqOpts.body = isJson ? JSON.stringify(opts.body) : opts.body;
    reqOpts.headers["content-type"] = isJson ? "application/json" : "text/plain";
  }
  if (opts.headers) {
    Object.assign(reqOpts.headers, normaliseHeaders(opts.headers));
  }
  return reqOpts;
}
function sameType(request, response) {
  if (!request.accept || request.accept === "*/*" || !response["content-type"]) {
    return true;
  }
  const [a, b] = response["content-type"].split(";")[0].trim().split("/");
  return request.accept.split(",").map((type2) => type2.split(";")[0].trim().split("/")).some(([c, d]) => (c === a || c === "*") && (d === b || d === "*"));
}
function checkResponse(response, opts) {
  const {
    status,
    headers
  } = response;
  let error;
  if (status >= 400) {
    error = new Error(`Server responded with status code ${status}`);
  } else if (opts.checkContentType === true && !sameType(opts.headers, normaliseHeaders(headers))) {
    error = new Error(`Server responded with content-type ${headers.get("content-type")}`);
  }
  if (error) {
    error.status = status;
    error.headers = headers;
    error.body = response.body;
    throw error;
  }
  return response;
}
function fetchFile(url, opts) {
  const reqOpts = parseOpts(opts);
  logger_default.http("[core]", reqOpts.method, url, reqOpts);
  const response = checkResponse((0, import_sync_fetch_undici.default)(url, reqOpts), reqOpts);
  return response.text();
}
async function fetchFileAsync(url, opts) {
  const reqOpts = parseOpts(opts);
  logger_default.http("[core]", reqOpts.method, url, reqOpts);
  return fetch(url, reqOpts).then((response) => checkResponse(response, reqOpts)).then((response) => response.text());
}
function setUserAgent(newUserAgent) {
  userAgent = newUserAgent;
}

// node_modules/@citation-js/core/lib-mjs/util/fetchId.js
function fetchId(list6, prefix) {
  let id;
  while (id === void 0 || list6.includes(id)) {
    id = `${prefix}${Math.random().toString().slice(2)}`;
  }
  return id;
}
var fetchId_default = fetchId;

// node_modules/@citation-js/core/lib-mjs/util/stack.js
var TokenStack = class _TokenStack {
  constructor(array) {
    this.stack = array;
    this.index = 0;
    this.current = this.stack[this.index];
  }
  static getPatternText(pattern) {
    return `"${pattern instanceof RegExp ? pattern.source : pattern}"`;
  }
  static getMatchCallback(pattern) {
    if (Array.isArray(pattern)) {
      const matches = pattern.map(_TokenStack.getMatchCallback);
      return (token) => matches.some((matchCallback) => matchCallback(token));
    } else if (pattern instanceof Function) {
      return pattern;
    } else if (pattern instanceof RegExp) {
      return (token) => pattern.test(token);
    } else {
      return (token) => pattern === token;
    }
  }
  tokensLeft() {
    return this.stack.length - this.index;
  }
  matches(pattern) {
    return _TokenStack.getMatchCallback(pattern)(this.current, this.index, this.stack);
  }
  matchesSequence(sequence) {
    const part = this.stack.slice(this.index, this.index + sequence.length).join("");
    return typeof sequence === "string" ? part === sequence : sequence.every((pattern, index) => _TokenStack.getMatchCallback(pattern)(part[index]));
  }
  consumeToken(pattern = /^[\s\S]$/, {
    inverse = false,
    spaced = true
  } = {}) {
    if (spaced) {
      this.consumeWhitespace();
    }
    const token = this.current;
    const match = _TokenStack.getMatchCallback(pattern)(token, this.index, this.stack);
    if (match) {
      this.current = this.stack[++this.index];
    } else {
      throw new SyntaxError(`Unexpected token at index ${this.index}: Expected ${_TokenStack.getPatternText(pattern)}, got "${token}"`);
    }
    if (spaced) {
      this.consumeWhitespace();
    }
    return token;
  }
  consumeWhitespace(pattern = /^\s$/, {
    optional = true
  } = {}) {
    return this.consume(pattern, {
      min: +!optional
    });
  }
  consumeN(length) {
    if (this.tokensLeft() < length) {
      throw new SyntaxError("Not enough tokens left");
    }
    const start = this.index;
    while (length--) {
      this.current = this.stack[++this.index];
    }
    return this.stack.slice(start, this.index).join("");
  }
  consumeSequence(sequence) {
    if (this.matchesSequence(sequence)) {
      return this.consumeN(sequence.length);
    } else {
      throw new SyntaxError(`Expected "${sequence}", got "${this.consumeN(sequence.length)}"`);
    }
  }
  consume(pattern = /^[\s\S]$/, {
    min = 0,
    max = Infinity,
    inverse = false,
    tokenMap,
    tokenFilter
  } = {}) {
    const start = this.index;
    const match = _TokenStack.getMatchCallback(pattern);
    while (match(this.current, this.index, this.stack) !== inverse) {
      this.current = this.stack[++this.index];
    }
    let consumed = this.stack.slice(start, this.index);
    if (consumed.length < min) {
      throw new SyntaxError(`Not enough ${_TokenStack.getPatternText(pattern)}`);
    } else if (consumed.length > max) {
      throw new SyntaxError(`Too many ${_TokenStack.getPatternText(pattern)}`);
    }
    if (tokenMap) {
      consumed = consumed.map(tokenMap);
    }
    if (tokenFilter) {
      consumed = consumed.filter(tokenFilter);
    }
    return consumed.join("");
  }
};
var stack_default = TokenStack;

// node_modules/@citation-js/core/lib-mjs/util/register.js
var Register = class {
  constructor(data2 = {}) {
    this.data = data2;
  }
  set(key, value) {
    this.data[key] = value;
    return this;
  }
  add(...args) {
    return this.set(...args);
  }
  delete(key) {
    delete this.data[key];
    return this;
  }
  remove(...args) {
    return this.delete(...args);
  }
  get(key) {
    return this.data[key];
  }
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }
  list() {
    return Object.keys(this.data);
  }
};
var register_default = Register;

// node_modules/@citation-js/core/lib-mjs/util/grammar.js
var Grammar = class {
  constructor(rules, state) {
    this.rules = rules;
    this.defaultState = state;
    this.mainRule = Object.keys(rules)[0];
    this.log = [];
  }
  parse(iterator, mainRule) {
    this.lexer = iterator;
    this.token = this.lexer.next();
    this.state = deepCopy(this.defaultState);
    this.log = [];
    return this.consumeRule(mainRule || this.mainRule);
  }
  matchEndOfFile() {
    return !this.token;
  }
  matchToken(type2) {
    return this.token && type2 === this.token.type;
  }
  consumeToken(type2, optional) {
    const token = this.token;
    if (!type2 || token && token.type === type2) {
      this.token = this.lexer.next();
      return token;
    } else if (optional) {
      return void 0;
    } else {
      const got = token ? `"${token.type}"` : "EOF";
      const error = new SyntaxError(this.lexer.formatError(token, `expected "${type2}", got ${got}`));
      error.message += ` (${this.log.join("->")})`;
      throw error;
    }
  }
  consumeRule(rule) {
    this.log.push(rule);
    const result = this.rules[rule].call(this);
    this.log.pop();
    return result;
  }
};

// node_modules/@citation-js/core/lib-mjs/util/translator.js
function createConditionEval(condition) {
  return function conditionEval(input) {
    if (typeof condition === "boolean") {
      return condition;
    }
    return Object.keys(condition).every((prop) => {
      const value = condition[prop];
      if (value === true) {
        return prop in input;
      } else if (value === false) {
        return !(prop in input);
      } else if (typeof value === "function") {
        return value(input[prop]);
      } else if (Array.isArray(value)) {
        return value.includes(input[prop]);
      } else {
        return input[prop] === value;
      }
    });
  };
}
function parsePropStatement(prop, toSource) {
  let inputProp;
  let outputProp;
  let convert;
  let condition;
  if (typeof prop === "string") {
    inputProp = outputProp = prop;
  } else if (prop) {
    inputProp = toSource ? prop.target : prop.source;
    outputProp = toSource ? prop.source : prop.target;
    if (prop.convert) {
      convert = toSource ? prop.convert.toSource : prop.convert.toTarget;
    }
    if (prop.when) {
      condition = toSource ? prop.when.target : prop.when.source;
      if (condition != null) {
        condition = createConditionEval(condition);
      }
    }
  } else {
    return null;
  }
  inputProp = [].concat(inputProp).filter(Boolean);
  outputProp = [].concat(outputProp).filter(Boolean);
  return {
    inputProp,
    outputProp,
    convert,
    condition
  };
}
function createConverter(props, toSource) {
  toSource = toSource === Translator.CONVERT_TO_SOURCE;
  props = props.map((prop) => parsePropStatement(prop, toSource)).filter(Boolean);
  return function converter(input) {
    const output = {};
    for (const {
      inputProp,
      outputProp,
      convert,
      condition
    } of props) {
      if (outputProp.length === 0) {
        continue;
      } else if (condition && !condition(input)) {
        continue;
      } else if (inputProp.length !== 0 && inputProp.every((prop) => !(prop in input))) {
        continue;
      }
      let outputData = inputProp.map((prop) => input[prop]);
      if (convert) {
        try {
          const converted = convert.apply(input, outputData);
          outputData = outputProp.length === 1 ? [converted] : converted;
        } catch (cause) {
          throw new Error(`Failed to convert ${inputProp} to ${outputProp}`, {
            cause
          });
        }
      }
      outputProp.forEach((prop, index) => {
        const value = outputData[index];
        if (value !== void 0) {
          output[prop] = value;
        }
      });
    }
    return output;
  };
}
var Translator = class _Translator {
  constructor(props) {
    this.convertToSource = createConverter(props, _Translator.CONVERT_TO_SOURCE);
    this.convertToTarget = createConverter(props, _Translator.CONVERT_TO_TARGET);
  }
};
Translator.CONVERT_TO_SOURCE = Symbol("convert to source");
Translator.CONVERT_TO_TARGET = Symbol("convert to target");

// node_modules/@citation-js/core/lib-mjs/plugins/input/chain.js
function prepareParseGraph(graph) {
  return graph.reduce((array, next) => {
    const last = array[array.length - 1];
    if (last && last.type === next.type) {
      last.count = last.count + 1 || 2;
    } else {
      array.push(next);
    }
    return array;
  }, []).map((element) => (element.count > 1 ? element.count + "x " : "") + element.type).join(" -> ");
}
var ChainParser = class {
  constructor(input, options2 = {}) {
    this.options = Object.assign({
      generateGraph: true,
      forceType: type(input),
      maxChainLength: 10,
      strict: true,
      target: "@csl/list+object"
    }, options2);
    this.type = this.options.forceType;
    this.data = typeof input === "object" ? deepCopy_default(input) : input;
    this.graph = [{
      type: this.type,
      data: input
    }];
    this.iteration = 0;
  }
  iterate() {
    if (this.iteration !== 0) {
      const typeInfo = get(this.type);
      if (typeInfo && typeInfo.outputs) {
        this.type = typeInfo.outputs;
      } else {
        this.type = type(this.data);
      }
      this.graph.push({
        type: this.type
      });
    }
    if (this.error || this.type === this.options.target) {
      return false;
    } else if (this.iteration >= this.options.maxChainLength) {
      this.error = new RangeError(`Max. number of parsing iterations reached (${prepareParseGraph(this.graph)})`);
      return false;
    } else {
      this.iteration++;
      return true;
    }
  }
  end() {
    if (this.error) {
      logger_default.error("[core]", this.error.message);
      if (this.options.strict !== false) {
        throw this.error;
      } else {
        return [];
      }
    } else if (this.options.target === "@csl/list+object") {
      return upgradeCsl(this.data).map(this.options.generateGraph ? (entry) => applyGraph(entry, this.graph) : removeGraph);
    } else {
      return this.data;
    }
  }
};
var chain = (...args) => {
  const chain2 = new ChainParser(...args);
  while (chain2.iterate()) {
    try {
      chain2.data = data(chain2.data, chain2.type);
    } catch (e) {
      chain2.error = e;
    }
  }
  return chain2.end();
};
var chainLink = (input) => {
  const type2 = type(input);
  const output = type2.match(/array|object/) ? deepCopy_default(input) : input;
  return data(output, type2);
};
var chainAsync = async (...args) => {
  const chain2 = new ChainParser(...args);
  while (chain2.iterate()) {
    chain2.data = await dataAsync(chain2.data, chain2.type).catch((e) => {
      chain2.error = e;
    });
  }
  return chain2.end();
};
var chainLinkAsync = async (input) => {
  const type2 = type(input);
  const output = type2.match(/array|object/) ? deepCopy_default(input) : input;
  return dataAsync(output, type2);
};

// node_modules/@citation-js/core/lib-mjs/plugins/input/index.js
var util = Object.assign({}, dataType_exports, graph_exports, parser_exports, csl_exports);

// node_modules/@citation-js/core/lib-mjs/Cite/set.js
function add2(data2, options2 = {}, log = false) {
  if (options2 === true || log === true) {
    this.save();
  }
  this.data.push(...chain(data2, options2));
  this.data.filter((entry) => !Object.prototype.hasOwnProperty.call(entry, "id")).forEach((entry) => {
    entry.id = fetchId_default(this.getIds(), "temp_id_");
  });
  return this;
}
async function addAsync(data2, options2 = {}, log = false) {
  if (options2 === true || log === true) {
    this.save();
  }
  this.data.push(...await chainAsync(data2, options2));
  this.data.filter((entry) => !Object.prototype.hasOwnProperty.call(entry, "id")).forEach((entry) => {
    entry.id = fetchId_default(this.getIds(), "temp_id_");
  });
  return this;
}
function set(data2, options2 = {}, log = false) {
  if (options2 === true || log === true) {
    this.save();
  }
  this.data = [];
  return typeof options2 !== "boolean" ? this.add(data2, options2) : this.add(data2);
}
async function setAsync(data2, options2 = {}, log = false) {
  if (options2 === true || log === true) {
    this.save();
  }
  this.data = [];
  return typeof options2 !== "boolean" ? this.addAsync(data2, options2) : this.addAsync(data2);
}
function reset(log) {
  if (log) {
    this.save();
  }
  this.data = [];
  this._options = {};
  return this;
}

// node_modules/@citation-js/core/lib-mjs/Cite/sort.js
var sort_exports = {};
__export(sort_exports, {
  sort: () => sort
});

// node_modules/@citation-js/core/lib-mjs/plugin-common/output/label.js
function getLabel(entry) {
  if ("citation-label" in entry) {
    return entry["citation-label"];
  }
  let res = "";
  if (entry.author) {
    res += entry.author[0].family || entry.author[0].literal;
  }
  if (entry.issued && entry.issued["date-parts"] && entry.issued["date-parts"][0]) {
    res += entry.issued["date-parts"][0][0];
  }
  if (entry["year-suffix"]) {
    res += entry["year-suffix"];
  } else if (entry.title) {
    res += entry.title.replace(/<\/?.*?>/g, "").match(/^(?:(?:the|a|an)\s+)?(\S+)/i)[1];
  }
  return res;
}
var label_default = {
  label(data2) {
    return data2.reduce((object, entry) => {
      object[entry.id] = getLabel(entry);
      return object;
    }, {});
  }
};

// node_modules/@citation-js/core/lib-mjs/Cite/sort.js
var import_name2 = __toESM(require_lib());
function getComparisonValue(obj, prop, label = prop === "label") {
  let value = label ? getLabel(obj) : obj[prop];
  switch (prop) {
    case "author":
    case "editor":
      return value.map((name3) => name3.literal || name3.family || (0, import_name2.format)(name3));
    case "accessed":
    case "issued":
      return value["date-parts"][0];
    case "page":
      return value.split("-").map((num) => parseInt(num));
    case "edition":
    case "issue":
    case "volume":
      value = parseInt(value);
      return !isNaN(value) ? value : -Infinity;
    default:
      return value || -Infinity;
  }
}
function compareProp(entryA, entryB, prop, flip = /^!/.test(prop)) {
  prop = prop.replace(/^!/, "");
  const a = getComparisonValue(entryA, prop);
  const b = getComparisonValue(entryB, prop);
  return (flip ? -1 : 1) * (a > b ? 1 : a < b ? -1 : 0);
}
function getSortCallback(...props) {
  return (a, b) => {
    const keys = props.slice();
    let output = 0;
    while (!output && keys.length) {
      output = compareProp(a, b, keys.shift());
    }
    return output;
  };
}
function sort(method = [], log) {
  if (log) {
    this.save();
  }
  this.data.sort(typeof method === "function" ? method : getSortCallback(...method, "label"));
  return this;
}

// node_modules/@citation-js/core/lib-mjs/Cite/get.js
var get_exports = {};
__export(get_exports, {
  format: () => format2,
  get: () => get2,
  getIds: () => getIds
});

// node_modules/@citation-js/core/lib-mjs/plugins/output.js
var output_exports = {};
__export(output_exports, {
  add: () => add3,
  format: () => format,
  has: () => has2,
  list: () => list2,
  register: () => register,
  remove: () => remove2
});
function validate(name3, formatter) {
  if (typeof name3 !== "string") {
    throw new TypeError(`Invalid output format name, expected string, got ${typeof name3}`);
  } else if (typeof formatter !== "function") {
    throw new TypeError(`Invalid formatter, expected function, got ${typeof formatter}`);
  }
}
var register = new register_default();
function add3(name3, formatter) {
  validate(name3, formatter);
  register.set(name3, formatter);
}
function remove2(name3) {
  register.remove(name3);
}
function has2(name3) {
  return register.has(name3);
}
function list2() {
  return register.list();
}
function format(name3, data2, ...options2) {
  if (!register.has(name3)) {
    throw new Error(`Output format "${name3}" unavailable`);
  }
  return register.get(name3)(data2, ...options2);
}

// node_modules/@citation-js/core/lib-mjs/Cite/get.js
function getIds() {
  return this.data.map((entry) => entry.id);
}
function format2(format9, ...options2) {
  return format(format9, parseCsl(this.data), ...options2);
}
function get2(options2 = {}) {
  validateOutputOptions(options2);
  const parsedOptions = Object.assign({}, this.defaultOptions, this._options.output, options2);
  const {
    type: type2,
    style
  } = parsedOptions;
  const [styleType, styleFormat] = style.split("-");
  const newStyle = styleType === "citation" ? "bibliography" : styleType === "csl" ? "data" : styleType;
  const newType = type2 === "string" ? "text" : type2 === "json" ? "object" : type2;
  let formatOptions;
  switch (newStyle) {
    case "bibliography": {
      const {
        lang,
        append,
        prepend
      } = parsedOptions;
      formatOptions = {
        template: styleFormat,
        lang,
        format: newType,
        append,
        prepend
      };
      break;
    }
    case "data":
    case "bibtex":
    case "bibtxt":
    case "ndjson":
    case "ris":
      formatOptions = {
        type: newType
      };
      break;
    default:
      throw new Error(`Invalid style "${newStyle}"`);
  }
  const result = this.format(newStyle, Object.assign(formatOptions, options2._newOptions));
  const {
    format: format9
  } = parsedOptions;
  if (format9 === "real" && newType === "html" && typeof document !== "undefined" && typeof document.createElement === "function") {
    const tmp = document.createElement("div");
    tmp.innerHTML = result;
    return tmp.firstChild;
  } else if (format9 === "string" && typeof result === "object") {
    return JSON.stringify(result);
  } else {
    return result;
  }
}

// node_modules/@citation-js/core/lib-mjs/Cite/static.js
var static_exports = {};
__export(static_exports, {
  async: () => async_default,
  validateOptions: () => validateOptions,
  validateOutputOptions: () => validateOutputOptions
});

// node_modules/@citation-js/core/lib-mjs/Cite/async.js
function async(data2, options2, callback) {
  if (typeof options2 === "function" && !callback) {
    callback = options2;
    options2 = void 0;
  }
  const promise = new this().setAsync(data2, options2);
  if (typeof callback === "function") {
    promise.then(callback);
    return void 0;
  } else {
    return promise;
  }
}
var async_default = async;

// node_modules/@citation-js/core/lib-mjs/Cite/index.js
function Cite(data2, options2 = {}) {
  if (!(this instanceof Cite)) {
    return new Cite(data2, options2);
  }
  this._options = options2;
  this.log = [];
  this.data = [];
  this.set(data2, options2);
  this.options(options2);
  return this;
}
Object.assign(Cite.prototype, log_exports, options_exports, set_exports, sort_exports, get_exports);
Cite.prototype[Symbol.iterator] = function* () {
  yield* this.data;
};
Object.assign(Cite, static_exports);
var Cite_default = Cite;

// node_modules/@citation-js/core/lib-mjs/plugins/index.js
var plugins_exports = {};
__export(plugins_exports, {
  add: () => add6,
  config: () => config_exports,
  dict: () => dict_exports,
  has: () => has5,
  input: () => input_exports,
  list: () => list5,
  output: () => output_exports,
  remove: () => remove5
});

// node_modules/@citation-js/core/lib-mjs/plugins/dict.js
var dict_exports = {};
__export(dict_exports, {
  add: () => add4,
  get: () => get3,
  has: () => has3,
  list: () => list3,
  register: () => register2,
  remove: () => remove3
});
function validate2(name3, dict) {
  if (typeof name3 !== "string") {
    throw new TypeError(`Invalid dict name, expected string, got ${typeof name3}`);
  } else if (typeof dict !== "object") {
    throw new TypeError(`Invalid dict, expected object, got ${typeof dict}`);
  }
  for (const entryName in dict) {
    const entry = dict[entryName];
    if (!Array.isArray(entry) || entry.some((part) => typeof part !== "string")) {
      throw new TypeError(`Invalid dict entry "${entryName}", expected array of strings`);
    }
  }
}
var register2 = new register_default({
  html: {
    bibliographyContainer: ['<div class="csl-bib-body">', "</div>"],
    entry: ['<div class="csl-entry">', "</div>"],
    list: ['<ul style="list-style-type:none">', "</ul>"],
    listItem: ["<li>", "</li>"]
  },
  text: {
    bibliographyContainer: ["", "\n"],
    entry: ["", "\n"],
    list: ["\n", ""],
    listItem: ["	", "\n"]
  }
});
function add4(name3, dict) {
  validate2(name3, dict);
  register2.set(name3, dict);
}
function remove3(name3) {
  register2.remove(name3);
}
function has3(name3) {
  return register2.has(name3);
}
function list3() {
  return register2.list();
}
function get3(name3) {
  if (!register2.has(name3)) {
    throw new Error(`Dict "${name3}" unavailable`);
  }
  return register2.get(name3);
}

// node_modules/@citation-js/core/lib-mjs/plugins/config.js
var config_exports = {};
__export(config_exports, {
  add: () => add5,
  get: () => get4,
  has: () => has4,
  list: () => list4,
  remove: () => remove4
});
var configs = {};
function add5(ref3, config) {
  configs[ref3] = config;
}
function get4(ref3) {
  return configs[ref3];
}
function has4(ref3) {
  return Object.prototype.hasOwnProperty.call(configs, ref3);
}
function remove4(ref3) {
  delete configs[ref3];
}
function list4() {
  return Object.keys(configs);
}

// node_modules/@citation-js/core/lib-mjs/plugins/index.js
var registers = {
  input: input_exports,
  output: output_exports,
  dict: dict_exports,
  config: config_exports
};
var indices = {};
function add6(ref3, plugins = {}) {
  const mainIndex = indices[ref3] = {};
  for (const type2 in plugins) {
    if (type2 === "config") {
      mainIndex.config = {
        [ref3]: plugins.config
      };
      registers.config.add(ref3, plugins.config);
      continue;
    }
    const typeIndex = mainIndex[type2] = {};
    const typePlugins = plugins[type2];
    for (const name3 in typePlugins) {
      const typePlugin = typePlugins[name3];
      typeIndex[name3] = true;
      registers[type2].add(name3, typePlugin);
    }
  }
}
function remove5(ref3) {
  const mainIndex = indices[ref3];
  for (const type2 in mainIndex) {
    const typeIndex = mainIndex[type2];
    for (const name3 in typeIndex) {
      registers[type2].remove(name3);
    }
  }
  delete indices[ref3];
}
function has5(ref3) {
  return ref3 in indices;
}
function list5() {
  return Object.keys(indices);
}

// node_modules/@citation-js/core/lib-mjs/plugin-common/input/empty.js
function parse() {
  return [];
}

// node_modules/@citation-js/core/lib-mjs/plugin-common/input/json.js
var substituters = [[/((?:\[|:|,)\s*)'((?:\\'|[^'])*?[^\\])?'(?=\s*(?:\]|}|,))/g, '$1"$2"'], [/((?:(?:"|]|}|\/[gmiuys]|\.|(?:\d|\.|-)*\d)\s*,|{)\s*)(?:"([^":\n]+?)"|'([^":\n]+?)'|([^":\n]+?))(\s*):/g, '$1"$2$3$4"$5:']];
function parseJSON(str) {
  if (typeof str !== "string") {
    return JSON.parse(str);
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    logger_default.debug("[plugin-common]", "Invalid JSON, switching to experimental parser");
    substituters.forEach(([regex, subst]) => {
      str = str.replace(regex, subst);
    });
    return JSON.parse(str);
  }
}

// node_modules/@citation-js/core/lib-mjs/plugin-common/input/jquery.js
function parse2(input) {
  return input.val() || input.text() || input.html();
}

// node_modules/@citation-js/core/lib-mjs/plugin-common/input/html.js
function parse3(input) {
  return input.value || input.textContent;
}

// node_modules/@citation-js/core/lib-mjs/plugin-common/input/index.js
var ref = "@else";
var formats3 = {
  "@empty/text": {
    parse,
    parseType: {
      dataType: "String",
      predicate: (input) => input === ""
    }
  },
  "@empty/whitespace+text": {
    parse,
    parseType: {
      dataType: "String",
      predicate: /^\s+$/
    }
  },
  "@empty": {
    parse,
    parseType: {
      dataType: "Primitive",
      predicate: (input) => input == null
    }
  },
  "@else/json": {
    parse: parseJSON,
    parseType: {
      dataType: "String",
      predicate: /^\s*(\{[\S\s]*\}|\[[\S\s]*\])\s*$/
    }
  },
  "@else/url": {
    parseType: {
      dataType: "String",
      predicate: /^https?:\/\/(([\w-]+\.)*[\w-]+)(:\d+)?(\/[^?/]*)*(\?[^#]*)?(#.*)?$/i
    }
  },
  "@else/jquery": {
    parse: parse2,
    parseType: {
      dataType: "ComplexObject",
      predicate(input) {
        return typeof jQuery !== "undefined" && input instanceof jQuery;
      }
    }
  },
  "@else/html": {
    parse: parse3,
    parseType: {
      dataType: "ComplexObject",
      predicate(input) {
        return typeof HTMLElement !== "undefined" && input instanceof HTMLElement;
      }
    }
  }
};

// node_modules/@citation-js/core/lib-mjs/plugin-common/output/json.js
function appendCommas(string, index, array) {
  return string + (index < array.length - 1 ? "," : "");
}
function getJsonObject(src, dict) {
  const isArray = Array.isArray(src);
  let entries;
  if (isArray) {
    entries = src.map((entry) => getJsonValue(entry, dict));
  } else {
    entries = Object.keys(src).filter((prop) => JSON.stringify(src[prop])).map((prop) => `"${prop}": ${getJsonValue(src[prop], dict)}`);
  }
  entries = entries.map(appendCommas).map((entry) => dict.listItem.join(entry));
  entries = dict.list.join(entries.join(""));
  return isArray ? `[${entries}]` : `{${entries}}`;
}
function getJsonValue(src, dict) {
  if (typeof src === "object" && src !== null) {
    if (src.length === 0) {
      return "[]";
    } else if (Object.keys(src).length === 0) {
      return "{}";
    } else {
      return getJsonObject(src, dict);
    }
  } else {
    return JSON.stringify(src);
  }
}
function getJson(src, dict) {
  let entries = src.map((entry) => getJsonObject(entry, dict));
  entries = entries.map(appendCommas).map((entry) => dict.entry.join(entry));
  entries = entries.join("");
  return dict.bibliographyContainer.join(`[${entries}]`);
}
var json_default = {
  data(data2, {
    type: type2,
    format: format9 = type2 || "text",
    version: version2 = "1.0.2"
  } = {}) {
    if (version2 < "1.0.2") {
      data2 = downgradeCsl(data2);
    }
    if (format9 === "object") {
      return deepCopy_default(data2);
    } else if (format9 === "text") {
      return JSON.stringify(data2, null, 2);
    } else {
      logger_default.warn("[core]", "This feature (JSON output with special formatting) is unstable. See https://github.com/larsgw/citation.js/issues/144");
      return getJson(data2, dict_exports.get(format9));
    }
  },
  ndjson(data2, {
    version: version2 = "1.0.2"
  } = {}) {
    if (version2 < "1.0.2") {
      data2 = downgradeCsl(data2);
    }
    return data2.map((entry) => JSON.stringify(entry)).join("\n");
  }
};

// node_modules/@citation-js/core/lib-mjs/plugin-common/output/index.js
var output_default = Object.assign({}, json_default, label_default);

// node_modules/@citation-js/core/lib-mjs/plugin-common/index.js
add6(ref, {
  input: formats3,
  output: output_default
});

// node_modules/@citation-js/core/lib-mjs/index.js
var version = package_default.version;

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/file.js
var import_moo = __toESM(require_moo());

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/biblatexTypes.json
var biblatexTypes_default = {
  source: {
    article: "article-journal",
    book: "book",
    mvbook: "book",
    inbook: "chapter",
    bookinbook: "book",
    booklet: "book",
    collection: "book",
    mvcollection: "book",
    incollection: "chapter",
    dataset: "dataset",
    manual: "report",
    misc: "document",
    online: "webpage",
    patent: "patent",
    periodical: "periodical",
    proceedings: "book",
    mvproceedings: "book",
    inproceedings: "paper-conference",
    reference: "book",
    mvreference: "book",
    inreference: "entry",
    report: "report",
    software: "software",
    thesis: "thesis",
    unpublished: "manuscript",
    artwork: "graphic",
    audio: "song",
    image: "figure",
    jurisdiction: "legal_case",
    legislation: "legislation",
    legal: "treaty",
    letter: "personal_communication",
    movie: "motion_picture",
    music: "musical_score",
    performance: "performance",
    review: "review",
    standard: "standard",
    video: "motion_picture",
    conference: "paper-conference",
    electronic: "webpage",
    mastersthesis: "thesis",
    phdthesis: "thesis",
    techreport: "report",
    www: "webpage"
  },
  target: {
    article: "article",
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    bill: "legislation",
    book: "book",
    broadcast: "audio",
    chapter: "inbook",
    classic: "unpublished",
    collection: "misc",
    dataset: "dataset",
    document: "misc",
    entry: "inreference",
    "entry-dictionary": "inreference",
    "entry-encyclopedia": "inreference",
    event: "misc",
    figure: "artwork",
    graphic: "artwork",
    hearing: "legal",
    interview: "audio",
    legal_case: "jurisdiction",
    legislation: "legislation",
    manuscript: "unpublished",
    motion_picture: "movie",
    musical_score: "music",
    "paper-conference": "inproceedings",
    patent: "patent",
    performance: "performance",
    periodical: "periodical",
    personal_communication: "letter",
    post: "online",
    "post-weblog": "online",
    regulation: "legal",
    report: "report",
    review: "review",
    "review-book": "review",
    software: "software",
    song: "music",
    speech: "audio",
    standard: "standard",
    thesis: "thesis",
    treaty: "legal",
    webpage: "online"
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/bibtexTypes.json
var bibtexTypes_default = {
  source: {
    article: "article-journal",
    book: "book",
    booklet: "book",
    conference: "paper-conference",
    inbook: "chapter",
    incollection: "chapter",
    inproceedings: "paper-conference",
    manual: "report",
    mastersthesis: "thesis",
    misc: "document",
    phdthesis: "thesis",
    proceedings: "book",
    techreport: "report",
    unpublished: "manuscript"
  },
  target: {
    article: "article",
    "article-journal": "article",
    "article-magazine": "article",
    "article-newspaper": "article",
    book: "book",
    chapter: "inbook",
    manuscript: "unpublished",
    "paper-conference": "inproceedings",
    report: "techreport",
    review: "article",
    "review-book": "article"
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/constants.js
var constants_exports = {};
__export(constants_exports, {
  argumentCommands: () => argumentCommands,
  commands: () => commands,
  defaultStrings: () => defaultStrings,
  diacritics: () => diacritics,
  fieldTypes: () => fieldTypes2,
  formatting: () => formatting,
  formattingCommands: () => formattingCommands,
  formattingEnvs: () => formattingEnvs,
  ligaturePattern: () => ligaturePattern,
  ligatures: () => ligatures,
  mathCommands: () => mathCommands,
  mathScriptFormatting: () => mathScriptFormatting,
  mathScripts: () => mathScripts,
  required: () => required,
  sentenceCaseLanguages: () => sentenceCaseLanguages
});

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/required.json
var required_default = {
  biblatex: {
    article: [
      "author",
      "title",
      "journaltitle",
      [
        "year",
        "date"
      ]
    ],
    book: [
      "author",
      "title",
      [
        "year",
        "date"
      ]
    ],
    mvbook: [
      "author",
      "title",
      [
        "year",
        "date"
      ]
    ],
    inbook: [
      "author",
      "title",
      "booktitle",
      [
        "year",
        "date"
      ]
    ],
    booklet: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "year",
        "date"
      ]
    ],
    collection: [
      "editor",
      "title",
      [
        "year",
        "date"
      ]
    ],
    mvcollection: [
      "editor",
      "title",
      [
        "year",
        "date"
      ]
    ],
    incollection: [
      "author",
      "title",
      "booktitle",
      [
        "year",
        "date"
      ]
    ],
    dataset: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "year",
        "date"
      ]
    ],
    online: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "year",
        "date"
      ],
      [
        "doi",
        "eprint",
        "url"
      ]
    ],
    patent: [
      "author",
      "title",
      "number",
      [
        "year",
        "date"
      ]
    ],
    periodical: [
      "editor",
      "title",
      [
        "year",
        "date"
      ]
    ],
    proceedings: [
      "title",
      [
        "year",
        "date"
      ]
    ],
    mvproceedings: [
      "title",
      [
        "year",
        "date"
      ]
    ],
    inproceedings: [
      "author",
      "title",
      "booktitle",
      [
        "year",
        "date"
      ]
    ],
    report: [
      "author",
      "title",
      "type",
      "institution",
      [
        "year",
        "date"
      ]
    ],
    thesis: [
      "author",
      "title",
      "type",
      "institution",
      [
        "year",
        "date"
      ]
    ],
    unpublished: [
      "author",
      "title",
      [
        "year",
        "date"
      ]
    ],
    conference: [
      "author",
      "title",
      "booktitle",
      [
        "year",
        "date"
      ]
    ],
    electronic: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "year",
        "date"
      ],
      [
        "doi",
        "eprint",
        "url"
      ]
    ],
    mastersthesis: [
      "author",
      "title",
      "institution",
      [
        "year",
        "date"
      ]
    ],
    phdthesis: [
      "author",
      "title",
      "institution",
      [
        "year",
        "date"
      ]
    ],
    techreport: [
      "author",
      "title",
      "institution",
      [
        "year",
        "date"
      ]
    ],
    www: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "year",
        "date"
      ],
      [
        "doi",
        "eprint",
        "url"
      ]
    ]
  },
  bibtex: {
    article: [
      "author",
      "title",
      "journal",
      "year"
    ],
    book: [
      [
        "author",
        "editor"
      ],
      "title",
      "publisher",
      "year"
    ],
    booklet: [
      "title"
    ],
    inbook: [
      [
        "author",
        "editor"
      ],
      "title",
      [
        "chapter",
        "pages"
      ],
      "publisher",
      "year"
    ],
    incollection: [
      "author",
      "title",
      "booktitle",
      "publisher",
      "year"
    ],
    inproceedings: [
      "author",
      "title",
      "booktitle",
      "year"
    ],
    mastersthesis: [
      "author",
      "title",
      "school",
      "year"
    ],
    phdthesis: [
      "author",
      "title",
      "school",
      "year"
    ],
    proceedings: [
      "title",
      "year"
    ],
    techreport: [
      "author",
      "title",
      "institution",
      "year"
    ],
    unpublished: [
      "author",
      "title",
      "note"
    ]
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/fieldTypes.json
var fieldTypes_default = {
  abstract: ["field", "literal"],
  addendum: ["field", "literal"],
  afterword: ["list", "name"],
  annotation: ["field", "literal"],
  annotator: ["list", "name"],
  author: ["list", "name"],
  authortype: ["field", "key"],
  bookauthor: ["list", "name"],
  bookpagination: ["field", "key"],
  booksubtitle: ["field", "literal"],
  booktitle: ["field", "title"],
  booktitleaddon: ["field", "literal"],
  chapter: ["field", "literal"],
  commentator: ["list", "name"],
  date: ["field", "date"],
  doi: ["field", "verbatim"],
  edition: ["field", "literal"],
  editor: ["list", "name"],
  editora: ["list", "name"],
  editorb: ["list", "name"],
  editorc: ["list", "name"],
  editortype: ["field", "key"],
  editoratype: ["field", "key"],
  editorbtype: ["field", "key"],
  editorctype: ["field", "key"],
  eid: ["field", "literal"],
  entrysubtype: ["field", "literal"],
  eprint: ["field", "verbatim"],
  eprintclass: ["field", "literal"],
  eprinttype: ["field", "literal"],
  eventdate: ["field", "date"],
  eventtitle: ["field", "title"],
  eventtitleaddon: ["field", "literal"],
  file: ["field", "verbatim"],
  foreword: ["list", "name"],
  holder: ["list", "name"],
  howpublished: ["field", "literal"],
  indextitle: ["field", "literal"],
  institution: ["list", "literal"],
  introduction: ["list", "name"],
  isan: ["field", "literal"],
  isbn: ["field", "literal"],
  ismn: ["field", "literal"],
  isrn: ["field", "literal"],
  issn: ["field", "literal"],
  issue: ["field", "literal"],
  issuesubtitle: ["field", "literal"],
  issuetitle: ["field", "literal"],
  iswc: ["field", "literal"],
  journalsubtitle: ["field", "literal"],
  journaltitle: ["field", "literal"],
  label: ["field", "literal"],
  language: ["list", "key"],
  library: ["field", "literal"],
  location: ["list", "literal"],
  mainsubtitle: ["field", "literal"],
  maintitle: ["field", "title"],
  maintitleaddon: ["field", "literal"],
  month: ["field", "literal"],
  nameaddon: ["field", "literal"],
  note: ["field", "literal"],
  number: ["field", "literal"],
  organization: ["list", "literal"],
  origdate: ["field", "date"],
  origlanguage: ["list", "key"],
  origlocation: ["list", "literal"],
  origpublisher: ["list", "literal"],
  origtitle: ["field", "title"],
  pages: ["field", "range"],
  pagetotal: ["field", "literal"],
  pagination: ["field", "key"],
  part: ["field", "literal"],
  publisher: ["list", "literal"],
  pubstate: ["field", "key"],
  reprinttitle: ["field", "literal"],
  series: ["field", "title"],
  shortauthor: ["list", "name"],
  shorteditor: ["list", "name"],
  shorthand: ["field", "literal"],
  shorthandintro: ["field", "literal"],
  shortjournal: ["field", "literal"],
  shortseries: ["field", "literal"],
  shorttitle: ["field", "title"],
  subtitle: ["field", "literal"],
  title: ["field", "title"],
  titleaddon: ["field", "literal"],
  translator: ["list", "name"],
  type: ["field", "title"],
  url: ["field", "uri"],
  urldate: ["field", "date"],
  venue: ["field", "literal"],
  version: ["field", "literal"],
  volume: ["field", "integer"],
  volumes: ["field", "integer"],
  year: ["field", "literal"],
  crossref: ["field", "entry key"],
  entryset: ["separated", "literal"],
  execute: ["field", "code"],
  gender: ["field", "gender"],
  langid: ["field", "identifier"],
  langidopts: ["field", "literal"],
  ids: ["separated", "entry key"],
  indexsorttitle: ["field", "literal"],
  keywords: ["separated", "literal"],
  options: ["separated", "options"],
  presort: ["field", "string"],
  related: ["separated", "literal"],
  relatedoptions: ["separated", "literal"],
  relatedtype: ["field", "identifier"],
  relatedstring: ["field", "literal"],
  sortkey: ["field", "literal"],
  sortname: ["list", "name"],
  sortshorthand: ["field", "literal"],
  sorttitle: ["field", "literal"],
  sortyear: ["field", "integer"],
  xdata: ["separated", "entry key"],
  xref: ["field", "entry key"],
  namea: ["list", "name"],
  nameb: ["list", "name"],
  namec: ["list", "name"],
  nameatype: ["field", "key"],
  namebtype: ["field", "key"],
  namectype: ["field", "key"],
  lista: ["list", "literal"],
  listb: ["list", "literal"],
  listc: ["list", "literal"],
  listd: ["list", "literal"],
  liste: ["list", "literal"],
  listf: ["list", "literal"],
  usera: ["field", "literal"],
  userb: ["field", "literal"],
  userc: ["field", "literal"],
  userd: ["field", "literal"],
  usere: ["field", "literal"],
  userf: ["field", "literal"],
  verba: ["field", "literal"],
  verbb: ["field", "literal"],
  verbc: ["field", "literal"],
  address: ["list", "literal"],
  annote: ["field", "literal"],
  archiveprefix: ["field", "literal"],
  journal: ["field", "literal"],
  key: ["field", "literal"],
  pdf: ["field", "verbatim"],
  primaryclass: ["field", "literal"],
  school: ["list", "literal"],
  numpages: ["field", "integer"],
  pmid: ["field", "literal"],
  pmcid: ["field", "literal"]
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/unicode.json
var unicode_default = { diacritics: { "`": "\u0300", "'": "\u0301", "^": "\u0302", "~": "\u0303", "=": "\u0304", u: "\u0306", ".": "\u0307", '"': "\u0308", r: "\u030A", H: "\u030B", v: "\u030C", b: "\u0332", d: "\u0323", c: "\u0327", k: "\u0328", t: "\u0361", textcommabelow: "\u0326" }, commands: { textquotesingle: "'", textasciigrave: "`", textquotedbl: '"', textdollar: "$", textless: "<", textgreater: ">", textbackslash: "\\", textasciicircum: "^", textunderscore: "_", textbraceleft: "{", textbar: "|", textbraceright: "}", textasciitilde: "~", textexclamdown: "\xA1", textcent: "\xA2", textsterling: "\xA3", textcurrency: "\xA4", textyen: "\xA5", textbrokenbar: "\xA6", textsection: "\xA7", textasciidieresis: "\xA8", textcopyright: "\xA9", textordfeminine: "\xAA", guillemetleft: "\xAB", guillemotleft: "\xAB", textlnot: "\xAC", textregistered: "\xAE", textasciimacron: "\xAF", textdegree: "\xB0", textpm: "\xB1", texttwosuperior: "\xB2", textthreesuperior: "\xB3", textasciiacute: "\xB4", textmu: "\xB5", textparagraph: "\xB6", textperiodcentered: "\xB7", textonesuperior: "\xB9", textordmasculine: "\xBA", guillemetright: "\xBB", guillemotright: "\xBB", textonequarter: "\xBC", textonehalf: "\xBD", textthreequarters: "\xBE", textquestiondown: "\xBF", AE: "\xC6", DH: "\xD0", texttimes: "\xD7", O: "\xD8", TH: "\xDE", ss: "\xDF", ae: "\xE6", dh: "\xF0", textdiv: "\xF7", o: "\xF8", th: "\xFE", DJ: "\u0110", dj: "\u0111", i: "\u0131", IJ: "\u0132", ij: "\u0133", L: "\u0141", l: "\u0142", NG: "\u014A", ng: "\u014B", OE: "\u0152", oe: "\u0153", textflorin: "\u0192", j: "\u0237", textasciicaron: "\u02C7", textasciibreve: "\u02D8", textacutedbl: "\u02DD", textgravedbl: "\u02F5", texttildelow: "\u02F7", textbaht: "\u0E3F", SS: "\u1E9E", textcompwordmark: "\u200C", textendash: "\u2013", textemdash: "\u2014", textbardbl: "\u2016", textquoteleft: "\u2018", textquoteright: "\u2019", quotesinglbase: "\u201A", textquotedblleft: "\u201C", textquotedblright: "\u201D", quotedblbase: "\u201E", textdagger: "\u2020", textdaggerdbl: "\u2021", textbullet: "\u2022", textellipsis: "\u2026", textperthousand: "\u2030", textpertenthousand: "\u2031", guilsinglleft: "\u2039", guilsinglright: "\u203A", textreferencemark: "\u203B", textinterrobang: "\u203D", textfractionsolidus: "\u2044", textlquill: "\u2045", textrquill: "\u2046", textdiscount: "\u2052", textcolonmonetary: "\u20A1", textlira: "\u20A4", textnaira: "\u20A6", textwon: "\u20A9", textdong: "\u20AB", texteuro: "\u20AC", textpeso: "\u20B1", textcelsius: "\u2103", textnumero: "\u2116", textcircledP: "\u2117", textrecipe: "\u211E", textservicemark: "\u2120", texttrademark: "\u2122", textohm: "\u2126", textmho: "\u2127", textestimated: "\u212E", textleftarrow: "\u2190", textuparrow: "\u2191", textrightarrow: "\u2192", textdownarrow: "\u2193", textminus: "\u2212", Hwithstroke: "\u0126", hwithstroke: "\u0127", textasteriskcentered: "\u2217", textsurd: "\u221A", textlangle: "\u2329", textrangle: "\u232A", textblank: "\u2422", textvisiblespace: "\u2423", textopenbullet: "\u25E6", textbigcircle: "\u25EF", textmusicalnote: "\u266A", textmarried: "\u26AD", textdivorced: "\u26AE", textinterrobangdown: "\u2E18", textcommabelow: null, copyright: "\xA9" }, mathCommands: { Gamma: "\u0393", Delta: "\u0394", Theta: "\u0398", Lambda: "\u039B", Xi: "\u039E", Pi: "\u03A0", Sigma: "\u03A3", Phi: "\u03A6", Psi: "\u03A8", Omega: "\u03A9", alpha: "\u03B1", beta: "\u03B2", gamma: "\u03B3", delta: "\u03B4", varepsilon: "\u03B5", zeta: "\u03B6", eta: "\u03B7", theta: "\u03B8", iota: "\u03B9", kappa: "\u03BA", lambda: "\u03BB", mu: "\u03BC", nu: "\u03BD", xi: "\u03BE", pi: "\u03C0", rho: "\u03C1", varsigma: "\u03C2", sigma: "\u03C3", tau: "\u03C4", upsilon: "\u03C5", varphi: "\u03C6", chi: "\u03C7", psi: "\u03C8", omega: "\u03C9", vartheta: "\u03D1", Upsilon: "\u03D2", phi: "\u03D5", varpi: "\u03D6", varrho: "\u03F1", epsilon: "\u03F5" } };

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/constants.js
var required = required_default;
var fieldTypes2 = fieldTypes_default;
var diacritics = unicode_default.diacritics;
var commands = unicode_default.commands;
var mathCommands = unicode_default.mathCommands;
var defaultStrings = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
  acmcs: "ACM Computing Surveys",
  acta: "Acta Informatica",
  cacm: "Communications of the ACM",
  ibmjrd: "IBM Journal of Research and Development",
  ibmsj: "IBM Systems Journal",
  ieeese: "IEEE Transactions on Software Engineering",
  ieeetc: "IEEE Transactions on Computers",
  ieeetcad: "IEEE Transactions on Computer-Aided Design of Integrated Circuits",
  ipl: "Information Processing Letters",
  jacm: "Journal of the ACM",
  jcss: "Journal of Computer and System Sciences",
  scp: "Science of Computer Programming",
  sicomp: "SIAM Journal on Computing",
  tocs: "ACM Transactions on Computer Systems",
  tods: "ACM Transactions on Database Systems",
  tog: "ACM Transactions on Graphics",
  toms: "ACM Transactions on Mathematical Software",
  toois: "ACM Transactions on Office Information Systems",
  toplas: "ACM Transactions on Programming Languages and Systems",
  tcs: "Theoretical Computer Science"
};
var formattingEnvs = {
  it: "italics",
  itshape: "italics",
  sl: "italics",
  slshape: "italics",
  em: "italics",
  bf: "bold",
  bfseries: "bold",
  sc: "smallcaps",
  scshape: "smallcaps",
  rm: void 0,
  sf: void 0,
  tt: void 0
};
var formattingCommands = {
  textit: "italics",
  textsl: "italics",
  emph: "italics",
  mkbibitalic: "italics",
  mkbibemph: "italics",
  textbf: "bold",
  strong: "bold",
  mkbibbold: "bold",
  textsc: "smallcaps",
  textsuperscript: "superscript",
  textsubscript: "subscript",
  enquote: "quotes",
  mkbibquote: "quotes",
  textmd: void 0,
  textrm: void 0,
  textsf: void 0,
  texttt: void 0,
  textup: void 0
};
var formatting = {
  italics: ["<i>", "</i>"],
  bold: ["<b>", "</b>"],
  superscript: ["<sup>", "</sup>"],
  subscript: ["<sub>", "</sub>"],
  smallcaps: ['<span style="font-variant:small-caps;">', "</span>"],
  nocase: ['<span class="nocase">', "</span>"],
  quotes: ["\u201C", "\u201D"]
};
var argumentCommands = {
  ElsevierGlyph(glyph) {
    return String.fromCharCode(parseInt(glyph, 16));
  },
  href(url, text2) {
    return url;
  },
  url(url) {
    return url;
  }
};
var ligaturePattern = /---?|''|``|~/g;
var ligatures = {
  "--": "\u2013",
  "---": "\u2014",
  "``": "\u201C",
  "''": "\u201D",
  "~": "\xA0"
};
var mathScriptFormatting = {
  "^": "superscript",
  sp: "superscript",
  _: "subscript",
  sb: "subscript",
  mathrm: void 0
};
var mathScripts = {
  "^": {
    "0": "\u2070",
    "1": "\xB9",
    "2": "\xB2",
    "3": "\xB3",
    "4": "\u2074",
    "5": "\u2075",
    "6": "\u2076",
    "7": "\u2077",
    "8": "\u2078",
    "9": "\u2079",
    "+": "\u207A",
    "-": "\u207B",
    "=": "\u207C",
    "(": "\u207D",
    ")": "\u207E",
    "i": "\u2071",
    "n": "\u207F"
  },
  "_": {
    "0": "\u2080",
    "1": "\u2081",
    "2": "\u2082",
    "3": "\u2083",
    "4": "\u2084",
    "5": "\u2085",
    "6": "\u2086",
    "7": "\u2087",
    "8": "\u2088",
    "9": "\u2089",
    "+": "\u208A",
    "-": "\u208B",
    "=": "\u208C",
    "(": "\u208D",
    ")": "\u208E",
    "a": "\u2090",
    "e": "\u2091",
    "o": "\u2092",
    "x": "\u2093",
    "\u0259": "\u2094",
    "h": "\u2095",
    "k": "\u2096",
    "l": "\u2097",
    "m": "\u2098",
    "n": "\u2099",
    "s": "\u209A",
    "p": "\u209B",
    "t": "\u209C"
  }
};
var sentenceCaseLanguages = ["american", "british", "canadian", "english", "australian", "newzealand", "usenglish", "ukenglish", "en", "eng", "en-au", "en-bz", "en-ca", "en-cb", "en-gb", "en-ie", "en-jm", "en-nz", "en-ph", "en-tt", "en-us", "en-za", "en-zw", "anglais"];

// node_modules/@citation-js/plugin-bibtex/lib-mjs/config.js
var config_default = {
  constants: constants_exports,
  types: {
    biblatex: biblatexTypes_default,
    bibtex: bibtexTypes_default
  },
  parse: {
    biblatex: true,
    strict: false,
    sentenceCase: "never"
  },
  format: {
    useIdAsLabel: false,
    checkLabel: true,
    asciiOnly: true
  },
  biber: {
    annotationMarker: "+an",
    namedAnnotationMarker: ":"
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/file.js
function ownKeys3(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread3(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys3(Object(t), true).forEach(function(r2) {
      _defineProperty4(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty4(e, r, t) {
  return (r = _toPropertyKey4(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey4(t) {
  var i = _toPrimitive4(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive4(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var identifier = /[a-zA-Z_][a-zA-Z0-9_:+-]*/;
var whitespace = {
  comment: /%.*/,
  whitespace: {
    match: /\s+/,
    lineBreaks: true
  }
};
var lexer = import_moo.default.states({
  main: {
    junk: {
      match: /@[cC][oO][mM][mM][eE][nN][tT].+|[^@]+/,
      lineBreaks: true
    },
    at: {
      match: "@",
      push: "entry"
    }
  },
  entry: _objectSpread3(_objectSpread3({}, whitespace), {}, {
    otherEntryType: {
      match: /[sS][tT][rR][iI][nN][gG]|[pP][rR][eE][aA][mM][bB][lL][eE]/,
      next: "otherEntryContents"
    },
    dataEntryType: {
      match: identifier,
      next: "dataEntryContents"
    }
  }),
  otherEntryContents: _objectSpread3(_objectSpread3({}, whitespace), {}, {
    lbrace: {
      match: /[{(]/,
      next: "fields"
    }
  }),
  dataEntryContents: _objectSpread3(_objectSpread3({}, whitespace), {}, {
    lbrace: {
      match: /[{(]/,
      next: "dataEntryContents"
    },
    label: /[^,\s]+/,
    comma: {
      match: ",",
      next: "fields"
    }
  }),
  fields: _objectSpread3(_objectSpread3({}, whitespace), {}, {
    identifier,
    number: /-?\d+/,
    hash: "#",
    equals: "=",
    comma: ",",
    quote: {
      match: '"',
      push: "quotedLiteral"
    },
    lbrace: {
      match: "{",
      push: "bracedLiteral"
    },
    rbrace: {
      match: /[})]/,
      pop: true
    }
  }),
  quotedLiteral: {
    lbrace: {
      match: "{",
      push: "bracedLiteral"
    },
    quote: {
      match: '"',
      pop: true
    },
    text: {
      match: /(?:\\[\\{]|[^{"])+/,
      lineBreaks: true
    }
  },
  bracedLiteral: {
    lbrace: {
      match: "{",
      push: "bracedLiteral"
    },
    rbrace: {
      match: "}",
      pop: true
    },
    text: {
      match: /(?:\\[\\{}]|[^{}])+/,
      lineBreaks: true
    }
  }
});
var delimiters = {
  "(": ")",
  "{": "}"
};
var bibtexGrammar = new util_exports.Grammar({
  Main() {
    const entries = [];
    while (true) {
      while (this.matchToken("junk")) {
        this.consumeToken("junk");
      }
      if (this.matchEndOfFile()) {
        break;
      }
      entries.push(this.consumeRule("Entry"));
    }
    return entries.filter(Boolean);
  },
  _() {
    let oldToken;
    while (oldToken !== this.token) {
      oldToken = this.token;
      this.consumeToken("whitespace", true);
      this.consumeToken("comment", true);
    }
  },
  Entry() {
    this.consumeToken("at");
    this.consumeRule("_");
    const type2 = (this.matchToken("otherEntryType") ? this.consumeToken("otherEntryType") : this.consumeToken("dataEntryType")).value.toLowerCase();
    this.consumeRule("_");
    const openBrace = this.consumeToken("lbrace").value;
    this.consumeRule("_");
    let result;
    if (type2 === "string") {
      const [key, value] = this.consumeRule("Field");
      this.state.strings[key] = value;
    } else if (type2 === "preamble") {
      this.consumeRule("Expression");
    } else {
      const label = this.consumeToken("label").value;
      this.consumeRule("_");
      this.consumeToken("comma");
      this.consumeRule("_");
      const entryBody = this.consumeRule("EntryBody");
      result = _objectSpread3({
        type: type2,
        label
      }, entryBody);
    }
    this.consumeRule("_");
    const closeBrace = this.consumeToken("rbrace").value;
    if (closeBrace !== delimiters[openBrace]) {
      logger_default.warn("[plugin-bibtex]", `entry started with "${openBrace}", but ends with "${closeBrace}"`);
    }
    return result;
  },
  EntryBody() {
    const output = {
      properties: {}
    };
    while (this.matchToken("identifier")) {
      const [field, value] = this.consumeRule("Field");
      let annotationField;
      let annotationName = "default";
      if (field.endsWith(config_default.biber.annotationMarker)) {
        annotationField = field.slice(0, -config_default.biber.annotationMarker.length);
      } else if (field.includes(config_default.biber.annotationMarker + config_default.biber.namedAnnotationMarker)) {
        [annotationField, annotationName] = field.split(config_default.biber.annotationMarker + config_default.biber.namedAnnotationMarker);
      }
      if (annotationField) {
        if (!output.annotations) {
          output.annotations = {};
        }
        if (!output.annotations[annotationField]) {
          output.annotations[annotationField] = {};
        }
        output.annotations[annotationField][annotationName] = value;
      } else {
        output.properties[field] = value;
      }
      this.consumeRule("_");
      if (this.consumeToken("comma", true)) {
        this.consumeRule("_");
      } else {
        break;
      }
    }
    return output;
  },
  Field() {
    const field = this.consumeToken("identifier").value.toLowerCase();
    this.consumeRule("_");
    this.consumeToken("equals");
    this.consumeRule("_");
    const value = this.consumeRule("Expression");
    return [field, value];
  },
  Expression() {
    let output = this.consumeRule("ExpressionPart");
    this.consumeRule("_");
    while (this.matchToken("hash")) {
      this.consumeToken("hash");
      this.consumeRule("_");
      output += this.consumeRule("ExpressionPart").toString();
      this.consumeRule("_");
    }
    return output;
  },
  ExpressionPart() {
    if (this.matchToken("identifier")) {
      return this.state.strings[this.consumeToken("identifier").value.toLowerCase()] || "";
    } else if (this.matchToken("number")) {
      return parseInt(this.consumeToken("number"));
    } else if (this.matchToken("quote")) {
      return this.consumeRule("QuoteString");
    } else {
      return this.consumeRule("BracketString");
    }
  },
  QuoteString() {
    let output = "";
    this.consumeToken("quote");
    while (!this.matchToken("quote")) {
      output += this.consumeRule("Text");
    }
    this.consumeToken("quote");
    return output;
  },
  BracketString() {
    let output = "";
    this.consumeToken("lbrace");
    while (!this.matchToken("rbrace")) {
      output += this.consumeRule("Text");
    }
    this.consumeToken("rbrace");
    return output;
  },
  Text() {
    if (this.matchToken("lbrace")) {
      return `{${this.consumeRule("BracketString")}}`;
    } else {
      return this.consumeToken("text").value;
    }
  }
}, {
  strings: defaultStrings
});
function parse4(text2) {
  return bibtexGrammar.parse(lexer.reset(text2));
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/bibtxt.js
var bibTxtRegex = {
  splitEntries: /\n\s*(?=\[)/g,
  parseEntry: /^\[(.+?)\]\s*(?:\n([\s\S]+))?$/,
  splitPairs: /((?=.)\s)*\n\s*/g,
  splitPair: /:(.*)/
};
var parseBibTxtEntry = (entry) => {
  const [, label, pairs] = entry.match(bibTxtRegex.parseEntry) || [];
  if (!label || !pairs) {
    return {};
  } else {
    const out = {
      type: "book",
      label,
      properties: {}
    };
    pairs.trim().split(bibTxtRegex.splitPairs).filter((v) => v).forEach((pair) => {
      let [key, value] = pair.split(bibTxtRegex.splitPair);
      if (value) {
        key = key.trim();
        value = value.trim();
        if (key === "type") {
          out.type = value;
        } else {
          out.properties[key] = value;
        }
      }
    });
    return out;
  }
};
var parseBibTxt = (src) => src.trim().split(bibTxtRegex.splitEntries).map(parseBibTxtEntry);

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/shared.js
var stopWords = /* @__PURE__ */ new Set(["the", "a", "an"]);
var unsafeChars = /(?:<\/?.*?>|[\u0020-\u002F\u003A-\u0040\u005B-\u005E\u0060\u007B-\u007F])+/g;
var unicode = /[^\u0020-\u007F]+/g;
function isLabelSafe(text2) {
  return !config_default.format.checkLabel || !text2.match(unsafeChars);
}
function formatLabelFromId(id) {
  if (id === null) {
    return "null";
  } else if (id === void 0) {
    return "undefined";
  } else if (config_default.format.checkLabel) {
    return id.toString().replace(unsafeChars, "");
  } else {
    return id.toString();
  }
}
function firstWord(text2) {
  if (!text2) {
    return "";
  } else {
    return text2.normalize("NFKD").replace(unicode, "").split(unsafeChars).find((word) => word.length && !stopWords.has(word.toLowerCase()));
  }
}
var name = new util_exports.Translator([{
  source: "given",
  target: "given"
}, {
  source: "family",
  target: "family"
}, {
  source: "suffix",
  target: "suffix"
}, {
  source: "prefix",
  target: "non-dropping-particle"
}, {
  source: "family",
  target: "literal",
  when: {
    source: false,
    target: {
      family: false,
      given: false
    }
  }
}]);
var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var TYPE2 = "BibTeX type";
var LABEL = "BibTeX label";
var MONTHS = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  sept: 9
};
var TYPE_KEYS = {
  bathesis: "Bachelor's thesis",
  mathesis: "Master's thesis",
  phdthesis: "PhD thesis",
  candthesis: "Candidate thesis",
  techreport: "technical report",
  resreport: "research report",
  software: "computer software",
  datacd: "data cd",
  audiocd: "audio cd",
  patent: "patent",
  patentde: "German patent",
  patenteu: "European patent",
  patentfr: "French patent",
  patentuk: "British patent",
  patentus: "U.S. patent",
  patreq: "patent request",
  patreqde: "German patent request",
  patreqeu: "European patent request",
  patreqfr: "French patent request",
  patrequk: "British patent request",
  patrequs: "U.S. patent request"
};
var STANDARD_NUMBERS_PATTERN = /(^(?:ISAN )?(?:[0-9a-f]{4}-){4}[0-9a-z](?:-(?:[0-9a-f]{4}-){2}[0-9a-z])?$)|(^(?:979-?0-?|M-?)(?:\d{9}|(?=[\d-]{11}$)\d+-\d+-\d)$)|(^ISRN .{1,36}$)|(^(?:ISWC )?T-?\d{9}-?\d$)/i;
function parseDate(date) {
  const parts = date.split("T")[0].replace(/[?~%]$/, "").split("-");
  const year = +parts[0].replace(/^Y(?=-?\d{4}\d+)/, "").replace(/X/g, "0");
  const month = +parts[1];
  const day = +parts[2];
  if (!month || month > 20) {
    return [year];
  } else if (!day) {
    return [year, month];
  } else {
    return [year, month, day];
  }
}
function parseMonth(value) {
  if (value == null) {
    return [];
  }
  if (+value) {
    return [parseInt(value, 10)];
  }
  value = value.trim().toLowerCase();
  if (value in MONTHS) {
    return [MONTHS[value]];
  }
  const parts = value.split(/\s+/);
  let month;
  let day;
  if (parts[0] in MONTHS) {
    month = MONTHS[parts[0]];
    day = parseInt(parts[1]);
  } else if (parts[1] in MONTHS) {
    month = MONTHS[parts[1]];
    day = parseInt(parts[0]);
  }
  return day ? [month, day] : month ? [month] : [];
}
function formatLabel(author, issued, suffix, title) {
  let label = "";
  if (author && author[0]) {
    label += firstWord(author[0].family || author[0].literal);
  }
  if (issued && issued["date-parts"] && issued["date-parts"][0]) {
    label += issued["date-parts"][0][0];
  }
  if (suffix) {
    label += suffix;
  } else if (title) {
    label += firstWord(title);
  }
  return label;
}
var Converters = {
  PICK: {
    toTarget(...args) {
      return args.find(Boolean);
    },
    toSource(value) {
      return [value];
    }
  },
  DATE: {
    toTarget(date) {
      const parts = date.split("/").map((part) => part && part !== ".." ? parseDate(part) : void 0);
      return isNaN(parts[0][0]) ? {
        literal: date
      } : {
        "date-parts": parts
      };
    },
    toSource(date) {
      if ("date-parts" in date) {
        return date["date-parts"].map((datePart) => datePart.map((datePart2) => datePart2.toString().padStart(2, "0")).join("-")).join("/");
      }
    }
  },
  YEAR_MONTH: {
    toTarget(year, month, day) {
      if (isNaN(+year)) {
        return {
          literal: year
        };
      } else if (!isNaN(+day) && !isNaN(+month)) {
        return {
          "date-parts": [[+year, +month, +day]]
        };
      } else {
        return {
          "date-parts": [[+year, ...parseMonth(month)]]
        };
      }
    },
    toSource(date) {
      if ("date-parts" in date) {
        const [year, month, day] = date["date-parts"][0];
        return [year.toString(), month ? day ? `${months[month - 1]} ${day}` : month : void 0];
      } else {
        return [];
      }
    }
  },
  EPRINT: {
    toTarget(id, type2) {
      if (type2 === "pubmed") {
        return id;
      }
    },
    toSource(id) {
      return [id, "pubmed"];
    }
  },
  EVENT_TITLE: {
    toTarget(title, addon) {
      if (addon) {
        title += " (" + addon + ")";
      }
      return title;
    },
    toSource(title) {
      return title.match(/^(.+)(?: \((.+)\))?$/).slice(1, 3);
    }
  },
  HOW_PUBLISHED: {
    toTarget(howPublished) {
      if (howPublished.startsWith("http")) {
        return howPublished;
      }
    }
  },
  KEYWORDS: {
    toTarget(list6) {
      return list6.join(",");
    },
    toSource(list6) {
      return list6.split(",");
    }
  },
  LABEL: {
    toTarget(label) {
      return [label, label];
    },
    toSource(id, label, author, issued, suffix, title) {
      if (label && isLabelSafe(label)) {
        return label;
      } else if (config_default.format.useIdAsLabel) {
        return formatLabelFromId(id);
      } else {
        return formatLabel(author, issued, suffix, title) || formatLabelFromId(id);
      }
    }
  },
  NAMES: {
    toTarget(list6) {
      return list6.map(name.convertToTarget);
    },
    toSource(list6) {
      return list6.map(name.convertToSource);
    }
  },
  NAMES_ORCID: {
    toTarget(list6, orcid) {
      return list6.map((inputName, i) => {
        var _orcid$item;
        const outputName = name.convertToTarget(inputName);
        if (typeof (orcid === null || orcid === void 0 || (_orcid$item = orcid.item) === null || _orcid$item === void 0 ? void 0 : _orcid$item[i]) === "string") {
          outputName._orcid = orcid.item[i];
        }
        return outputName;
      });
    },
    toSource(list6) {
      const names = [];
      const orcid = [];
      for (let i = 0; i < list6.length; i++) {
        names.push(name.convertToSource(list6[i]));
        if (list6[i]._orcid) {
          orcid[i] = list6[i]._orcid;
        }
      }
      return [names, orcid.length ? {
        item: orcid
      } : void 0];
    }
  },
  PAGES: {
    toTarget(pages) {
      return pages.replace(/[–—]/, "-");
    },
    toSource(pages) {
      return pages.replace("-", "--");
    }
  },
  STANDARD_NUMBERS: {
    toTarget(...args) {
      return args.find(Boolean);
    },
    toSource(number) {
      const match = number.toString().match(STANDARD_NUMBERS_PATTERN);
      return match ? match.slice(1, 5) : [];
    }
  },
  STATUS: {
    toSource(state) {
      if (/^(inpreparation|submitted|forthcoming|inpress|prepublished)$/i.test(state)) {
        return state;
      }
    }
  },
  TITLE: {
    toTarget(title, subtitle, addon) {
      if (subtitle) {
        title += ": " + subtitle;
      }
      return title;
    },
    toSource(title) {
      return [title];
    }
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/biblatex.js
var import_date = __toESM(require_lib2());
var nonSpec = [{
  source: "note",
  target: "accessed",
  when: {
    source: false,
    target: {
      note: false,
      addendum: false
    }
  },
  convert: {
    toSource(accessed) {
      return `[Online; accessed ${(0, import_date.format)(accessed)}]`;
    }
  }
}, {
  source: "numpages",
  target: "number-of-pages",
  when: {
    source: {
      pagetotal: false
    },
    target: false
  }
}, {
  source: "pmid",
  target: "PMID",
  when: {
    source: {
      eprinttype(type2) {
        return type2 !== "pmid";
      },
      archiveprefix(type2) {
        return type2 !== "pmid";
      }
    },
    target: false
  }
}, {
  source: "pmcid",
  target: "PMCID",
  when: {
    target: false
  }
}, {
  source: "s2id",
  target: "custom",
  convert: {
    toTarget(S2ID) {
      return {
        S2ID
      };
    },
    toSource({
      S2ID
    }) {
      return S2ID;
    }
  }
}];
var aliases = [{
  source: "annote",
  target: "annote",
  when: {
    source: {
      annotation: false
    },
    target: false
  }
}, {
  source: "address",
  target: "publisher-place",
  convert: Converters.PICK,
  when: {
    source: {
      location: false
    },
    target: false
  }
}, {
  source: ["eprint", "archiveprefix"],
  target: "PMID",
  convert: Converters.EPRINT,
  when: {
    source: {
      eprinttype: false
    },
    target: false
  }
}, {
  source: "journal",
  target: "container-title",
  when: {
    source: {
      maintitle: false,
      booktitle: false,
      journaltitle: false
    },
    target: false
  }
}, {
  source: "school",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      institution: false,
      organization: false,
      publisher: false
    },
    target: false
  }
}];
var biblatex_default = new util_exports.Translator([...aliases, ...nonSpec, {
  source: "abstract",
  target: "abstract"
}, {
  source: "urldate",
  target: "accessed",
  convert: Converters.DATE
}, {
  source: "annotation",
  target: "annote"
}, {
  source: ["author", "author+an:orcid"],
  target: "author",
  convert: Converters.NAMES_ORCID
}, {
  source: "library",
  target: "call-number"
}, {
  source: "chapter",
  target: "chapter-number"
}, {
  source: "bookauthor",
  target: "container-author",
  convert: Converters.NAMES
}, {
  source: ["maintitle", "mainsubtitle", "maintitleaddon"],
  target: "container-title",
  when: {
    source: true,
    target: {
      "number-of-volumes": true
    }
  },
  convert: Converters.TITLE
}, {
  source: ["booktitle", "booksubtitle", "booktitleaddon"],
  target: "container-title",
  when: {
    source: {
      maintitle: false
    },
    target: {
      "number-of-volumes": false,
      type(type2) {
        return !type2 || !type2.startsWith("article");
      }
    }
  },
  convert: Converters.TITLE
}, {
  source: ["journaltitle", "journalsubtitle", "journaltitleaddon"],
  target: "container-title",
  when: {
    source: {
      [TYPE2]: "article"
    },
    target: {
      type: ["article", "article-newspaper", "article-journal", "article-magazine"]
    }
  },
  convert: Converters.TITLE
}, {
  source: "shortjournal",
  target: "container-title-short",
  when: {
    source: {
      [TYPE2]: "article"
    },
    target: {
      type: ["article", "article-newspaper", "article-journal", "article-magazine"]
    }
  }
}, {
  source: "shortjournal",
  target: "journalAbbreviation",
  when: {
    source: false,
    target: {
      "container-title-short": false
    }
  }
}, {
  source: "number",
  target: "collection-number",
  when: {
    source: {
      [TYPE2]: ["book", "mvbook", "inbook", "bookinbook", "suppbook", "collection", "mvcollection", "incollection", "suppcollection", "manual", "suppperiodical", "proceedings", "mvproceedings", "refererence"]
    },
    target: {
      type: ["bill", "book", "broadcast", "chapter", "dataset", "entry", "entry-dictionary", "entry-encyclopedia", "figure", "graphic", "interview", "legislation", "legal_case", "manuscript", "map", "motion_picture", "musical_score", "pamphlet", "post", "post-weblog", "personal_communication", "review", "review-book", "song", "speech", "thesis", "treaty", "webpage"]
    }
  }
}, {
  source: "series",
  target: "collection-title"
}, {
  source: "shortseries",
  target: "collection-title-short"
}, {
  source: "doi",
  target: "DOI"
}, {
  source: "edition",
  target: "edition"
}, {
  source: "editor",
  target: "editor",
  convert: Converters.NAMES
}, {
  source: [TYPE2, "entrysubtype", "type"],
  target: ["type", "genre"],
  convert: {
    toTarget(type2, subtype, typeKey) {
      if (!typeKey) {
        if (type2 === "mastersthesis") {
          typeKey = "mathesis";
        }
        if (type2 === "phdthesis") {
          typeKey = "phdthesis";
        }
        if (type2 === "techreport") {
          typeKey = "techreport";
        }
      }
      return [biblatexTypes_default.source[type2] || "document", typeKey || subtype];
    },
    toSource(type2, genre) {
      const sourceType = biblatexTypes_default.target[type2] || "misc";
      return genre in TYPE_KEYS ? [sourceType, void 0, genre] : [sourceType, genre];
    }
  }
}, {
  source: TYPE2,
  when: {
    target: {
      type: false
    }
  },
  convert: {
    toSource() {
      return "misc";
    }
  }
}, {
  source: "eventdate",
  target: "event-date",
  convert: Converters.DATE
}, {
  source: "venue",
  target: "event-place"
}, {
  source: ["eventtitle", "eventtitleaddon"],
  target: "event-title",
  convert: Converters.EVENT_TITLE
}, {
  source: ["eventtitle", "eventtitleaddon"],
  target: "event",
  convert: Converters.EVENT_TITLE,
  when: {
    source: false,
    target: {
      "event-title": false
    }
  }
}, {
  source: LABEL,
  target: ["id", "citation-key", "author", "issued", "year-suffix", "title"],
  convert: Converters.LABEL
}, {
  source: "isbn",
  target: "ISBN"
}, {
  source: "issn",
  target: "ISSN"
}, {
  source: "issue",
  target: "issue",
  when: {
    source: {
      number: false,
      [TYPE2]: ["article", "periodical"]
    },
    target: {
      issue(issue) {
        return typeof issue === "string" && !issue.match(/\d+/);
      },
      type: ["article", "article-journal", "article-newspaper", "article-magazine", "periodical"]
    }
  }
}, {
  source: "number",
  target: "issue",
  when: {
    source: {
      [TYPE2]: ["article", "periodical", "inproceedings"]
    },
    target: {
      issue(issue) {
        return issue && (typeof issue === "number" || issue.match(/\d+/));
      },
      type: ["article", "article-journal", "article-newspaper", "article-magazine", "paper-conference", "periodical"]
    }
  }
}, {
  source: "date",
  target: "issued",
  convert: Converters.DATE
}, {
  source: ["year", "month", "day"],
  target: "issued",
  convert: Converters.YEAR_MONTH,
  when: {
    source: {
      date: false
    },
    target: false
  }
}, {
  source: "location",
  target: "jurisdiction",
  when: {
    source: {
      type: "patent"
    },
    target: {
      type: "patent"
    }
  }
}, {
  source: "keywords",
  target: "keyword",
  convert: Converters.KEYWORDS
}, {
  source: "language",
  target: "language",
  convert: Converters.PICK
}, {
  source: "langid",
  target: "language",
  when: {
    source: {
      language: false
    },
    target: false
  }
}, {
  source: "note",
  target: "note"
}, {
  source: "addendum",
  target: "note",
  when: {
    source: {
      note: false
    },
    target: false
  }
}, {
  source: "eid",
  target: "number",
  when: {
    target: {
      type: ["article-journal"]
    }
  }
}, {
  source: ["isan", "ismn", "isrn", "iswc"],
  target: "number",
  convert: Converters.STANDARD_NUMBERS,
  when: {
    source: {
      [TYPE2](type2) {
        return type2 !== "patent";
      }
    },
    target: {
      type(type2) {
        return type2 !== "patent";
      }
    }
  }
}, {
  source: "number",
  target: "number",
  when: {
    source: {
      [TYPE2]: ["patent", "report", "techreport", "legislation"]
    },
    target: {
      type: ["patent", "report", "legislation"]
    }
  }
}, {
  source: "origdate",
  target: "original-date",
  convert: Converters.DATE
}, {
  source: "origlocation",
  target: "original-publisher-place",
  convert: Converters.PICK
}, {
  source: "origpublisher",
  target: "original-publisher",
  convert: Converters.PICK
}, {
  source: "origtitle",
  target: "original-title"
}, {
  source: "pages",
  target: "page",
  when: {
    source: {
      bookpagination: [void 0, "page"]
    }
  },
  convert: Converters.PAGES
}, {
  source: "pagetotal",
  target: "number-of-pages"
}, {
  source: "part",
  target: "part-number"
}, {
  source: ["eprint", "eprinttype"],
  target: "PMID",
  convert: Converters.EPRINT
}, {
  source: "location",
  target: "publisher-place",
  convert: Converters.PICK
}, {
  source: "publisher",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: true,
    target: {
      type: ["article", "article-journal", "article-magazine", "article-newspaper", "bill", "book", "broadcast", "chapter", "classic", "collection", "dataset", "document", "entry", "entry-dictionary", "entry-encyclopedia", "event", "figure", "graphic", "hearing", "interview", "legal_case", "legislation", "manuscript", "map", "motion_picture", "musical_score", "pamphlet", "patent", "performance", "periodical", "personal_communication", "post", "post-weblog", "regulation", "review", "review-book", "software", "song", "speech", "standard", "treaty"]
    }
  }
}, {
  source: "organization",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      publisher: false
    },
    target: {
      type: ["paper-conference", "webpage"]
    }
  }
}, {
  source: "institution",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false
    },
    target: {
      type: ["report", "thesis"]
    }
  }
}, {
  source: "howpublished",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      howpublished(howPublished) {
        return howPublished && !howPublished.startsWith("http");
      },
      publisher: false,
      organization: false,
      institution: false
    },
    target: {
      type: "manuscript"
    }
  }
}, {
  source: ["pages", "bookpagination"],
  target: "section",
  when: {
    source: {
      bookpagination: "section"
    },
    target: {
      page: false
    }
  },
  convert: {
    toTarget(section) {
      return section;
    },
    toSource(section) {
      return [section, "section"];
    }
  }
}, {
  source: "pubstate",
  target: "status",
  convert: Converters.STATUS
}, {
  source: "shorttitle",
  target: "title-short"
}, {
  source: "shorttitle",
  target: "shortTitle",
  when: {
    source: false,
    target: {
      "title-short": false
    }
  }
}, {
  source: ["title", "subtitle", "titleaddon"],
  target: "title",
  convert: Converters.TITLE
}, {
  source: "translator",
  target: "translator",
  convert: Converters.NAMES
}, {
  source: "url",
  target: "URL"
}, {
  source: "howpublished",
  target: "URL",
  convert: Converters.HOW_PUBLISHED,
  when: {
    source: {
      url: false
    },
    target: false
  }
}, {
  source: "version",
  target: "version"
}, {
  source: "volume",
  target: "volume"
}, {
  source: "volumes",
  target: "number-of-volumes"
}, {
  source: ["issuetitle", "issuesubtitle", "issuetitleaddon"],
  target: "volume-title",
  convert: Converters.TITLE
}]);

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/bibtex.js
var import_date2 = __toESM(require_lib2());
var bibtex_default = new util_exports.Translator([{
  source: "note",
  target: "accessed",
  when: {
    source: false,
    target: {
      note: false
    }
  },
  convert: {
    toSource(accessed) {
      return `[Online; accessed ${(0, import_date2.format)(accessed)}]`;
    }
  }
}, {
  source: "annote",
  target: "annote"
}, {
  source: "address",
  target: "publisher-place",
  convert: Converters.PICK
}, {
  source: "author",
  target: "author",
  convert: Converters.NAMES
}, {
  source: "chapter",
  target: "chapter-number"
}, {
  source: "number",
  target: "collection-number",
  when: {
    source: {
      [TYPE2]: ["book", "mvbook", "inbook", "collection", "mvcollection", "incollection", "suppcollection", "manual", "suppperiodical", "proceedings", "mvproceedings", "refererence"]
    },
    target: {
      type: ["bill", "book", "broadcast", "chapter", "dataset", "entry", "entry-dictionary", "entry-encyclopedia", "figure", "graphic", "interview", "legislation", "legal_case", "manuscript", "map", "motion_picture", "musical_score", "pamphlet", "post", "post-weblog", "personal_communication", "review", "review-book", "song", "speech", "thesis", "treaty", "webpage"]
    }
  }
}, {
  source: "series",
  target: "collection-title"
}, {
  source: "booktitle",
  target: "container-title",
  when: {
    target: {
      type: ["chapter", "paper-conference"]
    }
  }
}, {
  source: "journal",
  target: "container-title",
  when: {
    source: {
      [TYPE2]: "article"
    },
    target: {
      type: ["article", "article-newspaper", "article-journal", "article-magazine"]
    }
  }
}, {
  source: "doi",
  target: "DOI"
}, {
  source: "edition",
  target: "edition"
}, {
  source: "editor",
  target: "editor",
  convert: Converters.NAMES
}, {
  source: LABEL,
  target: ["id", "citation-key", "author", "issued", "year-suffix", "title"],
  convert: Converters.LABEL
}, {
  source: "isbn",
  target: "ISBN"
}, {
  source: "issn",
  target: "ISSN"
}, {
  source: "number",
  target: "issue",
  when: {
    source: {
      [TYPE2]: ["article", "periodical", "inproceedings"]
    },
    target: {
      issue(issue) {
        return typeof issue === "number" || typeof issue === "string" && issue.match(/\d+/);
      },
      type: ["article", "article-journal", "article-newspaper", "article-magazine", "paper-conference", "periodical"]
    }
  }
}, {
  source: ["year", "month", "day"],
  target: "issued",
  convert: Converters.YEAR_MONTH
}, {
  source: "note",
  target: "note"
}, {
  source: "number",
  target: "number",
  when: {
    source: {
      [TYPE2]: ["patent", "report", "techreport"]
    },
    target: {
      type: ["patent", "report"]
    }
  }
}, {
  source: "eid",
  target: "number",
  when: {
    source: {
      number: false
    },
    target: {
      type: ["article-journal"]
    }
  }
}, {
  source: "pages",
  target: "page",
  convert: Converters.PAGES
}, {
  source: "publisher",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    target: {
      type: ["article", "article-journal", "article-magazine", "article-newspaper", "bill", "book", "broadcast", "chapter", "classic", "collection", "dataset", "document", "entry", "entry-dictionary", "entry-encyclopedia", "event", "figure", "graphic", "hearing", "interview", "legal_case", "legislation", "map", "motion_picture", "musical_score", "pamphlet", "patent", "performance", "periodical", "personal_communication", "post", "post-weblog", "regulation", "review", "review-book", "software", "song", "speech", "standard", "treaty", "webpage"]
    }
  }
}, {
  source: "organization",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      publisher: false
    },
    target: {
      type: "paper-conference"
    }
  }
}, {
  source: "institution",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      publisher: false,
      organization: false
    },
    target: {
      type: "report"
    }
  }
}, {
  source: "school",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      institution: false,
      organization: false,
      publisher: false
    },
    target: {
      type: "thesis"
    }
  }
}, {
  source: "howpublished",
  target: "publisher",
  convert: Converters.PICK,
  when: {
    source: {
      howpublished(howPublished) {
        return howPublished && !howPublished.startsWith("http");
      },
      publisher: false,
      organization: false,
      institution: false,
      school: false
    },
    target: {
      type: "manuscript"
    }
  }
}, {
  source: "title",
  target: "title"
}, {
  source: [TYPE2, "type"],
  target: ["type", "genre"],
  convert: {
    toTarget(sourceType, subType) {
      const type2 = bibtexTypes_default.source[sourceType] || "document";
      if (subType) {
        return [type2, subType];
      } else if (sourceType === "mastersthesis") {
        return [type2, "Master's thesis"];
      } else if (sourceType === "phdthesis") {
        return [type2, "PhD thesis"];
      } else {
        return [type2];
      }
    },
    toSource(targetType, genre) {
      const type2 = bibtexTypes_default.target[targetType] || "misc";
      if (/^(master'?s|diploma) thesis$/i.test(genre)) {
        return ["mastersthesis"];
      } else if (/^(phd|doctoral) thesis$/i.test(genre)) {
        return ["phdthesis"];
      } else {
        return [type2, genre];
      }
    }
  }
}, {
  source: TYPE2,
  when: {
    target: {
      type: false
    }
  },
  convert: {
    toSource() {
      return "misc";
    }
  }
}, {
  source: "url",
  target: "URL"
}, {
  source: "howpublished",
  target: "URL",
  convert: Converters.HOW_PUBLISHED,
  when: {
    target: {
      publisher: false
    }
  }
}, {
  source: "volume",
  target: "volume"
}]);

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/crossref.js
function ownKeys4(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread4(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys4(Object(t), true).forEach(function(r2) {
      _defineProperty5(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys4(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty5(e, r, t) {
  return (r = _toPropertyKey5(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey5(t) {
  var i = _toPrimitive5(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive5(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var BOOK = /* @__PURE__ */ new Set(["book", "inbook", "bookinbook", "suppbook"]);
var BOOK_PART = /* @__PURE__ */ new Set(["inbook", "bookinbook", "suppbook"]);
var COLLECTION = /* @__PURE__ */ new Set(["collection", "reference", "incollection", "inreference", "suppcollection"]);
var COLLECTION_PART = /* @__PURE__ */ new Set(["incollection", "inreference", "suppcollection"]);
var PROCEEDINGS = /* @__PURE__ */ new Set(["proceedings", "inproceedings"]);
var PROCEEDINGS_PART = /* @__PURE__ */ new Set(["inproceedings"]);
var PERIODICAL_PART = /* @__PURE__ */ new Set(["article", "suppperiodical"]);
var TITLE_MAP = {
  mvbook: ["main", BOOK],
  mvcollection: ["main", COLLECTION],
  mvreference: ["main", COLLECTION],
  mvproceedings: ["main", PROCEEDINGS],
  book: ["book", BOOK_PART],
  collection: ["book", COLLECTION_PART],
  reference: ["book", COLLECTION_PART],
  proceedings: ["book", PROCEEDINGS_PART],
  periodical: ["journal", PERIODICAL_PART]
};
function crossref(target, entry, registry) {
  if (entry.crossref in registry) {
    const parent = registry[entry.crossref];
    if (parent.properties === entry) {
      return entry;
    }
    const data2 = _objectSpread4({}, crossref(parent.type, parent.properties, registry));
    delete data2.ids;
    delete data2.crossref;
    delete data2.xref;
    delete data2.entryset;
    delete data2.entrysubtype;
    delete data2.execute;
    delete data2.label;
    delete data2.options;
    delete data2.presort;
    delete data2.related;
    delete data2.relatedoptions;
    delete data2.relatedstring;
    delete data2.relatedtype;
    delete data2.shortand;
    delete data2.shortandintro;
    delete data2.sortkey;
    if ((parent.type === "mvbook" || parent.type === "book") && BOOK_PART.has(target)) {
      data2.bookauthor = data2.author;
    }
    if (parent.type in TITLE_MAP) {
      const [prefix, targets] = TITLE_MAP[parent.type];
      if (targets.has(target)) {
        data2[prefix + "title"] = data2.title;
        data2[prefix + "subtitle"] = data2.subtitle;
        if (prefix !== "journal") {
          data2[prefix + "titleaddon"] = data2.titleaddon;
        }
        delete data2.title;
        delete data2.subtitle;
        delete data2.titleaddon;
        delete data2.shorttitle;
        delete data2.sorttitle;
        delete data2.indextitle;
        delete data2.indexsorttitle;
      }
    }
    return Object.assign(data2, entry);
  }
  return entry;
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/mapping/index.js
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function ownKeys5(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread5(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys5(Object(t), true).forEach(function(r2) {
      _defineProperty6(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys5(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty6(e, r, t) {
  return (r = _toPropertyKey6(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey6(t) {
  var i = _toPrimitive6(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive6(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _parse(input, spec) {
  const registry = {};
  for (const entry of input) {
    registry[entry.label] = entry;
  }
  return input.map(({
    type: type2,
    label,
    properties
  }) => spec.convertToTarget(_objectSpread5({
    [TYPE2]: type2,
    [LABEL]: label
  }, crossref(type2, properties, registry))));
}
function _format(input, spec) {
  return input.map((entry) => {
    const _spec$convertToSource = spec.convertToSource(entry), {
      [TYPE2]: type2,
      [LABEL]: label
    } = _spec$convertToSource, properties = _objectWithoutProperties(_spec$convertToSource, [TYPE2, LABEL].map(_toPropertyKey6));
    return {
      type: type2,
      label,
      properties
    };
  });
}
function parseBibtex(input) {
  return _parse(input, bibtex_default);
}
function formatBibtex(input) {
  return _format(input, bibtex_default);
}
function parse5(input) {
  return _parse(input, biblatex_default);
}
function format3(input) {
  return _format(input, biblatex_default);
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/value.js
var import_moo2 = __toESM(require_moo());

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/name.js
function getStringCase(string) {
  const a = string.toUpperCase();
  const b = string.toLowerCase();
  for (let i = 0; i < string.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] === string[i];
    }
  }
  return null;
}
function formatNameParts(parts) {
  if (parts.length === 0) {
    return void 0;
  }
  let piece = "";
  while (parts.length > 1) {
    const {
      value,
      hyphenated
    } = parts.shift();
    piece += value + (hyphenated ? "-" : " ");
  }
  const output = piece + parts[0].value;
  return output[0] && output;
}
function orderNameParts(parts, orderGiven = true) {
  const given = [];
  const undecided = [];
  if (orderGiven) {
    while (parts.length > 1 && parts[0].upperCase !== false) {
      given.push(...undecided);
      undecided.length = 0;
      while (parts.length > 1 && parts[0].upperCase !== false && !parts[0].hyphenated) {
        given.push(parts.shift());
      }
      while (parts.length > 0 && parts[0].upperCase !== false && parts[0].hyphenated) {
        undecided.push(parts.shift());
      }
    }
  }
  const prefix = [];
  const family = [];
  while (parts.length > 1) {
    prefix.push(...family);
    family.length = 0;
    while (parts.length > 1 && parts[0].upperCase === false) {
      prefix.push(parts.shift());
    }
    while (parts.length > 0 && parts[0].upperCase !== false) {
      family.push(parts.shift());
    }
  }
  if (undecided.length) {
    family.unshift(...undecided);
  }
  if (parts.length) {
    family.push(parts[0]);
  }
  return [formatNameParts(given), formatNameParts(prefix), formatNameParts(family)];
}
function orderNamePieces(pieces) {
  if (pieces[0][0].label) {
    const name4 = {};
    for (const [{
      value,
      label
    }] of pieces) {
      name4[label] = value;
    }
    return name4;
  }
  const name3 = {};
  const [given, prefix, family] = orderNameParts(pieces[0], pieces.length === 1);
  if (family) {
    name3.family = family;
  }
  if (prefix) {
    name3.prefix = prefix;
  }
  if (pieces.length === 3) {
    name3.given = formatNameParts(pieces[2]);
    name3.suffix = formatNameParts(pieces[1]);
  } else if (pieces.length === 2) {
    name3.given = formatNameParts(pieces[1]);
  } else if (given) {
    name3.given = given;
  }
  return name3;
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/value.js
function ownKeys6(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread6(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys6(Object(t), true).forEach(function(r2) {
      _defineProperty7(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys6(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty7(e, r, t) {
  return (r = _toPropertyKey7(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey7(t) {
  var i = _toPrimitive7(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive7(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var text = {
  commandBegin: {
    match: "\\begin",
    push: "environment"
  },
  command: {
    match: /\\(?:[a-zA-Z]+|.) */,
    value: (s) => s.slice(1).trim()
  },
  lbrace: {
    match: "{",
    push: "bracedLiteral"
  },
  mathShift: {
    match: "$",
    push: "mathLiteral"
  },
  whitespace: {
    match: /[\s]+|~/,
    lineBreaks: true,
    value(token) {
      return token === "~" ? "\xA0" : " ";
    }
  }
};
var lexer2 = import_moo2.default.states({
  stringLiteral: _objectSpread6(_objectSpread6({}, text), {}, {
    text: /[^{$}\s~\\]+/
  }),
  namesLiteral: _objectSpread6(_objectSpread6({
    and: /\s+[aA][nN][dD]\s+/,
    comma: ",",
    hyphen: "-",
    equals: "="
  }, text), {}, {
    text: /[^{$}\s~\\,=-]+/
  }),
  listLiteral: _objectSpread6(_objectSpread6({
    and: /\s+and\s+/
  }, text), {}, {
    text: /[^{$}\s~\\]+/
  }),
  separatedLiteral: _objectSpread6(_objectSpread6({
    comma: ","
  }, text), {}, {
    text: /[^{$}\s~\\,]+/
  }),
  annotation: _objectSpread6(_objectSpread6({}, text), {}, {
    colon: ":",
    equals: "=",
    comma: ",",
    semicolon: ";",
    quote: '"',
    itemCount: /\d+/,
    text: /[^{$}\s~\\":;,=]+/
  }),
  bracedLiteral: _objectSpread6(_objectSpread6({}, text), {}, {
    rbrace: {
      match: "}",
      pop: true
    },
    text: /[^{$}\s~\\]+/
  }),
  mathLiteral: _objectSpread6(_objectSpread6({}, text), {}, {
    mathShift: {
      match: "$",
      pop: true
    },
    script: /[\^_]/,
    text: /[^{$}\s~\\^_]+/
  }),
  environment: _objectSpread6(_objectSpread6({
    commandEnd: {
      match: "\\end",
      pop: true
    }
  }, text), {}, {
    text: /[^{$}\s~\\]+/
  })
});
function flattenConsString(string) {
  string[0];
  return string;
}
function applyFormatting(text2, format9) {
  if (format9 in formatting) {
    return text2 && formatting[format9].join(text2);
  } else {
    return text2;
  }
}
var valueGrammar = new util_exports.Grammar({
  String() {
    let output = "";
    while (!this.matchEndOfFile()) {
      output += this.consumeRule("Text");
    }
    return flattenConsString(output);
  },
  StringNames() {
    const list6 = [];
    while (true) {
      this.consumeToken("whitespace", true);
      list6.push(this.consumeRule("Name"));
      this.consumeToken("whitespace", true);
      if (this.matchEndOfFile()) {
        return list6;
      } else {
        this.consumeToken("and");
      }
    }
  },
  Name() {
    const pieces = [];
    while (true) {
      pieces.push(this.consumeRule("NamePiece"));
      if (this.matchEndOfFile() || this.matchToken("and")) {
        return orderNamePieces(pieces);
      } else {
        this.consumeToken("comma");
        this.consumeToken("whitespace", true);
      }
    }
  },
  NamePiece() {
    const parts = [];
    while (true) {
      const part = this.consumeRule("NameToken");
      if (part.label) {
        part.label = formatNameParts([...parts, {
          value: part.label
        }]);
        return [part];
      }
      parts.push(part);
      if (this.matchEndOfFile() || this.matchToken("and") || this.matchToken("comma")) {
        return parts;
      } else {
        while (this.matchToken("hyphen") || this.matchToken("whitespace")) {
          this.consumeToken();
        }
      }
    }
  },
  NameToken() {
    let upperCase = null;
    let value = "";
    while (true) {
      if (upperCase === null && this.matchToken("text")) {
        const text2 = this.consumeToken().value;
        value += text2;
        upperCase = getStringCase(text2);
      } else if (this.matchEndOfFile() || this.matchToken("and") || this.matchToken("comma") || this.matchToken("whitespace")) {
        return {
          value,
          upperCase
        };
      } else if (this.matchToken("hyphen")) {
        return {
          value,
          upperCase,
          hyphenated: true
        };
      } else if (this.matchToken("equals")) {
        this.consumeToken("equals");
        const text2 = this.consumeRule("NamePiece");
        if (text2[0].label) {
          value += "=" + text2[0].label;
        }
        return {
          value: formatNameParts(text2),
          label: value
        };
      } else {
        value += this.consumeRule("Text");
      }
    }
  },
  StringList() {
    const list6 = [];
    while (!this.matchEndOfFile()) {
      let output = "";
      while (!this.matchEndOfFile() && !this.matchToken("and")) {
        output += this.consumeRule("Text");
      }
      list6.push(flattenConsString(output));
      this.consumeToken("and", true);
    }
    return list6.length === 1 ? list6[0] : list6;
  },
  StringSeparated() {
    const list6 = [];
    while (!this.matchEndOfFile()) {
      let output = "";
      while (!this.matchEndOfFile() && !this.matchToken("comma")) {
        output += this.consumeRule("Text");
      }
      list6.push(output.trim());
      this.consumeToken("comma", true);
      this.consumeToken("whitespace", true);
    }
    return list6;
  },
  StringVerbatim() {
    let output = "";
    while (!this.matchEndOfFile()) {
      output += this.consumeToken().text;
    }
    return flattenConsString(output);
  },
  StringUri() {
    const uri = this.consumeRule("StringVerbatim");
    try {
      if (decodeURI(uri) === uri) {
        return encodeURI(uri);
      } else {
        return uri;
      }
    } catch (e) {
      return encodeURI(uri);
    }
  },
  StringTitleCase() {
    this.state.sentenceCase = true;
    let output = "";
    while (!this.matchEndOfFile()) {
      output += this.consumeRule("Text");
    }
    return flattenConsString(output);
  },
  Annotations() {
    const annotations = {};
    while (true) {
      const {
        scope,
        item,
        part,
        value
      } = this.consumeRule("Annotation");
      if (scope === "part") {
        if (!annotations.part) {
          annotations.part = [];
        }
        if (!annotations.part[item]) {
          annotations.part[item] = {};
        }
        annotations.part[item][part] = value;
      } else if (scope === "item") {
        if (!annotations.item) {
          annotations.item = [];
        }
        annotations.item[item] = value;
      } else {
        annotations.field = value;
      }
      if (this.matchEndOfFile()) {
        break;
      } else {
        this.consumeToken("semicolon");
        this.consumeRule("_");
      }
    }
    return annotations;
  },
  Annotation() {
    const annotation = {};
    if (this.matchToken("itemCount")) {
      annotation.item = parseInt(this.consumeToken("itemCount")) - 1;
      if (this.matchToken("colon")) {
        this.consumeToken("colon");
        annotation.part = this.consumeToken("text");
        annotation.scope = "part";
      } else {
        annotation.scope = "item";
      }
    } else {
      annotation.scope = "field";
    }
    this.consumeToken("equals");
    this.consumeRule("_");
    if (this.matchToken("quote")) {
      this.consumeToken("quote");
      let literal = "";
      while (!this.matchToken("quote")) {
        if (this.matchToken("itemCount") || this.matchToken("colon") || this.matchToken("comma") || this.matchToken("semicolon") || this.matchToken("equals")) {
          literal += this.token.value;
          this.token = this.lexer.next();
        } else {
          literal += this.consumeRule("Text");
        }
      }
      this.consumeToken("quote");
      annotation.value = flattenConsString(literal);
      this.consumeRule("_");
    } else {
      annotation.value = [];
      let output = "";
      while (true) {
        output += this.consumeRule("Text");
        if (this.matchToken("comma")) {
          this.consumeToken("comma");
          this.consumeRule("_");
          annotation.value.push(flattenConsString(output));
          output = "";
        } else if (this.matchEndOfFile() || this.matchToken("semicolon")) {
          annotation.value.push(flattenConsString(output));
          break;
        }
      }
    }
    return annotation;
  },
  BracketString() {
    var _this$state;
    let output = "";
    this.consumeToken("lbrace");
    const sentenceCase = this.state.sentenceCase;
    this.state.sentenceCase = sentenceCase && this.matchToken("command");
    (_this$state = this.state).partlyLowercase && (_this$state.partlyLowercase = this.state.sentenceCase);
    while (!this.matchToken("rbrace")) {
      output += this.consumeRule("Text");
    }
    const topLevel = sentenceCase && !this.state.sentenceCase;
    const protectCase = topLevel && this.state.partlyLowercase;
    this.state.sentenceCase = sentenceCase;
    this.consumeToken("rbrace");
    return protectCase ? applyFormatting(output, "nocase") : output;
  },
  MathString() {
    let output = "";
    this.consumeToken("mathShift");
    while (!this.matchToken("mathShift")) {
      if (this.matchToken("script")) {
        const script = this.consumeToken("script").value;
        const text2 = this.consumeRule("Text").split("");
        if (text2.every((char) => char in mathScripts[script])) {
          output += text2.map((char) => mathScripts[script][char]).join("");
        } else {
          const formatName2 = mathScriptFormatting[script];
          output += formatting[formatName2].join(text2.join(""));
        }
        continue;
      }
      if (this.matchToken("command")) {
        const command = this.token.value;
        if (command in mathScriptFormatting) {
          this.consumeToken("command");
          const text2 = this.consumeRule("BracketString");
          output += applyFormatting(text2, mathScriptFormatting[command]);
          continue;
        }
      }
      output += this.consumeRule("Text");
    }
    this.consumeToken("mathShift");
    return output;
  },
  Text() {
    if (this.matchToken("lbrace")) {
      return this.consumeRule("BracketString");
    } else if (this.matchToken("mathShift")) {
      return this.consumeRule("MathString");
    } else if (this.matchToken("whitespace")) {
      return this.consumeToken("whitespace").value;
    } else if (this.matchToken("commandBegin")) {
      return this.consumeRule("EnclosedEnv");
    } else if (this.matchToken("command")) {
      return this.consumeRule("Command");
    }
    const text2 = this.consumeToken("text").value.replace(ligaturePattern, (ligature) => ligatures[ligature]);
    const afterPunctuation = this.state.afterPunctuation;
    this.state.afterPunctuation = /[?!.:]$/.test(text2);
    if (!this.state.sentenceCase) {
      var _this$state2;
      (_this$state2 = this.state).partlyLowercase || (_this$state2.partlyLowercase = text2 === text2.toLowerCase() && text2 !== text2.toUpperCase());
      return text2;
    }
    const [first, ...otherCharacters] = text2;
    const rest = otherCharacters.join("");
    const restLowerCase = rest.toLowerCase();
    if (rest !== restLowerCase) {
      return text2;
    }
    if (!afterPunctuation) {
      return text2.toLowerCase();
    }
    return first + restLowerCase;
  },
  Command() {
    const commandToken = this.consumeToken("command");
    const command = commandToken.value;
    if (command in formattingEnvs) {
      const text2 = this.consumeRule("Env");
      const format9 = formattingEnvs[command];
      return applyFormatting(text2, format9);
    } else if (command in formattingCommands) {
      const text2 = this.consumeRule("BracketString");
      const format9 = formattingCommands[command];
      return applyFormatting(text2, format9);
    } else if (command in commands) {
      return commands[command];
    } else if (command in mathCommands) {
      return mathCommands[command];
    } else if (command in diacritics && !this.matchEndOfFile()) {
      const text2 = this.consumeRule("Text");
      const diacritic = text2[0] + diacritics[command];
      return diacritic.normalize("NFC") + text2.slice(1);
    } else if (command in argumentCommands) {
      const func = argumentCommands[command];
      const args = [];
      let arity = func.length;
      while (arity-- > 0) {
        this.consumeToken("whitespace", true);
        args.push(this.consumeRule("BracketString"));
      }
      return func(...args);
    } else if (/^[&%$#_{}]$/.test(command)) {
      return commandToken.text.slice(1);
    } else {
      return commandToken.text;
    }
  },
  Env() {
    let output = "";
    while (!this.matchEndOfFile() && !this.matchToken("rbrace")) {
      output += this.consumeRule("Text");
    }
    return output;
  },
  EnclosedEnv() {
    this.consumeToken("commandBegin");
    const beginEnv = this.consumeRule("BracketString");
    let output = "";
    while (!this.matchToken("commandEnd")) {
      output += this.consumeRule("Text");
    }
    const end = this.consumeToken("commandEnd");
    const endEnv = this.consumeRule("BracketString");
    if (beginEnv !== endEnv) {
      throw new SyntaxError(this.lexer.formatError(end, `environment started with "${beginEnv}", ended with "${endEnv}"`));
    }
    return applyFormatting(output, formattingEnvs[beginEnv]);
  },
  _() {
    while (this.matchToken("whitespace")) {
      this.consumeToken("whitespace");
    }
  }
}, {
  sentenceCase: false,
  partlyLowercase: false,
  afterPunctuation: true
});
function singleLanguageIsEnglish(language) {
  return sentenceCaseLanguages.includes(language.toLowerCase());
}
function isEnglish(languages) {
  if (Array.isArray(languages)) {
    return languages.every(singleLanguageIsEnglish);
  }
  return singleLanguageIsEnglish(languages);
}
function getMainRule(fieldType, languages) {
  if (fieldType[1] === "name") {
    return fieldType[0] === "list" ? "StringNames" : "Name";
  }
  if (fieldType[1] === "title") {
    const option = config_default.parse.sentenceCase;
    if (option === "always" || option === "english" && isEnglish(languages)) {
      return "StringTitleCase";
    } else {
      return "String";
    }
  }
  switch (fieldType[0] === "field" ? fieldType[1] : fieldType[0]) {
    case "list":
      return "StringList";
    case "separated":
      return "StringSeparated";
    case "verbatim":
      return "StringVerbatim";
    case "uri":
      return "StringUri";
    case "title":
    case "literal":
    default:
      return "String";
  }
}
function getLexerState(fieldType) {
  if (fieldType[1] === "name") {
    return "namesLiteral";
  }
  switch (fieldType[0]) {
    case "list":
      return "listLiteral";
    case "separated":
      return "separatedLiteral";
    case "field":
    default:
      return "stringLiteral";
  }
}
function parse6(text2, field, languages = []) {
  const fieldType = fieldTypes2[field] || [];
  return valueGrammar.parse(lexer2.reset(text2, {
    state: getLexerState(fieldType),
    line: 0,
    col: 0
  }), getMainRule(fieldType, languages));
}
function parseAnnotation(text2) {
  return valueGrammar.parse(lexer2.reset(text2, {
    state: "annotation",
    line: 0,
    col: 0
  }), "Annotations");
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/entries.js
function ownKeys7(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread7(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys7(Object(t), true).forEach(function(r2) {
      _defineProperty8(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys7(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty8(e, r, t) {
  return (r = _toPropertyKey8(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey8(t) {
  var i = _toPrimitive8(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive8(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function validate3(entries, requirements) {
  const problems = [];
  for (const {
    type: type2,
    label,
    properties
  } of entries) {
    if (type2 in requirements) {
      const missing = [];
      for (const field of requirements[type2]) {
        if (Array.isArray(field) && !field.some((field2) => field2 in properties)) {
          missing.push(field.join("/"));
        } else if (typeof field === "string" && !(field in properties)) {
          missing.push(field);
        }
      }
      if (missing.length) {
        problems.push([label, `missing fields: ${missing.join(", ")}`]);
      }
    } else {
      problems.push([label, `invalid type: "${type2}"`]);
    }
  }
  if (problems.length) {
    throw new RangeError(["Invalid entries:"].concat(problems.map(([label, problem]) => `  - ${label} has ${problem}`)).join("\n"));
  }
}
function parseEntryValues(entry) {
  const output = {};
  if ("language" in entry.properties) {
    output.language = parse6(entry.properties.language, "language");
  }
  for (const property in entry.properties) {
    const value = entry.properties[property];
    if (value === "") {
      continue;
    }
    output[property] = parse6(value + "", property, output.language);
  }
  for (const property in entry.annotations) {
    for (const annotation in entry.annotations[property]) {
      output[property + "+an:" + annotation] = parseAnnotation(entry.annotations[property][annotation]);
    }
  }
  return _objectSpread7(_objectSpread7({}, entry), {}, {
    properties: output
  });
}
function parse7(entries) {
  if (config_default.parse.strict) {
    validate3(entries, required.biblatex);
  }
  return parse5(entries.map(parseEntryValues));
}
function parseBibtex2(entries) {
  if (config_default.parse.strict) {
    validate3(entries, required.bibtex);
  }
  return parseBibtex(entries.map(parseEntryValues));
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/input/index.js
var ref2 = "@bibtex";
var formats4 = {
  "@biblatex/text": {
    parse: parse4,
    parseType: {
      dataType: "String",
      predicate: /@\s{0,5}[A-Za-z]{1,13}\s{0,5}\{\s{0,5}[^@{}"=,\\\s]{0,100}\s{0,5},[\s\S]*\}/
    }
  },
  "@biblatex/entry+object": {
    parse(input) {
      return parse7([input]);
    },
    parseType: {
      dataType: "SimpleObject",
      propertyConstraint: {
        props: ["type", "label", "properties"]
      }
    }
  },
  "@biblatex/entries+list": {
    parse: parse7,
    parseType: {
      elementConstraint: "@biblatex/entry+object"
    }
  },
  "@bibtex/text": {
    parse: parse4,
    outputs: "@bibtex/entries+list"
  },
  "@bibtex/entry+object": {
    parse(input) {
      return parseBibtex2([input]);
    }
  },
  "@bibtex/entries+list": {
    parse: parseBibtex2
  },
  "@bibtxt/text": {
    parse: parseBibTxt,
    parseType: {
      dataType: "String",
      predicate: /^\s*(\[(?!\s*[{[]).*?\]\s*(\n\s*[^[]((?!:)\S)+\s*:\s*.+?\s*)*\s*)+$/
    }
  }
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/output/value.js
var unicode2 = {};
for (const command in commands) {
  unicode2[commands[command]] = command;
}
for (const diacritic in diacritics) {
  unicode2[diacritics[diacritic]] = diacritic;
}
for (const ligature in ligatures) {
  unicode2[ligatures[ligature]] = ligature;
}
var mathUnicode = {};
for (const command in mathCommands) {
  mathUnicode[mathCommands[command]] = command;
}
var UNSAFE_UNICODE = /[^a-zA-Z0-9\s!"'()*+,\-./:;=?@[\]\u0300-\u0308\u030a-\u030c\u0332\u0323\u0327\u0328\u0361\u0326]/g;
var DIACRITIC_PATTERN = /.[\u0300-\u0308\u030a-\u030c\u0332\u0323\u0327\u0328\u0361\u0326]+/g;
var LONE_DIACRITIC_PATTERN = /[\u0300-\u0308\u030a-\u030c\u0332\u0323\u0327\u0328\u0361\u0326]/g;
var listDelimiters = {
  separated: ",",
  list: " and "
};
var richTextMappings = {
  i: "\\textit{",
  b: "\\textbf{",
  sc: "\\textsc{",
  sup: "\\textsuperscript{",
  sub: "\\textsubscript{",
  'span style="font-variant:small-caps;"': "\\textsc{",
  'span class="nocase"': "{"
};
function escapeCharacter(char) {
  if (char in unicode2) {
    return unicode2[char] in ligatures ? unicode2[char] : `\\${unicode2[char]}{}`;
  } else if (char in mathUnicode) {
    return `$\\${mathUnicode[char]}$`;
  } else if (/^[&%$#_{}]$/.test(char)) {
    return `\\${char}`;
  } else {
    return "";
  }
}
function escapeValue(value) {
  if (!config_default.format.asciiOnly) {
    return value;
  }
  return value.normalize("NFKD").replace(UNSAFE_UNICODE, (char) => escapeCharacter(char)).replace(DIACRITIC_PATTERN, (match) => Array.from(match).reduce((subject, diacritic) => `{\\${unicode2[diacritic]} ${subject}}`)).replace(LONE_DIACRITIC_PATTERN, "");
}
function formatRichText(value) {
  const closingTags = [];
  let tokens = value.split(/<(\/?(?:i|b|sc|sup|sub|span)|span .*?)>/g);
  tokens = tokens.map((token, index) => {
    if (index % 2 === 0) {
      return escapeValue(token);
    } else if (token in richTextMappings) {
      closingTags.push("/" + token.split(" ")[0]);
      return richTextMappings[token];
    } else if (token === closingTags[closingTags.length - 1]) {
      closingTags.pop();
      return "}";
    } else {
      return "";
    }
  });
  return tokens.join("");
}
function formatName(name3) {
  if (name3.family && !name3.prefix && !name3.given & !name3.suffix) {
    return name3.family.includes(listDelimiters.list) ? name3.family : `{${name3.family}}`;
  }
  const parts = [""];
  if (name3.prefix && name3.family) {
    parts[0] += name3.prefix + " ";
  }
  if (name3.family) {
    parts[0] += name3.family;
  }
  if (name3.suffix) {
    parts.push(name3.suffix);
    parts.push(name3.given || "");
  } else {
    parts.push(name3.given);
  }
  return escapeValue(parts.join(", ").trim());
}
function formatTitle(title) {
  return formatRichText(title).split(/(:\s*)/).map((part, i) => i % 2 ? part : part.replace(/([^\\])\b([a-z]*[A-Z].*?)\b/g, "$1{$2}")).join("");
}
function formatSingleValue(value, valueType) {
  switch (valueType) {
    case "title":
      return formatTitle(value);
    case "literal":
      return formatRichText(value.toString());
    case "name":
      return formatName(value);
    case "verbatim":
    case "uri":
      return value.toString();
    default:
      return escapeValue(value.toString());
  }
}
function formatList(values, valueType, listType) {
  const delimiter = listDelimiters[listType];
  return values.map((value) => {
    const formatted = formatSingleValue(value, valueType);
    return formatted.includes(delimiter) ? `{${formatted}}` : formatted;
  }).join(delimiter);
}
function formatAnnotationValue(values) {
  if (Array.isArray(values)) {
    return values.map((value) => escapeValue(value).replace(/([;,"])/g, "{$1}")).join(", ");
  } else {
    return '"' + escapeValue(values).replace(/(["])/g, "{$1}") + '"';
  }
}
function format4(field, value) {
  if (!(field in fieldTypes2)) {
    return formatSingleValue(value, "verbatim");
  }
  const [listType, valueType] = fieldTypes2[field];
  if (listType in listDelimiters) {
    return formatList(value, valueType, listType);
  } else {
    return formatSingleValue(value, valueType);
  }
}
function formatAnnotation(value) {
  const annotations = [];
  if (value.field) {
    annotations.push("=" + formatAnnotationValue(value.field));
  }
  if (value.item) {
    for (const [itemCount, itemValue] of Object.entries(value.item)) {
      if (!itemValue) {
        continue;
      }
      const i = parseInt(itemCount) + 1;
      annotations.push(i + "=" + formatAnnotationValue(itemValue));
    }
  }
  if (value.part) {
    for (const [itemCount, itemValue] of Object.entries(value.part)) {
      if (!itemValue) {
        continue;
      }
      const i = parseInt(itemCount) + 1;
      for (const part in itemValue) {
        if (!itemValue[part]) {
          continue;
        }
        annotations.push(i + ":" + part + "=" + formatAnnotationValue(itemValue[part]));
      }
    }
  }
  return annotations.join("; ");
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/output/entries.js
function formatEntryValues({
  type: type2,
  label,
  properties
}) {
  const output = {
    type: type2,
    label,
    properties: {}
  };
  for (const property in properties) {
    const value = properties[property];
    const [field, annotation] = property.split("+an:");
    if (annotation) {
      if (!output.annotations) {
        output.annotations = {};
      }
      if (!output.annotations[field]) {
        output.annotations[field] = {};
      }
      output.annotations[field][annotation] = formatAnnotation(value);
    } else {
      output.properties[property] = format4(property, value);
    }
  }
  return output;
}
function format5(entries) {
  return format3(entries).map(formatEntryValues);
}
function formatBibtex2(entries) {
  return formatBibtex(entries).map(formatEntryValues);
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/output/bibtex.js
function formatField(field, value, dict) {
  return dict.listItem.join(`${field} = {${value}},`);
}
function formatEntry(entry, dict) {
  const fields2 = [];
  for (const field in entry.properties) {
    fields2.push(formatField(field, entry.properties[field], dict));
    if (entry.annotations && entry.annotations[field]) {
      for (const annotation in entry.annotations[field]) {
        let annotationField = field + config_default.biber.annotationMarker;
        if (annotation !== "default") {
          annotationField += config_default.biber.namedAnnotationMarker + annotation;
        }
        fields2.push(formatField(annotationField, entry.annotations[field][annotation], dict));
      }
    }
  }
  return dict.entry.join(`@${entry.type}{${entry.label},${dict.list.join(fields2.join(""))}}`);
}
function format6(src, dict) {
  const entries = src.map((entry) => formatEntry(entry, dict)).join("");
  return dict.bibliographyContainer.join(entries);
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/output/bibtxt.js
function formatEntry2({
  type: type2,
  label,
  properties
}, dict) {
  const fields2 = Object.entries(properties).concat([["type", type2]]).map(([field, value]) => dict.listItem.join(`${field}: ${value}`));
  return dict.entry.join(`[${label}]${dict.list.join(fields2.join(""))}`);
}
function format7(src, dict) {
  const entries = src.map((entry) => formatEntry2(entry, dict)).join("\n");
  return dict.bibliographyContainer.join(entries);
}

// node_modules/@citation-js/plugin-bibtex/lib-mjs/output/index.js
var factory = function(mapper, formatter) {
  return function(data2, opts = {}) {
    const {
      type: type2,
      format: format9 = type2 || "text"
    } = opts;
    data2 = mapper(data2);
    if (format9 === "object") {
      return data2;
    } else if (plugins_exports.dict.has(format9)) {
      return formatter(data2, plugins_exports.dict.get(format9), opts);
    } else {
      throw new RangeError(`Output dictionary "${format9}" not available`);
    }
  };
};
var output_default2 = {
  bibtex: factory(formatBibtex2, format6),
  biblatex: factory(format5, format6),
  bibtxt: factory(formatBibtex2, format7)
};

// node_modules/@citation-js/plugin-bibtex/lib-mjs/index.js
plugins_exports.add(ref2, {
  input: formats4,
  output: output_default2,
  config: config_default
});

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/types.json
var types_default = {
  RIS: {
    ABST: "article-journal",
    ADVS: "motion_picture",
    AGGR: "dataset",
    ANCIENT: "classic",
    ART: "graphic",
    BILL: "bill",
    BLOG: "post-weblog",
    BOOK: "book",
    CASE: "legal_case",
    CHAP: "chapter",
    CHART: "figure",
    CLSWK: "classic",
    COMP: "software",
    CONF: "paper-conference",
    CPAPER: "paper-conference",
    CTLG: "entry",
    DATA: "dataset",
    DBASE: "dataset",
    DICT: "entry-dictionary",
    EBOOK: "book",
    ECHAP: "chapter",
    EDBOOK: "book",
    EJOUR: "article-journal",
    ELEC: "webpage",
    ENCYC: "entry-encyclopedia",
    EQUA: "article",
    FIGURE: "figure",
    GEN: "document",
    GOVDOC: "report",
    GRANT: "article",
    HEAR: "hearing",
    ICOMM: "personal_communication",
    INPR: "article-journal",
    JFULL: "article-journal",
    JOUR: "article-journal",
    LEGAL: "legislation",
    MANSCPT: "manuscript",
    MAP: "map",
    MGZN: "article-magazine",
    MPCT: "broadcast",
    MULTI: "motion_picture",
    MUSIC: "musical_score",
    NEWS: "article-newspaper",
    PAMP: "pamphlet",
    PAT: "patent",
    PCOMM: "personal_communication",
    RPRT: "report",
    SER: "periodical",
    SLIDE: "motion_picture",
    SOUND: "motion_picture",
    STAND: "standard",
    STAT: "legislation",
    THES: "thesis",
    UNBILL: "manuscript",
    UNPB: "manuscript",
    VIDEO: "motion_picture",
    WEB: "webpage"
  },
  CSL: {
    "article-journal": "JOUR",
    "article-magazine": "MGZN",
    "article-newspaper": "NEWS",
    article: "JOUR",
    bill: "BILL",
    book: "BOOK",
    broadcast: "MPCT",
    chapter: "CHAP",
    classic: "CLSWK",
    collection: "GEN",
    dataset: "DATA",
    document: "GEN",
    entry: "CTLG",
    "entry-dictionary": "DICT",
    "entry-encyclopedia": "ENCYC",
    event: "GEN",
    figure: "FIGURE",
    graphic: "ART",
    hearing: "HEAR",
    interview: "GEN",
    legal_case: "CASE",
    legislation: "LEGAL",
    manuscript: "MANSCPT",
    map: "MAP",
    motion_picture: "MPCT",
    musical_score: "MUSIC",
    pamphlet: "PAMP",
    "paper-conference": "CONF",
    patent: "PAT",
    performance: "GEN",
    periodical: "SER",
    personal_communication: "PCOMM",
    "post-weblog": "BLOG",
    post: "ICOMM",
    regulation: "LEGAL",
    report: "RPRT",
    "review-book": "BOOK",
    review: "JOUR",
    software: "COMP",
    song: "SOUND",
    speech: "SOUND",
    standard: "STAND",
    thesis: "THES",
    treaty: "GEN",
    webpage: "ELEC"
  }
};

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/new.json
var new_default = [
  {
    source: "A2",
    target: "editor",
    when: {
      source: {
        TY: [
          "ANCIENT",
          "BLOG",
          "CHAP",
          "CONF",
          "CPAPER",
          "DICT",
          "EBOOK",
          "ECHAP",
          "ENCYC",
          "MUSIC",
          "SER"
        ]
      },
      target: {
        type: [
          "chapter",
          "entry-dictionary",
          "entry-encyclopedia",
          "musical_score",
          "paper-conference",
          "periodical",
          "post-weblog"
        ]
      }
    }
  },
  {
    source: "A2",
    target: "performer",
    when: {
      source: {
        TY: [
          "ADVS",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "song",
          "speech"
        ]
      }
    }
  },
  {
    source: "A2",
    target: "collection-editor",
    when: {
      source: {
        TY: [
          "BOOK",
          "CLSWK",
          "COMP",
          "EDBOOK",
          "ELEC",
          "MAP",
          "MULTI",
          "RPRT",
          "UNPB"
        ]
      },
      target: {
        type: [
          "book",
          "classic",
          "map",
          "report",
          "review-book",
          "software",
          "webpage"
        ]
      }
    }
  },
  {
    source: "A2",
    target: "reporter",
    when: {
      source: {
        TY: [
          "CASE"
        ]
      },
      target: {
        type: [
          "legal_case"
        ]
      }
    }
  },
  {
    source: "A2",
    target: "producer",
    when: {
      source: {
        TY: [
          "DATA"
        ]
      },
      target: {
        type: [
          "dataset"
        ]
      }
    }
  },
  {
    source: "A2",
    target: "recipient",
    when: {
      source: {
        TY: [
          "ICOMM",
          "PCOMM"
        ]
      },
      target: {
        type: [
          "personal_communication",
          "post"
        ]
      }
    }
  },
  {
    source: "A3",
    target: "collection-editor",
    when: {
      source: {
        TY: [
          "ADVS",
          "CHAP",
          "CONF",
          "EBOOK",
          "MUSIC",
          "SER",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "chapter",
          "musical_score",
          "paper-conference",
          "periodical",
          "song",
          "speech"
        ]
      }
    }
  },
  {
    source: "A3",
    target: "illustrator",
    when: {
      source: {
        TY: [
          "BLOG"
        ]
      },
      target: {
        type: [
          "post-weblog"
        ]
      }
    }
  },
  {
    source: "A3",
    target: "editor",
    when: {
      source: {
        TY: [
          "BOOK"
        ]
      },
      target: {
        type: [
          "book",
          "review-book"
        ]
      }
    }
  },
  {
    source: "A3",
    target: "producer",
    when: {
      source: {
        TY: [
          "MPCT"
        ]
      },
      target: {
        type: [
          "broadcast",
          "motion_picture"
        ]
      }
    }
  },
  {
    source: "A4",
    target: "translator",
    when: {
      source: {
        TY: [
          "ANCIENT",
          "BOOK",
          "CHAP",
          "CLSWK",
          "CTLG",
          "DICT",
          "EDBOOK",
          "ENCYC",
          "GRANT",
          "PAMP"
        ]
      },
      target: {
        type: [
          "book",
          "chapter",
          "classic",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "pamphlet",
          "review-book"
        ]
      }
    }
  },
  {
    source: "A4",
    target: "performer",
    when: {
      source: {
        TY: [
          "MPCT"
        ]
      },
      target: {
        type: [
          "broadcast",
          "motion_picture"
        ]
      }
    }
  },
  {
    source: "A4",
    target: "producer",
    when: {
      source: {
        TY: [
          "MUSIC"
        ]
      },
      target: {
        type: [
          "musical_score"
        ]
      }
    }
  },
  {
    source: "AB",
    target: "abstract",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "AU",
    target: "author",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BLOG",
          "BOOK",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MULTI",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "book",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "interview",
          "legislation",
          "manuscript",
          "map",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "AU",
    target: "editor",
    when: {
      source: {
        TY: [
          "EDBOOK"
        ]
      },
      target: false
    }
  },
  {
    source: "AU",
    target: "director",
    when: {
      source: {
        TY: [
          "MPCT"
        ]
      },
      target: {
        type: [
          "broadcast",
          "motion_picture"
        ]
      }
    }
  },
  {
    source: "AU",
    target: "composer",
    when: {
      source: {
        TY: [
          "MUSIC"
        ]
      },
      target: {
        type: [
          "musical_score"
        ]
      }
    }
  },
  {
    source: "AU",
    target: "reporter",
    when: {
      source: {
        TY: [
          "NEWS"
        ]
      },
      target: {
        type: [
          "article-newspaper"
        ]
      }
    }
  },
  {
    source: "C1",
    target: "section",
    when: {
      source: {
        TY: [
          "CHAP",
          "ECHAP",
          "SER"
        ]
      },
      target: {
        type: [
          "chapter",
          "periodical"
        ]
      }
    }
  },
  {
    source: "C1",
    target: "publisher-place",
    when: {
      source: {
        TY: [
          "CONF",
          "CPAPER"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "C1",
    target: "scale",
    when: {
      source: {
        TY: [
          "MAP"
        ]
      },
      target: {
        type: [
          "map"
        ]
      }
    }
  },
  {
    source: "C2",
    target: "PMCID",
    when: {
      source: {
        TY: [
          "ABST",
          "INPR",
          "JFULL",
          "JOUR"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "review"
        ]
      }
    }
  },
  {
    source: "C2",
    target: "issue",
    when: {
      source: {
        TY: [
          "NEWS"
        ]
      },
      target: {
        type: [
          "article-newspaper"
        ]
      }
    }
  },
  {
    source: "C2",
    target: "number",
    when: {
      source: {
        TY: [
          "SER"
        ]
      },
      target: {
        type: [
          "periodical"
        ]
      }
    }
  },
  {
    source: "C3",
    target: "dimensions",
    when: {
      source: {
        TY: [
          "ADVS",
          "MAP",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "map",
          "song",
          "speech"
        ]
      }
    }
  },
  {
    source: "C3",
    target: "container-title",
    when: {
      source: {
        TY: [
          "CONF"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "C3",
    target: "PMCID",
    when: {
      source: {
        TY: [
          "EJOUR"
        ]
      },
      target: false
    }
  },
  {
    source: "C3",
    target: "jurisdiction",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: [
      "C3",
      "M1"
    ],
    target: "dimensions",
    when: {
      source: {
        TY: [
          "ART"
        ]
      },
      target: {
        type: [
          "graphic"
        ]
      }
    }
  },
  {
    source: "C5",
    target: "volume-title",
    when: {
      source: {
        TY: [
          "EJOUR"
        ]
      },
      target: false
    }
  },
  {
    source: "C5",
    target: "number",
    when: {
      source: {
        TY: [
          "GRANT"
        ]
      },
      target: false
    }
  },
  {
    source: "C5",
    target: "dimensions",
    when: {
      source: {
        TY: [
          "MULTI"
        ]
      },
      target: false
    }
  },
  {
    source: "C5",
    target: "references",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: [
      "C5",
      "PY"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "EBOOK"
        ]
      },
      target: false
    }
  },
  {
    source: "C6",
    target: "status",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: "C6",
    target: "issue",
    when: {
      source: {
        TY: [
          "RPRT"
        ]
      },
      target: {
        type: [
          "report"
        ]
      }
    }
  },
  {
    source: "C6",
    target: "volume",
    when: {
      source: {
        TY: [
          "STAT"
        ]
      },
      target: false
    }
  },
  {
    source: "C7",
    target: "number",
    when: {
      source: {
        TY: [
          "ABST",
          "INPR",
          "JFULL",
          "JOUR"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "review"
        ]
      }
    }
  },
  {
    source: "C7",
    target: "PMCID",
    when: {
      source: {
        TY: [
          "EBOOK",
          "ECHAP"
        ]
      },
      target: false
    }
  },
  {
    source: [
      "C7",
      "NV"
    ],
    target: "number",
    when: {
      source: {
        TY: [
          "EJOUR"
        ]
      },
      target: false
    }
  },
  {
    source: "CN",
    target: "call-number",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CTLG",
          "DATA",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "CY",
    target: "publisher-place",
    when: {
      source: {
        TY: [
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BLOG",
          "BOOK",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "HEAR",
          "ICOMM",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article-magazine",
          "article-newspaper",
          "book",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legislation",
          "manuscript",
          "map",
          "musical_score",
          "pamphlet",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "CY",
    target: "event-place",
    when: {
      source: {
        TY: [
          "CONF",
          "CPAPER"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "DA",
    target: "accessed",
    when: {
      source: {
        TY: [
          "AGGR",
          "DBASE",
          "EBOOK",
          "EJOUR",
          "MULTI"
        ]
      },
      target: false
    }
  },
  {
    source: [
      "DA",
      "C2"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "CONF"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: [
      "DA",
      "PY",
      "C2"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: [
      "DA",
      "PY"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHART",
          "CPAPER",
          "CTLG",
          "DATA",
          "EDBOOK",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "PAMP",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "bill",
          "book",
          "broadcast",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: [
      "DA",
      "PY",
      "Y2"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "STAT"
        ]
      },
      target: false
    }
  },
  {
    source: [
      "DA",
      "Y2"
    ],
    target: "accessed",
    when: {
      source: {
        TY: [
          "ECHAP"
        ]
      },
      target: false
    }
  },
  {
    source: "DB",
    target: "source",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "DO",
    target: "DOI",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "ET",
    target: "edition",
    when: {
      source: {
        TY: [
          "ADVS",
          "ANCIENT",
          "ART",
          "BLOG",
          "BOOK",
          "CHAP",
          "CLSWK",
          "CONF",
          "CTLG",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "GEN",
          "GOVDOC",
          "LEGAL",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "NEWS",
          "PAMP",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article-magazine",
          "article-newspaper",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "graphic",
          "interview",
          "legislation",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "performance",
          "periodical",
          "post-weblog",
          "regulation",
          "report",
          "review-book",
          "song",
          "speech",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "ET",
    target: "version",
    when: {
      source: {
        TY: [
          "CHART",
          "COMP",
          "DATA",
          "EQUA",
          "FIGURE"
        ]
      },
      target: {
        type: [
          "dataset",
          "figure",
          "software"
        ]
      }
    }
  },
  {
    source: "ET",
    target: "available-date",
    when: {
      source: {
        TY: [
          "ABST",
          "INPR",
          "JFULL",
          "JOUR"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "review"
        ]
      }
    }
  },
  {
    source: "ET",
    target: "medium",
    when: {
      source: {
        TY: [
          "MANSCPT"
        ]
      },
      target: {
        type: [
          "manuscript"
        ]
      }
    }
  },
  {
    source: [
      "ET",
      "PY"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "AGGR",
          "DBASE"
        ]
      },
      target: false
    }
  },
  {
    source: "ID",
    target: "id"
  },
  {
    source: "IS",
    target: "number-of-volumes",
    when: {
      source: {
        TY: [
          "CHAP"
        ]
      },
      target: {
        type: [
          "chapter"
        ]
      }
    }
  },
  {
    source: "IS",
    target: "issue",
    when: {
      source: {
        TY: [
          "ABST",
          "INPR",
          "JFULL",
          "JOUR"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "review"
        ]
      }
    }
  },
  {
    source: "J2",
    target: "container-title-short",
    when: {
      source: {
        TY: [
          "ABST",
          "ANCIENT",
          "BOOK",
          "CHAP",
          "CTLG",
          "DATA",
          "DICT",
          "ENCYC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MGZN",
          "PAMP",
          "PCOMM",
          "SER",
          "STAND",
          "STAT",
          "UNPB"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "book",
          "chapter",
          "dataset",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "legislation",
          "manuscript",
          "pamphlet",
          "periodical",
          "personal_communication",
          "post",
          "regulation",
          "review",
          "review-book",
          "standard"
        ]
      }
    }
  },
  {
    source: "KW",
    target: "keyword",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "LA",
    target: "language",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "LB",
    target: "citation-label",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "M1",
    target: "number",
    when: {
      source: {
        TY: [
          "ADVS",
          "AGGR",
          "ANCIENT",
          "BILL",
          "CHART",
          "DICT",
          "EQUA",
          "FIGURE",
          "GEN",
          "HEAR",
          "SLIDE",
          "SOUND",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "bill",
          "collection",
          "document",
          "entry-dictionary",
          "event",
          "figure",
          "hearing",
          "interview",
          "performance",
          "song",
          "speech",
          "thesis",
          "treaty"
        ]
      }
    }
  },
  {
    source: "M1",
    target: "collection-number",
    when: {
      source: {
        TY: [
          "BOOK",
          "CLSWK",
          "CTLG",
          "EDBOOK",
          "PAMP",
          "SER"
        ]
      },
      target: {
        type: [
          "book",
          "classic",
          "entry",
          "pamphlet",
          "periodical",
          "review-book"
        ]
      }
    }
  },
  {
    source: "M1",
    target: "issue",
    when: {
      source: {
        TY: [
          "CONF",
          "EJOUR",
          "GOVDOC",
          "MGZN"
        ]
      },
      target: {
        type: [
          "article-magazine",
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "M1",
    target: "chapter-number",
    when: {
      source: {
        TY: [
          "ECHAP"
        ]
      },
      target: false
    }
  },
  {
    source: "M1",
    target: "status",
    when: {
      source: {
        TY: [
          "GRANT"
        ]
      },
      target: false
    }
  },
  {
    source: "M1",
    target: "page-first",
    when: {
      source: {
        TY: [
          "LEGAL",
          "NEWS",
          "STAND"
        ]
      },
      target: {
        type: [
          "article-newspaper",
          "legislation",
          "regulation",
          "standard"
        ]
      }
    }
  },
  {
    source: [
      "M1",
      "NV"
    ],
    target: "number",
    when: {
      source: {
        TY: "STAT"
      },
      target: false
    }
  },
  {
    source: [
      "NV",
      "M1"
    ],
    target: "number",
    when: {
      source: {
        TY: [
          "ICOMM",
          "MANSCPT",
          "PCOMM"
        ]
      },
      target: {
        type: [
          "manuscript",
          "personal_communication",
          "post"
        ]
      }
    }
  },
  {
    source: [
      "M1",
      "VL"
    ],
    target: "accessed",
    when: {
      source: {
        TY: [
          "ELEC"
        ]
      },
      target: {
        type: [
          "webpage"
        ]
      }
    }
  },
  {
    source: "M2",
    target: "page-first",
    when: {
      source: {
        TY: [
          "ABST",
          "INPR",
          "JFULL",
          "JOUR"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "review"
        ]
      }
    }
  },
  {
    source: "M2",
    target: "number-of-pages",
    when: {
      source: {
        TY: [
          "PAMP"
        ]
      },
      target: {
        type: [
          "pamphlet"
        ]
      }
    }
  },
  {
    source: "M3",
    target: "genre",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BOOK",
          "CHART",
          "CLSWK",
          "COMP",
          "CPAPER",
          "CTLG",
          "DBASE",
          "DICT",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "EQUA",
          "FIGURE",
          "GEN",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MULTI",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "book",
          "classic",
          "collection",
          "document",
          "entry",
          "entry-dictionary",
          "event",
          "figure",
          "graphic",
          "interview",
          "legislation",
          "manuscript",
          "map",
          "pamphlet",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty"
        ]
      }
    }
  },
  {
    source: "M3",
    target: "medium",
    when: {
      source: {
        TY: [
          "BLOG",
          "EBOOK",
          "ELEC",
          "MPCT",
          "MUSIC"
        ]
      },
      target: {
        type: [
          "broadcast",
          "motion_picture",
          "musical_score",
          "post-weblog",
          "webpage"
        ]
      }
    }
  },
  {
    source: [
      "N1",
      "RN"
    ],
    target: "note",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PCOMM",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: [
      "N1",
      "RN",
      "RP"
    ],
    target: "note",
    when: {
      source: {
        TY: [
          "PAT",
          "RPRT"
        ]
      },
      target: {
        type: [
          "patent",
          "report"
        ]
      }
    }
  },
  {
    source: "NV",
    target: "number-of-volumes",
    when: {
      source: {
        TY: [
          "ANCIENT",
          "BOOK",
          "CLSWK",
          "CONF",
          "DICT",
          "ECHAP",
          "EDBOOK",
          "ENCYC",
          "GEN",
          "HEAR",
          "MUSIC",
          "SER"
        ]
      },
      target: {
        type: [
          "book",
          "classic",
          "collection",
          "document",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "hearing",
          "interview",
          "musical_score",
          "paper-conference",
          "performance",
          "periodical",
          "review-book",
          "treaty"
        ]
      }
    }
  },
  {
    source: "NV",
    target: "number",
    when: {
      source: {
        TY: [
          "CTLG",
          "DATA"
        ]
      },
      target: {
        type: [
          "dataset",
          "entry"
        ]
      }
    }
  },
  {
    source: "NV",
    target: "version",
    when: {
      source: {
        TY: [
          "EBOOK"
        ]
      },
      target: false
    }
  },
  {
    source: "NV",
    target: "dimensions",
    when: {
      source: {
        TY: [
          "GRANT"
        ]
      },
      target: false
    }
  },
  {
    source: "NV",
    target: "collection-number",
    when: {
      source: {
        TY: [
          "RPRT"
        ]
      },
      target: {
        type: [
          "report"
        ]
      }
    }
  },
  {
    source: "OP",
    target: "original-title",
    when: {
      source: {
        TY: [
          "ABST",
          "AGGR",
          "ANCIENT",
          "BOOK",
          "CHAP",
          "CLSWK",
          "CTLG",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "ENCYC",
          "GEN",
          "INPR",
          "JFULL",
          "JOUR",
          "MGZN",
          "MUSIC",
          "PAMP",
          "SER"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "book",
          "chapter",
          "classic",
          "collection",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "interview",
          "musical_score",
          "pamphlet",
          "performance",
          "periodical",
          "review",
          "review-book",
          "treaty"
        ]
      }
    }
  },
  {
    source: "OP",
    target: "references",
    when: {
      source: {
        TY: [
          "BILL",
          "CASE",
          "HEAR",
          "LEGAL",
          "STAT",
          "UNBILL"
        ]
      },
      target: {
        type: [
          "bill",
          "hearing",
          "legal_case",
          "legislation",
          "regulation"
        ]
      }
    }
  },
  {
    source: "PB",
    target: "publisher",
    when: {
      source: {
        TY: [
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BLOG",
          "BOOK",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "LEGAL",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PCOMM",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article-magazine",
          "article-newspaper",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legislation",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "PB",
    target: "authority",
    when: {
      source: {
        TY: [
          "CASE"
        ]
      },
      target: {
        type: [
          "legal_case"
        ]
      }
    }
  },
  {
    source: "PB",
    target: "archive",
    when: {
      source: {
        TY: [
          "MANSCPT"
        ]
      },
      target: {
        type: [
          "manuscript"
        ]
      }
    }
  },
  {
    source: [
      "PB",
      "A3"
    ],
    target: "publisher",
    when: {
      source: {
        TY: [
          "RPRT"
        ]
      },
      target: {
        type: [
          "report"
        ]
      }
    }
  },
  {
    source: [
      "PB",
      "C5"
    ],
    target: "publisher",
    when: {
      source: {
        TY: [
          "STAT"
        ]
      },
      target: false
    }
  },
  {
    source: "PY",
    target: "issued",
    when: {
      source: {
        TY: [
          "CHAP",
          "CLSWK",
          "COMP",
          "DICT",
          "ECHAP",
          "GOVDOC",
          "MULTI",
          "NEWS"
        ]
      },
      target: {
        type: [
          "article-newspaper",
          "chapter",
          "classic",
          "entry-dictionary",
          "software"
        ]
      }
    }
  },
  {
    source: "PY",
    target: "event-date",
    when: {
      source: {
        TY: [
          "CONF"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "RI",
    target: "reviewed-title",
    when: {
      source: {
        TY: [
          "ABST",
          "ANCIENT",
          "CHAP",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EJOUR",
          "ENCYC",
          "GEN",
          "GRANT",
          "INPR",
          "JFULL",
          "JOUR",
          "MGZN",
          "NEWS",
          "SER"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "chapter",
          "collection",
          "document",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "interview",
          "performance",
          "periodical",
          "review",
          "treaty"
        ]
      }
    }
  },
  {
    source: "RI",
    target: "locator",
    when: {
      source: {
        TY: [
          "STAT"
        ]
      },
      target: false
    }
  },
  {
    source: "SE",
    target: "section",
    when: {
      source: {
        TY: [
          "BILL",
          "GEN",
          "GOVDOC",
          "MUSIC",
          "NEWS",
          "STAT",
          "UNBILL"
        ]
      },
      target: {
        type: [
          "article-newspaper",
          "bill",
          "collection",
          "document",
          "event",
          "interview",
          "musical_score",
          "performance",
          "treaty"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "number",
    when: {
      source: {
        TY: [
          "BLOG"
        ]
      },
      target: {
        type: [
          "post-weblog"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "chapter-number",
    when: {
      source: {
        TY: [
          "CHAP",
          "SER"
        ]
      },
      target: {
        type: [
          "chapter",
          "periodical"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "page",
    when: {
      source: {
        TY: [
          "BOOK"
        ]
      },
      target: {
        type: [
          "book",
          "review-book"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "submitted",
    when: {
      source: {
        TY: [
          "CASE"
        ]
      },
      target: {
        type: [
          "legal_case"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "number-of-pages",
    when: {
      source: {
        TY: [
          "CTLG"
        ]
      },
      target: {
        type: [
          "entry"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "original-date",
    when: {
      source: {
        TY: [
          "DATA"
        ]
      },
      target: {
        type: [
          "dataset"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "version",
    when: {
      source: {
        TY: [
          "DICT"
        ]
      },
      target: {
        type: [
          "entry-dictionary"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "locator",
    when: {
      source: {
        TY: [
          "STAND"
        ]
      },
      target: {
        type: [
          "standard"
        ]
      }
    }
  },
  {
    source: "SE",
    target: "page-first",
    when: {
      source: {
        TY: [
          "MANSCPT",
          "MGZN"
        ]
      },
      target: {
        type: [
          "article-magazine",
          "manuscript"
        ]
      }
    }
  },
  {
    source: [
      "SE",
      "PY"
    ],
    target: "issued",
    when: {
      source: {
        TY: [
          "EJOUR"
        ]
      },
      target: false
    }
  },
  {
    source: [
      "SE",
      "T2"
    ],
    target: "locator",
    when: {
      source: {
        TY: [
          "LEGAL"
        ]
      },
      target: {
        type: [
          "legislation",
          "regulation"
        ]
      }
    }
  },
  {
    source: "SN",
    target: [
      "ISSN",
      "ISBN"
    ],
    when: {
      source: {
        TY: [
          "AGGR",
          "CLSWK",
          "GEN"
        ]
      },
      target: {
        type: [
          "classic",
          "collection",
          "document",
          "event",
          "interview",
          "performance",
          "treaty"
        ]
      }
    }
  },
  {
    source: "SN",
    target: "ISBN",
    when: {
      source: {
        TY: [
          "ADVS",
          "ANCIENT",
          "BLOG",
          "BOOK",
          "CHAP",
          "COMP",
          "CONF",
          "CTLG",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "ELEC",
          "ENCYC",
          "HEAR",
          "MAP",
          "PAMP",
          "SER",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "book",
          "chapter",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "hearing",
          "map",
          "pamphlet",
          "paper-conference",
          "periodical",
          "post-weblog",
          "review-book",
          "software",
          "song",
          "speech",
          "webpage"
        ]
      }
    }
  },
  {
    source: "SN",
    target: "ISSN",
    when: {
      source: {
        TY: [
          "ABST",
          "DATA",
          "EJOUR",
          "INPR",
          "JFULL",
          "JOUR",
          "MGZN",
          "MUSIC",
          "NEWS"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "dataset",
          "musical_score",
          "review"
        ]
      }
    }
  },
  {
    source: "SN",
    target: "number",
    when: {
      source: {
        TY: [
          "DBASE",
          "GOVDOC"
        ]
      },
      target: false
    }
  },
  {
    source: [
      "SN",
      "M1"
    ],
    target: "number",
    when: {
      source: {
        TY: [
          "RPRT"
        ]
      },
      target: {
        type: [
          "report"
        ]
      }
    }
  },
  {
    source: [
      "SN",
      "SE",
      "M1"
    ],
    target: "number",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: [
      "SN",
      "T3"
    ],
    target: "number",
    when: {
      source: {
        TY: [
          "LEGAL",
          "STAND"
        ]
      },
      target: {
        type: [
          "legislation",
          "regulation",
          "standard"
        ]
      }
    }
  },
  {
    source: "SP",
    target: "page",
    when: {
      source: {
        TY: [
          "ABST",
          "AGGR",
          "ANCIENT",
          "BILL",
          "CHAP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DBASE",
          "DICT",
          "ECHAP",
          "EJOUR",
          "ENCYC",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MGZN",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "STAND",
          "STAT",
          "UNBILL",
          "UNPB"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "chapter",
          "collection",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "hearing",
          "interview",
          "legislation",
          "manuscript",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "regulation",
          "report",
          "review",
          "standard",
          "treaty"
        ]
      }
    }
  },
  {
    source: "SP",
    target: "number-of-pages",
    when: {
      source: {
        TY: [
          "BOOK",
          "CLSWK",
          "EBOOK",
          "EDBOOK",
          "THES"
        ]
      },
      target: {
        type: [
          "book",
          "classic",
          "review-book",
          "thesis"
        ]
      }
    }
  },
  {
    source: "SP",
    target: "page-first",
    when: {
      source: {
        TY: [
          "CASE"
        ]
      },
      target: {
        type: [
          "legal_case"
        ]
      }
    }
  },
  {
    source: "SP",
    target: "dimensions",
    when: {
      source: {
        TY: [
          "MPCT"
        ]
      },
      target: {
        type: [
          "broadcast",
          "motion_picture"
        ]
      }
    }
  },
  {
    source: "ST",
    target: "title-short",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CLSWK",
          "COMP",
          "CONF",
          "CTLG",
          "DATA",
          "DICT",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "GEN",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "SV",
    target: "collection-number",
    when: {
      source: {
        TY: [
          "CHAP"
        ]
      },
      target: {
        type: [
          "chapter"
        ]
      }
    }
  },
  {
    source: "T2",
    target: "collection-title",
    when: {
      source: {
        TY: [
          "AGGR",
          "BOOK",
          "CLSWK",
          "COMP",
          "CTLG",
          "DBASE",
          "ELEC",
          "MANSCPT",
          "MAP",
          "MPCT",
          "MULTI",
          "RPRT",
          "UNPB"
        ]
      },
      target: {
        type: [
          "book",
          "broadcast",
          "classic",
          "entry",
          "manuscript",
          "map",
          "motion_picture",
          "report",
          "review-book",
          "software",
          "webpage"
        ]
      }
    }
  },
  {
    source: "T2",
    target: "container-title",
    when: {
      source: {
        TY: [
          "ABST",
          "ANCIENT",
          "BILL",
          "BLOG",
          "CHAP",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ENCYC",
          "GEN",
          "INPR",
          "JFULL",
          "JOUR",
          "MGZN",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "SER",
          "STAT",
          "THES",
          "UNBILL"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "chapter",
          "collection",
          "document",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "interview",
          "musical_score",
          "pamphlet",
          "patent",
          "performance",
          "periodical",
          "post-weblog",
          "review",
          "thesis",
          "treaty"
        ]
      }
    }
  },
  {
    source: "T2",
    target: "event",
    when: {
      source: {
        TY: [
          "CONF",
          "CPAPER"
        ]
      },
      target: {
        type: [
          "paper-conference"
        ]
      }
    }
  },
  {
    source: "T2",
    target: "committee",
    when: {
      source: {
        TY: [
          "HEAR"
        ]
      },
      target: {
        type: [
          "hearing"
        ]
      }
    }
  },
  {
    source: "T2",
    target: "section",
    when: {
      source: {
        TY: [
          "STAND"
        ]
      },
      target: {
        type: [
          "standard"
        ]
      }
    }
  },
  {
    source: "T3",
    target: "collection-title",
    when: {
      source: {
        TY: [
          "ADVS",
          "ANCIENT",
          "CHAP",
          "CONF",
          "DATA",
          "EBOOK",
          "ECHAP",
          "EJOUR",
          "GEN",
          "GOVDOC",
          "MUSIC",
          "SER",
          "SLIDE",
          "SOUND",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "chapter",
          "collection",
          "dataset",
          "document",
          "event",
          "interview",
          "musical_score",
          "paper-conference",
          "performance",
          "periodical",
          "song",
          "speech",
          "treaty"
        ]
      }
    }
  },
  {
    source: "TI",
    target: "title",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: "TY",
    target: "type"
  },
  {
    source: "UR",
    target: "URL",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "post-weblog",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty",
          "webpage"
        ]
      }
    }
  },
  {
    source: [
      "UR",
      "L4"
    ],
    target: "URL",
    when: {
      source: {
        TY: [
          "HEAR"
        ]
      },
      target: {
        type: [
          "hearing"
        ]
      }
    }
  },
  {
    source: "VL",
    target: "volume",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "BILL",
          "BOOK",
          "CASE",
          "CHAP",
          "CLSWK",
          "CONF",
          "CPAPER",
          "CTLG",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ENCYC",
          "GEN",
          "GOVDOC",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MGZN",
          "MUSIC",
          "NEWS",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "UNBILL",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "chapter",
          "classic",
          "collection",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "musical_score",
          "paper-conference",
          "performance",
          "periodical",
          "regulation",
          "report",
          "review",
          "review-book",
          "song",
          "speech",
          "standard",
          "treaty"
        ]
      }
    }
  },
  {
    source: "VL",
    target: "dimensions",
    when: {
      source: {
        TY: [
          "CHART",
          "EQUA",
          "FIGURE"
        ]
      },
      target: {
        type: [
          "figure"
        ]
      }
    }
  },
  {
    source: "VL",
    target: "edition",
    when: {
      source: {
        TY: [
          "COMP"
        ]
      },
      target: {
        type: [
          "software"
        ]
      }
    }
  },
  {
    source: "VL",
    target: "number",
    when: {
      source: {
        TY: [
          "PAMP"
        ]
      },
      target: {
        type: [
          "pamphlet"
        ]
      }
    }
  },
  {
    source: "VL",
    target: "version",
    when: {
      source: {
        TY: [
          "PAT"
        ]
      },
      target: {
        type: [
          "patent"
        ]
      }
    }
  },
  {
    source: [
      "VL",
      "Y2"
    ],
    target: "accessed",
    when: {
      source: {
        TY: [
          "BLOG"
        ]
      },
      target: {
        type: [
          "post-weblog"
        ]
      }
    }
  },
  {
    source: "Y2",
    target: "accessed",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "ANCIENT",
          "ART",
          "BILL",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DICT",
          "EDBOOK",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        type: [
          "article",
          "article-journal",
          "article-magazine",
          "article-newspaper",
          "bill",
          "book",
          "broadcast",
          "chapter",
          "classic",
          "collection",
          "dataset",
          "document",
          "entry",
          "entry-dictionary",
          "entry-encyclopedia",
          "event",
          "figure",
          "graphic",
          "hearing",
          "interview",
          "legal_case",
          "legislation",
          "manuscript",
          "map",
          "motion_picture",
          "musical_score",
          "pamphlet",
          "paper-conference",
          "patent",
          "performance",
          "periodical",
          "personal_communication",
          "post",
          "regulation",
          "report",
          "review",
          "review-book",
          "software",
          "song",
          "speech",
          "standard",
          "thesis",
          "treaty"
        ]
      }
    }
  },
  {
    source: "C4",
    target: "author",
    when: {
      source: {
        TY: [
          "BOOK",
          "CHAP",
          "EBOOK",
          "ECHAP",
          "EJOUR"
        ]
      },
      target: {
        "reviewed-author": true,
        type: [
          "book",
          "chapter",
          "review-book",
          "review"
        ]
      }
    }
  },
  {
    source: "AU",
    target: "reviewed-author",
    when: {
      source: {
        C4: true,
        TY: [
          "BOOK",
          "CHAP",
          "EBOOK",
          "ECHAP",
          "EJOUR"
        ]
      },
      target: {
        type: [
          "book",
          "chapter",
          "review-book",
          "review"
        ]
      }
    }
  },
  {
    source: "TA",
    target: "author",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        "original-author": true,
        translator: true
      }
    }
  },
  {
    source: "AU",
    target: "original-author",
    when: {
      source: {
        TA: true,
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        translator: true
      }
    }
  },
  {
    source: "TT",
    target: "title",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        "original-author": true,
        translator: true
      }
    }
  },
  {
    source: "TI",
    target: "original-title",
    when: {
      source: {
        TT: true,
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ]
      },
      target: {
        translator: true
      }
    }
  }
];

// node_modules/@citation-js/plugin-ris/lib-mjs/converters.js
var import_date3 = __toESM(require_lib2());
var ISSN_REGEX = /^\d{4}-\d{3}[0-9Xx]$/;
var DOI_REGEX = /10(?:\.[0-9]{4,})?\/[^\s]*[^\s.,]/;
var CONVERTERS = {
  ANY: {
    toTarget(...values) {
      return values.find(Boolean);
    },
    toSource(value) {
      return [value];
    }
  },
  PAGE: {
    keepAll: true,
    toTarget(start, end) {
      return [start, end].filter(Boolean).join("-");
    },
    toSource(pages) {
      return pages.replace(/[-–—]/g, "-");
    }
  },
  ISBN: {
    toTarget(id) {
      return ISSN_REGEX.test(id) ? [id] : [void 0, id];
    },
    toSource(...ids) {
      return ids.find(Boolean);
    }
  },
  DATE: {
    toTarget(date) {
      return date && (0, import_date3.parse)(date.split("/").slice(0, 3).filter(Boolean).join("/"));
    },
    toSource(date) {
      if (!date["date-parts"] || !date["date-parts"][0]) {
        return void 0;
      }
      const parts = Array(4).fill("");
      date["date-parts"][0].forEach((part, index) => {
        parts[index] = part;
      });
      if (date.season) {
        parts[3] = date.season;
      }
      return parts.join("/");
    }
  },
  YEAR: {
    toTarget(year) {
      return isNaN(+year) ? {
        raw: year
      } : {
        "date-parts": [[+year]]
      };
    },
    toSource(date) {
      var _date$dateParts;
      return (_date$dateParts = date["date-parts"]) === null || _date$dateParts === void 0 || (_date$dateParts = _date$dateParts[0]) === null || _date$dateParts === void 0 || (_date$dateParts = _date$dateParts[0]) === null || _date$dateParts === void 0 ? void 0 : _date$dateParts.toString();
    }
  },
  DATE_YEAR: {
    keepAll: true,
    toTarget(...dates) {
      return CONVERTERS.DATE.toTarget(CONVERTERS.ANY.toTarget(...dates));
    },
    toSource(date) {
      return [CONVERTERS.DATE.toSource(date), CONVERTERS.YEAR.toSource(date)];
    }
  },
  NAME: {
    toTarget(names) {
      return names && [].concat(names).map((name3) => {
        const parts = name3.split(/, ?/);
        const [family, given, suffix] = parts;
        switch (parts.length) {
          case 3:
            return {
              family,
              given,
              suffix
            };
          case 2:
            return {
              family,
              given
            };
          case 1:
            if (family.indexOf(" ") === -1) {
              return {
                family
              };
            }
          default:
            return {
              literal: name3
            };
        }
      });
    },
    toSource(names) {
      return names.map(({
        family,
        given,
        suffix,
        literal
      }) => {
        const parts = [family, given, suffix].filter(Boolean);
        return parts.length ? parts.join(", ") : literal;
      });
    }
  },
  KEYWORD: {
    toTarget(words) {
      words = [].concat(words);
      return words.join(",");
    },
    toSource(words) {
      return words.split(",");
    }
  },
  ID: {
    toSource(id) {
      return id.toString().slice(0, 20);
    }
  },
  TYPE: {
    toTarget(type2) {
      return types_default.RIS[type2];
    },
    toSource(type2) {
      return types_default.CSL[type2];
    }
  },
  DOI: {
    toTarget(doi2) {
      const match = doi2.match(DOI_REGEX);
      return match ? match[0] : void 0;
    },
    toSource(doi2) {
      const match = doi2.match(DOI_REGEX);
      return match ? match[0] : void 0;
    }
  }
};
var converters_default = CONVERTERS;

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/old.js
var old_default = [{
  source: "TY",
  target: "type"
}, {
  source: "ID",
  target: "id"
}, {
  source: ["T1", "TI", "CT"],
  target: "title"
}, {
  source: "BT",
  target: "title",
  when: {
    source: {
      type: ["BOOK", "UNPB"],
      T1: false,
      TI: false,
      CT: false
    },
    target: false
  }
}, {
  source: "T2",
  target: "container-title",
  when: {
    target: {
      type: ["bill", "book", "broadcast", "chapter", "dataset", "entry", "entry-dictionary", "entry-encyclopedia", "figure", "graphic", "interview", "legal_case", "legislation", "manuscript", "map", "motion_picture", "musical_score", "pamphlet", "paper-conference", "patent", "personal_communication", "post", "post-weblog", "report", "review", "review-book", "song", "speech", "thesis", "treaty", "webpage"]
    }
  }
}, {
  source: "BT",
  target: "container-title",
  when: {
    source: {
      type: ["ABST", "ADVS", "ART", "BILL", "CASE", "CHAP", "COMP", "CONF", "CTLG", "DATA", "ELEC", "GEN", "HEAR", "ICOMM", "INPR", "JFULL", "JOUR", "MAP", "MGZN", "MPCT", "MUSIC", "NEWS", "PAMP", "PAT", "PCOMM", "RPRT", "SER", "SLIDE", "SOUND", "STAT", "THES", "UNBILL", "VIDEO"],
      T2: false
    },
    target: false
  }
}, {
  source: "T3",
  target: "collection-title"
}, {
  source: ["A1", "AU"],
  target: "author"
}, {
  source: ["A2", "ED"],
  target: "editor"
}, {
  source: "A3",
  target: "collection-editor"
}, {
  source: ["Y1", "PY"],
  target: "issued"
}, {
  source: "Y2",
  target: "event-date",
  convert: converters_default.DATE,
  when: {
    source: {
      type: ["CONF", "CPAPER"]
    },
    target: {
      type: ["paper-conference"]
    }
  }
}, {
  source: "Y2",
  target: "submitted",
  convert: converters_default.DATE,
  when: {
    source: {
      type: ["PAT"]
    },
    target: {
      type: "patent"
    }
  }
}, {
  source: ["AB", "N1"],
  target: "note"
}, {
  source: "N2",
  target: "abstract"
}, {
  source: "KW",
  target: "keyword"
}, {
  source: ["JF", "JO"],
  target: "container-title",
  convert: converters_default.ANY,
  when: {
    target: {
      type: ["article", "article-journal", "article-magazine", "article-newspaper"]
    }
  }
}, {
  source: ["JA", "J1", "J2"],
  target: "container-title-short"
}, {
  source: "VL",
  target: "volume"
}, {
  source: ["IS", "CP"],
  target: "issue"
}, {
  source: "SP",
  target: "page-first"
}, {
  source: ["SP", "EP"],
  target: "page",
  convert: converters_default.PAGE,
  when: {
    source: {
      SP: true,
      EP: true
    }
  }
}, {
  source: "CY",
  target: "publisher-place"
}, {
  source: "PB",
  target: "publisher"
}, {
  source: "SN",
  target: ["ISSN", "ISBN"]
}, {
  source: "AV",
  target: "archive_location"
}, {
  source: "UR",
  target: "URL"
}];

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/additions.json
var additions_default = [
  {
    source: [
      "T1",
      "BT"
    ],
    target: "title",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ],
        TI: false
      },
      target: false
    }
  },
  {
    source: "A1",
    target: "author",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BLOG",
          "BOOK",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MULTI",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNPB",
          "VIDEO"
        ],
        AU: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "CONF"
        ],
        C2: false,
        DA: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "PAT"
        ],
        C2: false,
        DA: false,
        PY: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "EBOOK"
        ],
        C5: false,
        PY: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHART",
          "CPAPER",
          "CTLG",
          "DATA",
          "EDBOOK",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MUSIC",
          "PAMP",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ],
        DA: false,
        PY: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "STAT"
        ],
        DA: false,
        PY: false,
        Y2: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "AGGR",
          "DBASE"
        ],
        ET: false,
        PY: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "CHAP",
          "CLSWK",
          "COMP",
          "DICT",
          "ECHAP",
          "GOVDOC",
          "MULTI",
          "NEWS"
        ],
        PY: false
      },
      target: false
    }
  },
  {
    source: "Y1",
    target: "issued",
    when: {
      source: {
        TY: [
          "EJOUR"
        ],
        PY: false,
        SE: false
      },
      target: false
    }
  },
  {
    source: [
      "JO",
      "JF",
      "J1"
    ],
    target: "container-title",
    when: {
      source: {
        TY: [
          "CONF"
        ],
        C3: false
      },
      target: false
    }
  },
  {
    source: [
      "JO",
      "JF",
      "J1"
    ],
    target: "container-title",
    when: {
      source: {
        TY: [
          "ABST",
          "ANCIENT",
          "BILL",
          "BLOG",
          "CHAP",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ENCYC",
          "GEN",
          "INPR",
          "JFULL",
          "JOUR",
          "MGZN",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "SER",
          "STAT",
          "THES",
          "UNBILL"
        ],
        T2: false
      },
      target: false
    }
  },
  {
    source: "JA",
    target: "container-title-short",
    when: {
      source: {
        TY: [
          "ABST",
          "ANCIENT",
          "BOOK",
          "CHAP",
          "CTLG",
          "DATA",
          "DICT",
          "ENCYC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MGZN",
          "PAMP",
          "PCOMM",
          "SER",
          "STAND",
          "STAT",
          "UNPB"
        ],
        J2: false
      },
      target: false
    }
  },
  {
    source: "N2",
    target: "abstract",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ],
        AB: false
      },
      target: false
    }
  },
  {
    source: [
      "SP",
      "EP"
    ],
    target: "page",
    when: {
      source: {
        TY: [
          "BOOK"
        ],
        SE: false
      },
      target: false
    }
  },
  {
    source: [
      "SP",
      "EP"
    ],
    target: "page",
    when: {
      source: {
        TY: [
          "ABST",
          "AGGR",
          "ANCIENT",
          "BILL",
          "CHAP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DBASE",
          "DICT",
          "ECHAP",
          "EJOUR",
          "ENCYC",
          "GEN",
          "GOVDOC",
          "GRANT",
          "HEAR",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MGZN",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "STAND",
          "STAT",
          "UNBILL",
          "UNPB"
        ],
        EP: true
      },
      target: false
    }
  },
  {
    source: "AV",
    target: "archive_location",
    when: {
      target: false
    }
  },
  {
    source: "LK",
    target: "URL",
    when: {
      source: {
        TY: [
          "HEAR"
        ],
        L4: false,
        UR: false
      },
      target: false
    }
  },
  {
    source: "LK",
    target: "URL",
    when: {
      source: {
        TY: [
          "ABST",
          "ADVS",
          "AGGR",
          "ANCIENT",
          "ART",
          "BILL",
          "BLOG",
          "BOOK",
          "CASE",
          "CHAP",
          "CHART",
          "CLSWK",
          "COMP",
          "CONF",
          "CPAPER",
          "CTLG",
          "DATA",
          "DBASE",
          "DICT",
          "EBOOK",
          "ECHAP",
          "EDBOOK",
          "EJOUR",
          "ELEC",
          "ENCYC",
          "EQUA",
          "FIGURE",
          "GEN",
          "GOVDOC",
          "GRANT",
          "ICOMM",
          "INPR",
          "JFULL",
          "JOUR",
          "LEGAL",
          "MANSCPT",
          "MAP",
          "MGZN",
          "MPCT",
          "MULTI",
          "MUSIC",
          "NEWS",
          "PAMP",
          "PAT",
          "PCOMM",
          "RPRT",
          "SER",
          "SLIDE",
          "SOUND",
          "STAND",
          "STAT",
          "THES",
          "UNBILL",
          "UNPB",
          "VIDEO"
        ],
        UR: false
      },
      target: false
    }
  },
  {
    source: "IS",
    target: "issue",
    when: {
      source: {
        TY: "MGZN",
        M1: false
      },
      target: false
    }
  }
];

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/mixed.js
var mixed_default = new_default.concat(additions_default);

// node_modules/@citation-js/plugin-ris/lib-mjs/spec/index.js
var SPECS = {
  new: new_default,
  old: old_default,
  mixed: mixed_default
};

// node_modules/@citation-js/plugin-ris/lib-mjs/dataTypes.json
var dataTypes_default = {
  author: "NAME",
  chair: "NAME",
  "collection-editor": "NAME",
  compiler: "NAME",
  composer: "NAME",
  "container-author": "NAME",
  contributor: "NAME",
  curator: "NAME",
  director: "NAME",
  editor: "NAME",
  "editorial-director": "NAME",
  "editor-translator": "NAME",
  "executive-producer": "NAME",
  guest: "NAME",
  host: "NAME",
  illustrator: "NAME",
  interviewer: "NAME",
  narrator: "NAME",
  organizer: "NAME",
  "original-author": "NAME",
  performer: "NAME",
  producer: "NAME",
  recipient: "NAME",
  "reviewed-author": "NAME",
  "script-writer": "NAME",
  "series-creator": "NAME",
  translator: "NAME",
  accessed: "DATE",
  "available-date": "DATE",
  "event-date": "DATE",
  issued: "DATE_YEAR",
  "original-date": "DATE",
  submitted: "DATE",
  id: "ID",
  "ISSN,ISBN": "ISBN",
  keyword: "KEYWORD",
  page: "PAGE",
  type: "TYPE",
  DOI: "DOI"
};

// node_modules/@citation-js/plugin-ris/lib-mjs/ris.js
function ownKeys8(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread8(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys8(Object(t), true).forEach(function(r2) {
      _defineProperty9(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys8(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty9(e, r, t) {
  return (r = _toPropertyKey9(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey9(t) {
  var i = _toPrimitive9(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive9(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var LINE_MATCH = /^[A-Z][A-Z0-9] {2}-( |$)/;
var LINE_SPLIT = / {2}-(?: |$)/;
var TRANSLATORS = /* @__PURE__ */ new Map();
function prepareTranslator(spec) {
  if (!TRANSLATORS.has(spec)) {
    for (const mapping of spec) {
      if (mapping.target === "issued" && !Array.isArray(mapping.source)) {
        mapping.convert = converters_default.YEAR;
        continue;
      }
      if (mapping.target in dataTypes_default) {
        mapping.convert = converters_default[dataTypes_default[mapping.target]];
      }
      if (mapping.convert && mapping.convert.keepAll === true) {
        continue;
      }
      if (Array.isArray(mapping.source)) {
        if (mapping.convert) {
          const {
            toSource,
            toTarget
          } = mapping.convert;
          mapping.convert = {
            toTarget(...args) {
              return toTarget(converters_default.ANY.toTarget(...args));
            },
            toSource(...args) {
              return converters_default.ANY.toSource(toSource(...args));
            }
          };
        } else {
          mapping.convert = converters_default.ANY;
        }
      }
    }
    TRANSLATORS.set(spec, new util_exports.Translator(spec));
  }
  return TRANSLATORS.get(spec);
}
function parseType(type2) {
  type2 = type2.toUpperCase();
  if (type2 === "JOURN") {
    return "JOUR";
  }
  return type2;
}
function parse8(text2) {
  const entries = [];
  let lastEntry;
  let lastTag;
  for (let line2 of text2.split(/\r?\n/)) {
    line2 = line2.trim();
    if (!LINE_MATCH.test(line2)) {
      if (lastEntry && lastTag) {
        lastEntry[lastTag] += " " + line2;
      }
      continue;
    }
    let [tag, value] = line2.split(LINE_SPLIT);
    if (value.trim() === "") {
      lastTag = void 0;
      continue;
    }
    switch (tag) {
      case "ER":
        lastEntry = void 0;
        lastTag = void 0;
        break;
      case "TY":
        lastEntry = {};
        entries.push(lastEntry);
        value = parseType(value);
      default:
        if (Array.isArray(lastEntry[tag])) {
          lastEntry[tag].push(value);
        } else {
          lastEntry[tag] = lastEntry[tag] ? [lastEntry[tag], value] : value;
        }
        lastTag = tag;
    }
  }
  return entries;
}
function parseOld(data2) {
  return prepareTranslator(SPECS.old).convertToTarget(data2);
}
function parseNew(data2) {
  return prepareTranslator(SPECS.new).convertToTarget(data2);
}
function parseMixed(data2) {
  return prepareTranslator(SPECS.mixed).convertToTarget(data2);
}
function format8(data2, {
  type: type2,
  format: format9 = type2 || "text",
  spec = "mixed"
} = {}) {
  if (!SPECS[spec]) {
    throw new TypeError(`Invalid RIS specification ("${spec}")`);
  }
  const translate = prepareTranslator(SPECS[spec]).convertToSource;
  const entries = data2.map((entry) => translate(entry.type ? entry : _objectSpread8(_objectSpread8({}, entry), {}, {
    type: "document"
  })));
  if (format9 === "object") {
    return entries;
  }
  return entries.map((entry) => {
    const tags = [];
    for (const tag in entry) {
      if (tag === "TY") {
        continue;
      }
      tags.push(...[].concat(entry[tag]).map((value) => `${tag}  - ${value.toString().replace(/(.{70})/g, "$1\n")}`));
    }
    tags.unshift(`TY  - ${entry.TY}`);
    tags.push("ER  - ");
    return tags.join("\n");
  }).join("\n");
}

// node_modules/@citation-js/plugin-ris/lib-mjs/index.js
var oldProps = ["A1", "AV", "BT", "CP", "ED", "EP", "ID", "J1", "JA", "JF", "JO", "L2", "L3", "N2", "T1", "U1", "U2", "U3", "U4", "U5", "U6", "Y1"];
var newProps = ["A4", "AD", "AN", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "CA", "CN", "DA", "DB", "DO", "DP", "ET", "LA", "LB", "NV", "OP", "PY", "RI", "RN", "SE", "ST", "SV", "TA", "TT"];
plugins_exports.add("@ris", {
  input: {
    "@ris/file": {
      parse: parse8,
      parseType: {
        dataType: "String",
        predicate: /^TY {2}- /m
      }
    },
    "@ris/record": {
      parse: parseMixed,
      parseType: {
        dataType: "SimpleObject",
        propertyConstraint: {
          props: ["TY"]
        }
      }
    },
    "@ris/new+record": {
      parse: parseNew,
      parseType: {
        extends: "@ris/record",
        propertyConstraint: [{
          props: newProps,
          match: "some"
        }, {
          props: oldProps,
          match: "none"
        }]
      }
    },
    "@ris/old+record": {
      parse: parseOld,
      parseType: {
        extends: "@ris/record",
        propertyConstraint: [{
          props: oldProps,
          match: "some"
        }, {
          props: newProps,
          match: "none"
        }]
      }
    }
  },
  output: {
    ris: format8
  }
});

// node_modules/parse5/dist/common/unicode.js
var UNDEFINED_CODE_POINTS = /* @__PURE__ */ new Set([
  65534,
  65535,
  131070,
  131071,
  196606,
  196607,
  262142,
  262143,
  327678,
  327679,
  393214,
  393215,
  458750,
  458751,
  524286,
  524287,
  589822,
  589823,
  655358,
  655359,
  720894,
  720895,
  786430,
  786431,
  851966,
  851967,
  917502,
  917503,
  983038,
  983039,
  1048574,
  1048575,
  1114110,
  1114111
]);
var REPLACEMENT_CHARACTER = "\uFFFD";
var CODE_POINTS;
(function(CODE_POINTS2) {
  CODE_POINTS2[CODE_POINTS2["EOF"] = -1] = "EOF";
  CODE_POINTS2[CODE_POINTS2["NULL"] = 0] = "NULL";
  CODE_POINTS2[CODE_POINTS2["TABULATION"] = 9] = "TABULATION";
  CODE_POINTS2[CODE_POINTS2["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
  CODE_POINTS2[CODE_POINTS2["LINE_FEED"] = 10] = "LINE_FEED";
  CODE_POINTS2[CODE_POINTS2["FORM_FEED"] = 12] = "FORM_FEED";
  CODE_POINTS2[CODE_POINTS2["SPACE"] = 32] = "SPACE";
  CODE_POINTS2[CODE_POINTS2["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
  CODE_POINTS2[CODE_POINTS2["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
  CODE_POINTS2[CODE_POINTS2["AMPERSAND"] = 38] = "AMPERSAND";
  CODE_POINTS2[CODE_POINTS2["APOSTROPHE"] = 39] = "APOSTROPHE";
  CODE_POINTS2[CODE_POINTS2["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
  CODE_POINTS2[CODE_POINTS2["SOLIDUS"] = 47] = "SOLIDUS";
  CODE_POINTS2[CODE_POINTS2["DIGIT_0"] = 48] = "DIGIT_0";
  CODE_POINTS2[CODE_POINTS2["DIGIT_9"] = 57] = "DIGIT_9";
  CODE_POINTS2[CODE_POINTS2["SEMICOLON"] = 59] = "SEMICOLON";
  CODE_POINTS2[CODE_POINTS2["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
  CODE_POINTS2[CODE_POINTS2["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
  CODE_POINTS2[CODE_POINTS2["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
  CODE_POINTS2[CODE_POINTS2["QUESTION_MARK"] = 63] = "QUESTION_MARK";
  CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_A"] = 65] = "LATIN_CAPITAL_A";
  CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_Z"] = 90] = "LATIN_CAPITAL_Z";
  CODE_POINTS2[CODE_POINTS2["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
  CODE_POINTS2[CODE_POINTS2["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
  CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_A"] = 97] = "LATIN_SMALL_A";
  CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_Z"] = 122] = "LATIN_SMALL_Z";
})(CODE_POINTS || (CODE_POINTS = {}));
var SEQUENCES = {
  DASH_DASH: "--",
  CDATA_START: "[CDATA[",
  DOCTYPE: "doctype",
  SCRIPT: "script",
  PUBLIC: "public",
  SYSTEM: "system"
};
function isSurrogate(cp) {
  return cp >= 55296 && cp <= 57343;
}
function isSurrogatePair(cp) {
  return cp >= 56320 && cp <= 57343;
}
function getSurrogatePairCodePoint(cp1, cp2) {
  return (cp1 - 55296) * 1024 + 9216 + cp2;
}
function isControlCodePoint(cp) {
  return cp !== 32 && cp !== 10 && cp !== 13 && cp !== 9 && cp !== 12 && cp >= 1 && cp <= 31 || cp >= 127 && cp <= 159;
}
function isUndefinedCodePoint(cp) {
  return cp >= 64976 && cp <= 65007 || UNDEFINED_CODE_POINTS.has(cp);
}

// node_modules/parse5/dist/common/error-codes.js
var ERR;
(function(ERR2) {
  ERR2["controlCharacterInInputStream"] = "control-character-in-input-stream";
  ERR2["noncharacterInInputStream"] = "noncharacter-in-input-stream";
  ERR2["surrogateInInputStream"] = "surrogate-in-input-stream";
  ERR2["nonVoidHtmlElementStartTagWithTrailingSolidus"] = "non-void-html-element-start-tag-with-trailing-solidus";
  ERR2["endTagWithAttributes"] = "end-tag-with-attributes";
  ERR2["endTagWithTrailingSolidus"] = "end-tag-with-trailing-solidus";
  ERR2["unexpectedSolidusInTag"] = "unexpected-solidus-in-tag";
  ERR2["unexpectedNullCharacter"] = "unexpected-null-character";
  ERR2["unexpectedQuestionMarkInsteadOfTagName"] = "unexpected-question-mark-instead-of-tag-name";
  ERR2["invalidFirstCharacterOfTagName"] = "invalid-first-character-of-tag-name";
  ERR2["unexpectedEqualsSignBeforeAttributeName"] = "unexpected-equals-sign-before-attribute-name";
  ERR2["missingEndTagName"] = "missing-end-tag-name";
  ERR2["unexpectedCharacterInAttributeName"] = "unexpected-character-in-attribute-name";
  ERR2["unknownNamedCharacterReference"] = "unknown-named-character-reference";
  ERR2["missingSemicolonAfterCharacterReference"] = "missing-semicolon-after-character-reference";
  ERR2["unexpectedCharacterAfterDoctypeSystemIdentifier"] = "unexpected-character-after-doctype-system-identifier";
  ERR2["unexpectedCharacterInUnquotedAttributeValue"] = "unexpected-character-in-unquoted-attribute-value";
  ERR2["eofBeforeTagName"] = "eof-before-tag-name";
  ERR2["eofInTag"] = "eof-in-tag";
  ERR2["missingAttributeValue"] = "missing-attribute-value";
  ERR2["missingWhitespaceBetweenAttributes"] = "missing-whitespace-between-attributes";
  ERR2["missingWhitespaceAfterDoctypePublicKeyword"] = "missing-whitespace-after-doctype-public-keyword";
  ERR2["missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers"] = "missing-whitespace-between-doctype-public-and-system-identifiers";
  ERR2["missingWhitespaceAfterDoctypeSystemKeyword"] = "missing-whitespace-after-doctype-system-keyword";
  ERR2["missingQuoteBeforeDoctypePublicIdentifier"] = "missing-quote-before-doctype-public-identifier";
  ERR2["missingQuoteBeforeDoctypeSystemIdentifier"] = "missing-quote-before-doctype-system-identifier";
  ERR2["missingDoctypePublicIdentifier"] = "missing-doctype-public-identifier";
  ERR2["missingDoctypeSystemIdentifier"] = "missing-doctype-system-identifier";
  ERR2["abruptDoctypePublicIdentifier"] = "abrupt-doctype-public-identifier";
  ERR2["abruptDoctypeSystemIdentifier"] = "abrupt-doctype-system-identifier";
  ERR2["cdataInHtmlContent"] = "cdata-in-html-content";
  ERR2["incorrectlyOpenedComment"] = "incorrectly-opened-comment";
  ERR2["eofInScriptHtmlCommentLikeText"] = "eof-in-script-html-comment-like-text";
  ERR2["eofInDoctype"] = "eof-in-doctype";
  ERR2["nestedComment"] = "nested-comment";
  ERR2["abruptClosingOfEmptyComment"] = "abrupt-closing-of-empty-comment";
  ERR2["eofInComment"] = "eof-in-comment";
  ERR2["incorrectlyClosedComment"] = "incorrectly-closed-comment";
  ERR2["eofInCdata"] = "eof-in-cdata";
  ERR2["absenceOfDigitsInNumericCharacterReference"] = "absence-of-digits-in-numeric-character-reference";
  ERR2["nullCharacterReference"] = "null-character-reference";
  ERR2["surrogateCharacterReference"] = "surrogate-character-reference";
  ERR2["characterReferenceOutsideUnicodeRange"] = "character-reference-outside-unicode-range";
  ERR2["controlCharacterReference"] = "control-character-reference";
  ERR2["noncharacterCharacterReference"] = "noncharacter-character-reference";
  ERR2["missingWhitespaceBeforeDoctypeName"] = "missing-whitespace-before-doctype-name";
  ERR2["missingDoctypeName"] = "missing-doctype-name";
  ERR2["invalidCharacterSequenceAfterDoctypeName"] = "invalid-character-sequence-after-doctype-name";
  ERR2["duplicateAttribute"] = "duplicate-attribute";
  ERR2["nonConformingDoctype"] = "non-conforming-doctype";
  ERR2["missingDoctype"] = "missing-doctype";
  ERR2["misplacedDoctype"] = "misplaced-doctype";
  ERR2["endTagWithoutMatchingOpenElement"] = "end-tag-without-matching-open-element";
  ERR2["closingOfElementWithOpenChildElements"] = "closing-of-element-with-open-child-elements";
  ERR2["disallowedContentInNoscriptInHead"] = "disallowed-content-in-noscript-in-head";
  ERR2["openElementsLeftAfterEof"] = "open-elements-left-after-eof";
  ERR2["abandonedHeadElementChild"] = "abandoned-head-element-child";
  ERR2["misplacedStartTagForHeadElement"] = "misplaced-start-tag-for-head-element";
  ERR2["nestedNoscriptInHead"] = "nested-noscript-in-head";
  ERR2["eofInElementThatCanContainOnlyText"] = "eof-in-element-that-can-contain-only-text";
})(ERR || (ERR = {}));

// node_modules/parse5/dist/tokenizer/preprocessor.js
var DEFAULT_BUFFER_WATERLINE = 1 << 16;
var Preprocessor = class {
  constructor(handler) {
    this.handler = handler;
    this.html = "";
    this.pos = -1;
    this.lastGapPos = -2;
    this.gapStack = [];
    this.skipNextNewLine = false;
    this.lastChunkWritten = false;
    this.endOfChunkHit = false;
    this.bufferWaterline = DEFAULT_BUFFER_WATERLINE;
    this.isEol = false;
    this.lineStartPos = 0;
    this.droppedBufferSize = 0;
    this.line = 1;
    this.lastErrOffset = -1;
  }
  /** The column on the current line. If we just saw a gap (eg. a surrogate pair), return the index before. */
  get col() {
    return this.pos - this.lineStartPos + Number(this.lastGapPos !== this.pos);
  }
  get offset() {
    return this.droppedBufferSize + this.pos;
  }
  getError(code, cpOffset) {
    const { line: line2, col, offset } = this;
    const startCol = col + cpOffset;
    const startOffset = offset + cpOffset;
    return {
      code,
      startLine: line2,
      endLine: line2,
      startCol,
      endCol: startCol,
      startOffset,
      endOffset: startOffset
    };
  }
  _err(code) {
    if (this.handler.onParseError && this.lastErrOffset !== this.offset) {
      this.lastErrOffset = this.offset;
      this.handler.onParseError(this.getError(code, 0));
    }
  }
  _addGap() {
    this.gapStack.push(this.lastGapPos);
    this.lastGapPos = this.pos;
  }
  _processSurrogate(cp) {
    if (this.pos !== this.html.length - 1) {
      const nextCp = this.html.charCodeAt(this.pos + 1);
      if (isSurrogatePair(nextCp)) {
        this.pos++;
        this._addGap();
        return getSurrogatePairCodePoint(cp, nextCp);
      }
    } else if (!this.lastChunkWritten) {
      this.endOfChunkHit = true;
      return CODE_POINTS.EOF;
    }
    this._err(ERR.surrogateInInputStream);
    return cp;
  }
  willDropParsedChunk() {
    return this.pos > this.bufferWaterline;
  }
  dropParsedChunk() {
    if (this.willDropParsedChunk()) {
      this.html = this.html.substring(this.pos);
      this.lineStartPos -= this.pos;
      this.droppedBufferSize += this.pos;
      this.pos = 0;
      this.lastGapPos = -2;
      this.gapStack.length = 0;
    }
  }
  write(chunk, isLastChunk) {
    if (this.html.length > 0) {
      this.html += chunk;
    } else {
      this.html = chunk;
    }
    this.endOfChunkHit = false;
    this.lastChunkWritten = isLastChunk;
  }
  insertHtmlAtCurrentPos(chunk) {
    this.html = this.html.substring(0, this.pos + 1) + chunk + this.html.substring(this.pos + 1);
    this.endOfChunkHit = false;
  }
  startsWith(pattern, caseSensitive) {
    if (this.pos + pattern.length > this.html.length) {
      this.endOfChunkHit = !this.lastChunkWritten;
      return false;
    }
    if (caseSensitive) {
      return this.html.startsWith(pattern, this.pos);
    }
    for (let i = 0; i < pattern.length; i++) {
      const cp = this.html.charCodeAt(this.pos + i) | 32;
      if (cp !== pattern.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  }
  peek(offset) {
    const pos = this.pos + offset;
    if (pos >= this.html.length) {
      this.endOfChunkHit = !this.lastChunkWritten;
      return CODE_POINTS.EOF;
    }
    const code = this.html.charCodeAt(pos);
    return code === CODE_POINTS.CARRIAGE_RETURN ? CODE_POINTS.LINE_FEED : code;
  }
  advance() {
    this.pos++;
    if (this.isEol) {
      this.isEol = false;
      this.line++;
      this.lineStartPos = this.pos;
    }
    if (this.pos >= this.html.length) {
      this.endOfChunkHit = !this.lastChunkWritten;
      return CODE_POINTS.EOF;
    }
    let cp = this.html.charCodeAt(this.pos);
    if (cp === CODE_POINTS.CARRIAGE_RETURN) {
      this.isEol = true;
      this.skipNextNewLine = true;
      return CODE_POINTS.LINE_FEED;
    }
    if (cp === CODE_POINTS.LINE_FEED) {
      this.isEol = true;
      if (this.skipNextNewLine) {
        this.line--;
        this.skipNextNewLine = false;
        this._addGap();
        return this.advance();
      }
    }
    this.skipNextNewLine = false;
    if (isSurrogate(cp)) {
      cp = this._processSurrogate(cp);
    }
    const isCommonValidRange = this.handler.onParseError === null || cp > 31 && cp < 127 || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.CARRIAGE_RETURN || cp > 159 && cp < 64976;
    if (!isCommonValidRange) {
      this._checkForProblematicCharacters(cp);
    }
    return cp;
  }
  _checkForProblematicCharacters(cp) {
    if (isControlCodePoint(cp)) {
      this._err(ERR.controlCharacterInInputStream);
    } else if (isUndefinedCodePoint(cp)) {
      this._err(ERR.noncharacterInInputStream);
    }
  }
  retreat(count) {
    this.pos -= count;
    while (this.pos < this.lastGapPos) {
      this.lastGapPos = this.gapStack.pop();
      this.pos--;
    }
    this.isEol = false;
  }
};

// node_modules/parse5/dist/common/token.js
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["CHARACTER"] = 0] = "CHARACTER";
  TokenType2[TokenType2["NULL_CHARACTER"] = 1] = "NULL_CHARACTER";
  TokenType2[TokenType2["WHITESPACE_CHARACTER"] = 2] = "WHITESPACE_CHARACTER";
  TokenType2[TokenType2["START_TAG"] = 3] = "START_TAG";
  TokenType2[TokenType2["END_TAG"] = 4] = "END_TAG";
  TokenType2[TokenType2["COMMENT"] = 5] = "COMMENT";
  TokenType2[TokenType2["DOCTYPE"] = 6] = "DOCTYPE";
  TokenType2[TokenType2["EOF"] = 7] = "EOF";
  TokenType2[TokenType2["HIBERNATION"] = 8] = "HIBERNATION";
})(TokenType || (TokenType = {}));
function getTokenAttr(token, attrName) {
  for (let i = token.attrs.length - 1; i >= 0; i--) {
    if (token.attrs[i].name === attrName) {
      return token.attrs[i].value;
    }
  }
  return null;
}

// node_modules/entities/dist/esm/generated/decode-data-html.js
var htmlDecodeTree = /* @__PURE__ */ new Uint16Array(
  // prettier-ignore
  /* @__PURE__ */ '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((c) => c.charCodeAt(0))
);

// node_modules/entities/dist/esm/decode-codepoint.js
var _a;
var decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
var fromCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, n/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  }
);
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}

// node_modules/entities/dist/esm/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber(code) {
  return code >= CharCodes.ZERO && code <= CharCodes.NINE;
}
function isHexadecimalCharacter(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber(code);
}
function isEntityInAttributeInvalidEnd(code) {
  return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
var EntityDecoder = class {
  constructor(decodeTree, emitCodePoint, errors) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
    this.state = EntityDecoderState.EntityStart;
    this.consumed = 1;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.decodeMode = DecodingMode.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(input, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (input.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(input, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(input, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(input, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(input, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(input, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(input, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(input, offset) {
    if (offset >= input.length) {
      return -1;
    }
    if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(input, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(input, offset);
  }
  addToNumericResult(input, start, end, base) {
    if (start !== end) {
      const digitCount = end - start;
      this.result = this.result * Math.pow(base, digitCount) + Number.parseInt(input.substr(start, digitCount), base);
      this.consumed += digitCount;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(input, offset) {
    const startIndex = offset;
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(input, startIndex, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }
    this.addToNumericResult(input, startIndex, offset, 16);
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(input, offset) {
    const startIndex = offset;
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(input, startIndex, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }
    this.addToNumericResult(input, startIndex, offset, 10);
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    var _a2;
    if (this.consumed <= expectedLength) {
      (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(input, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    for (; offset < input.length; offset++, this.excess++) {
      const char = input.charCodeAt(offset);
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var _a2;
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var _a2;
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
};
function determineBranch(decodeTree, current, nodeIndex, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
  }
  let lo = nodeIndex;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midValue = decodeTree[mid];
    if (midValue < char) {
      lo = mid + 1;
    } else if (midValue > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}

// node_modules/parse5/dist/common/html.js
var NS;
(function(NS2) {
  NS2["HTML"] = "http://www.w3.org/1999/xhtml";
  NS2["MATHML"] = "http://www.w3.org/1998/Math/MathML";
  NS2["SVG"] = "http://www.w3.org/2000/svg";
  NS2["XLINK"] = "http://www.w3.org/1999/xlink";
  NS2["XML"] = "http://www.w3.org/XML/1998/namespace";
  NS2["XMLNS"] = "http://www.w3.org/2000/xmlns/";
})(NS || (NS = {}));
var ATTRS;
(function(ATTRS2) {
  ATTRS2["TYPE"] = "type";
  ATTRS2["ACTION"] = "action";
  ATTRS2["ENCODING"] = "encoding";
  ATTRS2["PROMPT"] = "prompt";
  ATTRS2["NAME"] = "name";
  ATTRS2["COLOR"] = "color";
  ATTRS2["FACE"] = "face";
  ATTRS2["SIZE"] = "size";
})(ATTRS || (ATTRS = {}));
var DOCUMENT_MODE;
(function(DOCUMENT_MODE2) {
  DOCUMENT_MODE2["NO_QUIRKS"] = "no-quirks";
  DOCUMENT_MODE2["QUIRKS"] = "quirks";
  DOCUMENT_MODE2["LIMITED_QUIRKS"] = "limited-quirks";
})(DOCUMENT_MODE || (DOCUMENT_MODE = {}));
var TAG_NAMES;
(function(TAG_NAMES2) {
  TAG_NAMES2["A"] = "a";
  TAG_NAMES2["ADDRESS"] = "address";
  TAG_NAMES2["ANNOTATION_XML"] = "annotation-xml";
  TAG_NAMES2["APPLET"] = "applet";
  TAG_NAMES2["AREA"] = "area";
  TAG_NAMES2["ARTICLE"] = "article";
  TAG_NAMES2["ASIDE"] = "aside";
  TAG_NAMES2["B"] = "b";
  TAG_NAMES2["BASE"] = "base";
  TAG_NAMES2["BASEFONT"] = "basefont";
  TAG_NAMES2["BGSOUND"] = "bgsound";
  TAG_NAMES2["BIG"] = "big";
  TAG_NAMES2["BLOCKQUOTE"] = "blockquote";
  TAG_NAMES2["BODY"] = "body";
  TAG_NAMES2["BR"] = "br";
  TAG_NAMES2["BUTTON"] = "button";
  TAG_NAMES2["CAPTION"] = "caption";
  TAG_NAMES2["CENTER"] = "center";
  TAG_NAMES2["CODE"] = "code";
  TAG_NAMES2["COL"] = "col";
  TAG_NAMES2["COLGROUP"] = "colgroup";
  TAG_NAMES2["DD"] = "dd";
  TAG_NAMES2["DESC"] = "desc";
  TAG_NAMES2["DETAILS"] = "details";
  TAG_NAMES2["DIALOG"] = "dialog";
  TAG_NAMES2["DIR"] = "dir";
  TAG_NAMES2["DIV"] = "div";
  TAG_NAMES2["DL"] = "dl";
  TAG_NAMES2["DT"] = "dt";
  TAG_NAMES2["EM"] = "em";
  TAG_NAMES2["EMBED"] = "embed";
  TAG_NAMES2["FIELDSET"] = "fieldset";
  TAG_NAMES2["FIGCAPTION"] = "figcaption";
  TAG_NAMES2["FIGURE"] = "figure";
  TAG_NAMES2["FONT"] = "font";
  TAG_NAMES2["FOOTER"] = "footer";
  TAG_NAMES2["FOREIGN_OBJECT"] = "foreignObject";
  TAG_NAMES2["FORM"] = "form";
  TAG_NAMES2["FRAME"] = "frame";
  TAG_NAMES2["FRAMESET"] = "frameset";
  TAG_NAMES2["H1"] = "h1";
  TAG_NAMES2["H2"] = "h2";
  TAG_NAMES2["H3"] = "h3";
  TAG_NAMES2["H4"] = "h4";
  TAG_NAMES2["H5"] = "h5";
  TAG_NAMES2["H6"] = "h6";
  TAG_NAMES2["HEAD"] = "head";
  TAG_NAMES2["HEADER"] = "header";
  TAG_NAMES2["HGROUP"] = "hgroup";
  TAG_NAMES2["HR"] = "hr";
  TAG_NAMES2["HTML"] = "html";
  TAG_NAMES2["I"] = "i";
  TAG_NAMES2["IMG"] = "img";
  TAG_NAMES2["IMAGE"] = "image";
  TAG_NAMES2["INPUT"] = "input";
  TAG_NAMES2["IFRAME"] = "iframe";
  TAG_NAMES2["KEYGEN"] = "keygen";
  TAG_NAMES2["LABEL"] = "label";
  TAG_NAMES2["LI"] = "li";
  TAG_NAMES2["LINK"] = "link";
  TAG_NAMES2["LISTING"] = "listing";
  TAG_NAMES2["MAIN"] = "main";
  TAG_NAMES2["MALIGNMARK"] = "malignmark";
  TAG_NAMES2["MARQUEE"] = "marquee";
  TAG_NAMES2["MATH"] = "math";
  TAG_NAMES2["MENU"] = "menu";
  TAG_NAMES2["META"] = "meta";
  TAG_NAMES2["MGLYPH"] = "mglyph";
  TAG_NAMES2["MI"] = "mi";
  TAG_NAMES2["MO"] = "mo";
  TAG_NAMES2["MN"] = "mn";
  TAG_NAMES2["MS"] = "ms";
  TAG_NAMES2["MTEXT"] = "mtext";
  TAG_NAMES2["NAV"] = "nav";
  TAG_NAMES2["NOBR"] = "nobr";
  TAG_NAMES2["NOFRAMES"] = "noframes";
  TAG_NAMES2["NOEMBED"] = "noembed";
  TAG_NAMES2["NOSCRIPT"] = "noscript";
  TAG_NAMES2["OBJECT"] = "object";
  TAG_NAMES2["OL"] = "ol";
  TAG_NAMES2["OPTGROUP"] = "optgroup";
  TAG_NAMES2["OPTION"] = "option";
  TAG_NAMES2["P"] = "p";
  TAG_NAMES2["PARAM"] = "param";
  TAG_NAMES2["PLAINTEXT"] = "plaintext";
  TAG_NAMES2["PRE"] = "pre";
  TAG_NAMES2["RB"] = "rb";
  TAG_NAMES2["RP"] = "rp";
  TAG_NAMES2["RT"] = "rt";
  TAG_NAMES2["RTC"] = "rtc";
  TAG_NAMES2["RUBY"] = "ruby";
  TAG_NAMES2["S"] = "s";
  TAG_NAMES2["SCRIPT"] = "script";
  TAG_NAMES2["SEARCH"] = "search";
  TAG_NAMES2["SECTION"] = "section";
  TAG_NAMES2["SELECT"] = "select";
  TAG_NAMES2["SOURCE"] = "source";
  TAG_NAMES2["SMALL"] = "small";
  TAG_NAMES2["SPAN"] = "span";
  TAG_NAMES2["STRIKE"] = "strike";
  TAG_NAMES2["STRONG"] = "strong";
  TAG_NAMES2["STYLE"] = "style";
  TAG_NAMES2["SUB"] = "sub";
  TAG_NAMES2["SUMMARY"] = "summary";
  TAG_NAMES2["SUP"] = "sup";
  TAG_NAMES2["TABLE"] = "table";
  TAG_NAMES2["TBODY"] = "tbody";
  TAG_NAMES2["TEMPLATE"] = "template";
  TAG_NAMES2["TEXTAREA"] = "textarea";
  TAG_NAMES2["TFOOT"] = "tfoot";
  TAG_NAMES2["TD"] = "td";
  TAG_NAMES2["TH"] = "th";
  TAG_NAMES2["THEAD"] = "thead";
  TAG_NAMES2["TITLE"] = "title";
  TAG_NAMES2["TR"] = "tr";
  TAG_NAMES2["TRACK"] = "track";
  TAG_NAMES2["TT"] = "tt";
  TAG_NAMES2["U"] = "u";
  TAG_NAMES2["UL"] = "ul";
  TAG_NAMES2["SVG"] = "svg";
  TAG_NAMES2["VAR"] = "var";
  TAG_NAMES2["WBR"] = "wbr";
  TAG_NAMES2["XMP"] = "xmp";
})(TAG_NAMES || (TAG_NAMES = {}));
var TAG_ID;
(function(TAG_ID2) {
  TAG_ID2[TAG_ID2["UNKNOWN"] = 0] = "UNKNOWN";
  TAG_ID2[TAG_ID2["A"] = 1] = "A";
  TAG_ID2[TAG_ID2["ADDRESS"] = 2] = "ADDRESS";
  TAG_ID2[TAG_ID2["ANNOTATION_XML"] = 3] = "ANNOTATION_XML";
  TAG_ID2[TAG_ID2["APPLET"] = 4] = "APPLET";
  TAG_ID2[TAG_ID2["AREA"] = 5] = "AREA";
  TAG_ID2[TAG_ID2["ARTICLE"] = 6] = "ARTICLE";
  TAG_ID2[TAG_ID2["ASIDE"] = 7] = "ASIDE";
  TAG_ID2[TAG_ID2["B"] = 8] = "B";
  TAG_ID2[TAG_ID2["BASE"] = 9] = "BASE";
  TAG_ID2[TAG_ID2["BASEFONT"] = 10] = "BASEFONT";
  TAG_ID2[TAG_ID2["BGSOUND"] = 11] = "BGSOUND";
  TAG_ID2[TAG_ID2["BIG"] = 12] = "BIG";
  TAG_ID2[TAG_ID2["BLOCKQUOTE"] = 13] = "BLOCKQUOTE";
  TAG_ID2[TAG_ID2["BODY"] = 14] = "BODY";
  TAG_ID2[TAG_ID2["BR"] = 15] = "BR";
  TAG_ID2[TAG_ID2["BUTTON"] = 16] = "BUTTON";
  TAG_ID2[TAG_ID2["CAPTION"] = 17] = "CAPTION";
  TAG_ID2[TAG_ID2["CENTER"] = 18] = "CENTER";
  TAG_ID2[TAG_ID2["CODE"] = 19] = "CODE";
  TAG_ID2[TAG_ID2["COL"] = 20] = "COL";
  TAG_ID2[TAG_ID2["COLGROUP"] = 21] = "COLGROUP";
  TAG_ID2[TAG_ID2["DD"] = 22] = "DD";
  TAG_ID2[TAG_ID2["DESC"] = 23] = "DESC";
  TAG_ID2[TAG_ID2["DETAILS"] = 24] = "DETAILS";
  TAG_ID2[TAG_ID2["DIALOG"] = 25] = "DIALOG";
  TAG_ID2[TAG_ID2["DIR"] = 26] = "DIR";
  TAG_ID2[TAG_ID2["DIV"] = 27] = "DIV";
  TAG_ID2[TAG_ID2["DL"] = 28] = "DL";
  TAG_ID2[TAG_ID2["DT"] = 29] = "DT";
  TAG_ID2[TAG_ID2["EM"] = 30] = "EM";
  TAG_ID2[TAG_ID2["EMBED"] = 31] = "EMBED";
  TAG_ID2[TAG_ID2["FIELDSET"] = 32] = "FIELDSET";
  TAG_ID2[TAG_ID2["FIGCAPTION"] = 33] = "FIGCAPTION";
  TAG_ID2[TAG_ID2["FIGURE"] = 34] = "FIGURE";
  TAG_ID2[TAG_ID2["FONT"] = 35] = "FONT";
  TAG_ID2[TAG_ID2["FOOTER"] = 36] = "FOOTER";
  TAG_ID2[TAG_ID2["FOREIGN_OBJECT"] = 37] = "FOREIGN_OBJECT";
  TAG_ID2[TAG_ID2["FORM"] = 38] = "FORM";
  TAG_ID2[TAG_ID2["FRAME"] = 39] = "FRAME";
  TAG_ID2[TAG_ID2["FRAMESET"] = 40] = "FRAMESET";
  TAG_ID2[TAG_ID2["H1"] = 41] = "H1";
  TAG_ID2[TAG_ID2["H2"] = 42] = "H2";
  TAG_ID2[TAG_ID2["H3"] = 43] = "H3";
  TAG_ID2[TAG_ID2["H4"] = 44] = "H4";
  TAG_ID2[TAG_ID2["H5"] = 45] = "H5";
  TAG_ID2[TAG_ID2["H6"] = 46] = "H6";
  TAG_ID2[TAG_ID2["HEAD"] = 47] = "HEAD";
  TAG_ID2[TAG_ID2["HEADER"] = 48] = "HEADER";
  TAG_ID2[TAG_ID2["HGROUP"] = 49] = "HGROUP";
  TAG_ID2[TAG_ID2["HR"] = 50] = "HR";
  TAG_ID2[TAG_ID2["HTML"] = 51] = "HTML";
  TAG_ID2[TAG_ID2["I"] = 52] = "I";
  TAG_ID2[TAG_ID2["IMG"] = 53] = "IMG";
  TAG_ID2[TAG_ID2["IMAGE"] = 54] = "IMAGE";
  TAG_ID2[TAG_ID2["INPUT"] = 55] = "INPUT";
  TAG_ID2[TAG_ID2["IFRAME"] = 56] = "IFRAME";
  TAG_ID2[TAG_ID2["KEYGEN"] = 57] = "KEYGEN";
  TAG_ID2[TAG_ID2["LABEL"] = 58] = "LABEL";
  TAG_ID2[TAG_ID2["LI"] = 59] = "LI";
  TAG_ID2[TAG_ID2["LINK"] = 60] = "LINK";
  TAG_ID2[TAG_ID2["LISTING"] = 61] = "LISTING";
  TAG_ID2[TAG_ID2["MAIN"] = 62] = "MAIN";
  TAG_ID2[TAG_ID2["MALIGNMARK"] = 63] = "MALIGNMARK";
  TAG_ID2[TAG_ID2["MARQUEE"] = 64] = "MARQUEE";
  TAG_ID2[TAG_ID2["MATH"] = 65] = "MATH";
  TAG_ID2[TAG_ID2["MENU"] = 66] = "MENU";
  TAG_ID2[TAG_ID2["META"] = 67] = "META";
  TAG_ID2[TAG_ID2["MGLYPH"] = 68] = "MGLYPH";
  TAG_ID2[TAG_ID2["MI"] = 69] = "MI";
  TAG_ID2[TAG_ID2["MO"] = 70] = "MO";
  TAG_ID2[TAG_ID2["MN"] = 71] = "MN";
  TAG_ID2[TAG_ID2["MS"] = 72] = "MS";
  TAG_ID2[TAG_ID2["MTEXT"] = 73] = "MTEXT";
  TAG_ID2[TAG_ID2["NAV"] = 74] = "NAV";
  TAG_ID2[TAG_ID2["NOBR"] = 75] = "NOBR";
  TAG_ID2[TAG_ID2["NOFRAMES"] = 76] = "NOFRAMES";
  TAG_ID2[TAG_ID2["NOEMBED"] = 77] = "NOEMBED";
  TAG_ID2[TAG_ID2["NOSCRIPT"] = 78] = "NOSCRIPT";
  TAG_ID2[TAG_ID2["OBJECT"] = 79] = "OBJECT";
  TAG_ID2[TAG_ID2["OL"] = 80] = "OL";
  TAG_ID2[TAG_ID2["OPTGROUP"] = 81] = "OPTGROUP";
  TAG_ID2[TAG_ID2["OPTION"] = 82] = "OPTION";
  TAG_ID2[TAG_ID2["P"] = 83] = "P";
  TAG_ID2[TAG_ID2["PARAM"] = 84] = "PARAM";
  TAG_ID2[TAG_ID2["PLAINTEXT"] = 85] = "PLAINTEXT";
  TAG_ID2[TAG_ID2["PRE"] = 86] = "PRE";
  TAG_ID2[TAG_ID2["RB"] = 87] = "RB";
  TAG_ID2[TAG_ID2["RP"] = 88] = "RP";
  TAG_ID2[TAG_ID2["RT"] = 89] = "RT";
  TAG_ID2[TAG_ID2["RTC"] = 90] = "RTC";
  TAG_ID2[TAG_ID2["RUBY"] = 91] = "RUBY";
  TAG_ID2[TAG_ID2["S"] = 92] = "S";
  TAG_ID2[TAG_ID2["SCRIPT"] = 93] = "SCRIPT";
  TAG_ID2[TAG_ID2["SEARCH"] = 94] = "SEARCH";
  TAG_ID2[TAG_ID2["SECTION"] = 95] = "SECTION";
  TAG_ID2[TAG_ID2["SELECT"] = 96] = "SELECT";
  TAG_ID2[TAG_ID2["SOURCE"] = 97] = "SOURCE";
  TAG_ID2[TAG_ID2["SMALL"] = 98] = "SMALL";
  TAG_ID2[TAG_ID2["SPAN"] = 99] = "SPAN";
  TAG_ID2[TAG_ID2["STRIKE"] = 100] = "STRIKE";
  TAG_ID2[TAG_ID2["STRONG"] = 101] = "STRONG";
  TAG_ID2[TAG_ID2["STYLE"] = 102] = "STYLE";
  TAG_ID2[TAG_ID2["SUB"] = 103] = "SUB";
  TAG_ID2[TAG_ID2["SUMMARY"] = 104] = "SUMMARY";
  TAG_ID2[TAG_ID2["SUP"] = 105] = "SUP";
  TAG_ID2[TAG_ID2["TABLE"] = 106] = "TABLE";
  TAG_ID2[TAG_ID2["TBODY"] = 107] = "TBODY";
  TAG_ID2[TAG_ID2["TEMPLATE"] = 108] = "TEMPLATE";
  TAG_ID2[TAG_ID2["TEXTAREA"] = 109] = "TEXTAREA";
  TAG_ID2[TAG_ID2["TFOOT"] = 110] = "TFOOT";
  TAG_ID2[TAG_ID2["TD"] = 111] = "TD";
  TAG_ID2[TAG_ID2["TH"] = 112] = "TH";
  TAG_ID2[TAG_ID2["THEAD"] = 113] = "THEAD";
  TAG_ID2[TAG_ID2["TITLE"] = 114] = "TITLE";
  TAG_ID2[TAG_ID2["TR"] = 115] = "TR";
  TAG_ID2[TAG_ID2["TRACK"] = 116] = "TRACK";
  TAG_ID2[TAG_ID2["TT"] = 117] = "TT";
  TAG_ID2[TAG_ID2["U"] = 118] = "U";
  TAG_ID2[TAG_ID2["UL"] = 119] = "UL";
  TAG_ID2[TAG_ID2["SVG"] = 120] = "SVG";
  TAG_ID2[TAG_ID2["VAR"] = 121] = "VAR";
  TAG_ID2[TAG_ID2["WBR"] = 122] = "WBR";
  TAG_ID2[TAG_ID2["XMP"] = 123] = "XMP";
})(TAG_ID || (TAG_ID = {}));
var TAG_NAME_TO_ID = /* @__PURE__ */ new Map([
  [TAG_NAMES.A, TAG_ID.A],
  [TAG_NAMES.ADDRESS, TAG_ID.ADDRESS],
  [TAG_NAMES.ANNOTATION_XML, TAG_ID.ANNOTATION_XML],
  [TAG_NAMES.APPLET, TAG_ID.APPLET],
  [TAG_NAMES.AREA, TAG_ID.AREA],
  [TAG_NAMES.ARTICLE, TAG_ID.ARTICLE],
  [TAG_NAMES.ASIDE, TAG_ID.ASIDE],
  [TAG_NAMES.B, TAG_ID.B],
  [TAG_NAMES.BASE, TAG_ID.BASE],
  [TAG_NAMES.BASEFONT, TAG_ID.BASEFONT],
  [TAG_NAMES.BGSOUND, TAG_ID.BGSOUND],
  [TAG_NAMES.BIG, TAG_ID.BIG],
  [TAG_NAMES.BLOCKQUOTE, TAG_ID.BLOCKQUOTE],
  [TAG_NAMES.BODY, TAG_ID.BODY],
  [TAG_NAMES.BR, TAG_ID.BR],
  [TAG_NAMES.BUTTON, TAG_ID.BUTTON],
  [TAG_NAMES.CAPTION, TAG_ID.CAPTION],
  [TAG_NAMES.CENTER, TAG_ID.CENTER],
  [TAG_NAMES.CODE, TAG_ID.CODE],
  [TAG_NAMES.COL, TAG_ID.COL],
  [TAG_NAMES.COLGROUP, TAG_ID.COLGROUP],
  [TAG_NAMES.DD, TAG_ID.DD],
  [TAG_NAMES.DESC, TAG_ID.DESC],
  [TAG_NAMES.DETAILS, TAG_ID.DETAILS],
  [TAG_NAMES.DIALOG, TAG_ID.DIALOG],
  [TAG_NAMES.DIR, TAG_ID.DIR],
  [TAG_NAMES.DIV, TAG_ID.DIV],
  [TAG_NAMES.DL, TAG_ID.DL],
  [TAG_NAMES.DT, TAG_ID.DT],
  [TAG_NAMES.EM, TAG_ID.EM],
  [TAG_NAMES.EMBED, TAG_ID.EMBED],
  [TAG_NAMES.FIELDSET, TAG_ID.FIELDSET],
  [TAG_NAMES.FIGCAPTION, TAG_ID.FIGCAPTION],
  [TAG_NAMES.FIGURE, TAG_ID.FIGURE],
  [TAG_NAMES.FONT, TAG_ID.FONT],
  [TAG_NAMES.FOOTER, TAG_ID.FOOTER],
  [TAG_NAMES.FOREIGN_OBJECT, TAG_ID.FOREIGN_OBJECT],
  [TAG_NAMES.FORM, TAG_ID.FORM],
  [TAG_NAMES.FRAME, TAG_ID.FRAME],
  [TAG_NAMES.FRAMESET, TAG_ID.FRAMESET],
  [TAG_NAMES.H1, TAG_ID.H1],
  [TAG_NAMES.H2, TAG_ID.H2],
  [TAG_NAMES.H3, TAG_ID.H3],
  [TAG_NAMES.H4, TAG_ID.H4],
  [TAG_NAMES.H5, TAG_ID.H5],
  [TAG_NAMES.H6, TAG_ID.H6],
  [TAG_NAMES.HEAD, TAG_ID.HEAD],
  [TAG_NAMES.HEADER, TAG_ID.HEADER],
  [TAG_NAMES.HGROUP, TAG_ID.HGROUP],
  [TAG_NAMES.HR, TAG_ID.HR],
  [TAG_NAMES.HTML, TAG_ID.HTML],
  [TAG_NAMES.I, TAG_ID.I],
  [TAG_NAMES.IMG, TAG_ID.IMG],
  [TAG_NAMES.IMAGE, TAG_ID.IMAGE],
  [TAG_NAMES.INPUT, TAG_ID.INPUT],
  [TAG_NAMES.IFRAME, TAG_ID.IFRAME],
  [TAG_NAMES.KEYGEN, TAG_ID.KEYGEN],
  [TAG_NAMES.LABEL, TAG_ID.LABEL],
  [TAG_NAMES.LI, TAG_ID.LI],
  [TAG_NAMES.LINK, TAG_ID.LINK],
  [TAG_NAMES.LISTING, TAG_ID.LISTING],
  [TAG_NAMES.MAIN, TAG_ID.MAIN],
  [TAG_NAMES.MALIGNMARK, TAG_ID.MALIGNMARK],
  [TAG_NAMES.MARQUEE, TAG_ID.MARQUEE],
  [TAG_NAMES.MATH, TAG_ID.MATH],
  [TAG_NAMES.MENU, TAG_ID.MENU],
  [TAG_NAMES.META, TAG_ID.META],
  [TAG_NAMES.MGLYPH, TAG_ID.MGLYPH],
  [TAG_NAMES.MI, TAG_ID.MI],
  [TAG_NAMES.MO, TAG_ID.MO],
  [TAG_NAMES.MN, TAG_ID.MN],
  [TAG_NAMES.MS, TAG_ID.MS],
  [TAG_NAMES.MTEXT, TAG_ID.MTEXT],
  [TAG_NAMES.NAV, TAG_ID.NAV],
  [TAG_NAMES.NOBR, TAG_ID.NOBR],
  [TAG_NAMES.NOFRAMES, TAG_ID.NOFRAMES],
  [TAG_NAMES.NOEMBED, TAG_ID.NOEMBED],
  [TAG_NAMES.NOSCRIPT, TAG_ID.NOSCRIPT],
  [TAG_NAMES.OBJECT, TAG_ID.OBJECT],
  [TAG_NAMES.OL, TAG_ID.OL],
  [TAG_NAMES.OPTGROUP, TAG_ID.OPTGROUP],
  [TAG_NAMES.OPTION, TAG_ID.OPTION],
  [TAG_NAMES.P, TAG_ID.P],
  [TAG_NAMES.PARAM, TAG_ID.PARAM],
  [TAG_NAMES.PLAINTEXT, TAG_ID.PLAINTEXT],
  [TAG_NAMES.PRE, TAG_ID.PRE],
  [TAG_NAMES.RB, TAG_ID.RB],
  [TAG_NAMES.RP, TAG_ID.RP],
  [TAG_NAMES.RT, TAG_ID.RT],
  [TAG_NAMES.RTC, TAG_ID.RTC],
  [TAG_NAMES.RUBY, TAG_ID.RUBY],
  [TAG_NAMES.S, TAG_ID.S],
  [TAG_NAMES.SCRIPT, TAG_ID.SCRIPT],
  [TAG_NAMES.SEARCH, TAG_ID.SEARCH],
  [TAG_NAMES.SECTION, TAG_ID.SECTION],
  [TAG_NAMES.SELECT, TAG_ID.SELECT],
  [TAG_NAMES.SOURCE, TAG_ID.SOURCE],
  [TAG_NAMES.SMALL, TAG_ID.SMALL],
  [TAG_NAMES.SPAN, TAG_ID.SPAN],
  [TAG_NAMES.STRIKE, TAG_ID.STRIKE],
  [TAG_NAMES.STRONG, TAG_ID.STRONG],
  [TAG_NAMES.STYLE, TAG_ID.STYLE],
  [TAG_NAMES.SUB, TAG_ID.SUB],
  [TAG_NAMES.SUMMARY, TAG_ID.SUMMARY],
  [TAG_NAMES.SUP, TAG_ID.SUP],
  [TAG_NAMES.TABLE, TAG_ID.TABLE],
  [TAG_NAMES.TBODY, TAG_ID.TBODY],
  [TAG_NAMES.TEMPLATE, TAG_ID.TEMPLATE],
  [TAG_NAMES.TEXTAREA, TAG_ID.TEXTAREA],
  [TAG_NAMES.TFOOT, TAG_ID.TFOOT],
  [TAG_NAMES.TD, TAG_ID.TD],
  [TAG_NAMES.TH, TAG_ID.TH],
  [TAG_NAMES.THEAD, TAG_ID.THEAD],
  [TAG_NAMES.TITLE, TAG_ID.TITLE],
  [TAG_NAMES.TR, TAG_ID.TR],
  [TAG_NAMES.TRACK, TAG_ID.TRACK],
  [TAG_NAMES.TT, TAG_ID.TT],
  [TAG_NAMES.U, TAG_ID.U],
  [TAG_NAMES.UL, TAG_ID.UL],
  [TAG_NAMES.SVG, TAG_ID.SVG],
  [TAG_NAMES.VAR, TAG_ID.VAR],
  [TAG_NAMES.WBR, TAG_ID.WBR],
  [TAG_NAMES.XMP, TAG_ID.XMP]
]);
function getTagID(tagName) {
  var _a2;
  return (_a2 = TAG_NAME_TO_ID.get(tagName)) !== null && _a2 !== void 0 ? _a2 : TAG_ID.UNKNOWN;
}
var $ = TAG_ID;
var SPECIAL_ELEMENTS = {
  [NS.HTML]: /* @__PURE__ */ new Set([
    $.ADDRESS,
    $.APPLET,
    $.AREA,
    $.ARTICLE,
    $.ASIDE,
    $.BASE,
    $.BASEFONT,
    $.BGSOUND,
    $.BLOCKQUOTE,
    $.BODY,
    $.BR,
    $.BUTTON,
    $.CAPTION,
    $.CENTER,
    $.COL,
    $.COLGROUP,
    $.DD,
    $.DETAILS,
    $.DIR,
    $.DIV,
    $.DL,
    $.DT,
    $.EMBED,
    $.FIELDSET,
    $.FIGCAPTION,
    $.FIGURE,
    $.FOOTER,
    $.FORM,
    $.FRAME,
    $.FRAMESET,
    $.H1,
    $.H2,
    $.H3,
    $.H4,
    $.H5,
    $.H6,
    $.HEAD,
    $.HEADER,
    $.HGROUP,
    $.HR,
    $.HTML,
    $.IFRAME,
    $.IMG,
    $.INPUT,
    $.LI,
    $.LINK,
    $.LISTING,
    $.MAIN,
    $.MARQUEE,
    $.MENU,
    $.META,
    $.NAV,
    $.NOEMBED,
    $.NOFRAMES,
    $.NOSCRIPT,
    $.OBJECT,
    $.OL,
    $.P,
    $.PARAM,
    $.PLAINTEXT,
    $.PRE,
    $.SCRIPT,
    $.SECTION,
    $.SELECT,
    $.SOURCE,
    $.STYLE,
    $.SUMMARY,
    $.TABLE,
    $.TBODY,
    $.TD,
    $.TEMPLATE,
    $.TEXTAREA,
    $.TFOOT,
    $.TH,
    $.THEAD,
    $.TITLE,
    $.TR,
    $.TRACK,
    $.UL,
    $.WBR,
    $.XMP
  ]),
  [NS.MATHML]: /* @__PURE__ */ new Set([$.MI, $.MO, $.MN, $.MS, $.MTEXT, $.ANNOTATION_XML]),
  [NS.SVG]: /* @__PURE__ */ new Set([$.TITLE, $.FOREIGN_OBJECT, $.DESC]),
  [NS.XLINK]: /* @__PURE__ */ new Set(),
  [NS.XML]: /* @__PURE__ */ new Set(),
  [NS.XMLNS]: /* @__PURE__ */ new Set()
};
var NUMBERED_HEADERS = /* @__PURE__ */ new Set([$.H1, $.H2, $.H3, $.H4, $.H5, $.H6]);
var UNESCAPED_TEXT = /* @__PURE__ */ new Set([
  TAG_NAMES.STYLE,
  TAG_NAMES.SCRIPT,
  TAG_NAMES.XMP,
  TAG_NAMES.IFRAME,
  TAG_NAMES.NOEMBED,
  TAG_NAMES.NOFRAMES,
  TAG_NAMES.PLAINTEXT
]);

// node_modules/parse5/dist/tokenizer/index.js
var State;
(function(State2) {
  State2[State2["DATA"] = 0] = "DATA";
  State2[State2["RCDATA"] = 1] = "RCDATA";
  State2[State2["RAWTEXT"] = 2] = "RAWTEXT";
  State2[State2["SCRIPT_DATA"] = 3] = "SCRIPT_DATA";
  State2[State2["PLAINTEXT"] = 4] = "PLAINTEXT";
  State2[State2["TAG_OPEN"] = 5] = "TAG_OPEN";
  State2[State2["END_TAG_OPEN"] = 6] = "END_TAG_OPEN";
  State2[State2["TAG_NAME"] = 7] = "TAG_NAME";
  State2[State2["RCDATA_LESS_THAN_SIGN"] = 8] = "RCDATA_LESS_THAN_SIGN";
  State2[State2["RCDATA_END_TAG_OPEN"] = 9] = "RCDATA_END_TAG_OPEN";
  State2[State2["RCDATA_END_TAG_NAME"] = 10] = "RCDATA_END_TAG_NAME";
  State2[State2["RAWTEXT_LESS_THAN_SIGN"] = 11] = "RAWTEXT_LESS_THAN_SIGN";
  State2[State2["RAWTEXT_END_TAG_OPEN"] = 12] = "RAWTEXT_END_TAG_OPEN";
  State2[State2["RAWTEXT_END_TAG_NAME"] = 13] = "RAWTEXT_END_TAG_NAME";
  State2[State2["SCRIPT_DATA_LESS_THAN_SIGN"] = 14] = "SCRIPT_DATA_LESS_THAN_SIGN";
  State2[State2["SCRIPT_DATA_END_TAG_OPEN"] = 15] = "SCRIPT_DATA_END_TAG_OPEN";
  State2[State2["SCRIPT_DATA_END_TAG_NAME"] = 16] = "SCRIPT_DATA_END_TAG_NAME";
  State2[State2["SCRIPT_DATA_ESCAPE_START"] = 17] = "SCRIPT_DATA_ESCAPE_START";
  State2[State2["SCRIPT_DATA_ESCAPE_START_DASH"] = 18] = "SCRIPT_DATA_ESCAPE_START_DASH";
  State2[State2["SCRIPT_DATA_ESCAPED"] = 19] = "SCRIPT_DATA_ESCAPED";
  State2[State2["SCRIPT_DATA_ESCAPED_DASH"] = 20] = "SCRIPT_DATA_ESCAPED_DASH";
  State2[State2["SCRIPT_DATA_ESCAPED_DASH_DASH"] = 21] = "SCRIPT_DATA_ESCAPED_DASH_DASH";
  State2[State2["SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN"] = 22] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN";
  State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_OPEN"] = 23] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN";
  State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_NAME"] = 24] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_START"] = 25] = "SCRIPT_DATA_DOUBLE_ESCAPE_START";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED"] = 26] = "SCRIPT_DATA_DOUBLE_ESCAPED";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH"] = 27] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH"] = 28] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN"] = 29] = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN";
  State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_END"] = 30] = "SCRIPT_DATA_DOUBLE_ESCAPE_END";
  State2[State2["BEFORE_ATTRIBUTE_NAME"] = 31] = "BEFORE_ATTRIBUTE_NAME";
  State2[State2["ATTRIBUTE_NAME"] = 32] = "ATTRIBUTE_NAME";
  State2[State2["AFTER_ATTRIBUTE_NAME"] = 33] = "AFTER_ATTRIBUTE_NAME";
  State2[State2["BEFORE_ATTRIBUTE_VALUE"] = 34] = "BEFORE_ATTRIBUTE_VALUE";
  State2[State2["ATTRIBUTE_VALUE_DOUBLE_QUOTED"] = 35] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED";
  State2[State2["ATTRIBUTE_VALUE_SINGLE_QUOTED"] = 36] = "ATTRIBUTE_VALUE_SINGLE_QUOTED";
  State2[State2["ATTRIBUTE_VALUE_UNQUOTED"] = 37] = "ATTRIBUTE_VALUE_UNQUOTED";
  State2[State2["AFTER_ATTRIBUTE_VALUE_QUOTED"] = 38] = "AFTER_ATTRIBUTE_VALUE_QUOTED";
  State2[State2["SELF_CLOSING_START_TAG"] = 39] = "SELF_CLOSING_START_TAG";
  State2[State2["BOGUS_COMMENT"] = 40] = "BOGUS_COMMENT";
  State2[State2["MARKUP_DECLARATION_OPEN"] = 41] = "MARKUP_DECLARATION_OPEN";
  State2[State2["COMMENT_START"] = 42] = "COMMENT_START";
  State2[State2["COMMENT_START_DASH"] = 43] = "COMMENT_START_DASH";
  State2[State2["COMMENT"] = 44] = "COMMENT";
  State2[State2["COMMENT_LESS_THAN_SIGN"] = 45] = "COMMENT_LESS_THAN_SIGN";
  State2[State2["COMMENT_LESS_THAN_SIGN_BANG"] = 46] = "COMMENT_LESS_THAN_SIGN_BANG";
  State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH"] = 47] = "COMMENT_LESS_THAN_SIGN_BANG_DASH";
  State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH"] = 48] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH";
  State2[State2["COMMENT_END_DASH"] = 49] = "COMMENT_END_DASH";
  State2[State2["COMMENT_END"] = 50] = "COMMENT_END";
  State2[State2["COMMENT_END_BANG"] = 51] = "COMMENT_END_BANG";
  State2[State2["DOCTYPE"] = 52] = "DOCTYPE";
  State2[State2["BEFORE_DOCTYPE_NAME"] = 53] = "BEFORE_DOCTYPE_NAME";
  State2[State2["DOCTYPE_NAME"] = 54] = "DOCTYPE_NAME";
  State2[State2["AFTER_DOCTYPE_NAME"] = 55] = "AFTER_DOCTYPE_NAME";
  State2[State2["AFTER_DOCTYPE_PUBLIC_KEYWORD"] = 56] = "AFTER_DOCTYPE_PUBLIC_KEYWORD";
  State2[State2["BEFORE_DOCTYPE_PUBLIC_IDENTIFIER"] = 57] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER";
  State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED"] = 58] = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED";
  State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED"] = 59] = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED";
  State2[State2["AFTER_DOCTYPE_PUBLIC_IDENTIFIER"] = 60] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER";
  State2[State2["BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS"] = 61] = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS";
  State2[State2["AFTER_DOCTYPE_SYSTEM_KEYWORD"] = 62] = "AFTER_DOCTYPE_SYSTEM_KEYWORD";
  State2[State2["BEFORE_DOCTYPE_SYSTEM_IDENTIFIER"] = 63] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER";
  State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED"] = 64] = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED";
  State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED"] = 65] = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED";
  State2[State2["AFTER_DOCTYPE_SYSTEM_IDENTIFIER"] = 66] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER";
  State2[State2["BOGUS_DOCTYPE"] = 67] = "BOGUS_DOCTYPE";
  State2[State2["CDATA_SECTION"] = 68] = "CDATA_SECTION";
  State2[State2["CDATA_SECTION_BRACKET"] = 69] = "CDATA_SECTION_BRACKET";
  State2[State2["CDATA_SECTION_END"] = 70] = "CDATA_SECTION_END";
  State2[State2["CHARACTER_REFERENCE"] = 71] = "CHARACTER_REFERENCE";
  State2[State2["AMBIGUOUS_AMPERSAND"] = 72] = "AMBIGUOUS_AMPERSAND";
})(State || (State = {}));
var TokenizerMode = {
  DATA: State.DATA,
  RCDATA: State.RCDATA,
  RAWTEXT: State.RAWTEXT,
  SCRIPT_DATA: State.SCRIPT_DATA,
  PLAINTEXT: State.PLAINTEXT,
  CDATA_SECTION: State.CDATA_SECTION
};
function isAsciiDigit(cp) {
  return cp >= CODE_POINTS.DIGIT_0 && cp <= CODE_POINTS.DIGIT_9;
}
function isAsciiUpper(cp) {
  return cp >= CODE_POINTS.LATIN_CAPITAL_A && cp <= CODE_POINTS.LATIN_CAPITAL_Z;
}
function isAsciiLower(cp) {
  return cp >= CODE_POINTS.LATIN_SMALL_A && cp <= CODE_POINTS.LATIN_SMALL_Z;
}
function isAsciiLetter(cp) {
  return isAsciiLower(cp) || isAsciiUpper(cp);
}
function isAsciiAlphaNumeric2(cp) {
  return isAsciiLetter(cp) || isAsciiDigit(cp);
}
function toAsciiLower(cp) {
  return cp + 32;
}
function isWhitespace(cp) {
  return cp === CODE_POINTS.SPACE || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.TABULATION || cp === CODE_POINTS.FORM_FEED;
}
function isScriptDataDoubleEscapeSequenceEnd(cp) {
  return isWhitespace(cp) || cp === CODE_POINTS.SOLIDUS || cp === CODE_POINTS.GREATER_THAN_SIGN;
}
function getErrorForNumericCharacterReference(code) {
  if (code === CODE_POINTS.NULL) {
    return ERR.nullCharacterReference;
  } else if (code > 1114111) {
    return ERR.characterReferenceOutsideUnicodeRange;
  } else if (isSurrogate(code)) {
    return ERR.surrogateCharacterReference;
  } else if (isUndefinedCodePoint(code)) {
    return ERR.noncharacterCharacterReference;
  } else if (isControlCodePoint(code) || code === CODE_POINTS.CARRIAGE_RETURN) {
    return ERR.controlCharacterReference;
  }
  return null;
}
var Tokenizer = class {
  constructor(options2, handler) {
    this.options = options2;
    this.handler = handler;
    this.paused = false;
    this.inLoop = false;
    this.inForeignNode = false;
    this.lastStartTagName = "";
    this.active = false;
    this.state = State.DATA;
    this.returnState = State.DATA;
    this.entityStartPos = 0;
    this.consumedAfterSnapshot = -1;
    this.currentCharacterToken = null;
    this.currentToken = null;
    this.currentAttr = { name: "", value: "" };
    this.preprocessor = new Preprocessor(handler);
    this.currentLocation = this.getCurrentLocation(-1);
    this.entityDecoder = new EntityDecoder(htmlDecodeTree, (cp, consumed) => {
      this.preprocessor.pos = this.entityStartPos + consumed - 1;
      this._flushCodePointConsumedAsCharacterReference(cp);
    }, handler.onParseError ? {
      missingSemicolonAfterCharacterReference: () => {
        this._err(ERR.missingSemicolonAfterCharacterReference, 1);
      },
      absenceOfDigitsInNumericCharacterReference: (consumed) => {
        this._err(ERR.absenceOfDigitsInNumericCharacterReference, this.entityStartPos - this.preprocessor.pos + consumed);
      },
      validateNumericCharacterReference: (code) => {
        const error = getErrorForNumericCharacterReference(code);
        if (error)
          this._err(error, 1);
      }
    } : void 0);
  }
  //Errors
  _err(code, cpOffset = 0) {
    var _a2, _b;
    (_b = (_a2 = this.handler).onParseError) === null || _b === void 0 ? void 0 : _b.call(_a2, this.preprocessor.getError(code, cpOffset));
  }
  // NOTE: `offset` may never run across line boundaries.
  getCurrentLocation(offset) {
    if (!this.options.sourceCodeLocationInfo) {
      return null;
    }
    return {
      startLine: this.preprocessor.line,
      startCol: this.preprocessor.col - offset,
      startOffset: this.preprocessor.offset - offset,
      endLine: -1,
      endCol: -1,
      endOffset: -1
    };
  }
  _runParsingLoop() {
    if (this.inLoop)
      return;
    this.inLoop = true;
    while (this.active && !this.paused) {
      this.consumedAfterSnapshot = 0;
      const cp = this._consume();
      if (!this._ensureHibernation()) {
        this._callState(cp);
      }
    }
    this.inLoop = false;
  }
  //API
  pause() {
    this.paused = true;
  }
  resume(writeCallback) {
    if (!this.paused) {
      throw new Error("Parser was already resumed");
    }
    this.paused = false;
    if (this.inLoop)
      return;
    this._runParsingLoop();
    if (!this.paused) {
      writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
    }
  }
  write(chunk, isLastChunk, writeCallback) {
    this.active = true;
    this.preprocessor.write(chunk, isLastChunk);
    this._runParsingLoop();
    if (!this.paused) {
      writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
    }
  }
  insertHtmlAtCurrentPos(chunk) {
    this.active = true;
    this.preprocessor.insertHtmlAtCurrentPos(chunk);
    this._runParsingLoop();
  }
  //Hibernation
  _ensureHibernation() {
    if (this.preprocessor.endOfChunkHit) {
      this.preprocessor.retreat(this.consumedAfterSnapshot);
      this.consumedAfterSnapshot = 0;
      this.active = false;
      return true;
    }
    return false;
  }
  //Consumption
  _consume() {
    this.consumedAfterSnapshot++;
    return this.preprocessor.advance();
  }
  _advanceBy(count) {
    this.consumedAfterSnapshot += count;
    for (let i = 0; i < count; i++) {
      this.preprocessor.advance();
    }
  }
  _consumeSequenceIfMatch(pattern, caseSensitive) {
    if (this.preprocessor.startsWith(pattern, caseSensitive)) {
      this._advanceBy(pattern.length - 1);
      return true;
    }
    return false;
  }
  //Token creation
  _createStartTagToken() {
    this.currentToken = {
      type: TokenType.START_TAG,
      tagName: "",
      tagID: TAG_ID.UNKNOWN,
      selfClosing: false,
      ackSelfClosing: false,
      attrs: [],
      location: this.getCurrentLocation(1)
    };
  }
  _createEndTagToken() {
    this.currentToken = {
      type: TokenType.END_TAG,
      tagName: "",
      tagID: TAG_ID.UNKNOWN,
      selfClosing: false,
      ackSelfClosing: false,
      attrs: [],
      location: this.getCurrentLocation(2)
    };
  }
  _createCommentToken(offset) {
    this.currentToken = {
      type: TokenType.COMMENT,
      data: "",
      location: this.getCurrentLocation(offset)
    };
  }
  _createDoctypeToken(initialName) {
    this.currentToken = {
      type: TokenType.DOCTYPE,
      name: initialName,
      forceQuirks: false,
      publicId: null,
      systemId: null,
      location: this.currentLocation
    };
  }
  _createCharacterToken(type2, chars) {
    this.currentCharacterToken = {
      type: type2,
      chars,
      location: this.currentLocation
    };
  }
  //Tag attributes
  _createAttr(attrNameFirstCh) {
    this.currentAttr = {
      name: attrNameFirstCh,
      value: ""
    };
    this.currentLocation = this.getCurrentLocation(0);
  }
  _leaveAttrName() {
    var _a2;
    var _b;
    const token = this.currentToken;
    if (getTokenAttr(token, this.currentAttr.name) === null) {
      token.attrs.push(this.currentAttr);
      if (token.location && this.currentLocation) {
        const attrLocations = (_a2 = (_b = token.location).attrs) !== null && _a2 !== void 0 ? _a2 : _b.attrs = /* @__PURE__ */ Object.create(null);
        attrLocations[this.currentAttr.name] = this.currentLocation;
        this._leaveAttrValue();
      }
    } else {
      this._err(ERR.duplicateAttribute);
    }
  }
  _leaveAttrValue() {
    if (this.currentLocation) {
      this.currentLocation.endLine = this.preprocessor.line;
      this.currentLocation.endCol = this.preprocessor.col;
      this.currentLocation.endOffset = this.preprocessor.offset;
    }
  }
  //Token emission
  prepareToken(ct) {
    this._emitCurrentCharacterToken(ct.location);
    this.currentToken = null;
    if (ct.location) {
      ct.location.endLine = this.preprocessor.line;
      ct.location.endCol = this.preprocessor.col + 1;
      ct.location.endOffset = this.preprocessor.offset + 1;
    }
    this.currentLocation = this.getCurrentLocation(-1);
  }
  emitCurrentTagToken() {
    const ct = this.currentToken;
    this.prepareToken(ct);
    ct.tagID = getTagID(ct.tagName);
    if (ct.type === TokenType.START_TAG) {
      this.lastStartTagName = ct.tagName;
      this.handler.onStartTag(ct);
    } else {
      if (ct.attrs.length > 0) {
        this._err(ERR.endTagWithAttributes);
      }
      if (ct.selfClosing) {
        this._err(ERR.endTagWithTrailingSolidus);
      }
      this.handler.onEndTag(ct);
    }
    this.preprocessor.dropParsedChunk();
  }
  emitCurrentComment(ct) {
    this.prepareToken(ct);
    this.handler.onComment(ct);
    this.preprocessor.dropParsedChunk();
  }
  emitCurrentDoctype(ct) {
    this.prepareToken(ct);
    this.handler.onDoctype(ct);
    this.preprocessor.dropParsedChunk();
  }
  _emitCurrentCharacterToken(nextLocation) {
    if (this.currentCharacterToken) {
      if (nextLocation && this.currentCharacterToken.location) {
        this.currentCharacterToken.location.endLine = nextLocation.startLine;
        this.currentCharacterToken.location.endCol = nextLocation.startCol;
        this.currentCharacterToken.location.endOffset = nextLocation.startOffset;
      }
      switch (this.currentCharacterToken.type) {
        case TokenType.CHARACTER: {
          this.handler.onCharacter(this.currentCharacterToken);
          break;
        }
        case TokenType.NULL_CHARACTER: {
          this.handler.onNullCharacter(this.currentCharacterToken);
          break;
        }
        case TokenType.WHITESPACE_CHARACTER: {
          this.handler.onWhitespaceCharacter(this.currentCharacterToken);
          break;
        }
      }
      this.currentCharacterToken = null;
    }
  }
  _emitEOFToken() {
    const location2 = this.getCurrentLocation(0);
    if (location2) {
      location2.endLine = location2.startLine;
      location2.endCol = location2.startCol;
      location2.endOffset = location2.startOffset;
    }
    this._emitCurrentCharacterToken(location2);
    this.handler.onEof({ type: TokenType.EOF, location: location2 });
    this.active = false;
  }
  //Characters emission
  //OPTIMIZATION: The specification uses only one type of character token (one token per character).
  //This causes a huge memory overhead and a lot of unnecessary parser loops. parse5 uses 3 groups of characters.
  //If we have a sequence of characters that belong to the same group, the parser can process it
  //as a single solid character token.
  //So, there are 3 types of character tokens in parse5:
  //1)TokenType.NULL_CHARACTER - \u0000-character sequences (e.g. '\u0000\u0000\u0000')
  //2)TokenType.WHITESPACE_CHARACTER - any whitespace/new-line character sequences (e.g. '\n  \r\t   \f')
  //3)TokenType.CHARACTER - any character sequence which don't belong to groups 1 and 2 (e.g. 'abcdef1234@@#$%^')
  _appendCharToCurrentCharacterToken(type2, ch) {
    if (this.currentCharacterToken) {
      if (this.currentCharacterToken.type === type2) {
        this.currentCharacterToken.chars += ch;
        return;
      } else {
        this.currentLocation = this.getCurrentLocation(0);
        this._emitCurrentCharacterToken(this.currentLocation);
        this.preprocessor.dropParsedChunk();
      }
    }
    this._createCharacterToken(type2, ch);
  }
  _emitCodePoint(cp) {
    const type2 = isWhitespace(cp) ? TokenType.WHITESPACE_CHARACTER : cp === CODE_POINTS.NULL ? TokenType.NULL_CHARACTER : TokenType.CHARACTER;
    this._appendCharToCurrentCharacterToken(type2, String.fromCodePoint(cp));
  }
  //NOTE: used when we emit characters explicitly.
  //This is always for non-whitespace and non-null characters, which allows us to avoid additional checks.
  _emitChars(ch) {
    this._appendCharToCurrentCharacterToken(TokenType.CHARACTER, ch);
  }
  // Character reference helpers
  _startCharacterReference() {
    this.returnState = this.state;
    this.state = State.CHARACTER_REFERENCE;
    this.entityStartPos = this.preprocessor.pos;
    this.entityDecoder.startEntity(this._isCharacterReferenceInAttribute() ? DecodingMode.Attribute : DecodingMode.Legacy);
  }
  _isCharacterReferenceInAttribute() {
    return this.returnState === State.ATTRIBUTE_VALUE_DOUBLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_SINGLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_UNQUOTED;
  }
  _flushCodePointConsumedAsCharacterReference(cp) {
    if (this._isCharacterReferenceInAttribute()) {
      this.currentAttr.value += String.fromCodePoint(cp);
    } else {
      this._emitCodePoint(cp);
    }
  }
  // Calling states this way turns out to be much faster than any other approach.
  _callState(cp) {
    switch (this.state) {
      case State.DATA: {
        this._stateData(cp);
        break;
      }
      case State.RCDATA: {
        this._stateRcdata(cp);
        break;
      }
      case State.RAWTEXT: {
        this._stateRawtext(cp);
        break;
      }
      case State.SCRIPT_DATA: {
        this._stateScriptData(cp);
        break;
      }
      case State.PLAINTEXT: {
        this._statePlaintext(cp);
        break;
      }
      case State.TAG_OPEN: {
        this._stateTagOpen(cp);
        break;
      }
      case State.END_TAG_OPEN: {
        this._stateEndTagOpen(cp);
        break;
      }
      case State.TAG_NAME: {
        this._stateTagName(cp);
        break;
      }
      case State.RCDATA_LESS_THAN_SIGN: {
        this._stateRcdataLessThanSign(cp);
        break;
      }
      case State.RCDATA_END_TAG_OPEN: {
        this._stateRcdataEndTagOpen(cp);
        break;
      }
      case State.RCDATA_END_TAG_NAME: {
        this._stateRcdataEndTagName(cp);
        break;
      }
      case State.RAWTEXT_LESS_THAN_SIGN: {
        this._stateRawtextLessThanSign(cp);
        break;
      }
      case State.RAWTEXT_END_TAG_OPEN: {
        this._stateRawtextEndTagOpen(cp);
        break;
      }
      case State.RAWTEXT_END_TAG_NAME: {
        this._stateRawtextEndTagName(cp);
        break;
      }
      case State.SCRIPT_DATA_LESS_THAN_SIGN: {
        this._stateScriptDataLessThanSign(cp);
        break;
      }
      case State.SCRIPT_DATA_END_TAG_OPEN: {
        this._stateScriptDataEndTagOpen(cp);
        break;
      }
      case State.SCRIPT_DATA_END_TAG_NAME: {
        this._stateScriptDataEndTagName(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPE_START: {
        this._stateScriptDataEscapeStart(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPE_START_DASH: {
        this._stateScriptDataEscapeStartDash(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED: {
        this._stateScriptDataEscaped(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED_DASH: {
        this._stateScriptDataEscapedDash(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED_DASH_DASH: {
        this._stateScriptDataEscapedDashDash(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN: {
        this._stateScriptDataEscapedLessThanSign(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN: {
        this._stateScriptDataEscapedEndTagOpen(cp);
        break;
      }
      case State.SCRIPT_DATA_ESCAPED_END_TAG_NAME: {
        this._stateScriptDataEscapedEndTagName(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPE_START: {
        this._stateScriptDataDoubleEscapeStart(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPED: {
        this._stateScriptDataDoubleEscaped(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH: {
        this._stateScriptDataDoubleEscapedDash(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH: {
        this._stateScriptDataDoubleEscapedDashDash(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN: {
        this._stateScriptDataDoubleEscapedLessThanSign(cp);
        break;
      }
      case State.SCRIPT_DATA_DOUBLE_ESCAPE_END: {
        this._stateScriptDataDoubleEscapeEnd(cp);
        break;
      }
      case State.BEFORE_ATTRIBUTE_NAME: {
        this._stateBeforeAttributeName(cp);
        break;
      }
      case State.ATTRIBUTE_NAME: {
        this._stateAttributeName(cp);
        break;
      }
      case State.AFTER_ATTRIBUTE_NAME: {
        this._stateAfterAttributeName(cp);
        break;
      }
      case State.BEFORE_ATTRIBUTE_VALUE: {
        this._stateBeforeAttributeValue(cp);
        break;
      }
      case State.ATTRIBUTE_VALUE_DOUBLE_QUOTED: {
        this._stateAttributeValueDoubleQuoted(cp);
        break;
      }
      case State.ATTRIBUTE_VALUE_SINGLE_QUOTED: {
        this._stateAttributeValueSingleQuoted(cp);
        break;
      }
      case State.ATTRIBUTE_VALUE_UNQUOTED: {
        this._stateAttributeValueUnquoted(cp);
        break;
      }
      case State.AFTER_ATTRIBUTE_VALUE_QUOTED: {
        this._stateAfterAttributeValueQuoted(cp);
        break;
      }
      case State.SELF_CLOSING_START_TAG: {
        this._stateSelfClosingStartTag(cp);
        break;
      }
      case State.BOGUS_COMMENT: {
        this._stateBogusComment(cp);
        break;
      }
      case State.MARKUP_DECLARATION_OPEN: {
        this._stateMarkupDeclarationOpen(cp);
        break;
      }
      case State.COMMENT_START: {
        this._stateCommentStart(cp);
        break;
      }
      case State.COMMENT_START_DASH: {
        this._stateCommentStartDash(cp);
        break;
      }
      case State.COMMENT: {
        this._stateComment(cp);
        break;
      }
      case State.COMMENT_LESS_THAN_SIGN: {
        this._stateCommentLessThanSign(cp);
        break;
      }
      case State.COMMENT_LESS_THAN_SIGN_BANG: {
        this._stateCommentLessThanSignBang(cp);
        break;
      }
      case State.COMMENT_LESS_THAN_SIGN_BANG_DASH: {
        this._stateCommentLessThanSignBangDash(cp);
        break;
      }
      case State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH: {
        this._stateCommentLessThanSignBangDashDash(cp);
        break;
      }
      case State.COMMENT_END_DASH: {
        this._stateCommentEndDash(cp);
        break;
      }
      case State.COMMENT_END: {
        this._stateCommentEnd(cp);
        break;
      }
      case State.COMMENT_END_BANG: {
        this._stateCommentEndBang(cp);
        break;
      }
      case State.DOCTYPE: {
        this._stateDoctype(cp);
        break;
      }
      case State.BEFORE_DOCTYPE_NAME: {
        this._stateBeforeDoctypeName(cp);
        break;
      }
      case State.DOCTYPE_NAME: {
        this._stateDoctypeName(cp);
        break;
      }
      case State.AFTER_DOCTYPE_NAME: {
        this._stateAfterDoctypeName(cp);
        break;
      }
      case State.AFTER_DOCTYPE_PUBLIC_KEYWORD: {
        this._stateAfterDoctypePublicKeyword(cp);
        break;
      }
      case State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER: {
        this._stateBeforeDoctypePublicIdentifier(cp);
        break;
      }
      case State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED: {
        this._stateDoctypePublicIdentifierDoubleQuoted(cp);
        break;
      }
      case State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED: {
        this._stateDoctypePublicIdentifierSingleQuoted(cp);
        break;
      }
      case State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER: {
        this._stateAfterDoctypePublicIdentifier(cp);
        break;
      }
      case State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS: {
        this._stateBetweenDoctypePublicAndSystemIdentifiers(cp);
        break;
      }
      case State.AFTER_DOCTYPE_SYSTEM_KEYWORD: {
        this._stateAfterDoctypeSystemKeyword(cp);
        break;
      }
      case State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER: {
        this._stateBeforeDoctypeSystemIdentifier(cp);
        break;
      }
      case State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED: {
        this._stateDoctypeSystemIdentifierDoubleQuoted(cp);
        break;
      }
      case State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED: {
        this._stateDoctypeSystemIdentifierSingleQuoted(cp);
        break;
      }
      case State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER: {
        this._stateAfterDoctypeSystemIdentifier(cp);
        break;
      }
      case State.BOGUS_DOCTYPE: {
        this._stateBogusDoctype(cp);
        break;
      }
      case State.CDATA_SECTION: {
        this._stateCdataSection(cp);
        break;
      }
      case State.CDATA_SECTION_BRACKET: {
        this._stateCdataSectionBracket(cp);
        break;
      }
      case State.CDATA_SECTION_END: {
        this._stateCdataSectionEnd(cp);
        break;
      }
      case State.CHARACTER_REFERENCE: {
        this._stateCharacterReference();
        break;
      }
      case State.AMBIGUOUS_AMPERSAND: {
        this._stateAmbiguousAmpersand(cp);
        break;
      }
      default: {
        throw new Error("Unknown state");
      }
    }
  }
  // State machine
  // Data state
  //------------------------------------------------------------------
  _stateData(cp) {
    switch (cp) {
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.TAG_OPEN;
        break;
      }
      case CODE_POINTS.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitCodePoint(cp);
        break;
      }
      case CODE_POINTS.EOF: {
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  //  RCDATA state
  //------------------------------------------------------------------
  _stateRcdata(cp) {
    switch (cp) {
      case CODE_POINTS.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.RCDATA_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // RAWTEXT state
  //------------------------------------------------------------------
  _stateRawtext(cp) {
    switch (cp) {
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.RAWTEXT_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data state
  //------------------------------------------------------------------
  _stateScriptData(cp) {
    switch (cp) {
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // PLAINTEXT state
  //------------------------------------------------------------------
  _statePlaintext(cp) {
    switch (cp) {
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // Tag open state
  //------------------------------------------------------------------
  _stateTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this._createStartTagToken();
      this.state = State.TAG_NAME;
      this._stateTagName(cp);
    } else
      switch (cp) {
        case CODE_POINTS.EXCLAMATION_MARK: {
          this.state = State.MARKUP_DECLARATION_OPEN;
          break;
        }
        case CODE_POINTS.SOLIDUS: {
          this.state = State.END_TAG_OPEN;
          break;
        }
        case CODE_POINTS.QUESTION_MARK: {
          this._err(ERR.unexpectedQuestionMarkInsteadOfTagName);
          this._createCommentToken(1);
          this.state = State.BOGUS_COMMENT;
          this._stateBogusComment(cp);
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofBeforeTagName);
          this._emitChars("<");
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.invalidFirstCharacterOfTagName);
          this._emitChars("<");
          this.state = State.DATA;
          this._stateData(cp);
        }
      }
  }
  // End tag open state
  //------------------------------------------------------------------
  _stateEndTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this._createEndTagToken();
      this.state = State.TAG_NAME;
      this._stateTagName(cp);
    } else
      switch (cp) {
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingEndTagName);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofBeforeTagName);
          this._emitChars("</");
          this._emitEOFToken();
          break;
        }
        default: {
          this._err(ERR.invalidFirstCharacterOfTagName);
          this._createCommentToken(2);
          this.state = State.BOGUS_COMMENT;
          this._stateBogusComment(cp);
        }
      }
  }
  // Tag name state
  //------------------------------------------------------------------
  _stateTagName(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        break;
      }
      case CODE_POINTS.SOLIDUS: {
        this.state = State.SELF_CLOSING_START_TAG;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.tagName += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        token.tagName += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
      }
    }
  }
  // RCDATA less-than sign state
  //------------------------------------------------------------------
  _stateRcdataLessThanSign(cp) {
    if (cp === CODE_POINTS.SOLIDUS) {
      this.state = State.RCDATA_END_TAG_OPEN;
    } else {
      this._emitChars("<");
      this.state = State.RCDATA;
      this._stateRcdata(cp);
    }
  }
  // RCDATA end tag open state
  //------------------------------------------------------------------
  _stateRcdataEndTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this.state = State.RCDATA_END_TAG_NAME;
      this._stateRcdataEndTagName(cp);
    } else {
      this._emitChars("</");
      this.state = State.RCDATA;
      this._stateRcdata(cp);
    }
  }
  handleSpecialEndTag(_cp) {
    if (!this.preprocessor.startsWith(this.lastStartTagName, false)) {
      return !this._ensureHibernation();
    }
    this._createEndTagToken();
    const token = this.currentToken;
    token.tagName = this.lastStartTagName;
    const cp = this.preprocessor.peek(this.lastStartTagName.length);
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this._advanceBy(this.lastStartTagName.length);
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        return false;
      }
      case CODE_POINTS.SOLIDUS: {
        this._advanceBy(this.lastStartTagName.length);
        this.state = State.SELF_CLOSING_START_TAG;
        return false;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._advanceBy(this.lastStartTagName.length);
        this.emitCurrentTagToken();
        this.state = State.DATA;
        return false;
      }
      default: {
        return !this._ensureHibernation();
      }
    }
  }
  // RCDATA end tag name state
  //------------------------------------------------------------------
  _stateRcdataEndTagName(cp) {
    if (this.handleSpecialEndTag(cp)) {
      this._emitChars("</");
      this.state = State.RCDATA;
      this._stateRcdata(cp);
    }
  }
  // RAWTEXT less-than sign state
  //------------------------------------------------------------------
  _stateRawtextLessThanSign(cp) {
    if (cp === CODE_POINTS.SOLIDUS) {
      this.state = State.RAWTEXT_END_TAG_OPEN;
    } else {
      this._emitChars("<");
      this.state = State.RAWTEXT;
      this._stateRawtext(cp);
    }
  }
  // RAWTEXT end tag open state
  //------------------------------------------------------------------
  _stateRawtextEndTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this.state = State.RAWTEXT_END_TAG_NAME;
      this._stateRawtextEndTagName(cp);
    } else {
      this._emitChars("</");
      this.state = State.RAWTEXT;
      this._stateRawtext(cp);
    }
  }
  // RAWTEXT end tag name state
  //------------------------------------------------------------------
  _stateRawtextEndTagName(cp) {
    if (this.handleSpecialEndTag(cp)) {
      this._emitChars("</");
      this.state = State.RAWTEXT;
      this._stateRawtext(cp);
    }
  }
  // Script data less-than sign state
  //------------------------------------------------------------------
  _stateScriptDataLessThanSign(cp) {
    switch (cp) {
      case CODE_POINTS.SOLIDUS: {
        this.state = State.SCRIPT_DATA_END_TAG_OPEN;
        break;
      }
      case CODE_POINTS.EXCLAMATION_MARK: {
        this.state = State.SCRIPT_DATA_ESCAPE_START;
        this._emitChars("<!");
        break;
      }
      default: {
        this._emitChars("<");
        this.state = State.SCRIPT_DATA;
        this._stateScriptData(cp);
      }
    }
  }
  // Script data end tag open state
  //------------------------------------------------------------------
  _stateScriptDataEndTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this.state = State.SCRIPT_DATA_END_TAG_NAME;
      this._stateScriptDataEndTagName(cp);
    } else {
      this._emitChars("</");
      this.state = State.SCRIPT_DATA;
      this._stateScriptData(cp);
    }
  }
  // Script data end tag name state
  //------------------------------------------------------------------
  _stateScriptDataEndTagName(cp) {
    if (this.handleSpecialEndTag(cp)) {
      this._emitChars("</");
      this.state = State.SCRIPT_DATA;
      this._stateScriptData(cp);
    }
  }
  // Script data escape start state
  //------------------------------------------------------------------
  _stateScriptDataEscapeStart(cp) {
    if (cp === CODE_POINTS.HYPHEN_MINUS) {
      this.state = State.SCRIPT_DATA_ESCAPE_START_DASH;
      this._emitChars("-");
    } else {
      this.state = State.SCRIPT_DATA;
      this._stateScriptData(cp);
    }
  }
  // Script data escape start dash state
  //------------------------------------------------------------------
  _stateScriptDataEscapeStartDash(cp) {
    if (cp === CODE_POINTS.HYPHEN_MINUS) {
      this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
      this._emitChars("-");
    } else {
      this.state = State.SCRIPT_DATA;
      this._stateScriptData(cp);
    }
  }
  // Script data escaped state
  //------------------------------------------------------------------
  _stateScriptDataEscaped(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.SCRIPT_DATA_ESCAPED_DASH;
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data escaped dash state
  //------------------------------------------------------------------
  _stateScriptDataEscapedDash(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data escaped dash dash state
  //------------------------------------------------------------------
  _stateScriptDataEscapedDashDash(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.SCRIPT_DATA;
        this._emitChars(">");
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this.state = State.SCRIPT_DATA_ESCAPED;
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data escaped less-than sign state
  //------------------------------------------------------------------
  _stateScriptDataEscapedLessThanSign(cp) {
    if (cp === CODE_POINTS.SOLIDUS) {
      this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
    } else if (isAsciiLetter(cp)) {
      this._emitChars("<");
      this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_START;
      this._stateScriptDataDoubleEscapeStart(cp);
    } else {
      this._emitChars("<");
      this.state = State.SCRIPT_DATA_ESCAPED;
      this._stateScriptDataEscaped(cp);
    }
  }
  // Script data escaped end tag open state
  //------------------------------------------------------------------
  _stateScriptDataEscapedEndTagOpen(cp) {
    if (isAsciiLetter(cp)) {
      this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
      this._stateScriptDataEscapedEndTagName(cp);
    } else {
      this._emitChars("</");
      this.state = State.SCRIPT_DATA_ESCAPED;
      this._stateScriptDataEscaped(cp);
    }
  }
  // Script data escaped end tag name state
  //------------------------------------------------------------------
  _stateScriptDataEscapedEndTagName(cp) {
    if (this.handleSpecialEndTag(cp)) {
      this._emitChars("</");
      this.state = State.SCRIPT_DATA_ESCAPED;
      this._stateScriptDataEscaped(cp);
    }
  }
  // Script data double escape start state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscapeStart(cp) {
    if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
      this._emitCodePoint(cp);
      for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
        this._emitCodePoint(this._consume());
      }
      this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
    } else if (!this._ensureHibernation()) {
      this.state = State.SCRIPT_DATA_ESCAPED;
      this._stateScriptDataEscaped(cp);
    }
  }
  // Script data double escaped state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscaped(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        this._emitChars("<");
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data double escaped dash state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscapedDash(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        this._emitChars("<");
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data double escaped dash dash state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscapedDashDash(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this._emitChars("-");
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
        this._emitChars("<");
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.SCRIPT_DATA;
        this._emitChars(">");
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._emitChars(REPLACEMENT_CHARACTER);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInScriptHtmlCommentLikeText);
        this._emitEOFToken();
        break;
      }
      default: {
        this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        this._emitCodePoint(cp);
      }
    }
  }
  // Script data double escaped less-than sign state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscapedLessThanSign(cp) {
    if (cp === CODE_POINTS.SOLIDUS) {
      this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_END;
      this._emitChars("/");
    } else {
      this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
      this._stateScriptDataDoubleEscaped(cp);
    }
  }
  // Script data double escape end state
  //------------------------------------------------------------------
  _stateScriptDataDoubleEscapeEnd(cp) {
    if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
      this._emitCodePoint(cp);
      for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
        this._emitCodePoint(this._consume());
      }
      this.state = State.SCRIPT_DATA_ESCAPED;
    } else if (!this._ensureHibernation()) {
      this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
      this._stateScriptDataDoubleEscaped(cp);
    }
  }
  // Before attribute name state
  //------------------------------------------------------------------
  _stateBeforeAttributeName(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.SOLIDUS:
      case CODE_POINTS.GREATER_THAN_SIGN:
      case CODE_POINTS.EOF: {
        this.state = State.AFTER_ATTRIBUTE_NAME;
        this._stateAfterAttributeName(cp);
        break;
      }
      case CODE_POINTS.EQUALS_SIGN: {
        this._err(ERR.unexpectedEqualsSignBeforeAttributeName);
        this._createAttr("=");
        this.state = State.ATTRIBUTE_NAME;
        break;
      }
      default: {
        this._createAttr("");
        this.state = State.ATTRIBUTE_NAME;
        this._stateAttributeName(cp);
      }
    }
  }
  // Attribute name state
  //------------------------------------------------------------------
  _stateAttributeName(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED:
      case CODE_POINTS.SOLIDUS:
      case CODE_POINTS.GREATER_THAN_SIGN:
      case CODE_POINTS.EOF: {
        this._leaveAttrName();
        this.state = State.AFTER_ATTRIBUTE_NAME;
        this._stateAfterAttributeName(cp);
        break;
      }
      case CODE_POINTS.EQUALS_SIGN: {
        this._leaveAttrName();
        this.state = State.BEFORE_ATTRIBUTE_VALUE;
        break;
      }
      case CODE_POINTS.QUOTATION_MARK:
      case CODE_POINTS.APOSTROPHE:
      case CODE_POINTS.LESS_THAN_SIGN: {
        this._err(ERR.unexpectedCharacterInAttributeName);
        this.currentAttr.name += String.fromCodePoint(cp);
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.currentAttr.name += REPLACEMENT_CHARACTER;
        break;
      }
      default: {
        this.currentAttr.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
      }
    }
  }
  // After attribute name state
  //------------------------------------------------------------------
  _stateAfterAttributeName(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.SOLIDUS: {
        this.state = State.SELF_CLOSING_START_TAG;
        break;
      }
      case CODE_POINTS.EQUALS_SIGN: {
        this.state = State.BEFORE_ATTRIBUTE_VALUE;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this._createAttr("");
        this.state = State.ATTRIBUTE_NAME;
        this._stateAttributeName(cp);
      }
    }
  }
  // Before attribute value state
  //------------------------------------------------------------------
  _stateBeforeAttributeValue(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        this.state = State.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        this.state = State.ATTRIBUTE_VALUE_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.missingAttributeValue);
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      default: {
        this.state = State.ATTRIBUTE_VALUE_UNQUOTED;
        this._stateAttributeValueUnquoted(cp);
      }
    }
  }
  // Attribute value (double-quoted) state
  //------------------------------------------------------------------
  _stateAttributeValueDoubleQuoted(cp) {
    switch (cp) {
      case CODE_POINTS.QUOTATION_MARK: {
        this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
        break;
      }
      case CODE_POINTS.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.currentAttr.value += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this.currentAttr.value += String.fromCodePoint(cp);
      }
    }
  }
  // Attribute value (single-quoted) state
  //------------------------------------------------------------------
  _stateAttributeValueSingleQuoted(cp) {
    switch (cp) {
      case CODE_POINTS.APOSTROPHE: {
        this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
        break;
      }
      case CODE_POINTS.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.currentAttr.value += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this.currentAttr.value += String.fromCodePoint(cp);
      }
    }
  }
  // Attribute value (unquoted) state
  //------------------------------------------------------------------
  _stateAttributeValueUnquoted(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this._leaveAttrValue();
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        break;
      }
      case CODE_POINTS.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._leaveAttrValue();
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        this.currentAttr.value += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.QUOTATION_MARK:
      case CODE_POINTS.APOSTROPHE:
      case CODE_POINTS.LESS_THAN_SIGN:
      case CODE_POINTS.EQUALS_SIGN:
      case CODE_POINTS.GRAVE_ACCENT: {
        this._err(ERR.unexpectedCharacterInUnquotedAttributeValue);
        this.currentAttr.value += String.fromCodePoint(cp);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this.currentAttr.value += String.fromCodePoint(cp);
      }
    }
  }
  // After attribute value (quoted) state
  //------------------------------------------------------------------
  _stateAfterAttributeValueQuoted(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this._leaveAttrValue();
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        break;
      }
      case CODE_POINTS.SOLIDUS: {
        this._leaveAttrValue();
        this.state = State.SELF_CLOSING_START_TAG;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._leaveAttrValue();
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingWhitespaceBetweenAttributes);
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        this._stateBeforeAttributeName(cp);
      }
    }
  }
  // Self-closing start tag state
  //------------------------------------------------------------------
  _stateSelfClosingStartTag(cp) {
    switch (cp) {
      case CODE_POINTS.GREATER_THAN_SIGN: {
        const token = this.currentToken;
        token.selfClosing = true;
        this.state = State.DATA;
        this.emitCurrentTagToken();
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInTag);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.unexpectedSolidusInTag);
        this.state = State.BEFORE_ATTRIBUTE_NAME;
        this._stateBeforeAttributeName(cp);
      }
    }
  }
  // Bogus comment state
  //------------------------------------------------------------------
  _stateBogusComment(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentComment(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.data += REPLACEMENT_CHARACTER;
        break;
      }
      default: {
        token.data += String.fromCodePoint(cp);
      }
    }
  }
  // Markup declaration open state
  //------------------------------------------------------------------
  _stateMarkupDeclarationOpen(cp) {
    if (this._consumeSequenceIfMatch(SEQUENCES.DASH_DASH, true)) {
      this._createCommentToken(SEQUENCES.DASH_DASH.length + 1);
      this.state = State.COMMENT_START;
    } else if (this._consumeSequenceIfMatch(SEQUENCES.DOCTYPE, false)) {
      this.currentLocation = this.getCurrentLocation(SEQUENCES.DOCTYPE.length + 1);
      this.state = State.DOCTYPE;
    } else if (this._consumeSequenceIfMatch(SEQUENCES.CDATA_START, true)) {
      if (this.inForeignNode) {
        this.state = State.CDATA_SECTION;
      } else {
        this._err(ERR.cdataInHtmlContent);
        this._createCommentToken(SEQUENCES.CDATA_START.length + 1);
        this.currentToken.data = "[CDATA[";
        this.state = State.BOGUS_COMMENT;
      }
    } else if (!this._ensureHibernation()) {
      this._err(ERR.incorrectlyOpenedComment);
      this._createCommentToken(2);
      this.state = State.BOGUS_COMMENT;
      this._stateBogusComment(cp);
    }
  }
  // Comment start state
  //------------------------------------------------------------------
  _stateCommentStart(cp) {
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.COMMENT_START_DASH;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptClosingOfEmptyComment);
        this.state = State.DATA;
        const token = this.currentToken;
        this.emitCurrentComment(token);
        break;
      }
      default: {
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // Comment start dash state
  //------------------------------------------------------------------
  _stateCommentStartDash(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.COMMENT_END;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptClosingOfEmptyComment);
        this.state = State.DATA;
        this.emitCurrentComment(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInComment);
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.data += "-";
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // Comment state
  //------------------------------------------------------------------
  _stateComment(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.COMMENT_END_DASH;
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        token.data += "<";
        this.state = State.COMMENT_LESS_THAN_SIGN;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.data += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInComment);
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.data += String.fromCodePoint(cp);
      }
    }
  }
  // Comment less-than sign state
  //------------------------------------------------------------------
  _stateCommentLessThanSign(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.EXCLAMATION_MARK: {
        token.data += "!";
        this.state = State.COMMENT_LESS_THAN_SIGN_BANG;
        break;
      }
      case CODE_POINTS.LESS_THAN_SIGN: {
        token.data += "<";
        break;
      }
      default: {
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // Comment less-than sign bang state
  //------------------------------------------------------------------
  _stateCommentLessThanSignBang(cp) {
    if (cp === CODE_POINTS.HYPHEN_MINUS) {
      this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH;
    } else {
      this.state = State.COMMENT;
      this._stateComment(cp);
    }
  }
  // Comment less-than sign bang dash state
  //------------------------------------------------------------------
  _stateCommentLessThanSignBangDash(cp) {
    if (cp === CODE_POINTS.HYPHEN_MINUS) {
      this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH;
    } else {
      this.state = State.COMMENT_END_DASH;
      this._stateCommentEndDash(cp);
    }
  }
  // Comment less-than sign bang dash dash state
  //------------------------------------------------------------------
  _stateCommentLessThanSignBangDashDash(cp) {
    if (cp !== CODE_POINTS.GREATER_THAN_SIGN && cp !== CODE_POINTS.EOF) {
      this._err(ERR.nestedComment);
    }
    this.state = State.COMMENT_END;
    this._stateCommentEnd(cp);
  }
  // Comment end dash state
  //------------------------------------------------------------------
  _stateCommentEndDash(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        this.state = State.COMMENT_END;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInComment);
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.data += "-";
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // Comment end state
  //------------------------------------------------------------------
  _stateCommentEnd(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentComment(token);
        break;
      }
      case CODE_POINTS.EXCLAMATION_MARK: {
        this.state = State.COMMENT_END_BANG;
        break;
      }
      case CODE_POINTS.HYPHEN_MINUS: {
        token.data += "-";
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInComment);
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.data += "--";
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // Comment end bang state
  //------------------------------------------------------------------
  _stateCommentEndBang(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.HYPHEN_MINUS: {
        token.data += "--!";
        this.state = State.COMMENT_END_DASH;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.incorrectlyClosedComment);
        this.state = State.DATA;
        this.emitCurrentComment(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInComment);
        this.emitCurrentComment(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.data += "--!";
        this.state = State.COMMENT;
        this._stateComment(cp);
      }
    }
  }
  // DOCTYPE state
  //------------------------------------------------------------------
  _stateDoctype(cp) {
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.BEFORE_DOCTYPE_NAME;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.BEFORE_DOCTYPE_NAME;
        this._stateBeforeDoctypeName(cp);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        this._createDoctypeToken(null);
        const token = this.currentToken;
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingWhitespaceBeforeDoctypeName);
        this.state = State.BEFORE_DOCTYPE_NAME;
        this._stateBeforeDoctypeName(cp);
      }
    }
  }
  // Before DOCTYPE name state
  //------------------------------------------------------------------
  _stateBeforeDoctypeName(cp) {
    if (isAsciiUpper(cp)) {
      this._createDoctypeToken(String.fromCharCode(toAsciiLower(cp)));
      this.state = State.DOCTYPE_NAME;
    } else
      switch (cp) {
        case CODE_POINTS.SPACE:
        case CODE_POINTS.LINE_FEED:
        case CODE_POINTS.TABULATION:
        case CODE_POINTS.FORM_FEED: {
          break;
        }
        case CODE_POINTS.NULL: {
          this._err(ERR.unexpectedNullCharacter);
          this._createDoctypeToken(REPLACEMENT_CHARACTER);
          this.state = State.DOCTYPE_NAME;
          break;
        }
        case CODE_POINTS.GREATER_THAN_SIGN: {
          this._err(ERR.missingDoctypeName);
          this._createDoctypeToken(null);
          const token = this.currentToken;
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this.state = State.DATA;
          break;
        }
        case CODE_POINTS.EOF: {
          this._err(ERR.eofInDoctype);
          this._createDoctypeToken(null);
          const token = this.currentToken;
          token.forceQuirks = true;
          this.emitCurrentDoctype(token);
          this._emitEOFToken();
          break;
        }
        default: {
          this._createDoctypeToken(String.fromCodePoint(cp));
          this.state = State.DOCTYPE_NAME;
        }
      }
  }
  // DOCTYPE name state
  //------------------------------------------------------------------
  _stateDoctypeName(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.AFTER_DOCTYPE_NAME;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.name += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
      }
    }
  }
  // After DOCTYPE name state
  //------------------------------------------------------------------
  _stateAfterDoctypeName(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        if (this._consumeSequenceIfMatch(SEQUENCES.PUBLIC, false)) {
          this.state = State.AFTER_DOCTYPE_PUBLIC_KEYWORD;
        } else if (this._consumeSequenceIfMatch(SEQUENCES.SYSTEM, false)) {
          this.state = State.AFTER_DOCTYPE_SYSTEM_KEYWORD;
        } else if (!this._ensureHibernation()) {
          this._err(ERR.invalidCharacterSequenceAfterDoctypeName);
          token.forceQuirks = true;
          this.state = State.BOGUS_DOCTYPE;
          this._stateBogusDoctype(cp);
        }
      }
    }
  }
  // After DOCTYPE public keyword state
  //------------------------------------------------------------------
  _stateAfterDoctypePublicKeyword(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
        token.publicId = "";
        this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
        token.publicId = "";
        this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.missingDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // Before DOCTYPE public identifier state
  //------------------------------------------------------------------
  _stateBeforeDoctypePublicIdentifier(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        token.publicId = "";
        this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        token.publicId = "";
        this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.missingDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // DOCTYPE public identifier (double-quoted) state
  //------------------------------------------------------------------
  _stateDoctypePublicIdentifierDoubleQuoted(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.QUOTATION_MARK: {
        this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.publicId += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.publicId += String.fromCodePoint(cp);
      }
    }
  }
  // DOCTYPE public identifier (single-quoted) state
  //------------------------------------------------------------------
  _stateDoctypePublicIdentifierSingleQuoted(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.APOSTROPHE: {
        this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.publicId += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptDoctypePublicIdentifier);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.publicId += String.fromCodePoint(cp);
      }
    }
  }
  // After DOCTYPE public identifier state
  //------------------------------------------------------------------
  _stateAfterDoctypePublicIdentifier(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // Between DOCTYPE public and system identifiers state
  //------------------------------------------------------------------
  _stateBetweenDoctypePublicAndSystemIdentifiers(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // After DOCTYPE system keyword state
  //------------------------------------------------------------------
  _stateAfterDoctypeSystemKeyword(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        this.state = State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.missingDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // Before DOCTYPE system identifier state
  //------------------------------------------------------------------
  _stateBeforeDoctypeSystemIdentifier(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.QUOTATION_MARK: {
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
        break;
      }
      case CODE_POINTS.APOSTROPHE: {
        token.systemId = "";
        this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.missingDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.DATA;
        this.emitCurrentDoctype(token);
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // DOCTYPE system identifier (double-quoted) state
  //------------------------------------------------------------------
  _stateDoctypeSystemIdentifierDoubleQuoted(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.QUOTATION_MARK: {
        this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.systemId += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.systemId += String.fromCodePoint(cp);
      }
    }
  }
  // DOCTYPE system identifier (single-quoted) state
  //------------------------------------------------------------------
  _stateDoctypeSystemIdentifierSingleQuoted(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.APOSTROPHE: {
        this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        token.systemId += REPLACEMENT_CHARACTER;
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this._err(ERR.abruptDoctypeSystemIdentifier);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        token.systemId += String.fromCodePoint(cp);
      }
    }
  }
  // After DOCTYPE system identifier state
  //------------------------------------------------------------------
  _stateAfterDoctypeSystemIdentifier(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.SPACE:
      case CODE_POINTS.LINE_FEED:
      case CODE_POINTS.TABULATION:
      case CODE_POINTS.FORM_FEED: {
        break;
      }
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInDoctype);
        token.forceQuirks = true;
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default: {
        this._err(ERR.unexpectedCharacterAfterDoctypeSystemIdentifier);
        this.state = State.BOGUS_DOCTYPE;
        this._stateBogusDoctype(cp);
      }
    }
  }
  // Bogus DOCTYPE state
  //------------------------------------------------------------------
  _stateBogusDoctype(cp) {
    const token = this.currentToken;
    switch (cp) {
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.emitCurrentDoctype(token);
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.NULL: {
        this._err(ERR.unexpectedNullCharacter);
        break;
      }
      case CODE_POINTS.EOF: {
        this.emitCurrentDoctype(token);
        this._emitEOFToken();
        break;
      }
      default:
    }
  }
  // CDATA section state
  //------------------------------------------------------------------
  _stateCdataSection(cp) {
    switch (cp) {
      case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
        this.state = State.CDATA_SECTION_BRACKET;
        break;
      }
      case CODE_POINTS.EOF: {
        this._err(ERR.eofInCdata);
        this._emitEOFToken();
        break;
      }
      default: {
        this._emitCodePoint(cp);
      }
    }
  }
  // CDATA section bracket state
  //------------------------------------------------------------------
  _stateCdataSectionBracket(cp) {
    if (cp === CODE_POINTS.RIGHT_SQUARE_BRACKET) {
      this.state = State.CDATA_SECTION_END;
    } else {
      this._emitChars("]");
      this.state = State.CDATA_SECTION;
      this._stateCdataSection(cp);
    }
  }
  // CDATA section end state
  //------------------------------------------------------------------
  _stateCdataSectionEnd(cp) {
    switch (cp) {
      case CODE_POINTS.GREATER_THAN_SIGN: {
        this.state = State.DATA;
        break;
      }
      case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
        this._emitChars("]");
        break;
      }
      default: {
        this._emitChars("]]");
        this.state = State.CDATA_SECTION;
        this._stateCdataSection(cp);
      }
    }
  }
  // Character reference state
  //------------------------------------------------------------------
  _stateCharacterReference() {
    let length = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
    if (length < 0) {
      if (this.preprocessor.lastChunkWritten) {
        length = this.entityDecoder.end();
      } else {
        this.active = false;
        this.preprocessor.pos = this.preprocessor.html.length - 1;
        this.consumedAfterSnapshot = 0;
        this.preprocessor.endOfChunkHit = true;
        return;
      }
    }
    if (length === 0) {
      this.preprocessor.pos = this.entityStartPos;
      this._flushCodePointConsumedAsCharacterReference(CODE_POINTS.AMPERSAND);
      this.state = !this._isCharacterReferenceInAttribute() && isAsciiAlphaNumeric2(this.preprocessor.peek(1)) ? State.AMBIGUOUS_AMPERSAND : this.returnState;
    } else {
      this.state = this.returnState;
    }
  }
  // Ambiguos ampersand state
  //------------------------------------------------------------------
  _stateAmbiguousAmpersand(cp) {
    if (isAsciiAlphaNumeric2(cp)) {
      this._flushCodePointConsumedAsCharacterReference(cp);
    } else {
      if (cp === CODE_POINTS.SEMICOLON) {
        this._err(ERR.unknownNamedCharacterReference);
      }
      this.state = this.returnState;
      this._callState(cp);
    }
  }
};

// node_modules/parse5/dist/parser/open-element-stack.js
var IMPLICIT_END_TAG_REQUIRED = /* @__PURE__ */ new Set([TAG_ID.DD, TAG_ID.DT, TAG_ID.LI, TAG_ID.OPTGROUP, TAG_ID.OPTION, TAG_ID.P, TAG_ID.RB, TAG_ID.RP, TAG_ID.RT, TAG_ID.RTC]);
var IMPLICIT_END_TAG_REQUIRED_THOROUGHLY = /* @__PURE__ */ new Set([
  ...IMPLICIT_END_TAG_REQUIRED,
  TAG_ID.CAPTION,
  TAG_ID.COLGROUP,
  TAG_ID.TBODY,
  TAG_ID.TD,
  TAG_ID.TFOOT,
  TAG_ID.TH,
  TAG_ID.THEAD,
  TAG_ID.TR
]);
var SCOPING_ELEMENTS_HTML = /* @__PURE__ */ new Set([
  TAG_ID.APPLET,
  TAG_ID.CAPTION,
  TAG_ID.HTML,
  TAG_ID.MARQUEE,
  TAG_ID.OBJECT,
  TAG_ID.TABLE,
  TAG_ID.TD,
  TAG_ID.TEMPLATE,
  TAG_ID.TH
]);
var SCOPING_ELEMENTS_HTML_LIST = /* @__PURE__ */ new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.OL, TAG_ID.UL]);
var SCOPING_ELEMENTS_HTML_BUTTON = /* @__PURE__ */ new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.BUTTON]);
var SCOPING_ELEMENTS_MATHML = /* @__PURE__ */ new Set([TAG_ID.ANNOTATION_XML, TAG_ID.MI, TAG_ID.MN, TAG_ID.MO, TAG_ID.MS, TAG_ID.MTEXT]);
var SCOPING_ELEMENTS_SVG = /* @__PURE__ */ new Set([TAG_ID.DESC, TAG_ID.FOREIGN_OBJECT, TAG_ID.TITLE]);
var TABLE_ROW_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TR, TAG_ID.TEMPLATE, TAG_ID.HTML]);
var TABLE_BODY_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TEMPLATE, TAG_ID.HTML]);
var TABLE_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TABLE, TAG_ID.TEMPLATE, TAG_ID.HTML]);
var TABLE_CELLS = /* @__PURE__ */ new Set([TAG_ID.TD, TAG_ID.TH]);
var OpenElementStack = class {
  get currentTmplContentOrNode() {
    return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
  }
  constructor(document2, treeAdapter, handler) {
    this.treeAdapter = treeAdapter;
    this.handler = handler;
    this.items = [];
    this.tagIDs = [];
    this.stackTop = -1;
    this.tmplCount = 0;
    this.currentTagId = TAG_ID.UNKNOWN;
    this.current = document2;
  }
  //Index of element
  _indexOf(element) {
    return this.items.lastIndexOf(element, this.stackTop);
  }
  //Update current element
  _isInTemplate() {
    return this.currentTagId === TAG_ID.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === NS.HTML;
  }
  _updateCurrentElement() {
    this.current = this.items[this.stackTop];
    this.currentTagId = this.tagIDs[this.stackTop];
  }
  //Mutations
  push(element, tagID) {
    this.stackTop++;
    this.items[this.stackTop] = element;
    this.current = element;
    this.tagIDs[this.stackTop] = tagID;
    this.currentTagId = tagID;
    if (this._isInTemplate()) {
      this.tmplCount++;
    }
    this.handler.onItemPush(element, tagID, true);
  }
  pop() {
    const popped = this.current;
    if (this.tmplCount > 0 && this._isInTemplate()) {
      this.tmplCount--;
    }
    this.stackTop--;
    this._updateCurrentElement();
    this.handler.onItemPop(popped, true);
  }
  replace(oldElement, newElement) {
    const idx = this._indexOf(oldElement);
    this.items[idx] = newElement;
    if (idx === this.stackTop) {
      this.current = newElement;
    }
  }
  insertAfter(referenceElement, newElement, newElementID) {
    const insertionIdx = this._indexOf(referenceElement) + 1;
    this.items.splice(insertionIdx, 0, newElement);
    this.tagIDs.splice(insertionIdx, 0, newElementID);
    this.stackTop++;
    if (insertionIdx === this.stackTop) {
      this._updateCurrentElement();
    }
    if (this.current && this.currentTagId !== void 0) {
      this.handler.onItemPush(this.current, this.currentTagId, insertionIdx === this.stackTop);
    }
  }
  popUntilTagNamePopped(tagName) {
    let targetIdx = this.stackTop + 1;
    do {
      targetIdx = this.tagIDs.lastIndexOf(tagName, targetIdx - 1);
    } while (targetIdx > 0 && this.treeAdapter.getNamespaceURI(this.items[targetIdx]) !== NS.HTML);
    this.shortenToLength(Math.max(targetIdx, 0));
  }
  shortenToLength(idx) {
    while (this.stackTop >= idx) {
      const popped = this.current;
      if (this.tmplCount > 0 && this._isInTemplate()) {
        this.tmplCount -= 1;
      }
      this.stackTop--;
      this._updateCurrentElement();
      this.handler.onItemPop(popped, this.stackTop < idx);
    }
  }
  popUntilElementPopped(element) {
    const idx = this._indexOf(element);
    this.shortenToLength(Math.max(idx, 0));
  }
  popUntilPopped(tagNames, targetNS) {
    const idx = this._indexOfTagNames(tagNames, targetNS);
    this.shortenToLength(Math.max(idx, 0));
  }
  popUntilNumberedHeaderPopped() {
    this.popUntilPopped(NUMBERED_HEADERS, NS.HTML);
  }
  popUntilTableCellPopped() {
    this.popUntilPopped(TABLE_CELLS, NS.HTML);
  }
  popAllUpToHtmlElement() {
    this.tmplCount = 0;
    this.shortenToLength(1);
  }
  _indexOfTagNames(tagNames, namespace) {
    for (let i = this.stackTop; i >= 0; i--) {
      if (tagNames.has(this.tagIDs[i]) && this.treeAdapter.getNamespaceURI(this.items[i]) === namespace) {
        return i;
      }
    }
    return -1;
  }
  clearBackTo(tagNames, targetNS) {
    const idx = this._indexOfTagNames(tagNames, targetNS);
    this.shortenToLength(idx + 1);
  }
  clearBackToTableContext() {
    this.clearBackTo(TABLE_CONTEXT, NS.HTML);
  }
  clearBackToTableBodyContext() {
    this.clearBackTo(TABLE_BODY_CONTEXT, NS.HTML);
  }
  clearBackToTableRowContext() {
    this.clearBackTo(TABLE_ROW_CONTEXT, NS.HTML);
  }
  remove(element) {
    const idx = this._indexOf(element);
    if (idx >= 0) {
      if (idx === this.stackTop) {
        this.pop();
      } else {
        this.items.splice(idx, 1);
        this.tagIDs.splice(idx, 1);
        this.stackTop--;
        this._updateCurrentElement();
        this.handler.onItemPop(element, false);
      }
    }
  }
  //Search
  tryPeekProperlyNestedBodyElement() {
    return this.stackTop >= 1 && this.tagIDs[1] === TAG_ID.BODY ? this.items[1] : null;
  }
  contains(element) {
    return this._indexOf(element) > -1;
  }
  getCommonAncestor(element) {
    const elementIdx = this._indexOf(element) - 1;
    return elementIdx >= 0 ? this.items[elementIdx] : null;
  }
  isRootHtmlElementCurrent() {
    return this.stackTop === 0 && this.tagIDs[0] === TAG_ID.HTML;
  }
  //Element in scope
  hasInDynamicScope(tagName, htmlScope) {
    for (let i = this.stackTop; i >= 0; i--) {
      const tn = this.tagIDs[i];
      switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
        case NS.HTML: {
          if (tn === tagName)
            return true;
          if (htmlScope.has(tn))
            return false;
          break;
        }
        case NS.SVG: {
          if (SCOPING_ELEMENTS_SVG.has(tn))
            return false;
          break;
        }
        case NS.MATHML: {
          if (SCOPING_ELEMENTS_MATHML.has(tn))
            return false;
          break;
        }
      }
    }
    return true;
  }
  hasInScope(tagName) {
    return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML);
  }
  hasInListItemScope(tagName) {
    return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_LIST);
  }
  hasInButtonScope(tagName) {
    return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_BUTTON);
  }
  hasNumberedHeaderInScope() {
    for (let i = this.stackTop; i >= 0; i--) {
      const tn = this.tagIDs[i];
      switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
        case NS.HTML: {
          if (NUMBERED_HEADERS.has(tn))
            return true;
          if (SCOPING_ELEMENTS_HTML.has(tn))
            return false;
          break;
        }
        case NS.SVG: {
          if (SCOPING_ELEMENTS_SVG.has(tn))
            return false;
          break;
        }
        case NS.MATHML: {
          if (SCOPING_ELEMENTS_MATHML.has(tn))
            return false;
          break;
        }
      }
    }
    return true;
  }
  hasInTableScope(tagName) {
    for (let i = this.stackTop; i >= 0; i--) {
      if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
        continue;
      }
      switch (this.tagIDs[i]) {
        case tagName: {
          return true;
        }
        case TAG_ID.TABLE:
        case TAG_ID.HTML: {
          return false;
        }
      }
    }
    return true;
  }
  hasTableBodyContextInTableScope() {
    for (let i = this.stackTop; i >= 0; i--) {
      if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
        continue;
      }
      switch (this.tagIDs[i]) {
        case TAG_ID.TBODY:
        case TAG_ID.THEAD:
        case TAG_ID.TFOOT: {
          return true;
        }
        case TAG_ID.TABLE:
        case TAG_ID.HTML: {
          return false;
        }
      }
    }
    return true;
  }
  hasInSelectScope(tagName) {
    for (let i = this.stackTop; i >= 0; i--) {
      if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
        continue;
      }
      switch (this.tagIDs[i]) {
        case tagName: {
          return true;
        }
        case TAG_ID.OPTION:
        case TAG_ID.OPTGROUP: {
          break;
        }
        default: {
          return false;
        }
      }
    }
    return true;
  }
  //Implied end tags
  generateImpliedEndTags() {
    while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED.has(this.currentTagId)) {
      this.pop();
    }
  }
  generateImpliedEndTagsThoroughly() {
    while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
      this.pop();
    }
  }
  generateImpliedEndTagsWithExclusion(exclusionId) {
    while (this.currentTagId !== void 0 && this.currentTagId !== exclusionId && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
      this.pop();
    }
  }
};

// node_modules/parse5/dist/parser/formatting-element-list.js
var NOAH_ARK_CAPACITY = 3;
var EntryType;
(function(EntryType2) {
  EntryType2[EntryType2["Marker"] = 0] = "Marker";
  EntryType2[EntryType2["Element"] = 1] = "Element";
})(EntryType || (EntryType = {}));
var MARKER = { type: EntryType.Marker };
var FormattingElementList = class {
  constructor(treeAdapter) {
    this.treeAdapter = treeAdapter;
    this.entries = [];
    this.bookmark = null;
  }
  //Noah Ark's condition
  //OPTIMIZATION: at first we try to find possible candidates for exclusion using
  //lightweight heuristics without thorough attributes check.
  _getNoahArkConditionCandidates(newElement, neAttrs) {
    const candidates = [];
    const neAttrsLength = neAttrs.length;
    const neTagName = this.treeAdapter.getTagName(newElement);
    const neNamespaceURI = this.treeAdapter.getNamespaceURI(newElement);
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry.type === EntryType.Marker) {
        break;
      }
      const { element } = entry;
      if (this.treeAdapter.getTagName(element) === neTagName && this.treeAdapter.getNamespaceURI(element) === neNamespaceURI) {
        const elementAttrs = this.treeAdapter.getAttrList(element);
        if (elementAttrs.length === neAttrsLength) {
          candidates.push({ idx: i, attrs: elementAttrs });
        }
      }
    }
    return candidates;
  }
  _ensureNoahArkCondition(newElement) {
    if (this.entries.length < NOAH_ARK_CAPACITY)
      return;
    const neAttrs = this.treeAdapter.getAttrList(newElement);
    const candidates = this._getNoahArkConditionCandidates(newElement, neAttrs);
    if (candidates.length < NOAH_ARK_CAPACITY)
      return;
    const neAttrsMap = new Map(neAttrs.map((neAttr) => [neAttr.name, neAttr.value]));
    let validCandidates = 0;
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate.attrs.every((cAttr) => neAttrsMap.get(cAttr.name) === cAttr.value)) {
        validCandidates += 1;
        if (validCandidates >= NOAH_ARK_CAPACITY) {
          this.entries.splice(candidate.idx, 1);
        }
      }
    }
  }
  //Mutations
  insertMarker() {
    this.entries.unshift(MARKER);
  }
  pushElement(element, token) {
    this._ensureNoahArkCondition(element);
    this.entries.unshift({
      type: EntryType.Element,
      element,
      token
    });
  }
  insertElementAfterBookmark(element, token) {
    const bookmarkIdx = this.entries.indexOf(this.bookmark);
    this.entries.splice(bookmarkIdx, 0, {
      type: EntryType.Element,
      element,
      token
    });
  }
  removeEntry(entry) {
    const entryIndex = this.entries.indexOf(entry);
    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
    }
  }
  /**
   * Clears the list of formatting elements up to the last marker.
   *
   * @see https://html.spec.whatwg.org/multipage/parsing.html#clear-the-list-of-active-formatting-elements-up-to-the-last-marker
   */
  clearToLastMarker() {
    const markerIdx = this.entries.indexOf(MARKER);
    if (markerIdx === -1) {
      this.entries.length = 0;
    } else {
      this.entries.splice(0, markerIdx + 1);
    }
  }
  //Search
  getElementEntryInScopeWithTagName(tagName) {
    const entry = this.entries.find((entry2) => entry2.type === EntryType.Marker || this.treeAdapter.getTagName(entry2.element) === tagName);
    return entry && entry.type === EntryType.Element ? entry : null;
  }
  getElementEntry(element) {
    return this.entries.find((entry) => entry.type === EntryType.Element && entry.element === element);
  }
};

// node_modules/parse5/dist/tree-adapters/default.js
var defaultTreeAdapter = {
  //Node construction
  createDocument() {
    return {
      nodeName: "#document",
      mode: DOCUMENT_MODE.NO_QUIRKS,
      childNodes: []
    };
  },
  createDocumentFragment() {
    return {
      nodeName: "#document-fragment",
      childNodes: []
    };
  },
  createElement(tagName, namespaceURI, attrs) {
    return {
      nodeName: tagName,
      tagName,
      attrs,
      namespaceURI,
      childNodes: [],
      parentNode: null
    };
  },
  createCommentNode(data2) {
    return {
      nodeName: "#comment",
      data: data2,
      parentNode: null
    };
  },
  createTextNode(value) {
    return {
      nodeName: "#text",
      value,
      parentNode: null
    };
  },
  //Tree mutation
  appendChild(parentNode, newNode) {
    parentNode.childNodes.push(newNode);
    newNode.parentNode = parentNode;
  },
  insertBefore(parentNode, newNode, referenceNode) {
    const insertionIdx = parentNode.childNodes.indexOf(referenceNode);
    parentNode.childNodes.splice(insertionIdx, 0, newNode);
    newNode.parentNode = parentNode;
  },
  setTemplateContent(templateElement, contentElement) {
    templateElement.content = contentElement;
  },
  getTemplateContent(templateElement) {
    return templateElement.content;
  },
  setDocumentType(document2, name3, publicId, systemId) {
    const doctypeNode = document2.childNodes.find((node) => node.nodeName === "#documentType");
    if (doctypeNode) {
      doctypeNode.name = name3;
      doctypeNode.publicId = publicId;
      doctypeNode.systemId = systemId;
    } else {
      const node = {
        nodeName: "#documentType",
        name: name3,
        publicId,
        systemId,
        parentNode: null
      };
      defaultTreeAdapter.appendChild(document2, node);
    }
  },
  setDocumentMode(document2, mode) {
    document2.mode = mode;
  },
  getDocumentMode(document2) {
    return document2.mode;
  },
  detachNode(node) {
    if (node.parentNode) {
      const idx = node.parentNode.childNodes.indexOf(node);
      node.parentNode.childNodes.splice(idx, 1);
      node.parentNode = null;
    }
  },
  insertText(parentNode, text2) {
    if (parentNode.childNodes.length > 0) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];
      if (defaultTreeAdapter.isTextNode(prevNode)) {
        prevNode.value += text2;
        return;
      }
    }
    defaultTreeAdapter.appendChild(parentNode, defaultTreeAdapter.createTextNode(text2));
  },
  insertTextBefore(parentNode, text2, referenceNode) {
    const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
    if (prevNode && defaultTreeAdapter.isTextNode(prevNode)) {
      prevNode.value += text2;
    } else {
      defaultTreeAdapter.insertBefore(parentNode, defaultTreeAdapter.createTextNode(text2), referenceNode);
    }
  },
  adoptAttributes(recipient, attrs) {
    const recipientAttrsMap = new Set(recipient.attrs.map((attr) => attr.name));
    for (let j = 0; j < attrs.length; j++) {
      if (!recipientAttrsMap.has(attrs[j].name)) {
        recipient.attrs.push(attrs[j]);
      }
    }
  },
  //Tree traversing
  getFirstChild(node) {
    return node.childNodes[0];
  },
  getChildNodes(node) {
    return node.childNodes;
  },
  getParentNode(node) {
    return node.parentNode;
  },
  getAttrList(element) {
    return element.attrs;
  },
  //Node data
  getTagName(element) {
    return element.tagName;
  },
  getNamespaceURI(element) {
    return element.namespaceURI;
  },
  getTextNodeContent(textNode) {
    return textNode.value;
  },
  getCommentNodeContent(commentNode) {
    return commentNode.data;
  },
  getDocumentTypeNodeName(doctypeNode) {
    return doctypeNode.name;
  },
  getDocumentTypeNodePublicId(doctypeNode) {
    return doctypeNode.publicId;
  },
  getDocumentTypeNodeSystemId(doctypeNode) {
    return doctypeNode.systemId;
  },
  //Node types
  isTextNode(node) {
    return node.nodeName === "#text";
  },
  isCommentNode(node) {
    return node.nodeName === "#comment";
  },
  isDocumentTypeNode(node) {
    return node.nodeName === "#documentType";
  },
  isElementNode(node) {
    return Object.prototype.hasOwnProperty.call(node, "tagName");
  },
  // Source code location
  setNodeSourceCodeLocation(node, location2) {
    node.sourceCodeLocation = location2;
  },
  getNodeSourceCodeLocation(node) {
    return node.sourceCodeLocation;
  },
  updateNodeSourceCodeLocation(node, endLocation) {
    node.sourceCodeLocation = { ...node.sourceCodeLocation, ...endLocation };
  }
};

// node_modules/parse5/dist/common/doctype.js
var VALID_DOCTYPE_NAME = "html";
var VALID_SYSTEM_ID = "about:legacy-compat";
var QUIRKS_MODE_SYSTEM_ID = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";
var QUIRKS_MODE_PUBLIC_ID_PREFIXES = [
  "+//silmaril//dtd html pro v0r11 19970101//",
  "-//as//dtd html 3.0 aswedit + extensions//",
  "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
  "-//ietf//dtd html 2.0 level 1//",
  "-//ietf//dtd html 2.0 level 2//",
  "-//ietf//dtd html 2.0 strict level 1//",
  "-//ietf//dtd html 2.0 strict level 2//",
  "-//ietf//dtd html 2.0 strict//",
  "-//ietf//dtd html 2.0//",
  "-//ietf//dtd html 2.1e//",
  "-//ietf//dtd html 3.0//",
  "-//ietf//dtd html 3.2 final//",
  "-//ietf//dtd html 3.2//",
  "-//ietf//dtd html 3//",
  "-//ietf//dtd html level 0//",
  "-//ietf//dtd html level 1//",
  "-//ietf//dtd html level 2//",
  "-//ietf//dtd html level 3//",
  "-//ietf//dtd html strict level 0//",
  "-//ietf//dtd html strict level 1//",
  "-//ietf//dtd html strict level 2//",
  "-//ietf//dtd html strict level 3//",
  "-//ietf//dtd html strict//",
  "-//ietf//dtd html//",
  "-//metrius//dtd metrius presentational//",
  "-//microsoft//dtd internet explorer 2.0 html strict//",
  "-//microsoft//dtd internet explorer 2.0 html//",
  "-//microsoft//dtd internet explorer 2.0 tables//",
  "-//microsoft//dtd internet explorer 3.0 html strict//",
  "-//microsoft//dtd internet explorer 3.0 html//",
  "-//microsoft//dtd internet explorer 3.0 tables//",
  "-//netscape comm. corp.//dtd html//",
  "-//netscape comm. corp.//dtd strict html//",
  "-//o'reilly and associates//dtd html 2.0//",
  "-//o'reilly and associates//dtd html extended 1.0//",
  "-//o'reilly and associates//dtd html extended relaxed 1.0//",
  "-//sq//dtd html 2.0 hotmetal + extensions//",
  "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
  "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
  "-//spyglass//dtd html 2.0 extended//",
  "-//sun microsystems corp.//dtd hotjava html//",
  "-//sun microsystems corp.//dtd hotjava strict html//",
  "-//w3c//dtd html 3 1995-03-24//",
  "-//w3c//dtd html 3.2 draft//",
  "-//w3c//dtd html 3.2 final//",
  "-//w3c//dtd html 3.2//",
  "-//w3c//dtd html 3.2s draft//",
  "-//w3c//dtd html 4.0 frameset//",
  "-//w3c//dtd html 4.0 transitional//",
  "-//w3c//dtd html experimental 19960712//",
  "-//w3c//dtd html experimental 970421//",
  "-//w3c//dtd w3 html//",
  "-//w3o//dtd w3 html 3.0//",
  "-//webtechs//dtd mozilla html 2.0//",
  "-//webtechs//dtd mozilla html//"
];
var QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
  ...QUIRKS_MODE_PUBLIC_ID_PREFIXES,
  "-//w3c//dtd html 4.01 frameset//",
  "-//w3c//dtd html 4.01 transitional//"
];
var QUIRKS_MODE_PUBLIC_IDS = /* @__PURE__ */ new Set([
  "-//w3o//dtd w3 html strict 3.0//en//",
  "-/w3c/dtd html 4.0 transitional/en",
  "html"
]);
var LIMITED_QUIRKS_PUBLIC_ID_PREFIXES = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"];
var LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
  ...LIMITED_QUIRKS_PUBLIC_ID_PREFIXES,
  "-//w3c//dtd html 4.01 frameset//",
  "-//w3c//dtd html 4.01 transitional//"
];
function hasPrefix(publicId, prefixes) {
  return prefixes.some((prefix) => publicId.startsWith(prefix));
}
function isConforming(token) {
  return token.name === VALID_DOCTYPE_NAME && token.publicId === null && (token.systemId === null || token.systemId === VALID_SYSTEM_ID);
}
function getDocumentMode(token) {
  if (token.name !== VALID_DOCTYPE_NAME) {
    return DOCUMENT_MODE.QUIRKS;
  }
  const { systemId } = token;
  if (systemId && systemId.toLowerCase() === QUIRKS_MODE_SYSTEM_ID) {
    return DOCUMENT_MODE.QUIRKS;
  }
  let { publicId } = token;
  if (publicId !== null) {
    publicId = publicId.toLowerCase();
    if (QUIRKS_MODE_PUBLIC_IDS.has(publicId)) {
      return DOCUMENT_MODE.QUIRKS;
    }
    let prefixes = systemId === null ? QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES : QUIRKS_MODE_PUBLIC_ID_PREFIXES;
    if (hasPrefix(publicId, prefixes)) {
      return DOCUMENT_MODE.QUIRKS;
    }
    prefixes = systemId === null ? LIMITED_QUIRKS_PUBLIC_ID_PREFIXES : LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES;
    if (hasPrefix(publicId, prefixes)) {
      return DOCUMENT_MODE.LIMITED_QUIRKS;
    }
  }
  return DOCUMENT_MODE.NO_QUIRKS;
}

// node_modules/parse5/dist/common/foreign-content.js
var MIME_TYPES = {
  TEXT_HTML: "text/html",
  APPLICATION_XML: "application/xhtml+xml"
};
var DEFINITION_URL_ATTR = "definitionurl";
var ADJUSTED_DEFINITION_URL_ATTR = "definitionURL";
var SVG_ATTRS_ADJUSTMENT_MAP = new Map([
  "attributeName",
  "attributeType",
  "baseFrequency",
  "baseProfile",
  "calcMode",
  "clipPathUnits",
  "diffuseConstant",
  "edgeMode",
  "filterUnits",
  "glyphRef",
  "gradientTransform",
  "gradientUnits",
  "kernelMatrix",
  "kernelUnitLength",
  "keyPoints",
  "keySplines",
  "keyTimes",
  "lengthAdjust",
  "limitingConeAngle",
  "markerHeight",
  "markerUnits",
  "markerWidth",
  "maskContentUnits",
  "maskUnits",
  "numOctaves",
  "pathLength",
  "patternContentUnits",
  "patternTransform",
  "patternUnits",
  "pointsAtX",
  "pointsAtY",
  "pointsAtZ",
  "preserveAlpha",
  "preserveAspectRatio",
  "primitiveUnits",
  "refX",
  "refY",
  "repeatCount",
  "repeatDur",
  "requiredExtensions",
  "requiredFeatures",
  "specularConstant",
  "specularExponent",
  "spreadMethod",
  "startOffset",
  "stdDeviation",
  "stitchTiles",
  "surfaceScale",
  "systemLanguage",
  "tableValues",
  "targetX",
  "targetY",
  "textLength",
  "viewBox",
  "viewTarget",
  "xChannelSelector",
  "yChannelSelector",
  "zoomAndPan"
].map((attr) => [attr.toLowerCase(), attr]));
var XML_ATTRS_ADJUSTMENT_MAP = /* @__PURE__ */ new Map([
  ["xlink:actuate", { prefix: "xlink", name: "actuate", namespace: NS.XLINK }],
  ["xlink:arcrole", { prefix: "xlink", name: "arcrole", namespace: NS.XLINK }],
  ["xlink:href", { prefix: "xlink", name: "href", namespace: NS.XLINK }],
  ["xlink:role", { prefix: "xlink", name: "role", namespace: NS.XLINK }],
  ["xlink:show", { prefix: "xlink", name: "show", namespace: NS.XLINK }],
  ["xlink:title", { prefix: "xlink", name: "title", namespace: NS.XLINK }],
  ["xlink:type", { prefix: "xlink", name: "type", namespace: NS.XLINK }],
  ["xml:lang", { prefix: "xml", name: "lang", namespace: NS.XML }],
  ["xml:space", { prefix: "xml", name: "space", namespace: NS.XML }],
  ["xmlns", { prefix: "", name: "xmlns", namespace: NS.XMLNS }],
  ["xmlns:xlink", { prefix: "xmlns", name: "xlink", namespace: NS.XMLNS }]
]);
var SVG_TAG_NAMES_ADJUSTMENT_MAP = new Map([
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "clipPath",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "glyphRef",
  "linearGradient",
  "radialGradient",
  "textPath"
].map((tn) => [tn.toLowerCase(), tn]));
var EXITS_FOREIGN_CONTENT = /* @__PURE__ */ new Set([
  TAG_ID.B,
  TAG_ID.BIG,
  TAG_ID.BLOCKQUOTE,
  TAG_ID.BODY,
  TAG_ID.BR,
  TAG_ID.CENTER,
  TAG_ID.CODE,
  TAG_ID.DD,
  TAG_ID.DIV,
  TAG_ID.DL,
  TAG_ID.DT,
  TAG_ID.EM,
  TAG_ID.EMBED,
  TAG_ID.H1,
  TAG_ID.H2,
  TAG_ID.H3,
  TAG_ID.H4,
  TAG_ID.H5,
  TAG_ID.H6,
  TAG_ID.HEAD,
  TAG_ID.HR,
  TAG_ID.I,
  TAG_ID.IMG,
  TAG_ID.LI,
  TAG_ID.LISTING,
  TAG_ID.MENU,
  TAG_ID.META,
  TAG_ID.NOBR,
  TAG_ID.OL,
  TAG_ID.P,
  TAG_ID.PRE,
  TAG_ID.RUBY,
  TAG_ID.S,
  TAG_ID.SMALL,
  TAG_ID.SPAN,
  TAG_ID.STRONG,
  TAG_ID.STRIKE,
  TAG_ID.SUB,
  TAG_ID.SUP,
  TAG_ID.TABLE,
  TAG_ID.TT,
  TAG_ID.U,
  TAG_ID.UL,
  TAG_ID.VAR
]);
function causesExit(startTagToken) {
  const tn = startTagToken.tagID;
  const isFontWithAttrs = tn === TAG_ID.FONT && startTagToken.attrs.some(({ name: name3 }) => name3 === ATTRS.COLOR || name3 === ATTRS.SIZE || name3 === ATTRS.FACE);
  return isFontWithAttrs || EXITS_FOREIGN_CONTENT.has(tn);
}
function adjustTokenMathMLAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    if (token.attrs[i].name === DEFINITION_URL_ATTR) {
      token.attrs[i].name = ADJUSTED_DEFINITION_URL_ATTR;
      break;
    }
  }
}
function adjustTokenSVGAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    const adjustedAttrName = SVG_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
    if (adjustedAttrName != null) {
      token.attrs[i].name = adjustedAttrName;
    }
  }
}
function adjustTokenXMLAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    const adjustedAttrEntry = XML_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
    if (adjustedAttrEntry) {
      token.attrs[i].prefix = adjustedAttrEntry.prefix;
      token.attrs[i].name = adjustedAttrEntry.name;
      token.attrs[i].namespace = adjustedAttrEntry.namespace;
    }
  }
}
function adjustTokenSVGTagName(token) {
  const adjustedTagName = SVG_TAG_NAMES_ADJUSTMENT_MAP.get(token.tagName);
  if (adjustedTagName != null) {
    token.tagName = adjustedTagName;
    token.tagID = getTagID(token.tagName);
  }
}
function isMathMLTextIntegrationPoint(tn, ns) {
  return ns === NS.MATHML && (tn === TAG_ID.MI || tn === TAG_ID.MO || tn === TAG_ID.MN || tn === TAG_ID.MS || tn === TAG_ID.MTEXT);
}
function isHtmlIntegrationPoint(tn, ns, attrs) {
  if (ns === NS.MATHML && tn === TAG_ID.ANNOTATION_XML) {
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].name === ATTRS.ENCODING) {
        const value = attrs[i].value.toLowerCase();
        return value === MIME_TYPES.TEXT_HTML || value === MIME_TYPES.APPLICATION_XML;
      }
    }
  }
  return ns === NS.SVG && (tn === TAG_ID.FOREIGN_OBJECT || tn === TAG_ID.DESC || tn === TAG_ID.TITLE);
}
function isIntegrationPoint(tn, ns, attrs, foreignNS) {
  return (!foreignNS || foreignNS === NS.HTML) && isHtmlIntegrationPoint(tn, ns, attrs) || (!foreignNS || foreignNS === NS.MATHML) && isMathMLTextIntegrationPoint(tn, ns);
}

// node_modules/parse5/dist/parser/index.js
var HIDDEN_INPUT_TYPE = "hidden";
var AA_OUTER_LOOP_ITER = 8;
var AA_INNER_LOOP_ITER = 3;
var InsertionMode;
(function(InsertionMode2) {
  InsertionMode2[InsertionMode2["INITIAL"] = 0] = "INITIAL";
  InsertionMode2[InsertionMode2["BEFORE_HTML"] = 1] = "BEFORE_HTML";
  InsertionMode2[InsertionMode2["BEFORE_HEAD"] = 2] = "BEFORE_HEAD";
  InsertionMode2[InsertionMode2["IN_HEAD"] = 3] = "IN_HEAD";
  InsertionMode2[InsertionMode2["IN_HEAD_NO_SCRIPT"] = 4] = "IN_HEAD_NO_SCRIPT";
  InsertionMode2[InsertionMode2["AFTER_HEAD"] = 5] = "AFTER_HEAD";
  InsertionMode2[InsertionMode2["IN_BODY"] = 6] = "IN_BODY";
  InsertionMode2[InsertionMode2["TEXT"] = 7] = "TEXT";
  InsertionMode2[InsertionMode2["IN_TABLE"] = 8] = "IN_TABLE";
  InsertionMode2[InsertionMode2["IN_TABLE_TEXT"] = 9] = "IN_TABLE_TEXT";
  InsertionMode2[InsertionMode2["IN_CAPTION"] = 10] = "IN_CAPTION";
  InsertionMode2[InsertionMode2["IN_COLUMN_GROUP"] = 11] = "IN_COLUMN_GROUP";
  InsertionMode2[InsertionMode2["IN_TABLE_BODY"] = 12] = "IN_TABLE_BODY";
  InsertionMode2[InsertionMode2["IN_ROW"] = 13] = "IN_ROW";
  InsertionMode2[InsertionMode2["IN_CELL"] = 14] = "IN_CELL";
  InsertionMode2[InsertionMode2["IN_SELECT"] = 15] = "IN_SELECT";
  InsertionMode2[InsertionMode2["IN_SELECT_IN_TABLE"] = 16] = "IN_SELECT_IN_TABLE";
  InsertionMode2[InsertionMode2["IN_TEMPLATE"] = 17] = "IN_TEMPLATE";
  InsertionMode2[InsertionMode2["AFTER_BODY"] = 18] = "AFTER_BODY";
  InsertionMode2[InsertionMode2["IN_FRAMESET"] = 19] = "IN_FRAMESET";
  InsertionMode2[InsertionMode2["AFTER_FRAMESET"] = 20] = "AFTER_FRAMESET";
  InsertionMode2[InsertionMode2["AFTER_AFTER_BODY"] = 21] = "AFTER_AFTER_BODY";
  InsertionMode2[InsertionMode2["AFTER_AFTER_FRAMESET"] = 22] = "AFTER_AFTER_FRAMESET";
})(InsertionMode || (InsertionMode = {}));
var BASE_LOC = {
  startLine: -1,
  startCol: -1,
  startOffset: -1,
  endLine: -1,
  endCol: -1,
  endOffset: -1
};
var TABLE_STRUCTURE_TAGS = /* @__PURE__ */ new Set([TAG_ID.TABLE, TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TR]);
var defaultParserOptions = {
  scriptingEnabled: true,
  sourceCodeLocationInfo: false,
  treeAdapter: defaultTreeAdapter,
  onParseError: null
};
var Parser = class {
  constructor(options2, document2, fragmentContext = null, scriptHandler = null) {
    this.fragmentContext = fragmentContext;
    this.scriptHandler = scriptHandler;
    this.currentToken = null;
    this.stopped = false;
    this.insertionMode = InsertionMode.INITIAL;
    this.originalInsertionMode = InsertionMode.INITIAL;
    this.headElement = null;
    this.formElement = null;
    this.currentNotInHTML = false;
    this.tmplInsertionModeStack = [];
    this.pendingCharacterTokens = [];
    this.hasNonWhitespacePendingCharacterToken = false;
    this.framesetOk = true;
    this.skipNextNewLine = false;
    this.fosterParentingEnabled = false;
    this.options = {
      ...defaultParserOptions,
      ...options2
    };
    this.treeAdapter = this.options.treeAdapter;
    this.onParseError = this.options.onParseError;
    if (this.onParseError) {
      this.options.sourceCodeLocationInfo = true;
    }
    this.document = document2 !== null && document2 !== void 0 ? document2 : this.treeAdapter.createDocument();
    this.tokenizer = new Tokenizer(this.options, this);
    this.activeFormattingElements = new FormattingElementList(this.treeAdapter);
    this.fragmentContextID = fragmentContext ? getTagID(this.treeAdapter.getTagName(fragmentContext)) : TAG_ID.UNKNOWN;
    this._setContextModes(fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : this.document, this.fragmentContextID);
    this.openElements = new OpenElementStack(this.document, this.treeAdapter, this);
  }
  // API
  static parse(html, options2) {
    const parser = new this(options2);
    parser.tokenizer.write(html, true);
    return parser.document;
  }
  static getFragmentParser(fragmentContext, options2) {
    const opts = {
      ...defaultParserOptions,
      ...options2
    };
    fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : fragmentContext = opts.treeAdapter.createElement(TAG_NAMES.TEMPLATE, NS.HTML, []);
    const documentMock = opts.treeAdapter.createElement("documentmock", NS.HTML, []);
    const parser = new this(opts, documentMock, fragmentContext);
    if (parser.fragmentContextID === TAG_ID.TEMPLATE) {
      parser.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
    }
    parser._initTokenizerForFragmentParsing();
    parser._insertFakeRootElement();
    parser._resetInsertionMode();
    parser._findFormInFragmentContext();
    return parser;
  }
  getFragment() {
    const rootElement = this.treeAdapter.getFirstChild(this.document);
    const fragment = this.treeAdapter.createDocumentFragment();
    this._adoptNodes(rootElement, fragment);
    return fragment;
  }
  //Errors
  /** @internal */
  _err(token, code, beforeToken) {
    var _a2;
    if (!this.onParseError)
      return;
    const loc = (_a2 = token.location) !== null && _a2 !== void 0 ? _a2 : BASE_LOC;
    const err = {
      code,
      startLine: loc.startLine,
      startCol: loc.startCol,
      startOffset: loc.startOffset,
      endLine: beforeToken ? loc.startLine : loc.endLine,
      endCol: beforeToken ? loc.startCol : loc.endCol,
      endOffset: beforeToken ? loc.startOffset : loc.endOffset
    };
    this.onParseError(err);
  }
  //Stack events
  /** @internal */
  onItemPush(node, tid, isTop) {
    var _a2, _b;
    (_b = (_a2 = this.treeAdapter).onItemPush) === null || _b === void 0 ? void 0 : _b.call(_a2, node);
    if (isTop && this.openElements.stackTop > 0)
      this._setContextModes(node, tid);
  }
  /** @internal */
  onItemPop(node, isTop) {
    var _a2, _b;
    if (this.options.sourceCodeLocationInfo) {
      this._setEndLocation(node, this.currentToken);
    }
    (_b = (_a2 = this.treeAdapter).onItemPop) === null || _b === void 0 ? void 0 : _b.call(_a2, node, this.openElements.current);
    if (isTop) {
      let current;
      let currentTagId;
      if (this.openElements.stackTop === 0 && this.fragmentContext) {
        current = this.fragmentContext;
        currentTagId = this.fragmentContextID;
      } else {
        ({ current, currentTagId } = this.openElements);
      }
      this._setContextModes(current, currentTagId);
    }
  }
  _setContextModes(current, tid) {
    const isHTML = current === this.document || current && this.treeAdapter.getNamespaceURI(current) === NS.HTML;
    this.currentNotInHTML = !isHTML;
    this.tokenizer.inForeignNode = !isHTML && current !== void 0 && tid !== void 0 && !this._isIntegrationPoint(tid, current);
  }
  /** @protected */
  _switchToTextParsing(currentToken, nextTokenizerState) {
    this._insertElement(currentToken, NS.HTML);
    this.tokenizer.state = nextTokenizerState;
    this.originalInsertionMode = this.insertionMode;
    this.insertionMode = InsertionMode.TEXT;
  }
  switchToPlaintextParsing() {
    this.insertionMode = InsertionMode.TEXT;
    this.originalInsertionMode = InsertionMode.IN_BODY;
    this.tokenizer.state = TokenizerMode.PLAINTEXT;
  }
  //Fragment parsing
  /** @protected */
  _getAdjustedCurrentElement() {
    return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
  }
  /** @protected */
  _findFormInFragmentContext() {
    let node = this.fragmentContext;
    while (node) {
      if (this.treeAdapter.getTagName(node) === TAG_NAMES.FORM) {
        this.formElement = node;
        break;
      }
      node = this.treeAdapter.getParentNode(node);
    }
  }
  _initTokenizerForFragmentParsing() {
    if (!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== NS.HTML) {
      return;
    }
    switch (this.fragmentContextID) {
      case TAG_ID.TITLE:
      case TAG_ID.TEXTAREA: {
        this.tokenizer.state = TokenizerMode.RCDATA;
        break;
      }
      case TAG_ID.STYLE:
      case TAG_ID.XMP:
      case TAG_ID.IFRAME:
      case TAG_ID.NOEMBED:
      case TAG_ID.NOFRAMES:
      case TAG_ID.NOSCRIPT: {
        this.tokenizer.state = TokenizerMode.RAWTEXT;
        break;
      }
      case TAG_ID.SCRIPT: {
        this.tokenizer.state = TokenizerMode.SCRIPT_DATA;
        break;
      }
      case TAG_ID.PLAINTEXT: {
        this.tokenizer.state = TokenizerMode.PLAINTEXT;
        break;
      }
      default:
    }
  }
  //Tree mutation
  /** @protected */
  _setDocumentType(token) {
    const name3 = token.name || "";
    const publicId = token.publicId || "";
    const systemId = token.systemId || "";
    this.treeAdapter.setDocumentType(this.document, name3, publicId, systemId);
    if (token.location) {
      const documentChildren = this.treeAdapter.getChildNodes(this.document);
      const docTypeNode = documentChildren.find((node) => this.treeAdapter.isDocumentTypeNode(node));
      if (docTypeNode) {
        this.treeAdapter.setNodeSourceCodeLocation(docTypeNode, token.location);
      }
    }
  }
  /** @protected */
  _attachElementToTree(element, location2) {
    if (this.options.sourceCodeLocationInfo) {
      const loc = location2 && {
        ...location2,
        startTag: location2
      };
      this.treeAdapter.setNodeSourceCodeLocation(element, loc);
    }
    if (this._shouldFosterParentOnInsertion()) {
      this._fosterParentElement(element);
    } else {
      const parent = this.openElements.currentTmplContentOrNode;
      this.treeAdapter.appendChild(parent !== null && parent !== void 0 ? parent : this.document, element);
    }
  }
  /**
   * For self-closing tags. Add an element to the tree, but skip adding it
   * to the stack.
   */
  /** @protected */
  _appendElement(token, namespaceURI) {
    const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
    this._attachElementToTree(element, token.location);
  }
  /** @protected */
  _insertElement(token, namespaceURI) {
    const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
    this._attachElementToTree(element, token.location);
    this.openElements.push(element, token.tagID);
  }
  /** @protected */
  _insertFakeElement(tagName, tagID) {
    const element = this.treeAdapter.createElement(tagName, NS.HTML, []);
    this._attachElementToTree(element, null);
    this.openElements.push(element, tagID);
  }
  /** @protected */
  _insertTemplate(token) {
    const tmpl = this.treeAdapter.createElement(token.tagName, NS.HTML, token.attrs);
    const content = this.treeAdapter.createDocumentFragment();
    this.treeAdapter.setTemplateContent(tmpl, content);
    this._attachElementToTree(tmpl, token.location);
    this.openElements.push(tmpl, token.tagID);
    if (this.options.sourceCodeLocationInfo)
      this.treeAdapter.setNodeSourceCodeLocation(content, null);
  }
  /** @protected */
  _insertFakeRootElement() {
    const element = this.treeAdapter.createElement(TAG_NAMES.HTML, NS.HTML, []);
    if (this.options.sourceCodeLocationInfo)
      this.treeAdapter.setNodeSourceCodeLocation(element, null);
    this.treeAdapter.appendChild(this.openElements.current, element);
    this.openElements.push(element, TAG_ID.HTML);
  }
  /** @protected */
  _appendCommentNode(token, parent) {
    const commentNode = this.treeAdapter.createCommentNode(token.data);
    this.treeAdapter.appendChild(parent, commentNode);
    if (this.options.sourceCodeLocationInfo) {
      this.treeAdapter.setNodeSourceCodeLocation(commentNode, token.location);
    }
  }
  /** @protected */
  _insertCharacters(token) {
    let parent;
    let beforeElement;
    if (this._shouldFosterParentOnInsertion()) {
      ({ parent, beforeElement } = this._findFosterParentingLocation());
      if (beforeElement) {
        this.treeAdapter.insertTextBefore(parent, token.chars, beforeElement);
      } else {
        this.treeAdapter.insertText(parent, token.chars);
      }
    } else {
      parent = this.openElements.currentTmplContentOrNode;
      this.treeAdapter.insertText(parent, token.chars);
    }
    if (!token.location)
      return;
    const siblings = this.treeAdapter.getChildNodes(parent);
    const textNodeIdx = beforeElement ? siblings.lastIndexOf(beforeElement) : siblings.length;
    const textNode = siblings[textNodeIdx - 1];
    const tnLoc = this.treeAdapter.getNodeSourceCodeLocation(textNode);
    if (tnLoc) {
      const { endLine, endCol, endOffset } = token.location;
      this.treeAdapter.updateNodeSourceCodeLocation(textNode, { endLine, endCol, endOffset });
    } else if (this.options.sourceCodeLocationInfo) {
      this.treeAdapter.setNodeSourceCodeLocation(textNode, token.location);
    }
  }
  /** @protected */
  _adoptNodes(donor, recipient) {
    for (let child = this.treeAdapter.getFirstChild(donor); child; child = this.treeAdapter.getFirstChild(donor)) {
      this.treeAdapter.detachNode(child);
      this.treeAdapter.appendChild(recipient, child);
    }
  }
  /** @protected */
  _setEndLocation(element, closingToken) {
    if (this.treeAdapter.getNodeSourceCodeLocation(element) && closingToken.location) {
      const ctLoc = closingToken.location;
      const tn = this.treeAdapter.getTagName(element);
      const endLoc = (
        // NOTE: For cases like <p> <p> </p> - First 'p' closes without a closing
        // tag and for cases like <td> <p> </td> - 'p' closes without a closing tag.
        closingToken.type === TokenType.END_TAG && tn === closingToken.tagName ? {
          endTag: { ...ctLoc },
          endLine: ctLoc.endLine,
          endCol: ctLoc.endCol,
          endOffset: ctLoc.endOffset
        } : {
          endLine: ctLoc.startLine,
          endCol: ctLoc.startCol,
          endOffset: ctLoc.startOffset
        }
      );
      this.treeAdapter.updateNodeSourceCodeLocation(element, endLoc);
    }
  }
  //Token processing
  shouldProcessStartTagTokenInForeignContent(token) {
    if (!this.currentNotInHTML)
      return false;
    let current;
    let currentTagId;
    if (this.openElements.stackTop === 0 && this.fragmentContext) {
      current = this.fragmentContext;
      currentTagId = this.fragmentContextID;
    } else {
      ({ current, currentTagId } = this.openElements);
    }
    if (token.tagID === TAG_ID.SVG && this.treeAdapter.getTagName(current) === TAG_NAMES.ANNOTATION_XML && this.treeAdapter.getNamespaceURI(current) === NS.MATHML) {
      return false;
    }
    return (
      // Check that `current` is not an integration point for HTML or MathML elements.
      this.tokenizer.inForeignNode || // If it _is_ an integration point, then we might have to check that it is not an HTML
      // integration point.
      (token.tagID === TAG_ID.MGLYPH || token.tagID === TAG_ID.MALIGNMARK) && currentTagId !== void 0 && !this._isIntegrationPoint(currentTagId, current, NS.HTML)
    );
  }
  /** @protected */
  _processToken(token) {
    switch (token.type) {
      case TokenType.CHARACTER: {
        this.onCharacter(token);
        break;
      }
      case TokenType.NULL_CHARACTER: {
        this.onNullCharacter(token);
        break;
      }
      case TokenType.COMMENT: {
        this.onComment(token);
        break;
      }
      case TokenType.DOCTYPE: {
        this.onDoctype(token);
        break;
      }
      case TokenType.START_TAG: {
        this._processStartTag(token);
        break;
      }
      case TokenType.END_TAG: {
        this.onEndTag(token);
        break;
      }
      case TokenType.EOF: {
        this.onEof(token);
        break;
      }
      case TokenType.WHITESPACE_CHARACTER: {
        this.onWhitespaceCharacter(token);
        break;
      }
    }
  }
  //Integration points
  /** @protected */
  _isIntegrationPoint(tid, element, foreignNS) {
    const ns = this.treeAdapter.getNamespaceURI(element);
    const attrs = this.treeAdapter.getAttrList(element);
    return isIntegrationPoint(tid, ns, attrs, foreignNS);
  }
  //Active formatting elements reconstruction
  /** @protected */
  _reconstructActiveFormattingElements() {
    const listLength = this.activeFormattingElements.entries.length;
    if (listLength) {
      const endIndex = this.activeFormattingElements.entries.findIndex((entry) => entry.type === EntryType.Marker || this.openElements.contains(entry.element));
      const unopenIdx = endIndex === -1 ? listLength - 1 : endIndex - 1;
      for (let i = unopenIdx; i >= 0; i--) {
        const entry = this.activeFormattingElements.entries[i];
        this._insertElement(entry.token, this.treeAdapter.getNamespaceURI(entry.element));
        entry.element = this.openElements.current;
      }
    }
  }
  //Close elements
  /** @protected */
  _closeTableCell() {
    this.openElements.generateImpliedEndTags();
    this.openElements.popUntilTableCellPopped();
    this.activeFormattingElements.clearToLastMarker();
    this.insertionMode = InsertionMode.IN_ROW;
  }
  /** @protected */
  _closePElement() {
    this.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.P);
    this.openElements.popUntilTagNamePopped(TAG_ID.P);
  }
  //Insertion modes
  /** @protected */
  _resetInsertionMode() {
    for (let i = this.openElements.stackTop; i >= 0; i--) {
      switch (i === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[i]) {
        case TAG_ID.TR: {
          this.insertionMode = InsertionMode.IN_ROW;
          return;
        }
        case TAG_ID.TBODY:
        case TAG_ID.THEAD:
        case TAG_ID.TFOOT: {
          this.insertionMode = InsertionMode.IN_TABLE_BODY;
          return;
        }
        case TAG_ID.CAPTION: {
          this.insertionMode = InsertionMode.IN_CAPTION;
          return;
        }
        case TAG_ID.COLGROUP: {
          this.insertionMode = InsertionMode.IN_COLUMN_GROUP;
          return;
        }
        case TAG_ID.TABLE: {
          this.insertionMode = InsertionMode.IN_TABLE;
          return;
        }
        case TAG_ID.BODY: {
          this.insertionMode = InsertionMode.IN_BODY;
          return;
        }
        case TAG_ID.FRAMESET: {
          this.insertionMode = InsertionMode.IN_FRAMESET;
          return;
        }
        case TAG_ID.SELECT: {
          this._resetInsertionModeForSelect(i);
          return;
        }
        case TAG_ID.TEMPLATE: {
          this.insertionMode = this.tmplInsertionModeStack[0];
          return;
        }
        case TAG_ID.HTML: {
          this.insertionMode = this.headElement ? InsertionMode.AFTER_HEAD : InsertionMode.BEFORE_HEAD;
          return;
        }
        case TAG_ID.TD:
        case TAG_ID.TH: {
          if (i > 0) {
            this.insertionMode = InsertionMode.IN_CELL;
            return;
          }
          break;
        }
        case TAG_ID.HEAD: {
          if (i > 0) {
            this.insertionMode = InsertionMode.IN_HEAD;
            return;
          }
          break;
        }
      }
    }
    this.insertionMode = InsertionMode.IN_BODY;
  }
  /** @protected */
  _resetInsertionModeForSelect(selectIdx) {
    if (selectIdx > 0) {
      for (let i = selectIdx - 1; i > 0; i--) {
        const tn = this.openElements.tagIDs[i];
        if (tn === TAG_ID.TEMPLATE) {
          break;
        } else if (tn === TAG_ID.TABLE) {
          this.insertionMode = InsertionMode.IN_SELECT_IN_TABLE;
          return;
        }
      }
    }
    this.insertionMode = InsertionMode.IN_SELECT;
  }
  //Foster parenting
  /** @protected */
  _isElementCausesFosterParenting(tn) {
    return TABLE_STRUCTURE_TAGS.has(tn);
  }
  /** @protected */
  _shouldFosterParentOnInsertion() {
    return this.fosterParentingEnabled && this.openElements.currentTagId !== void 0 && this._isElementCausesFosterParenting(this.openElements.currentTagId);
  }
  /** @protected */
  _findFosterParentingLocation() {
    for (let i = this.openElements.stackTop; i >= 0; i--) {
      const openElement = this.openElements.items[i];
      switch (this.openElements.tagIDs[i]) {
        case TAG_ID.TEMPLATE: {
          if (this.treeAdapter.getNamespaceURI(openElement) === NS.HTML) {
            return { parent: this.treeAdapter.getTemplateContent(openElement), beforeElement: null };
          }
          break;
        }
        case TAG_ID.TABLE: {
          const parent = this.treeAdapter.getParentNode(openElement);
          if (parent) {
            return { parent, beforeElement: openElement };
          }
          return { parent: this.openElements.items[i - 1], beforeElement: null };
        }
        default:
      }
    }
    return { parent: this.openElements.items[0], beforeElement: null };
  }
  /** @protected */
  _fosterParentElement(element) {
    const location2 = this._findFosterParentingLocation();
    if (location2.beforeElement) {
      this.treeAdapter.insertBefore(location2.parent, element, location2.beforeElement);
    } else {
      this.treeAdapter.appendChild(location2.parent, element);
    }
  }
  //Special elements
  /** @protected */
  _isSpecialElement(element, id) {
    const ns = this.treeAdapter.getNamespaceURI(element);
    return SPECIAL_ELEMENTS[ns].has(id);
  }
  /** @internal */
  onCharacter(token) {
    this.skipNextNewLine = false;
    if (this.tokenizer.inForeignNode) {
      characterInForeignContent(this, token);
      return;
    }
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        tokenInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HTML: {
        tokenBeforeHtml(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD: {
        tokenBeforeHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD: {
        tokenInHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD_NO_SCRIPT: {
        tokenInHeadNoScript(this, token);
        break;
      }
      case InsertionMode.AFTER_HEAD: {
        tokenAfterHead(this, token);
        break;
      }
      case InsertionMode.IN_BODY:
      case InsertionMode.IN_CAPTION:
      case InsertionMode.IN_CELL:
      case InsertionMode.IN_TEMPLATE: {
        characterInBody(this, token);
        break;
      }
      case InsertionMode.TEXT:
      case InsertionMode.IN_SELECT:
      case InsertionMode.IN_SELECT_IN_TABLE: {
        this._insertCharacters(token);
        break;
      }
      case InsertionMode.IN_TABLE:
      case InsertionMode.IN_TABLE_BODY:
      case InsertionMode.IN_ROW: {
        characterInTable(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        characterInTableText(this, token);
        break;
      }
      case InsertionMode.IN_COLUMN_GROUP: {
        tokenInColumnGroup(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY: {
        tokenAfterBody(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_BODY: {
        tokenAfterAfterBody(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onNullCharacter(token) {
    this.skipNextNewLine = false;
    if (this.tokenizer.inForeignNode) {
      nullCharacterInForeignContent(this, token);
      return;
    }
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        tokenInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HTML: {
        tokenBeforeHtml(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD: {
        tokenBeforeHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD: {
        tokenInHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD_NO_SCRIPT: {
        tokenInHeadNoScript(this, token);
        break;
      }
      case InsertionMode.AFTER_HEAD: {
        tokenAfterHead(this, token);
        break;
      }
      case InsertionMode.TEXT: {
        this._insertCharacters(token);
        break;
      }
      case InsertionMode.IN_TABLE:
      case InsertionMode.IN_TABLE_BODY:
      case InsertionMode.IN_ROW: {
        characterInTable(this, token);
        break;
      }
      case InsertionMode.IN_COLUMN_GROUP: {
        tokenInColumnGroup(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY: {
        tokenAfterBody(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_BODY: {
        tokenAfterAfterBody(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onComment(token) {
    this.skipNextNewLine = false;
    if (this.currentNotInHTML) {
      appendComment(this, token);
      return;
    }
    switch (this.insertionMode) {
      case InsertionMode.INITIAL:
      case InsertionMode.BEFORE_HTML:
      case InsertionMode.BEFORE_HEAD:
      case InsertionMode.IN_HEAD:
      case InsertionMode.IN_HEAD_NO_SCRIPT:
      case InsertionMode.AFTER_HEAD:
      case InsertionMode.IN_BODY:
      case InsertionMode.IN_TABLE:
      case InsertionMode.IN_CAPTION:
      case InsertionMode.IN_COLUMN_GROUP:
      case InsertionMode.IN_TABLE_BODY:
      case InsertionMode.IN_ROW:
      case InsertionMode.IN_CELL:
      case InsertionMode.IN_SELECT:
      case InsertionMode.IN_SELECT_IN_TABLE:
      case InsertionMode.IN_TEMPLATE:
      case InsertionMode.IN_FRAMESET:
      case InsertionMode.AFTER_FRAMESET: {
        appendComment(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        tokenInTableText(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY: {
        appendCommentToRootHtmlElement(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_BODY:
      case InsertionMode.AFTER_AFTER_FRAMESET: {
        appendCommentToDocument(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onDoctype(token) {
    this.skipNextNewLine = false;
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        doctypeInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD:
      case InsertionMode.IN_HEAD:
      case InsertionMode.IN_HEAD_NO_SCRIPT:
      case InsertionMode.AFTER_HEAD: {
        this._err(token, ERR.misplacedDoctype);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        tokenInTableText(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onStartTag(token) {
    this.skipNextNewLine = false;
    this.currentToken = token;
    this._processStartTag(token);
    if (token.selfClosing && !token.ackSelfClosing) {
      this._err(token, ERR.nonVoidHtmlElementStartTagWithTrailingSolidus);
    }
  }
  /**
   * Processes a given start tag.
   *
   * `onStartTag` checks if a self-closing tag was recognized. When a token
   * is moved inbetween multiple insertion modes, this check for self-closing
   * could lead to false positives. To avoid this, `_processStartTag` is used
   * for nested calls.
   *
   * @param token The token to process.
   * @protected
   */
  _processStartTag(token) {
    if (this.shouldProcessStartTagTokenInForeignContent(token)) {
      startTagInForeignContent(this, token);
    } else {
      this._startTagOutsideForeignContent(token);
    }
  }
  /** @protected */
  _startTagOutsideForeignContent(token) {
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        tokenInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HTML: {
        startTagBeforeHtml(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD: {
        startTagBeforeHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD: {
        startTagInHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD_NO_SCRIPT: {
        startTagInHeadNoScript(this, token);
        break;
      }
      case InsertionMode.AFTER_HEAD: {
        startTagAfterHead(this, token);
        break;
      }
      case InsertionMode.IN_BODY: {
        startTagInBody(this, token);
        break;
      }
      case InsertionMode.IN_TABLE: {
        startTagInTable(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        tokenInTableText(this, token);
        break;
      }
      case InsertionMode.IN_CAPTION: {
        startTagInCaption(this, token);
        break;
      }
      case InsertionMode.IN_COLUMN_GROUP: {
        startTagInColumnGroup(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_BODY: {
        startTagInTableBody(this, token);
        break;
      }
      case InsertionMode.IN_ROW: {
        startTagInRow(this, token);
        break;
      }
      case InsertionMode.IN_CELL: {
        startTagInCell(this, token);
        break;
      }
      case InsertionMode.IN_SELECT: {
        startTagInSelect(this, token);
        break;
      }
      case InsertionMode.IN_SELECT_IN_TABLE: {
        startTagInSelectInTable(this, token);
        break;
      }
      case InsertionMode.IN_TEMPLATE: {
        startTagInTemplate(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY: {
        startTagAfterBody(this, token);
        break;
      }
      case InsertionMode.IN_FRAMESET: {
        startTagInFrameset(this, token);
        break;
      }
      case InsertionMode.AFTER_FRAMESET: {
        startTagAfterFrameset(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_BODY: {
        startTagAfterAfterBody(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_FRAMESET: {
        startTagAfterAfterFrameset(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onEndTag(token) {
    this.skipNextNewLine = false;
    this.currentToken = token;
    if (this.currentNotInHTML) {
      endTagInForeignContent(this, token);
    } else {
      this._endTagOutsideForeignContent(token);
    }
  }
  /** @protected */
  _endTagOutsideForeignContent(token) {
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        tokenInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HTML: {
        endTagBeforeHtml(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD: {
        endTagBeforeHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD: {
        endTagInHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD_NO_SCRIPT: {
        endTagInHeadNoScript(this, token);
        break;
      }
      case InsertionMode.AFTER_HEAD: {
        endTagAfterHead(this, token);
        break;
      }
      case InsertionMode.IN_BODY: {
        endTagInBody(this, token);
        break;
      }
      case InsertionMode.TEXT: {
        endTagInText(this, token);
        break;
      }
      case InsertionMode.IN_TABLE: {
        endTagInTable(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        tokenInTableText(this, token);
        break;
      }
      case InsertionMode.IN_CAPTION: {
        endTagInCaption(this, token);
        break;
      }
      case InsertionMode.IN_COLUMN_GROUP: {
        endTagInColumnGroup(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_BODY: {
        endTagInTableBody(this, token);
        break;
      }
      case InsertionMode.IN_ROW: {
        endTagInRow(this, token);
        break;
      }
      case InsertionMode.IN_CELL: {
        endTagInCell(this, token);
        break;
      }
      case InsertionMode.IN_SELECT: {
        endTagInSelect(this, token);
        break;
      }
      case InsertionMode.IN_SELECT_IN_TABLE: {
        endTagInSelectInTable(this, token);
        break;
      }
      case InsertionMode.IN_TEMPLATE: {
        endTagInTemplate(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY: {
        endTagAfterBody(this, token);
        break;
      }
      case InsertionMode.IN_FRAMESET: {
        endTagInFrameset(this, token);
        break;
      }
      case InsertionMode.AFTER_FRAMESET: {
        endTagAfterFrameset(this, token);
        break;
      }
      case InsertionMode.AFTER_AFTER_BODY: {
        tokenAfterAfterBody(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onEof(token) {
    switch (this.insertionMode) {
      case InsertionMode.INITIAL: {
        tokenInInitialMode(this, token);
        break;
      }
      case InsertionMode.BEFORE_HTML: {
        tokenBeforeHtml(this, token);
        break;
      }
      case InsertionMode.BEFORE_HEAD: {
        tokenBeforeHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD: {
        tokenInHead(this, token);
        break;
      }
      case InsertionMode.IN_HEAD_NO_SCRIPT: {
        tokenInHeadNoScript(this, token);
        break;
      }
      case InsertionMode.AFTER_HEAD: {
        tokenAfterHead(this, token);
        break;
      }
      case InsertionMode.IN_BODY:
      case InsertionMode.IN_TABLE:
      case InsertionMode.IN_CAPTION:
      case InsertionMode.IN_COLUMN_GROUP:
      case InsertionMode.IN_TABLE_BODY:
      case InsertionMode.IN_ROW:
      case InsertionMode.IN_CELL:
      case InsertionMode.IN_SELECT:
      case InsertionMode.IN_SELECT_IN_TABLE: {
        eofInBody(this, token);
        break;
      }
      case InsertionMode.TEXT: {
        eofInText(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        tokenInTableText(this, token);
        break;
      }
      case InsertionMode.IN_TEMPLATE: {
        eofInTemplate(this, token);
        break;
      }
      case InsertionMode.AFTER_BODY:
      case InsertionMode.IN_FRAMESET:
      case InsertionMode.AFTER_FRAMESET:
      case InsertionMode.AFTER_AFTER_BODY:
      case InsertionMode.AFTER_AFTER_FRAMESET: {
        stopParsing(this, token);
        break;
      }
      default:
    }
  }
  /** @internal */
  onWhitespaceCharacter(token) {
    if (this.skipNextNewLine) {
      this.skipNextNewLine = false;
      if (token.chars.charCodeAt(0) === CODE_POINTS.LINE_FEED) {
        if (token.chars.length === 1) {
          return;
        }
        token.chars = token.chars.substr(1);
      }
    }
    if (this.tokenizer.inForeignNode) {
      this._insertCharacters(token);
      return;
    }
    switch (this.insertionMode) {
      case InsertionMode.IN_HEAD:
      case InsertionMode.IN_HEAD_NO_SCRIPT:
      case InsertionMode.AFTER_HEAD:
      case InsertionMode.TEXT:
      case InsertionMode.IN_COLUMN_GROUP:
      case InsertionMode.IN_SELECT:
      case InsertionMode.IN_SELECT_IN_TABLE:
      case InsertionMode.IN_FRAMESET:
      case InsertionMode.AFTER_FRAMESET: {
        this._insertCharacters(token);
        break;
      }
      case InsertionMode.IN_BODY:
      case InsertionMode.IN_CAPTION:
      case InsertionMode.IN_CELL:
      case InsertionMode.IN_TEMPLATE:
      case InsertionMode.AFTER_BODY:
      case InsertionMode.AFTER_AFTER_BODY:
      case InsertionMode.AFTER_AFTER_FRAMESET: {
        whitespaceCharacterInBody(this, token);
        break;
      }
      case InsertionMode.IN_TABLE:
      case InsertionMode.IN_TABLE_BODY:
      case InsertionMode.IN_ROW: {
        characterInTable(this, token);
        break;
      }
      case InsertionMode.IN_TABLE_TEXT: {
        whitespaceCharacterInTableText(this, token);
        break;
      }
      default:
    }
  }
};
function aaObtainFormattingElementEntry(p, token) {
  let formattingElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(token.tagName);
  if (formattingElementEntry) {
    if (!p.openElements.contains(formattingElementEntry.element)) {
      p.activeFormattingElements.removeEntry(formattingElementEntry);
      formattingElementEntry = null;
    } else if (!p.openElements.hasInScope(token.tagID)) {
      formattingElementEntry = null;
    }
  } else {
    genericEndTagInBody(p, token);
  }
  return formattingElementEntry;
}
function aaObtainFurthestBlock(p, formattingElementEntry) {
  let furthestBlock = null;
  let idx = p.openElements.stackTop;
  for (; idx >= 0; idx--) {
    const element = p.openElements.items[idx];
    if (element === formattingElementEntry.element) {
      break;
    }
    if (p._isSpecialElement(element, p.openElements.tagIDs[idx])) {
      furthestBlock = element;
    }
  }
  if (!furthestBlock) {
    p.openElements.shortenToLength(Math.max(idx, 0));
    p.activeFormattingElements.removeEntry(formattingElementEntry);
  }
  return furthestBlock;
}
function aaInnerLoop(p, furthestBlock, formattingElement) {
  let lastElement = furthestBlock;
  let nextElement = p.openElements.getCommonAncestor(furthestBlock);
  for (let i = 0, element = nextElement; element !== formattingElement; i++, element = nextElement) {
    nextElement = p.openElements.getCommonAncestor(element);
    const elementEntry = p.activeFormattingElements.getElementEntry(element);
    const counterOverflow = elementEntry && i >= AA_INNER_LOOP_ITER;
    const shouldRemoveFromOpenElements = !elementEntry || counterOverflow;
    if (shouldRemoveFromOpenElements) {
      if (counterOverflow) {
        p.activeFormattingElements.removeEntry(elementEntry);
      }
      p.openElements.remove(element);
    } else {
      element = aaRecreateElementFromEntry(p, elementEntry);
      if (lastElement === furthestBlock) {
        p.activeFormattingElements.bookmark = elementEntry;
      }
      p.treeAdapter.detachNode(lastElement);
      p.treeAdapter.appendChild(element, lastElement);
      lastElement = element;
    }
  }
  return lastElement;
}
function aaRecreateElementFromEntry(p, elementEntry) {
  const ns = p.treeAdapter.getNamespaceURI(elementEntry.element);
  const newElement = p.treeAdapter.createElement(elementEntry.token.tagName, ns, elementEntry.token.attrs);
  p.openElements.replace(elementEntry.element, newElement);
  elementEntry.element = newElement;
  return newElement;
}
function aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement) {
  const tn = p.treeAdapter.getTagName(commonAncestor);
  const tid = getTagID(tn);
  if (p._isElementCausesFosterParenting(tid)) {
    p._fosterParentElement(lastElement);
  } else {
    const ns = p.treeAdapter.getNamespaceURI(commonAncestor);
    if (tid === TAG_ID.TEMPLATE && ns === NS.HTML) {
      commonAncestor = p.treeAdapter.getTemplateContent(commonAncestor);
    }
    p.treeAdapter.appendChild(commonAncestor, lastElement);
  }
}
function aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry) {
  const ns = p.treeAdapter.getNamespaceURI(formattingElementEntry.element);
  const { token } = formattingElementEntry;
  const newElement = p.treeAdapter.createElement(token.tagName, ns, token.attrs);
  p._adoptNodes(furthestBlock, newElement);
  p.treeAdapter.appendChild(furthestBlock, newElement);
  p.activeFormattingElements.insertElementAfterBookmark(newElement, token);
  p.activeFormattingElements.removeEntry(formattingElementEntry);
  p.openElements.remove(formattingElementEntry.element);
  p.openElements.insertAfter(furthestBlock, newElement, token.tagID);
}
function callAdoptionAgency(p, token) {
  for (let i = 0; i < AA_OUTER_LOOP_ITER; i++) {
    const formattingElementEntry = aaObtainFormattingElementEntry(p, token);
    if (!formattingElementEntry) {
      break;
    }
    const furthestBlock = aaObtainFurthestBlock(p, formattingElementEntry);
    if (!furthestBlock) {
      break;
    }
    p.activeFormattingElements.bookmark = formattingElementEntry;
    const lastElement = aaInnerLoop(p, furthestBlock, formattingElementEntry.element);
    const commonAncestor = p.openElements.getCommonAncestor(formattingElementEntry.element);
    p.treeAdapter.detachNode(lastElement);
    if (commonAncestor)
      aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement);
    aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry);
  }
}
function appendComment(p, token) {
  p._appendCommentNode(token, p.openElements.currentTmplContentOrNode);
}
function appendCommentToRootHtmlElement(p, token) {
  p._appendCommentNode(token, p.openElements.items[0]);
}
function appendCommentToDocument(p, token) {
  p._appendCommentNode(token, p.document);
}
function stopParsing(p, token) {
  p.stopped = true;
  if (token.location) {
    const target = p.fragmentContext ? 0 : 2;
    for (let i = p.openElements.stackTop; i >= target; i--) {
      p._setEndLocation(p.openElements.items[i], token);
    }
    if (!p.fragmentContext && p.openElements.stackTop >= 0) {
      const htmlElement = p.openElements.items[0];
      const htmlLocation = p.treeAdapter.getNodeSourceCodeLocation(htmlElement);
      if (htmlLocation && !htmlLocation.endTag) {
        p._setEndLocation(htmlElement, token);
        if (p.openElements.stackTop >= 1) {
          const bodyElement = p.openElements.items[1];
          const bodyLocation = p.treeAdapter.getNodeSourceCodeLocation(bodyElement);
          if (bodyLocation && !bodyLocation.endTag) {
            p._setEndLocation(bodyElement, token);
          }
        }
      }
    }
  }
}
function doctypeInInitialMode(p, token) {
  p._setDocumentType(token);
  const mode = token.forceQuirks ? DOCUMENT_MODE.QUIRKS : getDocumentMode(token);
  if (!isConforming(token)) {
    p._err(token, ERR.nonConformingDoctype);
  }
  p.treeAdapter.setDocumentMode(p.document, mode);
  p.insertionMode = InsertionMode.BEFORE_HTML;
}
function tokenInInitialMode(p, token) {
  p._err(token, ERR.missingDoctype, true);
  p.treeAdapter.setDocumentMode(p.document, DOCUMENT_MODE.QUIRKS);
  p.insertionMode = InsertionMode.BEFORE_HTML;
  p._processToken(token);
}
function startTagBeforeHtml(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.BEFORE_HEAD;
  } else {
    tokenBeforeHtml(p, token);
  }
}
function endTagBeforeHtml(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.HTML || tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.BR) {
    tokenBeforeHtml(p, token);
  }
}
function tokenBeforeHtml(p, token) {
  p._insertFakeRootElement();
  p.insertionMode = InsertionMode.BEFORE_HEAD;
  p._processToken(token);
}
function startTagBeforeHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.HEAD: {
      p._insertElement(token, NS.HTML);
      p.headElement = p.openElements.current;
      p.insertionMode = InsertionMode.IN_HEAD;
      break;
    }
    default: {
      tokenBeforeHead(p, token);
    }
  }
}
function endTagBeforeHead(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.HTML || tn === TAG_ID.BR) {
    tokenBeforeHead(p, token);
  } else {
    p._err(token, ERR.endTagWithoutMatchingOpenElement);
  }
}
function tokenBeforeHead(p, token) {
  p._insertFakeElement(TAG_NAMES.HEAD, TAG_ID.HEAD);
  p.headElement = p.openElements.current;
  p.insertionMode = InsertionMode.IN_HEAD;
  p._processToken(token);
}
function startTagInHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.TITLE: {
      p._switchToTextParsing(token, TokenizerMode.RCDATA);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      if (p.options.scriptingEnabled) {
        p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
      } else {
        p._insertElement(token, NS.HTML);
        p.insertionMode = InsertionMode.IN_HEAD_NO_SCRIPT;
      }
      break;
    }
    case TAG_ID.NOFRAMES:
    case TAG_ID.STYLE: {
      p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
      break;
    }
    case TAG_ID.SCRIPT: {
      p._switchToTextParsing(token, TokenizerMode.SCRIPT_DATA);
      break;
    }
    case TAG_ID.TEMPLATE: {
      p._insertTemplate(token);
      p.activeFormattingElements.insertMarker();
      p.framesetOk = false;
      p.insertionMode = InsertionMode.IN_TEMPLATE;
      p.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
      break;
    }
    case TAG_ID.HEAD: {
      p._err(token, ERR.misplacedStartTagForHeadElement);
      break;
    }
    default: {
      tokenInHead(p, token);
    }
  }
}
function endTagInHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HEAD: {
      p.openElements.pop();
      p.insertionMode = InsertionMode.AFTER_HEAD;
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.BR:
    case TAG_ID.HTML: {
      tokenInHead(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function templateEndTagInHead(p, token) {
  if (p.openElements.tmplCount > 0) {
    p.openElements.generateImpliedEndTagsThoroughly();
    if (p.openElements.currentTagId !== TAG_ID.TEMPLATE) {
      p._err(token, ERR.closingOfElementWithOpenChildElements);
    }
    p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
    p.activeFormattingElements.clearToLastMarker();
    p.tmplInsertionModeStack.shift();
    p._resetInsertionMode();
  } else {
    p._err(token, ERR.endTagWithoutMatchingOpenElement);
  }
}
function tokenInHead(p, token) {
  p.openElements.pop();
  p.insertionMode = InsertionMode.AFTER_HEAD;
  p._processToken(token);
}
function startTagInHeadNoScript(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.HEAD:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.STYLE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      p._err(token, ERR.nestedNoscriptInHead);
      break;
    }
    default: {
      tokenInHeadNoScript(p, token);
    }
  }
}
function endTagInHeadNoScript(p, token) {
  switch (token.tagID) {
    case TAG_ID.NOSCRIPT: {
      p.openElements.pop();
      p.insertionMode = InsertionMode.IN_HEAD;
      break;
    }
    case TAG_ID.BR: {
      tokenInHeadNoScript(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function tokenInHeadNoScript(p, token) {
  const errCode = token.type === TokenType.EOF ? ERR.openElementsLeftAfterEof : ERR.disallowedContentInNoscriptInHead;
  p._err(token, errCode);
  p.openElements.pop();
  p.insertionMode = InsertionMode.IN_HEAD;
  p._processToken(token);
}
function startTagAfterHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BODY: {
      p._insertElement(token, NS.HTML);
      p.framesetOk = false;
      p.insertionMode = InsertionMode.IN_BODY;
      break;
    }
    case TAG_ID.FRAMESET: {
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_FRAMESET;
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.SCRIPT:
    case TAG_ID.STYLE:
    case TAG_ID.TEMPLATE:
    case TAG_ID.TITLE: {
      p._err(token, ERR.abandonedHeadElementChild);
      p.openElements.push(p.headElement, TAG_ID.HEAD);
      startTagInHead(p, token);
      p.openElements.remove(p.headElement);
      break;
    }
    case TAG_ID.HEAD: {
      p._err(token, ERR.misplacedStartTagForHeadElement);
      break;
    }
    default: {
      tokenAfterHead(p, token);
    }
  }
}
function endTagAfterHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.BODY:
    case TAG_ID.HTML:
    case TAG_ID.BR: {
      tokenAfterHead(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function tokenAfterHead(p, token) {
  p._insertFakeElement(TAG_NAMES.BODY, TAG_ID.BODY);
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function modeInBody(p, token) {
  switch (token.type) {
    case TokenType.CHARACTER: {
      characterInBody(p, token);
      break;
    }
    case TokenType.WHITESPACE_CHARACTER: {
      whitespaceCharacterInBody(p, token);
      break;
    }
    case TokenType.COMMENT: {
      appendComment(p, token);
      break;
    }
    case TokenType.START_TAG: {
      startTagInBody(p, token);
      break;
    }
    case TokenType.END_TAG: {
      endTagInBody(p, token);
      break;
    }
    case TokenType.EOF: {
      eofInBody(p, token);
      break;
    }
    default:
  }
}
function whitespaceCharacterInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertCharacters(token);
}
function characterInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertCharacters(token);
  p.framesetOk = false;
}
function htmlStartTagInBody(p, token) {
  if (p.openElements.tmplCount === 0) {
    p.treeAdapter.adoptAttributes(p.openElements.items[0], token.attrs);
  }
}
function bodyStartTagInBody(p, token) {
  const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
  if (bodyElement && p.openElements.tmplCount === 0) {
    p.framesetOk = false;
    p.treeAdapter.adoptAttributes(bodyElement, token.attrs);
  }
}
function framesetStartTagInBody(p, token) {
  const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
  if (p.framesetOk && bodyElement) {
    p.treeAdapter.detachNode(bodyElement);
    p.openElements.popAllUpToHtmlElement();
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.IN_FRAMESET;
  }
}
function addressStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
}
function numberedHeaderStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  if (p.openElements.currentTagId !== void 0 && NUMBERED_HEADERS.has(p.openElements.currentTagId)) {
    p.openElements.pop();
  }
  p._insertElement(token, NS.HTML);
}
function preStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.skipNextNewLine = true;
  p.framesetOk = false;
}
function formStartTagInBody(p, token) {
  const inTemplate = p.openElements.tmplCount > 0;
  if (!p.formElement || inTemplate) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
    if (!inTemplate) {
      p.formElement = p.openElements.current;
    }
  }
}
function listItemStartTagInBody(p, token) {
  p.framesetOk = false;
  const tn = token.tagID;
  for (let i = p.openElements.stackTop; i >= 0; i--) {
    const elementId = p.openElements.tagIDs[i];
    if (tn === TAG_ID.LI && elementId === TAG_ID.LI || (tn === TAG_ID.DD || tn === TAG_ID.DT) && (elementId === TAG_ID.DD || elementId === TAG_ID.DT)) {
      p.openElements.generateImpliedEndTagsWithExclusion(elementId);
      p.openElements.popUntilTagNamePopped(elementId);
      break;
    }
    if (elementId !== TAG_ID.ADDRESS && elementId !== TAG_ID.DIV && elementId !== TAG_ID.P && p._isSpecialElement(p.openElements.items[i], elementId)) {
      break;
    }
  }
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
}
function plaintextStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.tokenizer.state = TokenizerMode.PLAINTEXT;
}
function buttonStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BUTTON)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(TAG_ID.BUTTON);
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
}
function aStartTagInBody(p, token) {
  const activeElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(TAG_NAMES.A);
  if (activeElementEntry) {
    callAdoptionAgency(p, token);
    p.openElements.remove(activeElementEntry.element);
    p.activeFormattingElements.removeEntry(activeElementEntry);
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function bStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function nobrStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  if (p.openElements.hasInScope(TAG_ID.NOBR)) {
    callAdoptionAgency(p, token);
    p._reconstructActiveFormattingElements();
  }
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function appletStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.insertMarker();
  p.framesetOk = false;
}
function tableStartTagInBody(p, token) {
  if (p.treeAdapter.getDocumentMode(p.document) !== DOCUMENT_MODE.QUIRKS && p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
  p.insertionMode = InsertionMode.IN_TABLE;
}
function areaStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._appendElement(token, NS.HTML);
  p.framesetOk = false;
  token.ackSelfClosing = true;
}
function isHiddenInput(token) {
  const inputType = getTokenAttr(token, ATTRS.TYPE);
  return inputType != null && inputType.toLowerCase() === HIDDEN_INPUT_TYPE;
}
function inputStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._appendElement(token, NS.HTML);
  if (!isHiddenInput(token)) {
    p.framesetOk = false;
  }
  token.ackSelfClosing = true;
}
function paramStartTagInBody(p, token) {
  p._appendElement(token, NS.HTML);
  token.ackSelfClosing = true;
}
function hrStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._appendElement(token, NS.HTML);
  p.framesetOk = false;
  token.ackSelfClosing = true;
}
function imageStartTagInBody(p, token) {
  token.tagName = TAG_NAMES.IMG;
  token.tagID = TAG_ID.IMG;
  areaStartTagInBody(p, token);
}
function textareaStartTagInBody(p, token) {
  p._insertElement(token, NS.HTML);
  p.skipNextNewLine = true;
  p.tokenizer.state = TokenizerMode.RCDATA;
  p.originalInsertionMode = p.insertionMode;
  p.framesetOk = false;
  p.insertionMode = InsertionMode.TEXT;
}
function xmpStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._reconstructActiveFormattingElements();
  p.framesetOk = false;
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function iframeStartTagInBody(p, token) {
  p.framesetOk = false;
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function rawTextStartTagInBody(p, token) {
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function selectStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
  p.insertionMode = p.insertionMode === InsertionMode.IN_TABLE || p.insertionMode === InsertionMode.IN_CAPTION || p.insertionMode === InsertionMode.IN_TABLE_BODY || p.insertionMode === InsertionMode.IN_ROW || p.insertionMode === InsertionMode.IN_CELL ? InsertionMode.IN_SELECT_IN_TABLE : InsertionMode.IN_SELECT;
}
function optgroupStartTagInBody(p, token) {
  if (p.openElements.currentTagId === TAG_ID.OPTION) {
    p.openElements.pop();
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
}
function rbStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.RUBY)) {
    p.openElements.generateImpliedEndTags();
  }
  p._insertElement(token, NS.HTML);
}
function rtStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.RUBY)) {
    p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.RTC);
  }
  p._insertElement(token, NS.HTML);
}
function mathStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  adjustTokenMathMLAttrs(token);
  adjustTokenXMLAttrs(token);
  if (token.selfClosing) {
    p._appendElement(token, NS.MATHML);
  } else {
    p._insertElement(token, NS.MATHML);
  }
  token.ackSelfClosing = true;
}
function svgStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  adjustTokenSVGAttrs(token);
  adjustTokenXMLAttrs(token);
  if (token.selfClosing) {
    p._appendElement(token, NS.SVG);
  } else {
    p._insertElement(token, NS.SVG);
  }
  token.ackSelfClosing = true;
}
function genericStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
}
function startTagInBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.I:
    case TAG_ID.S:
    case TAG_ID.B:
    case TAG_ID.U:
    case TAG_ID.EM:
    case TAG_ID.TT:
    case TAG_ID.BIG:
    case TAG_ID.CODE:
    case TAG_ID.FONT:
    case TAG_ID.SMALL:
    case TAG_ID.STRIKE:
    case TAG_ID.STRONG: {
      bStartTagInBody(p, token);
      break;
    }
    case TAG_ID.A: {
      aStartTagInBody(p, token);
      break;
    }
    case TAG_ID.H1:
    case TAG_ID.H2:
    case TAG_ID.H3:
    case TAG_ID.H4:
    case TAG_ID.H5:
    case TAG_ID.H6: {
      numberedHeaderStartTagInBody(p, token);
      break;
    }
    case TAG_ID.P:
    case TAG_ID.DL:
    case TAG_ID.OL:
    case TAG_ID.UL:
    case TAG_ID.DIV:
    case TAG_ID.DIR:
    case TAG_ID.NAV:
    case TAG_ID.MAIN:
    case TAG_ID.MENU:
    case TAG_ID.ASIDE:
    case TAG_ID.CENTER:
    case TAG_ID.FIGURE:
    case TAG_ID.FOOTER:
    case TAG_ID.HEADER:
    case TAG_ID.HGROUP:
    case TAG_ID.DIALOG:
    case TAG_ID.DETAILS:
    case TAG_ID.ADDRESS:
    case TAG_ID.ARTICLE:
    case TAG_ID.SEARCH:
    case TAG_ID.SECTION:
    case TAG_ID.SUMMARY:
    case TAG_ID.FIELDSET:
    case TAG_ID.BLOCKQUOTE:
    case TAG_ID.FIGCAPTION: {
      addressStartTagInBody(p, token);
      break;
    }
    case TAG_ID.LI:
    case TAG_ID.DD:
    case TAG_ID.DT: {
      listItemStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BR:
    case TAG_ID.IMG:
    case TAG_ID.WBR:
    case TAG_ID.AREA:
    case TAG_ID.EMBED:
    case TAG_ID.KEYGEN: {
      areaStartTagInBody(p, token);
      break;
    }
    case TAG_ID.HR: {
      hrStartTagInBody(p, token);
      break;
    }
    case TAG_ID.RB:
    case TAG_ID.RTC: {
      rbStartTagInBody(p, token);
      break;
    }
    case TAG_ID.RT:
    case TAG_ID.RP: {
      rtStartTagInBody(p, token);
      break;
    }
    case TAG_ID.PRE:
    case TAG_ID.LISTING: {
      preStartTagInBody(p, token);
      break;
    }
    case TAG_ID.XMP: {
      xmpStartTagInBody(p, token);
      break;
    }
    case TAG_ID.SVG: {
      svgStartTagInBody(p, token);
      break;
    }
    case TAG_ID.HTML: {
      htmlStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.STYLE:
    case TAG_ID.TITLE:
    case TAG_ID.SCRIPT:
    case TAG_ID.BGSOUND:
    case TAG_ID.BASEFONT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.BODY: {
      bodyStartTagInBody(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOBR: {
      nobrStartTagInBody(p, token);
      break;
    }
    case TAG_ID.MATH: {
      mathStartTagInBody(p, token);
      break;
    }
    case TAG_ID.TABLE: {
      tableStartTagInBody(p, token);
      break;
    }
    case TAG_ID.INPUT: {
      inputStartTagInBody(p, token);
      break;
    }
    case TAG_ID.PARAM:
    case TAG_ID.TRACK:
    case TAG_ID.SOURCE: {
      paramStartTagInBody(p, token);
      break;
    }
    case TAG_ID.IMAGE: {
      imageStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BUTTON: {
      buttonStartTagInBody(p, token);
      break;
    }
    case TAG_ID.APPLET:
    case TAG_ID.OBJECT:
    case TAG_ID.MARQUEE: {
      appletStartTagInBody(p, token);
      break;
    }
    case TAG_ID.IFRAME: {
      iframeStartTagInBody(p, token);
      break;
    }
    case TAG_ID.SELECT: {
      selectStartTagInBody(p, token);
      break;
    }
    case TAG_ID.OPTION:
    case TAG_ID.OPTGROUP: {
      optgroupStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOEMBED:
    case TAG_ID.NOFRAMES: {
      rawTextStartTagInBody(p, token);
      break;
    }
    case TAG_ID.FRAMESET: {
      framesetStartTagInBody(p, token);
      break;
    }
    case TAG_ID.TEXTAREA: {
      textareaStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      if (p.options.scriptingEnabled) {
        rawTextStartTagInBody(p, token);
      } else {
        genericStartTagInBody(p, token);
      }
      break;
    }
    case TAG_ID.PLAINTEXT: {
      plaintextStartTagInBody(p, token);
      break;
    }
    case TAG_ID.COL:
    case TAG_ID.TH:
    case TAG_ID.TD:
    case TAG_ID.TR:
    case TAG_ID.HEAD:
    case TAG_ID.FRAME:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.CAPTION:
    case TAG_ID.COLGROUP: {
      break;
    }
    default: {
      genericStartTagInBody(p, token);
    }
  }
}
function bodyEndTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BODY)) {
    p.insertionMode = InsertionMode.AFTER_BODY;
    if (p.options.sourceCodeLocationInfo) {
      const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
      if (bodyElement) {
        p._setEndLocation(bodyElement, token);
      }
    }
  }
}
function htmlEndTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BODY)) {
    p.insertionMode = InsertionMode.AFTER_BODY;
    endTagAfterBody(p, token);
  }
}
function addressEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(tn);
  }
}
function formEndTagInBody(p) {
  const inTemplate = p.openElements.tmplCount > 0;
  const { formElement } = p;
  if (!inTemplate) {
    p.formElement = null;
  }
  if ((formElement || inTemplate) && p.openElements.hasInScope(TAG_ID.FORM)) {
    p.openElements.generateImpliedEndTags();
    if (inTemplate) {
      p.openElements.popUntilTagNamePopped(TAG_ID.FORM);
    } else if (formElement) {
      p.openElements.remove(formElement);
    }
  }
}
function pEndTagInBody(p) {
  if (!p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._insertFakeElement(TAG_NAMES.P, TAG_ID.P);
  }
  p._closePElement();
}
function liEndTagInBody(p) {
  if (p.openElements.hasInListItemScope(TAG_ID.LI)) {
    p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.LI);
    p.openElements.popUntilTagNamePopped(TAG_ID.LI);
  }
}
function ddEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTagsWithExclusion(tn);
    p.openElements.popUntilTagNamePopped(tn);
  }
}
function numberedHeaderEndTagInBody(p) {
  if (p.openElements.hasNumberedHeaderInScope()) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilNumberedHeaderPopped();
  }
}
function appletEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(tn);
    p.activeFormattingElements.clearToLastMarker();
  }
}
function brEndTagInBody(p) {
  p._reconstructActiveFormattingElements();
  p._insertFakeElement(TAG_NAMES.BR, TAG_ID.BR);
  p.openElements.pop();
  p.framesetOk = false;
}
function genericEndTagInBody(p, token) {
  const tn = token.tagName;
  const tid = token.tagID;
  for (let i = p.openElements.stackTop; i > 0; i--) {
    const element = p.openElements.items[i];
    const elementId = p.openElements.tagIDs[i];
    if (tid === elementId && (tid !== TAG_ID.UNKNOWN || p.treeAdapter.getTagName(element) === tn)) {
      p.openElements.generateImpliedEndTagsWithExclusion(tid);
      if (p.openElements.stackTop >= i)
        p.openElements.shortenToLength(i);
      break;
    }
    if (p._isSpecialElement(element, elementId)) {
      break;
    }
  }
}
function endTagInBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.A:
    case TAG_ID.B:
    case TAG_ID.I:
    case TAG_ID.S:
    case TAG_ID.U:
    case TAG_ID.EM:
    case TAG_ID.TT:
    case TAG_ID.BIG:
    case TAG_ID.CODE:
    case TAG_ID.FONT:
    case TAG_ID.NOBR:
    case TAG_ID.SMALL:
    case TAG_ID.STRIKE:
    case TAG_ID.STRONG: {
      callAdoptionAgency(p, token);
      break;
    }
    case TAG_ID.P: {
      pEndTagInBody(p);
      break;
    }
    case TAG_ID.DL:
    case TAG_ID.UL:
    case TAG_ID.OL:
    case TAG_ID.DIR:
    case TAG_ID.DIV:
    case TAG_ID.NAV:
    case TAG_ID.PRE:
    case TAG_ID.MAIN:
    case TAG_ID.MENU:
    case TAG_ID.ASIDE:
    case TAG_ID.BUTTON:
    case TAG_ID.CENTER:
    case TAG_ID.FIGURE:
    case TAG_ID.FOOTER:
    case TAG_ID.HEADER:
    case TAG_ID.HGROUP:
    case TAG_ID.DIALOG:
    case TAG_ID.ADDRESS:
    case TAG_ID.ARTICLE:
    case TAG_ID.DETAILS:
    case TAG_ID.SEARCH:
    case TAG_ID.SECTION:
    case TAG_ID.SUMMARY:
    case TAG_ID.LISTING:
    case TAG_ID.FIELDSET:
    case TAG_ID.BLOCKQUOTE:
    case TAG_ID.FIGCAPTION: {
      addressEndTagInBody(p, token);
      break;
    }
    case TAG_ID.LI: {
      liEndTagInBody(p);
      break;
    }
    case TAG_ID.DD:
    case TAG_ID.DT: {
      ddEndTagInBody(p, token);
      break;
    }
    case TAG_ID.H1:
    case TAG_ID.H2:
    case TAG_ID.H3:
    case TAG_ID.H4:
    case TAG_ID.H5:
    case TAG_ID.H6: {
      numberedHeaderEndTagInBody(p);
      break;
    }
    case TAG_ID.BR: {
      brEndTagInBody(p);
      break;
    }
    case TAG_ID.BODY: {
      bodyEndTagInBody(p, token);
      break;
    }
    case TAG_ID.HTML: {
      htmlEndTagInBody(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formEndTagInBody(p);
      break;
    }
    case TAG_ID.APPLET:
    case TAG_ID.OBJECT:
    case TAG_ID.MARQUEE: {
      appletEndTagInBody(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      genericEndTagInBody(p, token);
    }
  }
}
function eofInBody(p, token) {
  if (p.tmplInsertionModeStack.length > 0) {
    eofInTemplate(p, token);
  } else {
    stopParsing(p, token);
  }
}
function endTagInText(p, token) {
  var _a2;
  if (token.tagID === TAG_ID.SCRIPT) {
    (_a2 = p.scriptHandler) === null || _a2 === void 0 ? void 0 : _a2.call(p, p.openElements.current);
  }
  p.openElements.pop();
  p.insertionMode = p.originalInsertionMode;
}
function eofInText(p, token) {
  p._err(token, ERR.eofInElementThatCanContainOnlyText);
  p.openElements.pop();
  p.insertionMode = p.originalInsertionMode;
  p.onEof(token);
}
function characterInTable(p, token) {
  if (p.openElements.currentTagId !== void 0 && TABLE_STRUCTURE_TAGS.has(p.openElements.currentTagId)) {
    p.pendingCharacterTokens.length = 0;
    p.hasNonWhitespacePendingCharacterToken = false;
    p.originalInsertionMode = p.insertionMode;
    p.insertionMode = InsertionMode.IN_TABLE_TEXT;
    switch (token.type) {
      case TokenType.CHARACTER: {
        characterInTableText(p, token);
        break;
      }
      case TokenType.WHITESPACE_CHARACTER: {
        whitespaceCharacterInTableText(p, token);
        break;
      }
    }
  } else {
    tokenInTable(p, token);
  }
}
function captionStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p.activeFormattingElements.insertMarker();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_CAPTION;
}
function colgroupStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
}
function colStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertFakeElement(TAG_NAMES.COLGROUP, TAG_ID.COLGROUP);
  p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
  startTagInColumnGroup(p, token);
}
function tbodyStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_TABLE_BODY;
}
function tdStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertFakeElement(TAG_NAMES.TBODY, TAG_ID.TBODY);
  p.insertionMode = InsertionMode.IN_TABLE_BODY;
  startTagInTableBody(p, token);
}
function tableStartTagInTable(p, token) {
  if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
    p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
    p._resetInsertionMode();
    p._processStartTag(token);
  }
}
function inputStartTagInTable(p, token) {
  if (isHiddenInput(token)) {
    p._appendElement(token, NS.HTML);
  } else {
    tokenInTable(p, token);
  }
  token.ackSelfClosing = true;
}
function formStartTagInTable(p, token) {
  if (!p.formElement && p.openElements.tmplCount === 0) {
    p._insertElement(token, NS.HTML);
    p.formElement = p.openElements.current;
    p.openElements.pop();
  }
}
function startTagInTable(p, token) {
  switch (token.tagID) {
    case TAG_ID.TD:
    case TAG_ID.TH:
    case TAG_ID.TR: {
      tdStartTagInTable(p, token);
      break;
    }
    case TAG_ID.STYLE:
    case TAG_ID.SCRIPT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.COL: {
      colStartTagInTable(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formStartTagInTable(p, token);
      break;
    }
    case TAG_ID.TABLE: {
      tableStartTagInTable(p, token);
      break;
    }
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      tbodyStartTagInTable(p, token);
      break;
    }
    case TAG_ID.INPUT: {
      inputStartTagInTable(p, token);
      break;
    }
    case TAG_ID.CAPTION: {
      captionStartTagInTable(p, token);
      break;
    }
    case TAG_ID.COLGROUP: {
      colgroupStartTagInTable(p, token);
      break;
    }
    default: {
      tokenInTable(p, token);
    }
  }
}
function endTagInTable(p, token) {
  switch (token.tagID) {
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
        p._resetInsertionMode();
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TBODY:
    case TAG_ID.TD:
    case TAG_ID.TFOOT:
    case TAG_ID.TH:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      break;
    }
    default: {
      tokenInTable(p, token);
    }
  }
}
function tokenInTable(p, token) {
  const savedFosterParentingState = p.fosterParentingEnabled;
  p.fosterParentingEnabled = true;
  modeInBody(p, token);
  p.fosterParentingEnabled = savedFosterParentingState;
}
function whitespaceCharacterInTableText(p, token) {
  p.pendingCharacterTokens.push(token);
}
function characterInTableText(p, token) {
  p.pendingCharacterTokens.push(token);
  p.hasNonWhitespacePendingCharacterToken = true;
}
function tokenInTableText(p, token) {
  let i = 0;
  if (p.hasNonWhitespacePendingCharacterToken) {
    for (; i < p.pendingCharacterTokens.length; i++) {
      tokenInTable(p, p.pendingCharacterTokens[i]);
    }
  } else {
    for (; i < p.pendingCharacterTokens.length; i++) {
      p._insertCharacters(p.pendingCharacterTokens[i]);
    }
  }
  p.insertionMode = p.originalInsertionMode;
  p._processToken(token);
}
var TABLE_VOID_ELEMENTS = /* @__PURE__ */ new Set([TAG_ID.CAPTION, TAG_ID.COL, TAG_ID.COLGROUP, TAG_ID.TBODY, TAG_ID.TD, TAG_ID.TFOOT, TAG_ID.TH, TAG_ID.THEAD, TAG_ID.TR]);
function startTagInCaption(p, token) {
  const tn = token.tagID;
  if (TABLE_VOID_ELEMENTS.has(tn)) {
    if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
      p.activeFormattingElements.clearToLastMarker();
      p.insertionMode = InsertionMode.IN_TABLE;
      startTagInTable(p, token);
    }
  } else {
    startTagInBody(p, token);
  }
}
function endTagInCaption(p, token) {
  const tn = token.tagID;
  switch (tn) {
    case TAG_ID.CAPTION:
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
        p.openElements.generateImpliedEndTags();
        p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
        p.activeFormattingElements.clearToLastMarker();
        p.insertionMode = InsertionMode.IN_TABLE;
        if (tn === TAG_ID.TABLE) {
          endTagInTable(p, token);
        }
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TBODY:
    case TAG_ID.TD:
    case TAG_ID.TFOOT:
    case TAG_ID.TH:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      break;
    }
    default: {
      endTagInBody(p, token);
    }
  }
}
function startTagInColumnGroup(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.COL: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    default: {
      tokenInColumnGroup(p, token);
    }
  }
}
function endTagInColumnGroup(p, token) {
  switch (token.tagID) {
    case TAG_ID.COLGROUP: {
      if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    case TAG_ID.COL: {
      break;
    }
    default: {
      tokenInColumnGroup(p, token);
    }
  }
}
function tokenInColumnGroup(p, token) {
  if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
    p.openElements.pop();
    p.insertionMode = InsertionMode.IN_TABLE;
    p._processToken(token);
  }
}
function startTagInTableBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.TR: {
      p.openElements.clearBackToTableBodyContext();
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_ROW;
      break;
    }
    case TAG_ID.TH:
    case TAG_ID.TD: {
      p.openElements.clearBackToTableBodyContext();
      p._insertFakeElement(TAG_NAMES.TR, TAG_ID.TR);
      p.insertionMode = InsertionMode.IN_ROW;
      startTagInRow(p, token);
      break;
    }
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasTableBodyContextInTableScope()) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
        startTagInTable(p, token);
      }
      break;
    }
    default: {
      startTagInTable(p, token);
    }
  }
}
function endTagInTableBody(p, token) {
  const tn = token.tagID;
  switch (token.tagID) {
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasInTableScope(tn)) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
      }
      break;
    }
    case TAG_ID.TABLE: {
      if (p.openElements.hasTableBodyContextInTableScope()) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
        endTagInTable(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TD:
    case TAG_ID.TH:
    case TAG_ID.TR: {
      break;
    }
    default: {
      endTagInTable(p, token);
    }
  }
}
function startTagInRow(p, token) {
  switch (token.tagID) {
    case TAG_ID.TH:
    case TAG_ID.TD: {
      p.openElements.clearBackToTableRowContext();
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_CELL;
      p.activeFormattingElements.insertMarker();
      break;
    }
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        startTagInTableBody(p, token);
      }
      break;
    }
    default: {
      startTagInTable(p, token);
    }
  }
}
function endTagInRow(p, token) {
  switch (token.tagID) {
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
      }
      break;
    }
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        endTagInTableBody(p, token);
      }
      break;
    }
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasInTableScope(token.tagID) || p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        endTagInTableBody(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TD:
    case TAG_ID.TH: {
      break;
    }
    default: {
      endTagInTable(p, token);
    }
  }
}
function startTagInCell(p, token) {
  const tn = token.tagID;
  if (TABLE_VOID_ELEMENTS.has(tn)) {
    if (p.openElements.hasInTableScope(TAG_ID.TD) || p.openElements.hasInTableScope(TAG_ID.TH)) {
      p._closeTableCell();
      startTagInRow(p, token);
    }
  } else {
    startTagInBody(p, token);
  }
}
function endTagInCell(p, token) {
  const tn = token.tagID;
  switch (tn) {
    case TAG_ID.TD:
    case TAG_ID.TH: {
      if (p.openElements.hasInTableScope(tn)) {
        p.openElements.generateImpliedEndTags();
        p.openElements.popUntilTagNamePopped(tn);
        p.activeFormattingElements.clearToLastMarker();
        p.insertionMode = InsertionMode.IN_ROW;
      }
      break;
    }
    case TAG_ID.TABLE:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(tn)) {
        p._closeTableCell();
        endTagInRow(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML: {
      break;
    }
    default: {
      endTagInBody(p, token);
    }
  }
}
function startTagInSelect(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.OPTION: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.OPTGROUP: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.HR: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.INPUT:
    case TAG_ID.KEYGEN:
    case TAG_ID.TEXTAREA:
    case TAG_ID.SELECT: {
      if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
        p._resetInsertionMode();
        if (token.tagID !== TAG_ID.SELECT) {
          p._processStartTag(token);
        }
      }
      break;
    }
    case TAG_ID.SCRIPT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagInSelect(p, token) {
  switch (token.tagID) {
    case TAG_ID.OPTGROUP: {
      if (p.openElements.stackTop > 0 && p.openElements.currentTagId === TAG_ID.OPTION && p.openElements.tagIDs[p.openElements.stackTop - 1] === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      break;
    }
    case TAG_ID.OPTION: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      break;
    }
    case TAG_ID.SELECT: {
      if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
        p._resetInsertionMode();
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default:
  }
}
function startTagInSelectInTable(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
    p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
    p._resetInsertionMode();
    p._processStartTag(token);
  } else {
    startTagInSelect(p, token);
  }
}
function endTagInSelectInTable(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
    if (p.openElements.hasInTableScope(tn)) {
      p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
      p._resetInsertionMode();
      p.onEndTag(token);
    }
  } else {
    endTagInSelect(p, token);
  }
}
function startTagInTemplate(p, token) {
  switch (token.tagID) {
    // First, handle tags that can start without a mode change
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.SCRIPT:
    case TAG_ID.STYLE:
    case TAG_ID.TEMPLATE:
    case TAG_ID.TITLE: {
      startTagInHead(p, token);
      break;
    }
    // Re-process the token in the appropriate mode
    case TAG_ID.CAPTION:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE;
      p.insertionMode = InsertionMode.IN_TABLE;
      startTagInTable(p, token);
      break;
    }
    case TAG_ID.COL: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_COLUMN_GROUP;
      p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
      startTagInColumnGroup(p, token);
      break;
    }
    case TAG_ID.TR: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE_BODY;
      p.insertionMode = InsertionMode.IN_TABLE_BODY;
      startTagInTableBody(p, token);
      break;
    }
    case TAG_ID.TD:
    case TAG_ID.TH: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_ROW;
      p.insertionMode = InsertionMode.IN_ROW;
      startTagInRow(p, token);
      break;
    }
    default: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_BODY;
      p.insertionMode = InsertionMode.IN_BODY;
      startTagInBody(p, token);
    }
  }
}
function endTagInTemplate(p, token) {
  if (token.tagID === TAG_ID.TEMPLATE) {
    templateEndTagInHead(p, token);
  }
}
function eofInTemplate(p, token) {
  if (p.openElements.tmplCount > 0) {
    p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
    p.activeFormattingElements.clearToLastMarker();
    p.tmplInsertionModeStack.shift();
    p._resetInsertionMode();
    p.onEof(token);
  } else {
    stopParsing(p, token);
  }
}
function startTagAfterBody(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    startTagInBody(p, token);
  } else {
    tokenAfterBody(p, token);
  }
}
function endTagAfterBody(p, token) {
  var _a2;
  if (token.tagID === TAG_ID.HTML) {
    if (!p.fragmentContext) {
      p.insertionMode = InsertionMode.AFTER_AFTER_BODY;
    }
    if (p.options.sourceCodeLocationInfo && p.openElements.tagIDs[0] === TAG_ID.HTML) {
      p._setEndLocation(p.openElements.items[0], token);
      const bodyElement = p.openElements.items[1];
      if (bodyElement && !((_a2 = p.treeAdapter.getNodeSourceCodeLocation(bodyElement)) === null || _a2 === void 0 ? void 0 : _a2.endTag)) {
        p._setEndLocation(bodyElement, token);
      }
    }
  } else {
    tokenAfterBody(p, token);
  }
}
function tokenAfterBody(p, token) {
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function startTagInFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.FRAMESET: {
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.FRAME: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagInFrameset(p, token) {
  if (token.tagID === TAG_ID.FRAMESET && !p.openElements.isRootHtmlElementCurrent()) {
    p.openElements.pop();
    if (!p.fragmentContext && p.openElements.currentTagId !== TAG_ID.FRAMESET) {
      p.insertionMode = InsertionMode.AFTER_FRAMESET;
    }
  }
}
function startTagAfterFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagAfterFrameset(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    p.insertionMode = InsertionMode.AFTER_AFTER_FRAMESET;
  }
}
function startTagAfterAfterBody(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    startTagInBody(p, token);
  } else {
    tokenAfterAfterBody(p, token);
  }
}
function tokenAfterAfterBody(p, token) {
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function startTagAfterAfterFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function nullCharacterInForeignContent(p, token) {
  token.chars = REPLACEMENT_CHARACTER;
  p._insertCharacters(token);
}
function characterInForeignContent(p, token) {
  p._insertCharacters(token);
  p.framesetOk = false;
}
function popUntilHtmlOrIntegrationPoint(p) {
  while (p.treeAdapter.getNamespaceURI(p.openElements.current) !== NS.HTML && p.openElements.currentTagId !== void 0 && !p._isIntegrationPoint(p.openElements.currentTagId, p.openElements.current)) {
    p.openElements.pop();
  }
}
function startTagInForeignContent(p, token) {
  if (causesExit(token)) {
    popUntilHtmlOrIntegrationPoint(p);
    p._startTagOutsideForeignContent(token);
  } else {
    const current = p._getAdjustedCurrentElement();
    const currentNs = p.treeAdapter.getNamespaceURI(current);
    if (currentNs === NS.MATHML) {
      adjustTokenMathMLAttrs(token);
    } else if (currentNs === NS.SVG) {
      adjustTokenSVGTagName(token);
      adjustTokenSVGAttrs(token);
    }
    adjustTokenXMLAttrs(token);
    if (token.selfClosing) {
      p._appendElement(token, currentNs);
    } else {
      p._insertElement(token, currentNs);
    }
    token.ackSelfClosing = true;
  }
}
function endTagInForeignContent(p, token) {
  if (token.tagID === TAG_ID.P || token.tagID === TAG_ID.BR) {
    popUntilHtmlOrIntegrationPoint(p);
    p._endTagOutsideForeignContent(token);
    return;
  }
  for (let i = p.openElements.stackTop; i > 0; i--) {
    const element = p.openElements.items[i];
    if (p.treeAdapter.getNamespaceURI(element) === NS.HTML) {
      p._endTagOutsideForeignContent(token);
      break;
    }
    const tagName = p.treeAdapter.getTagName(element);
    if (tagName.toLowerCase() === token.tagName) {
      token.tagName = tagName;
      p.openElements.shortenToLength(i);
      break;
    }
  }
}

// node_modules/entities/dist/esm/escape.js
var getCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt == null ? (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index) : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    (input, index) => input.codePointAt(index)
  )
);

// node_modules/parse5/dist/serializer/index.js
var VOID_ELEMENTS = /* @__PURE__ */ new Set([
  TAG_NAMES.AREA,
  TAG_NAMES.BASE,
  TAG_NAMES.BASEFONT,
  TAG_NAMES.BGSOUND,
  TAG_NAMES.BR,
  TAG_NAMES.COL,
  TAG_NAMES.EMBED,
  TAG_NAMES.FRAME,
  TAG_NAMES.HR,
  TAG_NAMES.IMG,
  TAG_NAMES.INPUT,
  TAG_NAMES.KEYGEN,
  TAG_NAMES.LINK,
  TAG_NAMES.META,
  TAG_NAMES.PARAM,
  TAG_NAMES.SOURCE,
  TAG_NAMES.TRACK,
  TAG_NAMES.WBR
]);

// node_modules/parse5/dist/index.js
function parseFragment(fragmentContext, html, options2) {
  if (typeof fragmentContext === "string") {
    options2 = html;
    html = fragmentContext;
    fragmentContext = null;
  }
  const parser = Parser.getFragmentParser(fragmentContext, options2);
  parser.tokenizer.write(html, true);
  return parser.getFragment();
}

// src/title-parts.mjs
function normalizeTitleParts(parts, title) {
  if (!Array.isArray(parts) || !parts.length) return [];
  if (!parts.every((p) => p && typeof p.text === "string" && (!p.emphasis || ["italic", "bold"].includes(p.emphasis)))) return [];
  if (parts.map((p) => p.text).join("") !== title) return [];
  return parts.map(({ text: text2, emphasis }) => ({ text: text2, ...emphasis && { emphasis } }));
}
var escape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function cslTitle(title, parts) {
  const safe = normalizeTitleParts(parts, title);
  return safe.length ? safe.map((p) => p.emphasis ? `<${p.emphasis === "italic" ? "i" : "b"}>${escape(p.text)}</${p.emphasis === "italic" ? "i" : "b"}>` : escape(p.text)).join("") : escape(title);
}

// src/records.mjs
var CACHE_SCHEMA = "citation-inator.cache.v1";
var cleanText = (value) => typeof value === "string" ? value.trim() : "";
var normalizeTags = (value) => [...new Set((Array.isArray(value) ? value : []).filter((tag) => typeof tag === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(tag)))];
var stableId = /^[a-z0-9][a-z0-9.-]{0,159}$/;
var doi = (value) => /^10\.\d{4,9}\/[^\s\u0000-\u001f\u007f<>{}]+$/iu.test(value) && !value.split("/").some((part) => part === "." || part === "..");
var kinds = /* @__PURE__ */ new Set(["article-journal", "book", "thesis", "article", "dataset", "software", "webpage", "report", "chapter", "legislation", "document", "artwork", "image"]);
var versions = /* @__PURE__ */ new Set(["version of record", "accepted manuscript", "author preprint", "preprint", "repository dissertation", "dataset", "software release"]);
var integrityStates = /* @__PURE__ */ new Set(["retracted", "corrected", "expression of concern"]);
var locationKinds = /* @__PURE__ */ new Set(["publisher", "repository", "pdf", "preprint", "status", "full-text", "library"]);
function httpsURL(value) {
  try {
    const url = new URL(cleanText(value));
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch {
  }
  return "";
}
function validISBN10(value) {
  return /^\d{9}[\dX]$/.test(value) && [...value].reduce((sum, digit, index) => sum + (digit === "X" ? 10 : Number(digit)) * (10 - index), 0) % 11 === 0;
}
function isbn13CheckDigit(stem) {
  const total = [...stem].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0);
  return (10 - total % 10) % 10;
}
function normalizeIdentifier(input) {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 2048) return null;
  if (doi(raw)) return { scheme: "doi", value: raw.toLowerCase() };
  if (/^https:\/\//i.test(raw)) return normalizeIdentifier(`url:${raw}`);
  const match = /^([a-z]+):(.*)$/i.exec(raw);
  if (!match) return stableId.test(raw) ? { scheme: "local", value: raw } : null;
  const scheme = match[1].toLowerCase();
  let value = match[2].trim();
  switch (scheme) {
    case "doi":
      return doi(value) ? { scheme, value: value.toLowerCase() } : null;
    case "pmid":
      return /^[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "pmcid":
      value = value.toUpperCase();
      return /^PMC[1-9]\d{0,11}$/.test(value) ? { scheme, value } : null;
    case "arxiv":
      value = value.replace(/^arxiv:/i, "");
      return /^(?:\d{4}\.\d{4,5}|[a-z][a-z0-9.-]*\/\d{7})(?:v[1-9]\d*)?$/i.test(value) ? { scheme, value } : null;
    case "issn":
      value = value.replace(/[-\s]/g, "").toUpperCase();
      if (!/^\d{7}[\dX]$/.test(value)) return null;
      if ([...value].reduce((sum, digit, index) => sum + (digit === "X" ? 10 : Number(digit)) * (8 - index), 0) % 11) return null;
      return { scheme, value: value.slice(0, 4) + "-" + value.slice(4) };
    case "isbn": {
      value = value.replace(/[\s-]/g, "").toUpperCase();
      if (/^97[89]\d{10}$/.test(value) && isbn13CheckDigit(value.slice(0, -1)) === Number(value.at(-1))) return { scheme, value };
      if (validISBN10(value)) return { scheme, value };
      return null;
    }
    case "dataset":
    case "software":
      if (doi(value)) return normalizeIdentifier(value);
      return normalizeIdentifier(`url:${value}`);
    case "url": {
      const safe = httpsURL(value);
      if (!safe) return null;
      const { hostname, pathname } = new URL(safe);
      if (["doi.org", "dx.doi.org"].includes(hostname)) {
        try {
          return normalizeIdentifier(`doi:${decodeURIComponent(pathname.slice(1))}`);
        } catch {
          return null;
        }
      }
      if (hostname === "pubmed.ncbi.nlm.nih.gov") {
        const pmid = /^\/(\d+)\/?$/.exec(pathname)?.[1];
        if (pmid) return normalizeIdentifier(`pmid:${pmid}`);
      }
      if (hostname === "pmc.ncbi.nlm.nih.gov" || hostname === "www.ncbi.nlm.nih.gov") {
        const pmc = /^\/(?:pmc\/)?articles\/(PMC\d+)\/?$/.exec(pathname)?.[1];
        if (pmc) return normalizeIdentifier(`pmcid:${pmc}`);
      }
      if (hostname === "arxiv.org") {
        const arxiv = /^\/(?:abs|pdf)\/(.+?)(?:\.pdf)?$/.exec(pathname)?.[1];
        if (arxiv) return normalizeIdentifier(`arxiv:${arxiv}`);
      }
      return { scheme, value: safe };
    }
    case "local":
      return stableId.test(value) ? { scheme, value } : null;
    default:
      return null;
  }
}
var identifierKey = ({ scheme, value }) => `${scheme}:${value}`;
function canonicalIdentifierKey(identifier2) {
  const { scheme, value } = identifier2;
  if (scheme !== "isbn" || !validISBN10(value)) return identifierKey(identifier2);
  const stem = "978" + value.slice(0, -1);
  return `isbn:${stem}${isbn13CheckDigit(stem)}`;
}
function identifierURL(id) {
  if (!id) return "";
  const valid = normalizeIdentifier(identifierKey(id));
  if (!valid) return "";
  const path = valid.value.split("/").map(encodeURIComponent).join("/");
  return {
    doi: `https://doi.org/${path}`,
    pmid: `https://pubmed.ncbi.nlm.nih.gov/${path}/`,
    pmcid: `https://pmc.ncbi.nlm.nih.gov/articles/${path}/`,
    arxiv: `https://arxiv.org/abs/${path}`,
    isbn: `https://search.worldcat.org/search?q=bn%3A${path}`,
    url: valid.value
  }[valid.scheme] || "";
}
function dateParts(value) {
  if (!Array.isArray(value) || !value.length || value.length > 3 || !value.every(Number.isInteger)) return null;
  const [year, month = 1, day = 1] = value;
  if (year < 1e3 || year > 9999 || month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;
  return [...value];
}
function stamp(value) {
  const date = cleanText(value);
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toISOString() : null;
}
function normalizeTextParts(parts) {
  return (Array.isArray(parts) ? parts : []).flatMap((part) => {
    if (typeof part?.text !== "string" || !part.text) return [];
    const href = httpsURL(part.href);
    return [{ text: part.text, ...part.strong === true && { strong: true }, ...["italic", "bold"].includes(part.emphasis) && { emphasis: part.emphasis }, ...href && { href } }];
  });
}
function normalizeChecksum(value) {
  const algorithm = cleanText(value?.algorithm).toLowerCase().replace("-", "");
  const digest = cleanText(value?.value).toLowerCase();
  const lengths = { md5: 32, sha1: 40, sha256: 64, sha384: 96, sha512: 128 };
  if (!lengths[algorithm] || digest.length !== lengths[algorithm] || !/^[a-f0-9]+$/.test(digest)) return null;
  return { algorithm, value: digest, ...cleanText(value.role) && { role: cleanText(value.role) } };
}
function normalizeRecord(input) {
  if (!input || !stableId.test(cleanText(input.id))) throw new TypeError("A stable citation record ID is required.");
  const array = (value) => Array.isArray(value) ? value : [];
  const identifiers = /* @__PURE__ */ new Map();
  for (const item of array(input.identifiers)) {
    if (!item || typeof item.scheme !== "string" || typeof item.value !== "string") continue;
    const id = normalizeIdentifier(identifierKey(item));
    if (id && id.scheme !== "local") identifiers.set(identifierKey(id), id);
  }
  const relatedIdentifiers = array(input.relatedIdentifiers).flatMap((item) => {
    const label = cleanText(item?.label);
    const value = cleanText(item?.value);
    const authority = cleanText(item?.authority);
    return label && value && authority ? [{ label, value, authority }] : [];
  });
  const people = (value) => array(value).flatMap((author) => {
    const literal = cleanText(author?.literal);
    const family = cleanText(author?.family);
    const given = cleanText(author?.given);
    const short = cleanText(author?.short);
    const suffix = cleanText(author?.suffix);
    const id = cleanText(author?.id);
    return literal ? [{ literal, ...short && { short } }] : family ? [{ family, ...given && { given }, ...suffix && { suffix }, ...id && { id } }] : [];
  });
  const authors = people(input.authors), editors = people(input.editors), translators = people(input.translators);
  const locations = array(input.locations).flatMap((location2) => {
    const url = httpsURL(location2?.url);
    const provider = cleanText(location2?.provider);
    const verifiedAt = stamp(location2?.verifiedAt);
    if (!url || !provider || !locationKinds.has(location2.kind)) return [];
    if (["pdf", "preprint"].includes(location2.kind) && !verifiedAt) return [];
    return [{
      kind: location2.kind,
      url,
      provider,
      verifiedAt,
      version: versions.has(location2.version) ? location2.version : null,
      service: /^[a-z0-9][a-z0-9-]{0,63}$/.test(location2.service || "") ? location2.service : null,
      access: ["open", "subscription", "purchase", "loan"].includes(location2.access) ? location2.access : "unknown"
    }];
  });
  const provenance = array(input.provenance).flatMap((source) => {
    const provider = cleanText(source?.provider);
    return provider ? [{
      provider,
      url: httpsURL(source.url),
      retrievedAt: stamp(source.retrievedAt),
      note: cleanText(source.note),
      ...normalizeChecksum(source.checksum) && { checksum: normalizeChecksum(source.checksum) },
      ...Array.isArray(source.checksums) && { checksums: source.checksums.map(normalizeChecksum).filter(Boolean) }
    }] : [];
  });
  const title = cleanText(input.title);
  const citationParts = normalizeTextParts(input.citationParts);
  const abstract = cleanText(input.abstract?.text);
  const abstractSource = cleanText(input.abstract?.source);
  const optional = ["inlineAuthor", "jurisdiction", "number", "session", "legalCitation"];
  const originalIssued = dateParts(input.originalIssued);
  const state = ["resolved", "partial", "unresolved"].includes(input.state) ? input.state : "unresolved";
  const textFields = ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "publisherPlace", "containerAbbreviation", "apaTitle", "original", "note", "citationText", "unresolvedText", "releaseVersion", "medium", "dimensions", "holdingInstitution", "accession", "platform", "rightsHolder", "creatorAttribution", "displayDate"];
  return {
    id: input.id.trim(),
    type: kinds.has(input.type) ? input.type : "document",
    state: title ? state : state === "partial" && citationParts.length ? "partial" : "unresolved",
    ...input.license && cleanText(input.license.name) && {
      license: { name: cleanText(input.license.name), url: httpsURL(input.license.url) }
    },
    ...Array.isArray(input.contributors) && {
      contributors: input.contributors.flatMap((person) => {
        const name3 = cleanText(person?.name), role = cleanText(person?.role);
        return name3 && role ? [{ name: name3, role }] : [];
      })
    },
    title,
    ...Object.fromEntries(["title", "containerTitle"].flatMap((field) => {
      const parts = normalizeTitleParts(input[field + "Parts"], cleanText(input[field]));
      return parts.length ? [[field + "Parts", parts]] : [];
    })),
    authors,
    ...editors.length && { editors },
    ...translators.length && { translators },
    identifiers: [...identifiers.values()],
    locations,
    provenance,
    ...Array.isArray(input.tags) && { tags: normalizeTags(input.tags) },
    ...relatedIdentifiers.length && { relatedIdentifiers },
    citationParts,
    ...input.authorsComplete === false && { authorsComplete: false },
    ...Array.isArray(input.listAnnotationParts) && { listAnnotationParts: normalizeTextParts(input.listAnnotationParts) },
    ...Object.fromEntries(optional.map((field) => [field, cleanText(input[field])]).filter(([, value]) => value)),
    issued: dateParts(input.issued),
    ...originalIssued && { originalIssued },
    online: dateParts(input.online),
    print: dateParts(input.print),
    retrievedAt: stamp(input.retrievedAt),
    version: versions.has(input.version) ? input.version : null,
    integrity: integrityStates.has(input.integrity?.state) && (httpsURL(input.integrity?.url) || cleanText(input.integrity?.source)) ? {
      state: input.integrity.state,
      source: cleanText(input.integrity.source),
      url: httpsURL(input.integrity.url)
    } : null,
    abstract: abstract && abstractSource ? {
      text: abstract,
      source: abstractSource,
      ...input.abstract.kind === "excerpt" && { kind: "excerpt" },
      ...httpsURL(input.abstract.url) && { url: httpsURL(input.abstract.url) }
    } : null,
    ...Object.fromEntries(textFields.map((field) => [field, cleanText(input[field])]))
  };
}
function readCache(input) {
  if (input?.schema !== CACHE_SCHEMA || !Array.isArray(input.records)) throw new TypeError("Unsupported citation cache schema.");
  const byId = /* @__PURE__ */ new Map();
  const byIdentifier = /* @__PURE__ */ new Map();
  for (const raw of input.records) {
    const record = normalizeRecord(raw);
    if (byId.has(record.id)) throw new Error(`Duplicate record ID ${record.id}.`);
    byId.set(record.id, record);
    for (const identifier2 of record.identifiers) {
      const key = canonicalIdentifierKey(identifier2);
      const existing = byIdentifier.get(key);
      if (existing && existing !== record) throw new Error(`Conflicting records for ${key}.`);
      byIdentifier.set(key, record);
      byIdentifier.set(identifierKey(identifier2), record);
    }
  }
  return { byId, byIdentifier };
}
function makeCache(records) {
  return { schema: CACHE_SCHEMA, records: [...readCache({ schema: CACHE_SCHEMA, records }).byId.values()] };
}
function toCSL(record) {
  const id = (scheme) => record.identifiers.find((item) => item.scheme === scheme)?.value;
  const date = (parts) => parts && { "date-parts": [parts] };
  return Object.fromEntries(Object.entries({
    id: record.id,
    type: ["artwork", "image"].includes(record.type) ? "graphic" : record.type,
    title: cslTitle(record.title, record.titleParts),
    author: record.authors.map(({ id: id2, short, ...author }) => author),
    ...record.editors?.length && { editor: record.editors.map(({ id: id2, short, ...person }) => person) },
    ...record.translators?.length && { translator: record.translators.map(({ id: id2, short, ...person }) => person) },
    jurisdiction: record.jurisdiction,
    number: record.number,
    "original-date": date(record.originalIssued),
    "container-title": record.containerTitle && cslTitle(record.containerTitle, record.containerTitleParts),
    publisher: record.publisher,
    "publisher-place": record.publisherPlace,
    volume: record.volume,
    issue: record.issue,
    page: record.pages || record.articleNumber,
    note: [record.note, record.creatorAttribution && "Creator attribution: " + record.creatorAttribution, ...(record.contributors || []).map((person) => person.role + ": " + person.name)].filter(Boolean).join(" \xB7 "),
    medium: record.medium,
    dimensions: record.dimensions,
    archive: record.holdingInstitution,
    archive_location: record.accession,
    "copyright": record.rightsHolder,
    "issued": record.displayDate ? { literal: record.displayDate } : date(record.issued),
    edition: record.edition,
    ...record.releaseVersion && { version: record.releaseVersion },
    DOI: id("doi"),
    ISBN: id("isbn"),
    PMID: id("pmid"),
    PMCID: id("pmcid"),
    URL: identifierURL(record.identifiers.find((item) => item.scheme === "doi")) || id("url") || record.locations.find((item) => ["publisher", "repository"].includes(item.kind))?.url
  }).filter(([, value]) => value));
}

// src/import-limits.mjs
var IMPORT_LIMITS = Object.freeze({ sourceCharacters: 15e5, fileBytes: 18e6, recordCharacters: 3e5, requestBytes: 12e6, references: 300, citationGroups: 300, citedItems: 900, candidateChoices: 3e3, parallelLookups: 4, titleCharacters: 1500, authorsPerRecord: 150, pdfPages: 500, archiveEntryBytes: 24e6 });
function normalizeImportLimits(overrides = {}) {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) throw new TypeError("Supply an import limits object.");
  for (const [key, value] of Object.entries(overrides)) if (!Object.hasOwn(IMPORT_LIMITS, key) || !Number.isSafeInteger(value) || value < 1) throw new TypeError("Use positive integer values for known import limits.");
  return Object.freeze({ ...IMPORT_LIMITS, ...overrides });
}

// src/csl-json.mjs
var types3 = { "article-journal": "article-journal", book: "book", chapter: "chapter", report: "report", thesis: "thesis", webpage: "webpage", dataset: "dataset", software: "software", "paper-conference": "article" };
function fromCSLJSON(input, { recordId, limits: overrides } = {}) {
  const limits = normalizeImportLimits(overrides), diagnostics = [];
  if (JSON.stringify(input)?.length > limits.recordCharacters) throw new RangeError("Selected metadata exceeds the record limit.");
  let item = typeof input === "string" ? JSON.parse(input) : input;
  if (Array.isArray(item)) {
    if (item.length !== 1) throw new TypeError("Select one CSL item.");
    item = item[0];
  }
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new TypeError("Supply one CSL item.");
  const warn = (code, field) => diagnostics.push({ code, field });
  const numericFields = /* @__PURE__ */ new Set(["volume", "issue", "page", "article-number", "edition"]);
  const text2 = (field) => {
    const value = item[field];
    if (typeof value === "string") return value.trim();
    if (numericFields.has(field) && Number.isFinite(value)) return String(value);
    if (value !== void 0 && value !== null) warn("csl-field-review-required", field);
    return "";
  };
  const titleFormatting = {};
  const plain = (field) => {
    const value = text2(field);
    if (!/[<&]/.test(value)) return value;
    const root = parseFragment(value), parts = [];
    let unsupported = false;
    const walk = (node, emphasis) => {
      if (node.nodeName === "#text") {
        parts.push({ text: node.value, ...emphasis && { emphasis } });
        return;
      }
      if (["script", "style", "template"].includes(node.tagName)) {
        unsupported = true;
        return;
      }
      let next = emphasis;
      if (node.tagName) {
        const format9 = { i: "italic", em: "italic", b: "bold", strong: "bold" }[node.tagName];
        if (!format9 || node.attrs?.length || emphasis && emphasis !== format9) unsupported = true;
        else next = format9;
      }
      for (const child of node.childNodes || []) walk(child, next);
    };
    walk(root);
    const title2 = parts.map((p) => p.text).join("").trim();
    if (unsupported) warn("csl-title-formatting-review-required", field);
    while (parts.length && !parts[0].text.trim()) parts.shift();
    while (parts.length && !parts.at(-1).text.trim()) parts.pop();
    if (parts.length) {
      parts[0].text = parts[0].text.trimStart();
      parts.at(-1).text = parts.at(-1).text.trimEnd();
    }
    if (!unsupported && parts.some((p) => p.emphasis)) titleFormatting[field === "title" ? "titleParts" : "containerTitleParts"] = parts;
    return title2;
  };
  const people = (field) => {
    if (item[field] === void 0) return [];
    if (!Array.isArray(item[field]) || item[field].length > limits.authorsPerRecord) throw new TypeError("Use a bounded CSL creator array.");
    return item[field].flatMap((person) => {
      if (!person || typeof person !== "object") {
        warn("csl-creator-review-required", field);
        return [];
      }
      if (typeof person.literal === "string" && person.literal.trim()) return [{ literal: person.literal.trim() }];
      if (typeof person.family !== "string" || !person.family.trim()) {
        warn("csl-creator-review-required", field);
        return [];
      }
      const particles = [person["non-dropping-particle"], person["dropping-particle"]].filter((x) => typeof x === "string" && x.trim());
      if (particles.length) warn("csl-name-particle-review-required", field);
      return [{ family: [...particles, person.family.trim()].join(" "), ...typeof person.given === "string" && { given: person.given.trim() }, ...typeof person.suffix === "string" && { suffix: person.suffix.trim() } }];
    });
  };
  const cslDateParts = (parts) => Array.isArray(parts) ? dateParts(parts.map((value) => typeof value === "string" && /^\d{1,4}$/.test(value) ? Number(value) : value)) : null;
  function date(field) {
    const value = item[field];
    if (!value) return null;
    const parts = value["date-parts"];
    if (Array.isArray(parts) && parts.length === 1 && cslDateParts(parts[0]) && !value.circa && !value.season) return cslDateParts(parts[0]);
    if (field === "issued" && typeof value.literal === "string" && value.literal.trim()) return null;
    warn("csl-date-review-required", field);
    return null;
  }
  const issued = date("issued"), originalIssued = date("original-date");
  const identifiers = [];
  for (const [field, scheme] of [["DOI", "doi"], ["ISBN", "isbn"], ["PMID", "pmid"], ["PMCID", "pmcid"]]) {
    const raw = text2(field);
    if (!raw) continue;
    let candidates = [raw];
    if (scheme === "isbn" && !normalizeIdentifier("isbn:" + raw)) candidates = raw.split(/[,;\n]+/).flatMap((part) => normalizeIdentifier("isbn:" + part.trim()) ? [part.trim()] : part.trim().split(/\s+/));
    for (const value of candidates) {
      const id = normalizeIdentifier(scheme + ":" + value);
      if (id) identifiers.push(id);
      else warn("csl-identifier-review-required", field);
    }
  }
  const url = httpsURL(text2("URL"));
  if (text2("URL") && !url) warn("csl-url-review-required", "URL");
  if (url && !/\/(?:users|groups)\/\d+\/items\//.test(new URL(url).pathname)) identifiers.push({ scheme: "url", value: url });
  else if (url) warn("csl-manager-address-omitted", "URL");
  const authors = people("author"), editors = people("editor"), translators = people("translator");
  for (const field of ["container-author", "collection-editor", "recipient", "interviewer", "composer", "director", "illustrator"]) if (item[field]?.length) warn("csl-creator-role-review-required", field);
  const title = plain("title"), containerTitle = plain("container-title");
  if (!title || title.length > limits.titleCharacters) throw new TypeError("Use a nonempty bounded bibliographic title.");
  if (!Object.hasOwn(types3, item.type)) warn("csl-type-review-required", "type");
  if (!authors.length && !editors.length) warn("csl-missing-creator", "author");
  const sourceDates = item.issued?.["date-parts"];
  const renderedDates = Array.isArray(sourceDates) && sourceDates.length && sourceDates.every((parts) => cslDateParts(parts)) ? sourceDates.map((parts) => parts.join("-")).join("\u2013") : "";
  const literalDate = issued ? "" : typeof item.issued?.literal === "string" ? item.issued.literal.trim() : renderedDates ? (item.issued?.circa ? "circa " : "") + renderedDates + (item.issued?.season ? " (season " + String(item.issued.season) + ")" : "") : "";
  if (issued && item.issued?.literal) warn("csl-date-review-required", "issued");
  if (!issued && !literalDate) warn("csl-missing-date", "issued");
  const record = normalizeRecord({
    id: recordId,
    type: Object.hasOwn(types3, item.type) ? types3[item.type] : "document",
    title,
    containerTitle,
    ...titleFormatting,
    authors,
    editors,
    translators,
    issued,
    originalIssued,
    displayDate: literalDate,
    identifiers,
    publisher: text2("publisher"),
    publisherPlace: text2("publisher-place"),
    volume: text2("volume"),
    issue: text2("issue"),
    pages: text2("page"),
    articleNumber: text2("article-number"),
    edition: typeof item.edition === "number" ? String(item.edition) : text2("edition"),
    releaseVersion: text2("version"),
    state: diagnostics.length ? "partial" : "resolved",
    provenance: [{ provider: "CSL-JSON", note: "Selected bibliographic snapshot; identifiers have not been independently verified." }]
  });
  if (JSON.stringify(record).length > limits.recordCharacters) throw new RangeError("Converted metadata exceeds the record limit.");
  return { schema: "citation-inator.metadata-proposal.v1", record, diagnostics, requiresReview: diagnostics.length > 0 };
}

// node_modules/@noble/hashes/_u64.js
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE ? l : h, isLE);
  view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
var aopts = (value, label) => {
  aobject(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new TypeError("string expected");
  const encoded = new TextEncoder().encode(str);
  try {
    return new Uint8Array(encoded);
  } finally {
    clean(encoded);
  }
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data2) {
    aexists(this);
    abytes(data2);
    const { view, buffer, blockLen } = this;
    const len = data2.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data2);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data2 : data2.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data2.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      buffer.fill(0);
    }
    setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
    this.process(view, 0);
    this.roundClean();
    const oview = out === buffer ? view : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and makes sha256 3x slower (measured).
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  E = 0;
  F = 0;
  G = 0;
  H = 0;
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  _cloneInto(to) {
    (to ||= new this.constructor()).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  constructor() {
    super(32, SHA256_IV);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// src/import-hash.mjs
var importHash = (value) => bytesToHex(sha256(utf8ToBytes(value)));

// src/identifier-resolver.mjs
var NEGATIVE_TTL = 5 * 6e4;

// src/import-enrichment.mjs
var ENRICHMENT_POLICY = "exact-identity-v1";
var norm = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase("en").replace(/[.,:;!?“”‘’"'()\[\]{}—–-]+/gu, " ").replace(/\s+/gu, " ").trim();
var present = (value) => Array.isArray(value) ? value.length > 0 : Boolean(value);
var initials = (value) => norm(value).split(" ").map((word) => word[0]).join("");
function authorEqual(a, b) {
  if (a.id && a.id !== b.id || norm(a.suffix) !== norm(b.suffix)) return false;
  if (a.literal || b.literal) return norm(a.literal || [a.given, a.family].filter(Boolean).join(" ")) === norm(b.literal || [b.given, b.family].filter(Boolean).join(" "));
  if (!a.family || norm(a.family) !== norm(b.family) || !a.given || !b.given) return false;
  const x = norm(a.given).split(" "), y = norm(b.given).split(" ");
  return initials(a.given) === initials(b.given) && x.length === y.length && x.every((word, i) => word === y[i] || word.length === 1 || y[i].length === 1);
}
function compareIdentity(source, candidate) {
  const comparisons = {
    title: present(source.title) && norm(source.title) === norm(candidate.title),
    authors: source.authorsComplete !== false && source.authors?.length > 0 && source.authors.length === candidate.authors?.length && source.authors.every((author, i) => authorEqual(author, candidate.authors[i])),
    year: Boolean(source.issued?.[0] && source.issued[0] === candidate.issued?.[0]),
    type: present(source.type) && source.type !== "document" && source.type === candidate.type && !candidate.version && !candidate.noticeRelations?.length
  };
  for (const key of ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "originalIssued", "language", "format"]) if (present(source[key])) comparisons[key] = present(candidate[key]) && norm(source[key]) === norm(candidate[key]);
  return { policy: ENRICHMENT_POLICY, comparisons, exact: Object.values(comparisons).every(Boolean) };
}
var editionQualifier = /\s*\((?:(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|revised|rev\.?|updated|expanded)\s+(?:ed\.?|edition)\b[^)]*|repr\.?|reprint(?:ed)?(?:\s+\d{4})?)\)\s*\.?$/iu;
function importSearchTitle(source) {
  const title = typeof source === "string" ? source : source?.title;
  return typeof title === "string" ? title.replace(editionQualifier, "").trim() : "";
}
function rankingAuthorEqual(a, b) {
  if (a.id && b.id && a.id !== b.id || a.suffix && b.suffix && norm(a.suffix) !== norm(b.suffix)) return false;
  if (authorEqual(a, b)) return true;
  const family = norm(a.family), otherFamily = norm(b.family);
  if (family && otherFamily) {
    if (family !== otherFamily) return false;
    const x = norm(a.given), y = norm(b.given);
    return !x || !y || initials(x) === initials(y) || x.startsWith(y + " ") || y.startsWith(x + " ");
  }
  const structured = family ? a : otherFamily ? b : null, literal = family ? b.literal : a.literal;
  if (!structured || !literal) return false;
  const name3 = norm(literal), surname = norm(structured.family);
  let given;
  if (name3.endsWith(" " + surname)) given = name3.slice(0, -surname.length).trim();
  else if (name3.startsWith(surname + " ")) given = name3.slice(surname.length).trim();
  else return false;
  const required2 = norm(structured.given);
  return !required2 || initials(required2) === initials(given) || given.startsWith(required2 + " ") || required2.startsWith(given + " ");
}
var publicationType = (type2) => type2 === "book-chapter" ? "chapter" : ["book", "edited-book", "monograph", "reference-book"].includes(type2) ? "book" : ["article-journal", "journal-article"].includes(type2) ? "article-journal" : type2;
var rankingTitle = (value) => norm(importSearchTitle(value));
function assessImportCandidate(source, candidate) {
  const strict = compareIdentity(source, candidate), conflicts = [], differences = [], missing = [], reasons = [];
  const title = rankingTitle(source.title), otherTitle = rankingTitle(candidate.title), a = new Set(title.split(" ").filter(Boolean)), b = new Set(otherTitle.split(" ").filter(Boolean));
  const overlap = [...a].filter((word) => b.has(word)).length, titleSimilarity = a.size && b.size ? overlap / Math.max(a.size, b.size) : 0;
  if (!title || !otherTitle) missing.push("title");
  else if (title !== otherTitle && titleSimilarity < 0.8) conflicts.push("title");
  else if (title !== otherTitle) differences.push("title");
  const authors = source.authors || [], otherAuthors = candidate.authors || [];
  let authorsMatch = false;
  if (!authors.length || !otherAuthors.length) missing.push("authors");
  else {
    authorsMatch = (source.authorsComplete === false ? otherAuthors.length >= authors.length : otherAuthors.length === authors.length) && authors.every((author, index) => rankingAuthorEqual(author, otherAuthors[index]));
    if (!authorsMatch) conflicts.push("authors");
  }
  const expectedType = publicationType(source.type === "document" && (present(source.edition) || editionQualifier.test(source.title || "")) ? "book" : source.type), actualType = publicationType(candidate.type);
  if (!expectedType || expectedType === "document" || !actualType || actualType === "document") missing.push("type");
  else if (expectedType !== actualType) conflicts.push("type");
  const sourceYear = source.issued?.[0], candidateYear = candidate.issued?.[0], yearDistance = sourceYear && candidateYear ? Math.abs(sourceYear - candidateYear) : null;
  if (sourceYear && !candidateYear) missing.push("year");
  else if (yearDistance) differences.push("year");
  for (const key of ["containerTitle", "publisher", "volume", "issue", "pages", "articleNumber", "edition", "originalIssued", "language", "format"]) {
    if (!present(source[key])) continue;
    if (!present(candidate[key])) missing.push(key);
    else if (norm(source[key]) !== norm(candidate[key])) (key === "originalIssued" ? conflicts : differences).push(key);
  }
  if (expectedType === "document" && actualType === "chapter") reasons.push("unconfirmed-chapter");
  if (candidate.version || candidate.noticeRelations?.length) {
    conflicts.push("version");
    reasons.push("version-or-notice");
  }
  if (conflicts.includes("authors")) reasons.push("different-authors");
  if (conflicts.includes("type")) reasons.push(actualType === "chapter" ? "different-work-type-chapter" : "different-work-type");
  if (conflicts.includes("title")) reasons.push("different-title");
  if (yearDistance > 2) reasons.push("distant-year");
  const primary = !conflicts.length && !reasons.includes("unconfirmed-chapter") && authorsMatch && titleSimilarity >= 0.8 && (yearDistance === null || yearDistance <= 2);
  const score = (primary ? 1e3 : 0) + (authorsMatch ? 200 : 0) + (expectedType && expectedType !== "document" && expectedType === actualType ? 100 : 0) + Math.round(titleSimilarity * 100) - (yearDistance === null ? 0 : Math.min(yearDistance, 100)) - conflicts.length * 100;
  return { policy: "candidate-ranking-v1", comparisons: strict.comparisons, exact: strict.exact, conflicts, differences, missing, reasons, primary, score, titleSimilarity, yearDistance };
}

// src/import-sites.mjs
var titleKey = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
var mainTitle = (value) => titleKey(String(value || "").split(/[:：]/, 1)[0]);
function importSiteContext(records, siteCache, limits) {
  if (siteCache === void 0) return { records: [], matches: [] };
  if (siteCache?.schema !== "citation-inator.cache.v1" || !Array.isArray(siteCache.records) || siteCache.records.length > limits.references) throw TypeError("Supply a bounded site citation cache.");
  if (siteCache.records.some((record) => JSON.stringify(record).length > limits.recordCharacters)) throw TypeError("Use shorter site reference records.");
  const site = makeCache(siteCache.records).records;
  if (site.some((record) => record.title.length > limits.titleCharacters || record.authors.length > limits.authorsPerRecord)) throw TypeError("Use shorter site reference fields.");
  let count = 0;
  const matches = records.map((source) => ({ recordId: source.id, candidates: site.flatMap((record) => {
    const assessment = assessImportCandidate(source, record), keys = new Set((source.identifiers || []).map(canonicalIdentifierKey));
    const identifiers = record.identifiers.filter((id) => keys.has(canonicalIdentifierKey(id))).map(canonicalIdentifierKey);
    const sourceMain = mainTitle(source.title), siteMain = mainTitle(record.title);
    const mainTitleMatch = Boolean(sourceMain && sourceMain === siteMain);
    const bibliographic = mainTitleMatch && !assessment.conflicts.includes("authors") && !assessment.missing.includes("authors") && assessment.yearDistance !== null && assessment.yearDistance <= 2;
    if (!identifiers.length && !assessment.primary && !bibliographic) return [];
    const differences = ["title", "authors", "type"].filter((key) => JSON.stringify(source[key]) !== JSON.stringify(record[key]));
    if (++count > limits.candidateChoices) throw RangeError("Too many site identity choices. Use a smaller site cache.");
    return [{ recordId: record.id, title: record.title, requiresReview: true, evidence: { code: identifiers.length ? "import-site-shared-identifier" : "import-site-bibliographic-candidate", sharedIdentifierCount: identifiers.length, mainTitleMatch, differences, assessment } }];
  }) }));
  return { records: site, matches };
}
function allocateImportRecords(records, site, { recordDecisions = [], recordIds, recordId } = {}) {
  if (!Array.isArray(recordDecisions) || recordDecisions.length > records.length) throw TypeError("Supply one site identity decision per source record.");
  if (recordId !== void 0 && typeof recordId !== "function") throw TypeError("recordId must be an allocator function.");
  if (recordIds !== void 0 && (!recordIds || typeof recordIds !== "object" || Array.isArray(recordIds))) throw TypeError("Supply a recordIds object.");
  if (recordIds !== void 0 && recordId !== void 0) throw TypeError("Choose recordIds or recordId.");
  const reused = /* @__PURE__ */ new Map(), sourceIds = new Set(records.map((record) => record.id));
  if (sourceIds.size !== records.length) throw TypeError("Source and completion record IDs must be distinct before allocation.");
  for (const choice of recordDecisions) {
    if (!choice || !sourceIds.has(choice.recordId) || reused.has(choice.recordId) || typeof choice.siteRecordId !== "string" || !site.matches.find((match) => match.recordId === choice.recordId)?.candidates.some((candidate) => candidate.recordId === choice.siteRecordId)) throw TypeError("Choose one proposed site identity for each source record.");
    reused.set(choice.recordId, choice.siteRecordId);
  }
  for (const id of Object.keys(recordIds || {})) if (!sourceIds.has(id) || reused.has(id)) throw TypeError("Allocate IDs only for new source records.");
  const taken = new Set(site.records.map((record) => record.id)), mapping = new Map(reused), output = [...site.records];
  for (const record of records) {
    if (reused.has(record.id)) {
      continue;
    }
    const id = recordId ? recordId(structuredClone(record), { taken: Object.freeze([...taken]) }) : Object.hasOwn(recordIds || {}, record.id) ? recordIds[record.id] : record.id;
    const normalized = typeof id === "string" && normalizeIdentifier(id);
    if (normalized?.scheme !== "local" || normalized.value !== id || taken.has(id)) throw TypeError("New record IDs must be valid and distinct from existing site and allocated IDs.");
    taken.add(id);
    mapping.set(record.id, id);
    output.push({ ...record, id });
  }
  return { mapping, records: output, reusedRecordIds: [...new Set(reused.values())], newRecordIds: output.filter((record) => !site.records.some((existing) => existing.id === record.id)).map((record) => record.id) };
}

// src/bibliography-import.mjs
var schema = "citation-inator.bibliography-review.v1";
function settings(options2) {
  const limits = normalizeImportLimits(options2.limits), format9 = options2.format;
  if (!["csl-json", "bibtex", "ris"].includes(format9)) throw TypeError("Choose csl-json, bibtex or ris explicitly.");
  return { format: format9, limits };
}
function parse9(source, format9, limits) {
  if (typeof source !== "string" || source.length > limits.sourceCharacters || new TextEncoder().encode(source).length > limits.fileBytes) throw RangeError("Supply a bounded bibliography text file.");
  if (!source.trim()) throw TypeError("The bibliography file is empty.");
  const items = format9 === "csl-json" ? JSON.parse(source) : format9 === "bibtex" ? new Cite_default(source, { forceType: "@biblatex/text", generateGraph: false }).data : plugins_exports.input.data(source, "@ris/file").map((raw) => {
    const item = new Cite_default(raw, { forceType: "@ris/record", generateGraph: false }).data[0];
    const book = item.type === "book", series = book || item.type === "report";
    const editorTags = [raw.ED, book ? raw.A3 : series ? void 0 : raw.A2].flat().filter(Boolean);
    if (editorTags.length) item.editor = new Cite_default({ TY: "JOUR", TI: "Creator projection", ED: editorTags }, { forceType: "@ris/old+record", generateGraph: false }).data[0].editor;
    const seriesTags = [series ? raw.A2 : raw.A3].flat().filter(Boolean);
    if (seriesTags.length) item["collection-editor"] = new Cite_default({ TY: "JOUR", TI: "Creator projection", ED: seriesTags }, { forceType: "@ris/old+record", generateGraph: false }).data[0].editor;
    const legacy = new Cite_default(raw, { forceType: "@ris/old+record", generateGraph: false }).data[0], present2 = item.issued?.["date-parts"]?.[0], alternate = legacy.issued?.["date-parts"]?.[0];
    if (alternate && (!present2 || present2[0] === alternate[0] && alternate.length > present2.length)) item.issued = legacy.issued;
    return item;
  });
  if (!Array.isArray(items) || !items.length || items.length > limits.references) throw RangeError("Supply a nonempty bounded bibliography array.");
  return items;
}
function inspectBibliography(source, options2 = {}) {
  const { format: format9, limits } = settings(options2), raw = parse9(source, format9, limits);
  const items = raw.map((input, index) => {
    try {
      const converted = fromCSLJSON(input, { recordId: "bibliography-" + (index + 1), limits });
      if (format9 !== "csl-json") {
        converted.diagnostics.push({ code: "bibliography-format-projection-review", field: format9 });
        converted.requiresReview = true;
      }
      return { index, ...converted };
    } catch (error) {
      return { index, record: null, requiresReview: true, diagnostics: [{ code: "bibliography-item-invalid", message: error.message }] };
    }
  });
  const records = items.filter((i) => i.record).map((i) => i.record), site = importSiteContext(records, options2.siteCache, limits), owners = /* @__PURE__ */ new Map(), conflicts = [];
  for (const record of records) for (const id of record.identifiers) {
    const key = canonicalIdentifierKey(id), prior = owners.get(key);
    if (prior && prior !== record.id) conflicts.push({ code: "bibliography-shared-identifier", recordIds: [prior, record.id], identifier: key });
    else owners.set(key, record.id);
  }
  const reviewId = importHash(JSON.stringify({ source, format: format9, limits, siteCache: options2.siteCache ?? null }));
  return { schema, reviewId, format: format9, items, siteMatches: site.matches, conflicts, requiresReview: items.some((i) => i.requiresReview) || Boolean(conflicts.length) || site.matches.some((m) => m.candidates.length) };
}
function applyBibliographyImport(source, review, { decisions, ...options2 } = {}) {
  const current = inspectBibliography(source, options2);
  if (review?.schema !== schema || review.reviewId !== current.reviewId) throw Error("Bibliography, site cache or limits changed. Inspect again.");
  if (!Array.isArray(decisions) || decisions.length !== current.items.length) throw TypeError("Choose import, reuse or skip for every bibliography row.");
  const choices = /* @__PURE__ */ new Map();
  for (const d of decisions) {
    if (!d || !Number.isSafeInteger(d.index) || d.index < 0 || d.index >= current.items.length || choices.has(d.index) || !["import", "reuse", "skip"].includes(d.action)) throw TypeError("Use one valid decision per row.");
    choices.set(d.index, d);
  }
  const selected = [], recordIds = {}, recordDecisions = [];
  for (const item of current.items) {
    const d = choices.get(item.index);
    if (d.action === "skip") continue;
    if (!item.record) throw TypeError("Invalid bibliography items must be skipped or corrected.");
    if (item.requiresReview && d.acceptDiagnostics !== true) throw TypeError("Review the item diagnostics before importing.");
    selected.push(item.record);
    if (d.action === "reuse") recordDecisions.push({ recordId: item.record.id, siteRecordId: d.siteRecordId });
    else {
      if (typeof d.recordId !== "string") throw TypeError("Allocate a stable host record ID for each new work.");
      recordIds[item.record.id] = d.recordId;
    }
  }
  const site = importSiteContext(selected, options2.siteCache, normalizeImportLimits(options2.limits));
  const allocated = allocateImportRecords(selected, site, { recordIds, recordDecisions });
  if (allocated.records.length > normalizeImportLimits(options2.limits).references) throw RangeError("The combined bibliography exceeds the reference limit. Import fewer entries or increase the configured limit.");
  const cache = makeCache(allocated.records);
  return { cache, newRecordIds: allocated.newRecordIds, reusedRecordIds: allocated.reusedRecordIds, skippedIndexes: current.items.filter((i) => choices.get(i.index).action === "skip").map((i) => i.index) };
}

// src/metadata-refresh.mjs
var fields = ["type", "title", "titleParts", "authors", "editors", "translators", "issued", "originalIssued", "displayDate", "online", "print", "containerTitle", "containerTitleParts", "publisher", "publisherPlace", "volume", "issue", "pages", "articleNumber", "edition", "releaseVersion", "identifiers"];
var equal = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function bounded(raw, limits) {
  if (JSON.stringify(raw)?.length > limits.recordCharacters) throw RangeError("Metadata exceeds the record limit.");
  const r = normalizeRecord(raw);
  if (r.title.length > limits.titleCharacters || [r.authors, r.editors || [], r.translators || []].some((a) => a.length > limits.authorsPerRecord)) throw RangeError("Metadata fields exceed the record limit.");
  return r;
}
function reviewMetadataRefresh(current, incoming, { limits: overrides } = {}) {
  const limits = normalizeImportLimits(overrides), before = bounded(current, limits), after = bounded(incoming, limits);
  const keys = (r) => new Set(r.identifiers.map(canonicalIdentifierKey)), a = keys(before), b = keys(after), shared = [...a].filter((k) => b.has(k));
  const conflictingSchemes = ["doi", "isbn", "pmid", "pmcid"].filter((s) => {
    const x = [...a].filter((k) => k.startsWith(s + ":")), y = [...b].filter((k) => k.startsWith(s + ":"));
    return x.length && y.length && !x.some((k) => y.includes(k));
  });
  const changes = fields.filter((f) => !equal(before[f], after[f])).map((field) => ({ field, current: before[field] ?? null, incoming: after[field] ?? null, requiresDecision: true }));
  return { schema: "citation-inator.metadata-refresh.v1", reviewId: importHash(JSON.stringify({ before, after, limits })), recordId: before.id, identity: { state: conflictingSchemes.length ? "conflict" : shared.length ? "candidate" : "unverified", sharedIdentifiers: shared, conflictingSchemes }, changes };
}
function applyMetadataRefresh(cache, incoming, review, { decisions, confirmIdentity = false, limits: overrides } = {}) {
  const limits = normalizeImportLimits(overrides);
  if (cache?.schema !== "citation-inator.cache.v1" || !Array.isArray(cache?.records) || cache.records.length > limits.references) throw TypeError("Supply a bounded citation cache.");
  for (const r of cache.records) bounded(r, limits);
  const normalized = makeCache(cache.records), current = normalized.records.find((r) => r.id === review?.recordId);
  if (!current) throw Error("The current record is missing. Review again.");
  const next = bounded(incoming, limits), fresh = reviewMetadataRefresh(current, next, { limits });
  if (review?.schema !== fresh.schema || review.reviewId !== fresh.reviewId) throw Error("Current or incoming metadata changed. Review again.");
  if (fresh.identity.state === "conflict") throw Error("Conflicting source identifiers require a separate work or identity review.");
  if (!confirmIdentity) throw Error("Confirm that both snapshots describe the same work.");
  if (!Array.isArray(decisions) || decisions.length !== fresh.changes.length) throw TypeError("Decide every changed metadata field.");
  const chosen = /* @__PURE__ */ new Map();
  for (const d of decisions) {
    if (!d || !fresh.changes.some((c) => c.field === d.field) || chosen.has(d.field) || !["keep", "take", "clear"].includes(d.action)) throw TypeError("Choose keep, take or clear once for every changed field.");
    chosen.set(d.field, d.action);
  }
  const merged = { ...current };
  for (const change of fresh.changes) {
    const action = chosen.get(change.field);
    if (action === "take") merged[change.field] = next[change.field];
    else if (action === "clear") delete merged[change.field];
  }
  for (const field of ["title", "containerTitle"]) if (merged[field + "Parts"]?.length && merged[field + "Parts"].map((p) => p.text).join("") !== merged[field]) throw Error("Review " + field + " and its formatting together; the selected text and runs do not match.");
  const accepted = fresh.changes.filter((c) => chosen.get(c.field) === "take");
  if (accepted.length) {
    const note = "Reviewed incoming metadata fields: " + accepted.map((c) => c.field).join(", ") + ". Snapshot " + fresh.reviewId + ".";
    const sources = next.provenance.length ? next.provenance : [{ provider: "Reviewed metadata snapshot" }];
    merged.provenance = [...current.provenance, ...sources.map((s) => ({ provider: s.provider, url: s.url, retrievedAt: s.retrievedAt || next.retrievedAt, note }))];
  }
  const record = normalizeRecord(merged);
  return { cache: makeCache(normalized.records.map((r) => r.id === current.id ? record : r)), record, decisions: structuredClone(decisions), reviewId: fresh.reviewId };
}

// src/source-maintenance.mjs
var stamp2 = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(+date)) throw TypeError("Supply a valid check date.");
  return date.toISOString();
};
var recordHash = (record) => importHash(JSON.stringify(normalizeRecord(record)));
async function checkSourceLink(input, { url, fetch: fetcher, checkedAt = (/* @__PURE__ */ new Date()).toISOString(), timeoutMs = 8e3, signal } = {}) {
  const record = normalizeRecord(input), target = httpsURL(url);
  const destinations = new Set([...record.identifiers.map(identifierURL), ...record.locations.map((l) => l.url)].filter(Boolean));
  if (!target || !destinations.has(target)) throw TypeError("Choose an HTTPS destination belonging to this reference.");
  if (typeof fetcher !== "function") throw TypeError("Supply an explicitly authorized fetch transport.");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 6e4) throw RangeError("Use a timeout from 1 to 60000 milliseconds.");
  const base = { recordId: record.id, recordHash: recordHash(record), url: target, checkedAt: stamp2(checkedAt), method: "HEAD" };
  if (signal?.aborted) return { ...base, state: "indeterminate", reason: "cancelled" };
  const controller = new AbortController();
  let timer, removeAbort;
  try {
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new DOMException("Timed out", "TimeoutError"));
      }, timeoutMs);
      if (signal) {
        const cancel = () => {
          controller.abort();
          reject(new DOMException("Cancelled", "AbortError"));
        };
        removeAbort = () => signal.removeEventListener("abort", cancel);
        if (signal.aborted) cancel();
        else signal.addEventListener("abort", cancel, { once: true });
      }
    });
    const response = await Promise.race([Promise.resolve().then(() => {
      if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
      return fetcher(target, { method: "HEAD", redirect: "manual", credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal });
    }), deadline]);
    const status = response.status;
    if (status >= 200 && status < 300) return { ...base, state: "reachable", status };
    if (status >= 300 && status < 400) {
      let redirectURL = "";
      try {
        const location2 = response.headers?.get("location");
        if (location2) redirectURL = httpsURL(new URL(location2, target).href);
      } catch {
      }
      return { ...base, state: "redirect", status, ...redirectURL && { redirectURL } };
    }
    return { ...base, status, state: [404, 410].includes(status) ? "not-found" : [401, 403].includes(status) ? "restricted" : status === 429 ? "rate-limited" : [405, 501].includes(status) ? "head-unsupported" : "indeterminate" };
  } catch (error) {
    return { ...base, state: "indeterminate", reason: signal?.aborted ? "cancelled" : ["TimeoutError", "AbortError"].includes(error?.name) ? "timeout" : "transport-error" };
  } finally {
    clearTimeout(timer);
    removeAbort?.();
  }
}
var noticeTypes = { retraction: "retracted", correction: "corrected", "expression-of-concern": "expression of concern" };
function reviewCrossrefNotices(input, envelopes, { checkedAt, limits: overrides } = {}) {
  const limits = normalizeImportLimits(overrides);
  if (!Array.isArray(envelopes) || envelopes.length > limits.references || JSON.stringify(envelopes).length > limits.requestBytes) throw RangeError("Supply bounded Crossref notice metadata.");
  if (JSON.stringify(input)?.length > limits.recordCharacters) throw RangeError("Cited metadata exceeds the record limit.");
  const record = normalizeRecord(input), doi2 = record.identifiers.find((id) => id.scheme === "doi")?.value;
  if (!doi2) throw TypeError("Crossref notice review requires the cited DOI.");
  const proposals = [], diagnostics = [], seen = /* @__PURE__ */ new Set();
  for (let index = 0; index < envelopes.length; index++) {
    const message = envelopes[index]?.message, notice = normalizeIdentifier("doi:" + String(message?.DOI || ""));
    if (!notice || notice.scheme !== "doi" || notice.value === doi2) {
      diagnostics.push({ code: "notice-identity-unconfirmed", index });
      continue;
    }
    const relations = Array.isArray(message["update-to"]) ? message["update-to"] : [];
    let matched = false;
    for (const relation of relations) {
      const target = normalizeIdentifier("doi:" + String(relation?.DOI || ""));
      if (target?.value !== doi2 || !Object.hasOwn(noticeTypes, relation.type)) continue;
      matched = true;
      const key = notice.value + "|" + relation.type + "|" + doi2;
      if (seen.has(key)) continue;
      if (proposals.length >= limits.candidateChoices) throw RangeError("Too many notice proposals.");
      seen.add(key);
      proposals.push({ noticeDOI: notice.value, targetDOI: doi2, integrity: { state: noticeTypes[relation.type], source: "Crossref", url: identifierURL(notice) }, relationType: relation.type, providerSource: typeof relation.source === "string" ? relation.source : "" });
    }
    if (!matched) diagnostics.push({ code: "notice-relation-unconfirmed", index });
  }
  return { schema: "citation-inator.notice-review.v1", recordId: record.id, recordHash: recordHash(record), reviewId: importHash(JSON.stringify({ record, envelopes, limits, checkedAt: checkedAt ? stamp2(checkedAt) : null })), ...checkedAt && { checkedAt: stamp2(checkedAt) }, proposals, diagnostics, coverage: "provider-metadata-only", conclusion: proposals.length ? "review-notices" : "no-confirmed-notice-in-supplied-metadata" };
}
function applyNoticeReview(cache, envelopes, review, { proposalIndex, action = "retain", limits } = {}) {
  const budgets = normalizeImportLimits(limits);
  if (cache?.schema !== "citation-inator.cache.v1" || !Array.isArray(cache?.records) || cache.records.length > budgets.references || cache.records.some((r) => JSON.stringify(r).length > budgets.recordCharacters)) throw RangeError("Supply a bounded citation cache.");
  const current = makeCache(cache.records), record = current.records.find((r) => r.id === review?.recordId);
  if (!record) throw Error("The cited record changed. Review again.");
  const fresh = reviewCrossrefNotices(record, envelopes, { limits, checkedAt: review.checkedAt });
  if (review?.schema !== fresh.schema || review.reviewId !== fresh.reviewId) throw Error("The record or notice evidence changed. Review again.");
  if (!["retain", "accept"].includes(action)) throw TypeError("Choose retain or accept; absence of a notice cannot clear prior integrity evidence.");
  if (action === "retain") return { cache: current, changed: false };
  if (!Number.isSafeInteger(proposalIndex) || !fresh.proposals[proposalIndex]) throw TypeError("Choose one verified notice relation.");
  const proposal = fresh.proposals[proposalIndex], next = normalizeRecord({ ...record, integrity: proposal.integrity, provenance: [...record.provenance, ...record.integrity && JSON.stringify(record.integrity) !== JSON.stringify(proposal.integrity) ? [{ provider: "Prior integrity decision", url: record.integrity.url, retrievedAt: fresh.checkedAt, note: "Explicitly replaced " + record.integrity.state + " flag from " + record.integrity.source + "." }] : [], { provider: "Crossref", url: proposal.integrity.url, retrievedAt: fresh.checkedAt, note: `Reviewed ${proposal.relationType} notice ${proposal.noticeDOI} targeting ${proposal.targetDOI}.` }] });
  return { cache: makeCache(current.records.map((r) => r.id === next.id ? next : r)), changed: true, record: next };
}

// src/bibliography-export.mjs
var formats5 = {
  "csl-json": { extension: "json", mimeType: "application/vnd.citationstyles.csl+json" },
  bibtex: { extension: "bib", mimeType: "application/x-bibtex" },
  ris: { extension: "ris", mimeType: "application/x-research-info-systems" }
};
var bibTypes = { "article-journal": "article", article: "misc", book: "book", chapter: "incollection", report: "techreport" };
var risTypes = { "article-journal": "JOUR", article: "GEN", book: "BOOK", chapter: "CHAP", report: "RPRT", thesis: "THES", webpage: "ELEC", dataset: "DATA", software: "COMP", artwork: "ART", image: "ART", legislation: "STAT", document: "GEN" };
var tex = (value) => String(value ?? "").replace(/[\\{}%&#_$~^]/g, (c) => ({ "\\": "\\textbackslash{}", "{": "\\{", "}": "\\}", "%": "\\%", "&": "\\&", "#": "\\#", "_": "\\_", "$": "\\$", "~": "\\textasciitilde{}", "^": "\\textasciicircum{}" })[c]).replace(/\s+/gu, " ").trim();
var line = (value) => String(value).replace(/[\u0000-\u001f\u007f\u0085\u2028\u2029]+/gu, " ").trim();
var name2 = (person) => person.literal ? `{${tex(person.literal)}}` : ["{" + tex(person.family) + "}", person.suffix && "{" + tex(person.suffix) + "}", person.given && "{" + tex(person.given) + "}"].filter(Boolean).join(", ");
function exportBibliography(cache, { format: format9 = "csl-json" } = {}) {
  if (!Object.hasOwn(formats5, format9)) throw new TypeError("Choose csl-json, bibtex or ris.");
  const records = [...readCache(cache).byId.values()], diagnostics = [];
  const warn = (record, code, field) => diagnostics.push({ code, recordId: record.id, ...field && { field } });
  const items = records.map((record) => {
    if (record.state === "unresolved" || !record.title) warn(record, "export-incomplete-record");
    if (record.citationParts?.length || record.citationText) warn(record, "export-custom-reference-omitted", "citationParts");
    const csl = toCSL(record);
    delete csl.note;
    const explicitURL = record.identifiers.find((id) => id.scheme === "url")?.value;
    if (explicitURL) csl.URL = explicitURL;
    if (record.state === "partial") warn(record, "export-record-review-required");
    if (record.contributors?.length || record.creatorAttribution) warn(record, "export-contributor-detail-omitted", "contributors");
    for (const scheme of ["doi", "isbn", "pmid", "pmcid", "url"]) if (record.identifiers.filter((id) => id.scheme === scheme).length > 1) warn(record, "export-additional-identifiers-omitted", scheme);
    return { record, csl };
  });
  let text2;
  if (format9 === "csl-json") text2 = JSON.stringify(items.map(({ csl }) => csl), null, 2) + "\n";
  else if (format9 === "bibtex") text2 = items.map(({ record: r, csl: c }) => {
    const type2 = bibTypes[r.type] || "misc";
    if (type2 === "misc") warn(r, "export-type-fallback", "type");
    for (const [field, value] of [["translator", r.translators?.length], ["version", r.releaseVersion], ["original-date", r.originalIssued], ["issued", r.displayDate], ["PMID", c.PMID], ["PMCID", c.PMCID], ["medium", r.medium], ["archive", r.holdingInstitution], ["number", r.number]]) if (value) warn(r, "export-field-omitted", field);
    if (r.authors.length && r.editors?.length) warn(r, "export-creator-role-reader-dependent", "editor");
    const people = (list6) => list6?.map(name2).join(" and ");
    const fields2 = {
      title: `{${tex(r.title)}}`,
      author: people(r.authors),
      editor: people(r.editors),
      [r.type === "chapter" ? "booktitle" : "journal"]: tex(r.containerTitle),
      publisher: tex(r.publisher),
      address: tex(r.publisherPlace),
      year: r.issued?.[0],
      month: r.issued?.[1],
      volume: tex(r.volume),
      number: tex(r.issue),
      pages: tex(r.pages || r.articleNumber),
      edition: tex(r.edition),
      doi: tex(c.DOI || ""),
      isbn: tex(c.ISBN || ""),
      url: tex(c.URL || "")
    };
    if (r.issued?.length > 2) warn(r, "export-field-omitted", "issued.day");
    if (r.type === "report") {
      fields2.institution = fields2.publisher;
      delete fields2.publisher;
    }
    if (r.titleParts?.length || r.containerTitleParts?.length) warn(r, "export-title-formatting-omitted", "title");
    return `@${type2}{${r.id},
${Object.entries(fields2).filter(([, v]) => v !== void 0 && v !== "").map(([key, v]) => `  ${key} = {${v}}`).join(",\n")}
}`;
  }).join("\n\n") + (records.length ? "\n" : "");
  else text2 = items.map(({ record: r, csl: c }) => {
    const lines = [], add7 = (tag, value) => {
      if (value !== void 0 && value !== null && value !== "") lines.push(`${tag}  - ${line(value)}`);
    };
    const type2 = risTypes[r.type];
    add7("TY", type2 || "GEN");
    if (!type2 || type2 === "GEN") warn(r, "export-type-fallback", "type");
    add7("ID", r.id);
    add7("TI", r.title);
    for (const person of r.authors) add7("AU", person.literal || [person.family, person.given].filter(Boolean).join(", "));
    for (const person of r.editors || []) add7(r.type === "book" ? "A3" : "A2", person.literal || [person.family, person.given].filter(Boolean).join(", "));
    if ([...r.authors, ...r.editors || []].some((p) => p.literal || p.suffix)) warn(r, "export-creator-structure-reader-dependent", "creators");
    for (const [field, value] of [["translator", r.translators?.length], ["original-date", r.originalIssued], ["version", r.releaseVersion], ["PMID", c.PMID], ["PMCID", c.PMCID], ["medium", r.medium], ["archive", r.holdingInstitution], ["number", r.number]]) if (value) warn(r, "export-field-omitted", field);
    add7(r.issued?.length > 1 ? "Y1" : "PY", r.issued?.join("/") || r.displayDate);
    add7(r.type === "chapter" ? "T2" : "JO", r.containerTitle);
    add7("PB", r.publisher);
    add7("CY", r.publisherPlace);
    add7("VL", r.volume);
    add7("IS", r.issue);
    add7("ET", r.edition);
    const pages = r.pages || r.articleNumber, range = /^(\d+)\s*[-–—]\s*(\d+)$/.exec(pages);
    add7("SP", range ? range[1] : pages);
    if (range) add7("EP", range[2]);
    add7("DO", c.DOI);
    add7("SN", c.ISBN);
    add7("UR", c.URL);
    if (r.titleParts?.length || r.containerTitleParts?.length) warn(r, "export-title-formatting-omitted", "title");
    lines.push("ER  - ");
    return lines.join("\r\n");
  }).join("\r\n\r\n") + (records.length ? "\r\n" : "");
  return { format: format9, ...formats5[format9], text: text2, recordCount: records.length, diagnostics };
}
export {
  applyBibliographyImport,
  applyMetadataRefresh,
  applyNoticeReview,
  checkSourceLink,
  exportBibliography,
  inspectBibliography,
  reviewCrossrefNotices,
  reviewMetadataRefresh
};
