//index.js
const app = getApp()

Page({
  data: {
    draftList: [],
    draftCount: 10,
    userInfo: {},
    filterAddress: ['浙江省', '杭州市', '滨江区']
  },

  onLoad: function() {
    //  同步校验用户是否登陆
    app.miniLoginCheck();
    console.info('3')
    let me = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.info('用户授权信息', res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          me.initCurrentUserInfo()
        } else {
          // 向用户请求授权
          me.pleaseAuthTome();
        }

        if (res.authSetting['scope.userLocation']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          me.getWxUserLocation()
        } else {
          // 向用户请求授权
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              me.getWxUserLocation()
            }
          })
        }
      }
    })
  },

  /**
   * 获取微信用户个人位置
   */
  getWxUserLocation: function() {
    let me = this;
    // 获取位置
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        let longitude = res.longitude
        let latitude = res.latitude
        me.getLocationCity(longitude, latitude)
      }
    })
  },

  /**
   * 获取当前城市
   */
  getLocationCity: function (longitude, latitude) {
    let me = this;
    let postUrl = app.globalData.baseUrl + '/baidu/index/location?latitude=' + latitude + '&longitude=' + longitude;
    app.requestServerJson(postUrl, {}, function (res) {
      if (res && res.errorCode == 9000) {
        let location_data = res.data || {};
        app.globalData.wxUserLocation = location_data;

        let filterAddress = [];
        filterAddress.push(location_data.province);
        filterAddress.push(location_data.city);
        filterAddress.push(location_data.district);

        me.setData({ filterAddress })
        //   根据地区查询问题库
        me.initDraft()
      }
    })
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
  },

  /**
   * 获取当前用户信息
   */
  initCurrentUserInfo: function() {
    let me = this;
    let options = {
      success: function (res) {
        
        let wxUserinfo = res && res.userInfo;
        wx.cloud.callFunction({
          name: 'userinfo',
          complete: res => {
            let cloudRes = res && res.result;
            if (cloudRes && cloudRes.openid) {
              wxUserinfo = { ...wxUserinfo, appid: cloudRes.appid, openid: cloudRes.openid};
            }
            app.globalData.wxUserInfo = wxUserinfo;
            me.setData({
              userInfo: wxUserinfo,
            })
          }
        })
      }
    };
    wx.getUserInfo(options);
  },

  initDraft: function() {
    let draftCount = this.data.draftCount;
    this.setData({ draftList: []})
    let draftList = [];
    for (let i = 0; i < draftCount; i++) {
      setTimeout(this.createDraft, i * 0.1 * 1000)
    }
  },

  createDraft: function() {
    let draftList = this.data.draftList;

    let rx = Math.random() * 100;
    let ry = Math.random() * 100;

    if(ry > 60) {
      ry -= 20;
    }
    
    draftList.push({
      key: draftList.length + '',
      rx, ry,
      styleObj: { left: rx + '%', top: ry + '%' }
    })

    this.setData({
      draftList
    })
  },

  /**
   * 选择地址变更时
   */
  bindRegionChange: function (event) {
    let address = event && event.detail;
    this.setData({
      filterAddress: address.value,
    })

    this.initDraft();
  },

  /**
   * 漂流瓶点击事件
   */
  bottleClick: function(event) {
    wx.vibrateShort()
    let e_target = event.target;
    let dataset = e_target && e_target.dataset;
    console.info('dataset', dataset)
  },

  routeToBottleFormPage: function() {
    wx.navigateTo({
      url: '/pages/form/index'
    });
  }

})
