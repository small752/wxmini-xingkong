// miniprogram/pages/chat/index.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [],// 聊天内容列表
    loading: false,
    inputMsg: '',
    chatingObj: {},// 当前聊天对象
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    let globalData = app.globalData;
    let chatingObj = globalData.chating || {};

    wx.setNavigationBarTitle({
      title: chatingObj.userName || '匿名',
    })

    this.setData({ chatingObj })

    // 从文件中查询之前的聊天记录

    // 从本地缓存中读取未读的消息
    
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

})