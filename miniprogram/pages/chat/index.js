// miniprogram/pages/chat/index.js

const app = getApp()
const dateutil = require('../../util/dateutil.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [],// 聊天内容列表
    loading: false,
    inputMsg: '',
    chatingObj: {
      userId: '',//对方的用户编号
      userName: '', //对方名称
      headimg: '', //对方头像
      bottleId: '',//当前聊天瓶子编号
      myHeadimg: '',// 我的头像
    },// 当前聊天对象
    msgScanTime: undefined,// 消息扫描定时器

    chatInit: false,// 消息是否初始化完成(先读取文件中的历史消息)

    fileSystemManager: undefined,// 操作文件工具
    bottleFileDirPath: '',// 当前瓶子的文件目录
    todayFilePath: '',//保存当天消息的文件路径
    recordSplitStr: '|<end>|',// 记录到文件中的消息分隔符
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let me = this;
    let globalData = app.globalData;
    let chatingObj = globalData.chating || {};
    chatingObj.myHeadimg = globalData.wxUserInfo && globalData.wxUserInfo.avatarUrl;

    wx.setNavigationBarTitle({
      title: chatingObj.userName || '匿名',
    })

    me.setData({ chatingObj })

    // 从文件中查询之前的聊天记录
    me.initHistoryRecord();

    //  开启定时器不停扫描消息列表
    me.setData({
      msgScanTime: setInterval(function () {
        me.parseMsgAndShow();
      }, 500),
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.msgScanTime != undefined) {
      clearInterval(this.data.msgScanTime)
    }
  },

  /**
   * 生命周期函数--页面卸载时
   * 取消消息扫描监听
   */
  onUnload: function() {
    if (this.data.msgScanTime != undefined) {
      clearInterval(this.data.msgScanTime)
    }
  },

  /**
   * 点击发送消息
   */
  handleOnSendMsg: function () {
    let me = this;
    let chatingObj = this.data.chatingObj || {};
    let message = this.data.inputMsg;
    if (message && message.length > 0) {
      app.createSocketMessage('chat_to_one', chatingObj.userId, 'text', chatingObj.bottleId, message)

      setTimeout(function() {
        me.setData({ inputMsg: '' });
      }, 100)
    }    
  },

  /**
   * 发送内容变更时
   */
  handleOnSendMsgChange: function (event) {
    let detail = event.detail;
    let value = detail && detail.value;
    this.setData({ inputMsg: value});
  },

  /**
   * 消息初始化  读取历史消息
   */
  initHistoryRecord: function() {
    // 初始化当前瓶子的持久化文件目录
    let me = this;
    let chatingObj = this.data.chatingObj || {};
    let chatingBottleId = chatingObj.bottleId || '-1';
    let todayStr = dateutil.formatTime(new Date(), 'yyyyMMDD');

    let fs = me.data.fileSystemManager;
    if (fs == undefined) {
      fs = wx.getFileSystemManager();
    }

    //  保证当前瓶子的目录已存在
    let bottleFileDirPath = `${wx.env.USER_DATA_PATH}/bottle/record/${chatingBottleId}`;
    
    try {
      fs.accessSync(bottleFileDirPath)
    } catch (e) {
      let dir0 = `${wx.env.USER_DATA_PATH}`;
      let dir1 = '/bottle';
      let dir2 = '/record';
      let dir3 = `/${chatingBottleId}`;
      me.createFileDir(fs, dir0 + dir1);
      me.createFileDir(fs, dir0 + dir1 + dir2);
      me.createFileDir(fs, dir0 + dir1 + dir2 + dir3);
    }

    // 查看当天的文件是否存在 不存在则chuangj
    let todayFilePath = bottleFileDirPath + `/${todayStr}.txt`;
    try {
      fs.accessSync(todayFilePath)
    } catch (e) {
      fs.writeFileSync(todayFilePath, '', 'utf-8')
    }

    //  遍历文件 读取历史聊天记录
    let files = fs.readdirSync(bottleFileDirPath);
    let dataSource = [];
    for (let i = 0; i < files.length; i++) {
      let fileItemPath = `${bottleFileDirPath}/${files[i]}`;
      let fileItemContent = fs.readFileSync(fileItemPath, 'utf-8');
      if (fileItemContent && fileItemContent.length > 0) {
        let recordArr = fileItemContent.split(me.data.recordSplitStr);
        recordArr && recordArr.length > 0 && recordArr.map(function(ritem, rindex) {
          try {
            ritem && ritem.length > 0 && ritem.trim().length > 0 && dataSource.push(JSON.parse(ritem))
          } catch(err) {
            console.info('读取文件内容出错啦', err)
          }
        })
      }
    }

    this.setData({
      fileSystemManager: fs,
      bottleFileDirPath,
      todayFilePath,
      dataSource,
      chatInit: true,
    });//历史消息读取完成
  },

  /**
   * 为某天生成一个文件用来记录历史聊天记录
   */
  createFileDir: function(fs, dirPath) {
    try{
      fs.accessSync(dirPath)
    } catch(e) {
      fs.mkdirSync(dirPath, true)
    } 
  },

  /**
   * 格式化消息并显示
   */
  parseMsgAndShow: function() {
    let me = this;
    let chatRecord = app.globalData.chatRecord;
    let chatingObj = this.data.chatingObj || {};
    let chatingBottleId = chatingObj.bottleId || '-1';

    if (this.data.chatInit) {
      let unReadMsgs = chatRecord[chatingBottleId];
      if (unReadMsgs && unReadMsgs.length > 0) {
        let dataSource = me.data.dataSource;
        for (let i = 0; i < unReadMsgs.length; i++) {
          let unReadMsgItem = unReadMsgs[i];
          dataSource.push(unReadMsgItem);
          // 将消息保存到文件记录到历史聊天记录
          me.saveMsgToFile(unReadMsgItem);
        }
        me.setData({ dataSource })
      }
      chatRecord[chatingBottleId] = [];
    }
  },

  /**
   * 将消息持久化到文件
   */
  saveMsgToFile: function (unReadMsgItem) {
    let me = this;
    let chatingObj = this.data.chatingObj || {};
    let chatingBottleId = chatingObj.bottleId || '-1';

    // 当天存储的文件路径
    let todayFilePath = me.data.todayFilePath;

    let fs = me.data.fileSystemManager;
    if (fs == undefined) {
      fs = wx.getFileSystemManager();
    }

    fs.appendFileSync(todayFilePath, JSON.stringify(unReadMsgItem) + me.data.recordSplitStr + '\n', 'utf-8');    
  },

})