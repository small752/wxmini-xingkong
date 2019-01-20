const stringUtil = require('stringutil.js')
/**
 * 将日期格式化
 * formatStr: yyyy MM DD HH mm ss
 */
function formatTime(date, formatStr) {
  if(date == undefined) {
    return '';
  }

  let fullYearStr = stringUtil.leftFill(date.getFullYear().toString(), 4, '0');
  let fullMonthStr = stringUtil.leftFill((date.getMonth() + 1).toString(), 2, '0');
  let fullDayStr = stringUtil.leftFill(date.getDate().toString(), 2, '0');
  let fullHourStr = stringUtil.leftFill(date.getHours().toString(), 2, '0');
  let fullMinStr = stringUtil.leftFill(date.getMinutes().toString(), 2, '0');
  let fullSecStr = stringUtil.leftFill(date.getSeconds().toString(), 2, '0');

  return formatStr.replace('yyyy', fullYearStr).replace('MM', fullMonthStr).replace('DD', fullDayStr).replace('HH', fullHourStr).replace('mm', fullMinStr).replace('ss', fullSecStr)
}

module.exports = {
  formatTime: formatTime
}