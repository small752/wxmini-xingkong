//index.js
const app = getApp()

Page({
  data: {
    draftList: [],
    draftCount: 10,
    userInfo: {},
    userInfoStr: '',
  },

  onLoad: function() {
    let me = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.info('getSetting', res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          me.initCurrentUserInfo()
        } else {
          // 向用户请求授权
          me.pleaseAuthTome();
        }
      }
    })

    // console.info('吊起')
    // wx.openSetting({
    //   success(res) {
    //     console.log('吊起成功',res.authSetting)
    //     // res.authSetting = {
    //     //   "scope.userInfo": true,
    //     //   "scope.userLocation": true
    //     // }
    //   }
    // })
  },

  //   请求用户授权给小程序
  pleaseAuthTome: function() {
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        wx.startRecord()
      }
    })

    wx.authorize({
      scope: 'scope.userLocation',
      success() {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        wx.startRecord()
      }
    })

    wx.authorize({
      scope: 'scope.camera',
      success() {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        wx.startRecord()
      }
    })
  },

  /**
   * 获取当前用户信息
   */
  initCurrentUserInfo: function() {
    let me = this;
    let options = {
      success: function (res) {
        console.info('用户信息:', res)
        me.setData({
          userInfo: res,
          userInfoStr: JSON.stringify(res)
        })

        me.initDraft()
      }
    };
    wx.getUserInfo(options);

    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('callFunction test result: ', res)
      }
    })
  },

  initDraft: function() {
    let draftCount = this.data.draftCount;
    console.info('draftCount', draftCount)

    let draftList = [];
    for (let i = 0; i < draftCount; i++) {
      setTimeout(this.createDraft, i * 0.1 * 1000)
    }
  },

  createDraft: function() {
    let draftList = this.data.draftList;

    let rx = Math.random() * 100;
    let ry = Math.random() * 100;

    draftList.push({
      key: draftList.length + '',
      rx, ry,
      styleObj: { left: rx + '%', top: ry + '%' }
    })

    this.setData({
      draftList
    })
  },

})
