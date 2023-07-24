export function Base32Encode(input) {
  const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const paddingChar = '=';

  // Convert UTF-8 string to byte array
  const utf8Bytes = [];
  
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    if (charCode < 128) {
      utf8Bytes.push(charCode);
    } else if (charCode < 2048) {
      utf8Bytes.push((charCode >> 6) | 192);
      utf8Bytes.push((charCode & 63) | 128);
    } else {
      utf8Bytes.push((charCode >> 12) | 224);
      utf8Bytes.push(((charCode >> 6) & 63) | 128);
      utf8Bytes.push((charCode & 63) | 128);
    }
  }

  // Base32 encode byte array
  let output = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < utf8Bytes.length; i++) {
    value = (value << 8) | utf8Bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += base32Alphabet[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }

  if (bits > 0) {
    value <<= (5 - bits);
    output += base32Alphabet[value & 0x1f];
  }

  // Add padding if necessary
  while (output.length % 8 !== 0) {
    output += paddingChar;
  }

  return output;
}