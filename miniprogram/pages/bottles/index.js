// miniprogram/pages/bottles/index.js
const app = getApp()
const dateutil = require('../../util/dateutil.js')
const arrutil = require('../../util/arrutil.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 100,
    dataSource: [],

    historyInit: false,// 历史记录初始化完成
    fileSystemManager: undefined, // 文件操作工具
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let me = this;
    // 从文件中查询之前的聊天记录
    me.initHistoryRecord();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 读取文件中的历史记录
   */
  initHistoryRecord: function () {
    let me = this;

    let fs = me.data.fileSystemManager;
    if (fs == undefined) {
      fs = wx.getFileSystemManager();
    }

    //  保证当前瓶子的目录已存在
    let rootDirPath = `${wx.env.USER_DATA_PATH}/bottle/record`;

    try {
      fs.accessSync(rootDirPath)
    } catch (e) {
      let dir0 = `${wx.env.USER_DATA_PATH}`;
      let dir1 = '/bottle';
      let dir2 = '/record';
      me.touchFileDir(fs, dir0 + dir1);
      me.touchFileDir(fs, dir0 + dir1 + dir2);
    }

    //  读取文件中所有瓶子
    let bottlesDirArr = fs.readdirSync(rootDirPath);
    let bottlesArr = [];
    bottlesDirArr && bottlesDirArr.length > 0 && bottlesDirArr.map(function(dirItem, dirIndex) {
      let bottleInfoOld = me.getBottleInfoOnStorage(dirItem);
      if (bottleInfoOld != undefined) {
        //  将漂流瓶加入到界面列表
        me.pushBottleToDatasource(bottleInfoOld)
      }
    })

    me.setData({
      historyInit: true,
    })
  },

  /**
   * 检测某个目录是否存在  不存在则创建
   */
  touchFileDir: function (fs, dirPath) {
    try {
      fs.accessSync(dirPath)
    } catch (e) {
      fs.mkdirSync(dirPath, true)
    }
  },

  /**
   * 从缓存中读取漂流瓶信息
   */
  getBottleInfoOnStorage: function (bottleId) {
    let me = this;
    let _bottle_infos = wx.getStorageSync('_bottle_infos') || {};
    let bottleInfo = _bottle_infos[bottleId];
    if (bottleInfo == undefined) {
      me.queryBottleInfo(bottleId)
    }
    return bottleInfo;
  },

  /**
   * 查询漂流瓶信息并保存到缓存
   */
  queryBottleInfo: function (bottleId) {
    let me = this;

    let postUrl = app.globalData.bizUrl + '/bt/bottle/talkDetail';
    let params = {
      bottleId
    }
    app.requestServer(postUrl, params, function (res) {
      
      let resData = (res && res.data) || {};
      let authorId = resData.authorId;
      let authorName = resData.authorName;
      let authorHeadimg = resData.authorHeadimg;
      let lastTime = resData.lastTime;
      let lastMessage = resData.lastMessage;
      let createTime = resData.bottleCreatetime;

      let lastTimeDate = lastTime && new Date(lastTime);
      let lastTimeStr = dateutil.formatTime(lastTimeDate, 'yyyy-MM-DD HH:mm:ss');
      let bottleInfo = {
        bottleId,
        authorId,
        authorName,
        authorHeadimg,
        createTime,
        lastTime: lastTimeStr,
        lastMessage,
      }

      //  存入缓存
      let _bottle_infos = wx.getStorageSync('_bottle_infos') || {};
      _bottle_infos[bottleId] = bottleInfo;
      wx.setStorageSync('_bottle_infos', _bottle_infos)

      me.pushBottleToDatasource(bottleInfo)
    });
  },

  /**
   * 将漂流瓶加入到界面列表
   * 经过排序 把最新消息放到前面
   */
  pushBottleToDatasource: function(bottleInfo) {
    let me = this;
    let dataSourceOld = me.data.dataSource;
    //  遍历当前列表 是否已经存在
    let dataSourceNew = [];
    let hasExist = false;

    dataSourceOld && dataSourceOld.map(function(oldItem, oldIndex) {
      if (oldItem.bottleId == bottleInfo.bottleId) {
        hasExist = true;
        dataSourceNew.push(bottleInfo)
      } else {
        dataSourceNew.push(oldItem)
      }
    })

    if (!hasExist) {
      dataSourceNew.push(bottleInfo)
    }

    //  根据最新消息时间排序
    let dataSourceSort = arrutil.sort(dataSourceNew, 'lastTime', 'desc');
    me.setData({
      dataSource: dataSourceSort,
    })
  },

  /**
   * 瓶子列表的某个瓶子点击时
   */
  bottleClick: function (event) {

    let e_target = event.currentTarget;
    let dataset = e_target && e_target.dataset;
    let bottleId = dataset && dataset.bottleid;

    let dataSource = this.data.dataSource;
    let bottleObj = {};

    dataSource && dataSource.map(function(item, index) {
      if (item.bottleId == bottleId) {
        bottleObj = {
          ...item
        }
      }
    })
    let chating = {
      userId: bottleObj.authorId,
      userName: bottleObj.authorName,
      headimg: bottleObj.authorHeadimg,
      bottleId: bottleObj.bottleId,
    }
    app.globalData.chating = chating;
    setTimeout(function () {
      wx.navigateTo({
        url: '/pages/chat/index'
      });
    }, 200)
  },

  /**
   * 格式化上一次消息时间
   */
  parseLasttime: function(timeStr) {
    console.info('timeStr', timeStr)
  },
})