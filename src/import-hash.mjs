// Portable SHA-256 keeps review/source identities identical in Node and browser hosts.
import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex,utf8ToBytes} from '@noble/hashes/utils.js';
export const importHash=value=>bytesToHex(sha256(utf8ToBytes(value)));
