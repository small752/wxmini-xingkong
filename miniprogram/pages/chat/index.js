// miniprogram/pages/chat/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [],// 聊天内容列表
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})