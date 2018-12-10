// components/user-auth-modal/index.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

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

          if (hasAuthAll) {
            //  必须的授权已经全部授权 可以关闭
            me.triggerEvent('onClose')
          }
        },
        fail: function (err) {
          console.info('打开授权出错', err)
        }
      })
    }
  }
})
