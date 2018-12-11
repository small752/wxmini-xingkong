// miniprogram/pages/bottles/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 100,
    dataSource: [],
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
    let dataSource = []
    for(let i = 0; i < this.data.count; i++) {
      dataSource.push({
        key: Math.floor(1000 + Math.random() * 1000) + '' + i,
        title: '飒飒法发发发撒发撒哇' + i,
      })
    }

    this.setData({ dataSource })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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