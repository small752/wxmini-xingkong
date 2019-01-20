
/**
 * 将对象数组根据某个属性排序
 * arr: 要排序的数组
 * sortField：数组对象中的排序属性
 * sortDir: 排序方向  desc倒序 asc正序
 */
function sort(arr, sortField, sortDir ='asc') {
  
  if(arr == undefined) {
    return undefined;
  }

  if(sortField == undefined || sortField == '') {
    return arr;
  }

  if(arr.length <= 1) {
    return arr;
  }

  //定义中间值的索引
  var index = Math.floor(arr.length / 2);
  //取到中间值
  var temp = arr.splice(index, 1);
  //定义左右部分数组
  var left = [];
  var right = [];
  for (var i = 0; i < arr.length; i++) {
    //如果元素比中间值小，那么放在左边，否则放右边
    if (arr[i][sortField] < temp[0][sortField]) {
      if (sortDir == 'asc') {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    } else {
      if (sortDir == 'asc') {
        right.push(arr[i]);
      } else {
        left.push(arr[i]);
      }
    }
  }
  return sort(left, sortField, sortDir).concat(temp, sort(right, sortField, sortDir));
}

module.exports = {
  sort,
}