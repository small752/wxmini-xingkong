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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    let globalData = app.globalData;
    console.info('globalData', globalData)
    wx.setNavigationBarTitle({
      title:  '陈芬',
      success: function() {
        console.info('导航设置成功')
      }
    })

    let dataSource = [];
    for(let i = 0; i < 20; i++) {

      let textWordMap = '颠覆国家开放不能带来改变风格南京南京看发你的健康肤色打击开发商的艰苦奋斗空间';
      let textCount = Math.floor(Math.random() * 50) + 5;

      let contentText = '';
      for (let tn = 0; tn < textCount; tn++) {
        contentText += textWordMap[Math.floor(Math.random() * textWordMap.length)];
      }

      dataSource.push({
        key: Math.floor(1000 + Math.random() * 1000) + '' + i,
        type: Math.floor(Math.random() * 2) == 0 ? 'me' : 'other',
        content: contentText,
      })
    }

    this.setData({dataSource})
  },

  /**
   * 点击发送消息
   */
  handleOnSendMsg: function () {
    let inputMsg = this.data.inputMsg;
    console.info('inputMsg', inputMsg)
    app.sendSocketMessage(inputMsg)
    this.setData({ inputMsg: '' });
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