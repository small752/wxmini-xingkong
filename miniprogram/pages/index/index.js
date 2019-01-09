//index.js
const app = getApp()

Page({
  data: {
    draftList: [],
    draftCount: 10,
    userInfo: {},
    filterAddress: ['浙江省', '杭州市', '滨江区'],
    authModalVisible: false,
    authInfo: '',// 当前用户授权信息
  },

  onLoad: function() {
    let me = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.info('用户授权信息', res)
        me.setData({ authInfo: res.authSetting && JSON.stringify(res.authSetting)})
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          me.initCurrentUserInfo()
        } else {
          // 向用户请求授权
          me.openUserAuthModal();
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
            },
            fail: function(err) {
              me.openUserAuthModal();
            }
          })
        }
      }
    })
  },

  /**
   * 打开向用户获取授权的请求窗口
   */
  openUserAuthModal: function() {
    if (!this.data.authModalVisible) {
      this.setData({ authModalVisible: true})
    }
  },

  /**
   * 关闭提示授权窗口 并刷新页面
   */
  closeUserAuthModal: function () {
    this.setData({ authModalVisible: false })
    this.initCurrentUserInfo()
    this.getWxUserLocation()
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
    app.requestServer(postUrl, {}, function (res) {
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

            //  注册用户信息
            let postUrl = app.globalData.bizUrl + '/bt/user/regist';
            app.requestServer(postUrl, {...wxUserinfo}, function (resRegist) {
              if (resRegist && resRegist.errorCode != 9000) {
                console.info('用户注册失败')
              } else {
                let userId = resRegist.data && resRegist.data.userId;
                app.globalData.wxUserInfo.userId = userId;
              }
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

    this.queryDraft(draftCount);
  },

  queryDraft: function(count=10) {
    let me = this;
    let postUrl = app.globalData.bizUrl + '/bt/bottle/queryList';
    let filterAddress = this.data.filterAddress || [];
    let provice = '', city = '', area = '';
    for (let i = 0; i < filterAddress.length; i++) {
      if (i == 0) {
        provice = filterAddress[i];
      } else if (i == 1) {
        city = filterAddress[i];
      } else if (i == 2) {
        area = filterAddress[i];
      }
    }

    let params = {
      count, provice, city, area,
    }
    app.requestServer(postUrl, params, function (res) {
      if (res && res.errorCode == 9000) {
        for (let i = 0; i < res.results.length; i++) {
          setTimeout(function() {
            me.createDraft(res.results[i])
          }, i * 0.1 * 1000)
        }
      }
    })
  },

  createDraft: function(item) {
    let draftList = this.data.draftList;

    let rx = Math.random() * 100;
    let ry = Math.random() * 100;

    if(ry > 60) {
      ry -= 20;
    }
    
    draftList.push({
      key: draftList.length + '',
      rx, ry,
      styleObj: { left: rx + '%', top: ry + '%' },
      bottle: item,
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
    let me = this;
    wx.vibrateShort()
    let e_target = event.target;
    let dataset = e_target && e_target.dataset;
    let key = dataset && dataset.bottlekey;
    let bottle = dataset && dataset.bottle;

    let bottleObj = (bottle && bottle.bottle) || {};

    wx.showModal({
      title: '',
      content: '"' + bottleObj.content + '"' || '确定要打开这个吗?',
      success(res) {
        if (res.confirm) {
          let draftList = me.data.draftList;
          draftList.map((item) => {
            if (item.key == key) {
              item.clicked = true;
            }
          })
          me.setData({ draftList })

          me.openBottle(bottleObj);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 打开某个漂流瓶
   */
  openBottle: function(bottle={}) {
    let me = this;
    let postUrl = app.globalData.bizUrl + '/bt/bottle/openBottle';
    let params = {
      id: bottle.id
    }
    
    app.requestServer(postUrl, params, function (res) {
      if (res && res.errorCode == 9000) {
        let resData = res.data;
        let chating = {
          userId: resData.authorId,
          userName: resData.authorName,
          headimg: resData.authorHeadimg,
        }
        app.globalData.chating = chating;
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/chat/index'
          });
        }, 200)
      }
    })
  },

  /**
   * 跳转到创建漂流瓶界面
   */
  routeToBottleFormPage: function() {
    wx.navigateTo({
      url: '/pages/form/index'
    });
  },

  /**
   * 跳转到漂流瓶列表界面
   */
  routeToBottleListPage: function () {
    wx.navigateTo({
      url: '/pages/bottles/index'
    });
  },

})
