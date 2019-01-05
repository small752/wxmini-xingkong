//app.js
App({
  globalData: {
    baseUrl: 'https://www.yana.site/appweb',
    bizUrl: 'https://dev.yana.site/biz/service',
    // bizUrl: 'http://127.0.0.1:8082/biz/service',
    socketUrl: 'wss://dev.yana.site/biz/service',
    wxUserInfo: {},
    wxUserLocation: {},
    needAuth: ['scope.userInfo', 'scope.userLocation'],
    chating: {  //  当前聊天对象
      userId: '',
      userName: '',
      headimg: '',
    },

    socketObj: {
      open: false,
      msgQueue: ['你厉害 '],
    }
  },

  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.miniLoginCheck()
  },

  onShow: function() {
    let me = this;
    console.info('app onshow')
    //  建立socket链接
    wx.connectSocket({
      url: me.globalData.socketUrl + '/bottlesocket',
      header: {
        'content-type': 'application/json;charset=utf-8'
      },
      method: 'POST'
    })

    wx.onSocketOpen(function (res) {
      console.info('onSocketOpen', res)
      me.globalData.socketObj.open = true
      for (let i = 0; i < me.globalData.socketObj.msgQueue.length; i++) {
        me.sendSocketMessage(me.globalData.socketObj.msgQueue[i])
      }
      me.globalData.socketObj.msgQueue = []
    })

    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
      me.globalData.socketObj.open = false
    })

    wx.onSocketMessage(function(res) {
      console.log('WebSocket 收到消息', res)
    })
  },

  sendSocketMessage: function(msg) {
    let me = this;
    if (me.globalData.socketObj.open) {
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      me.globalData.socketObj.msgQueue.push(msg)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.info('app onhide')
    wx.closeSocket()
  },

  /**
   * 登陆
   */
  miniLoginCheck: function() {
    let me = this;
    wx.checkSession({
      success() {
        console.info('登陆校验成功')
        let _minitoken = wx.getStorageSync('_minitoken')
        let _miniopenid = wx.getStorageSync('_miniopenid')

        if (!(_minitoken && 
          _minitoken.length > 0 && 
          _miniopenid && 
          _miniopenid.length > 0)) {
          me._login();
        }
      },
      fail() {
		    console.info('登陆校验失败')
        me._login();
      }
    })
  },

  /**
   * 微信登陆
   */
  _login: function (reLaunch) {
    let me = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          let postUrl = me.globalData.baseUrl + '/oauth/mini/autoCode?code=' + res.code;
          me.requestServer(postUrl, {}, function(result) {
            if (result && result.errorCode == 9000) {
              let res_data = result.data || {};
              wx.setStorage({
                key: '_minitoken',
                data: res_data.token
              })
              wx.setStorage({
                key: '_miniopenid',
                data: res_data.openid
              })

              console.info('after loign', res_data)

              if (reLaunch) {
                //  首页重新加载
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              }
              
            }
          })
        }
      }
    })
  },

  /**
   * 登陆信息失效  重新登陆
   */
  relogin: function() {
    let me = this;
    wx.showModal({
      title: '请稍等一下',
      content: '或许您太久没来了',
      showCancel: false,
      success(res) {
        if (res.confirm) {
          me._login(true);
        }
      }
    })
  },

  /**
   * 异步json请求
   */
  requestServer: function (url, params = {}, suc, fail, showLoading=true) {
    let me = this;
    if (showLoading) {
      wx.showLoading({
        title: '玩命加载中',
      })
    }

    //  统一配置请求参数
    params = this.doPostParams(params)
    
    //  发起异步post请求
    wx.request({
      url,
      data: params,
      method: 'POST',
      header: {
        'content-type': 'application/json;charset=utf-8'
        // 'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      // },
      complete: function (res) {
        // console.info('接口请求结果', res)
        if (res && res.statusCode == 200) {
          let res_data = res.data;
          if (res_data && res_data.errorCode == 2000) {
            me.relogin()  //  重新登陆
          } else {
            suc && suc(res_data)
          }
        } else{
          fail && fail(res)
        }

        if (showLoading) {
          wx.hideLoading()
        }
      }
    })
  },

  /**
   * 统一配置请求参数
   */
  doPostParams: function(obj) {
    if(obj == undefined) {
      obj = {};
    }
    let _minitoken = wx.getStorageSync('_minitoken')
    let _miniopenid = wx.getStorageSync('_miniopenid')

    if (_miniopenid && _miniopenid.length > 0) {
      obj.__openid = _miniopenid;
    }

    if (_minitoken && _minitoken.length > 0) {
      obj.__token = _minitoken;
    }
    return obj;
  },

})
