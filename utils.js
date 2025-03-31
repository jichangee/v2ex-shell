export function wrapText(text, len = 40) {
  let result = '';
  let index = 0
  text.split('').forEach((char) => {
    if (char === '\n') {
      index = 0
    }
    if (index % len === 0 && index !== 0) {
      result += '\n';
    }
    result += char;
    index++;
  });
  return result;
}


