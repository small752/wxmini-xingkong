//app.js
App({
  globalData: {
    baseUrl: 'https://www.yana.site/appweb',
    wxUserInfo: {},
    wxUserLocation: {},
    _loginToken: {}
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
   * 登陆
   */
  miniLoginCheck: function() {
    console.info('1')
    let me = this;
    wx.checkSession({
      success() {
        console.info('小程序校验登陆信息有效')
      },
      fail(a, b, c) {
        console.info('checkSession fail', a, b, c)
        //  me._login();
      }
    })
    console.info('2')
  },

  /**
   * 微信登陆
   */
  _login: function() {
    let me = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          let postUrl = me.globalData.baseUrl + '/oauth/mini/autoCode?code=' + res.code;
          me.requestServerJson(postUrl, {}, function(result) {
            if (result && result.errorCode == 9000) {
              console.info('异步登陆并获取信息', result)
              let res_data = result.data || {};
              me.globalData._loginToken = { ...res_data};
              wx.setStorage({
                key: '_minilogintoken',
                data: res_data.token
              })
            }
          })
        }
      }
    })
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
