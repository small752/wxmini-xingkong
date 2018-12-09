//app.js
App({
  globalData: {
    baseUrl: 'https://www.yana.site/appweb',
    wxUserInfo: {},
    wxUserLocation: {},
  },

  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
  },

  /**
   * 异步json请求
   */
  requestServerJson: function (url, params = {}, suc, fail, showLoading=true) {

    let global_wxUserInfo = this.globalData && this.globalData.wxUserinfo;

    if (global_wxUserInfo && global_wxUserInfo.appid) {
      params.__appid = global_wxUserInfo && global_wxUserInfo.appid;
      params.__openid = global_wxUserInfo && global_wxUserInfo.openid;
    }

    if (showLoading) {
      wx.showLoading({
        title: '玩命加载中',
      })
    }

    wx.request({
      url,
      data: { ...params},
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      complete: function (res) {
        // console.info('接口请求结果', res)
        if (res && res.statusCode == 200) {
          suc && suc(res.data)
        } else{
          fail && fail(err)
        }

        if (showLoading) {
          wx.hideLoading()
        }
      }
    })
  },

})
