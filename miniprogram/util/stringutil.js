
/**
 * 向左侧填充字符使字符串达到一定长度
 */
function leftFill(str='', len, filling) {
  if (str.length >= len) {
    return str;
  }

  for(let i = 0; str.length < len; i++) {
    str = filling + str;
  }
  return str;
}

/**
 * 向右侧填充字符使字符串达到一定长度
 */
function rightFill(str = '', len, filling) {
  if (str.length >= len) {
    return str;
  }

  for (let i = 0; str.length < len; i++) {
    str = str + filling;
  }
  return str;
}

module.exports = {
  leftFill,
  rightFill,
}