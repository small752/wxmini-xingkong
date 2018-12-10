//app.js
App({
  globalData: {
    baseUrl: 'https://www.yana.site/appweb',
    wxUserInfo: {},
    wxUserLocation: {},
    _loginToken: {},
    needAuth: ['scope.userInfo', 'scope.userLocation']
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
    let me = this;
    wx.checkSession({
      success() {
        if (!(me.globalData._loginToken && me.globalData._loginToken.token && me.globalData._loginToken.token.length > 0)) {
          me._login();
        }
      },
      fail(a, b, c) {
        me._login();
      }
    })
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
              let res_data = result.data || {};
              me.globalData._loginToken = { ...res_data};
              wx.setStorage({
                key: '_minilogintoken',
                data: res_data.token
              })

              console.info('after loign', res_data)
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
    console.info('this.globalData', this.globalData)
    let { wxUserinfo, _loginToken} = this.globalData;
    if (wxUserinfo && wxUserinfo.appid && wxUserinfo.appid.length > 0) {
      params.__appid = wxUserinfo && wxUserinfo.appid;
      params.__openid = wxUserinfo && wxUserinfo.openid;
    }

    if (_loginToken && _loginToken.token && _loginToken.token.length > 0) {
      params.__token = _loginToken && _loginToken.token;
    }

    if (showLoading) {
      wx.showLoading({
        title: '玩命加载中',
      })
    }
    console.info('params', params)
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
