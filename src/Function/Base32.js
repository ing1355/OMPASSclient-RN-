const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const paddingChar = '=';

export function Base32Encode(input) {
  let output = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < input.length; i++) {
    value = (value << 8) | input[i];
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