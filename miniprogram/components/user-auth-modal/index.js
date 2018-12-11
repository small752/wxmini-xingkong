// components/user-auth-modal/index.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: Boolean,
    authInfo: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasAuthUserInfo: true,
  },

  /**
   * 生命周期
   */
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let authInfo = JSON.parse(this.data.authInfo);
      if (authInfo && authInfo['scope.userInfo']) {
        this.setData({ hasAuthUserInfo: true})
      } else {
        this.setData({ hasAuthUserInfo: false })
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    openWxUserAuth: function() {
      let me = this;
      wx.openSetting({
        success(res) {
          let needAuth = app.globalData.needAuth;
          let hasAuthAll = true;
          needAuth && needAuth.map((item) => {
            if (!res.authSetting[item]) {
              hasAuthAll = false;
            }
          })

          console.info('res.authSetting', res.authSetting)
          if (res.authSetting['scope.userInfo']) {
            me.setData({ hasAuthUserInfo: true})
          }

          if (hasAuthAll) {
            //  必须的授权已经全部授权 可以关闭
            me.triggerEvent('onClose')
          }
        },
        fail: function (err) {
          console.info('打开授权出错', err)
        }
      })
    },

    onGotUserInfo: function(e) {
      if (e.detail.userInfo) {
        this.setData({ hasAuthUserInfo: true })
        this.triggerEvent('onClose')
      }
    },

  }
})
