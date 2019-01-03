// miniprogram/pages/form/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionLibs: [],
    selectQuestion: {},
    target: {
      gender: '',
      address: [
        '浙江省', '杭州市', '滨江区'
      ]
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let me = this;
    this.queryTopics()
    //  从全局设置中获取当前用户信息和位置
    let user_location = [];
    let { wxUserLocation, wxUserInfo} = app.globalData;

    user_location.push(wxUserLocation.province);
    user_location.push(wxUserLocation.city);
    user_location.push(wxUserLocation.district);
    let current_target = me.data.target;
    current_target.address = user_location;

    let gender = wxUserInfo.gender == 1 ? '2' : '1';
    current_target.gender = gender;

    me.setData({ target: current_target, })
  },

  

  /**
   * 选择地址变更时
   */
  bindRegionChange: function (event) {
    let address = event && event.detail;
    let target = this.data.target;
    target.address = address.value;
    this.setData({
      target,
    })
  },

  selectTargetGender: function(event) {
    let e_target = event.target;
    let dataset = e_target && e_target.dataset;

    let target = this.data.target;
    target.gender = dataset && dataset.gender
    this.setData({
      target,
    })
  },

  queryTopics: function(count=6) {
    let me = this;
    let questionLibs = [
      {
        id: '0',
        title: '不考虑现实因素，最想做的工作是?'
      },
      {
        id: '1',
        title: '不考虑现实因素，最想做的工作是?'
      },
      {
        id: '2',
        title: '不考虑现实因素，最想做的工作是?'
      },
      {
        id: '3',
        title: '不考虑现实因素，最想做的工作是?'
      },
      {
        id: '4',
        title: '不考虑现实因素，最想做的工 不考虑现实因素，最想做的工作是不考虑现实因素，最想做的工作是作是?'
      }
    ];

    let postUrl = app.globalData.bizUrl + '/bt/topic/queryList';
    app.requestServer(postUrl, { count}, function (res) {
      if (res && res.errorCode == 9000) {
        if (res.results && res.results.length > 0) {
          questionLibs = res.results;
          me.setData({ questionLibs })
        }
      }
    })
  },

  /**
   * 选择话题变更
   */
  selectQuestion: function(event) {
    let eventDetail = event.detail;

    let selectQuestion = this.data.selectQuestion;
    selectQuestion.id = eventDetail && eventDetail.value;
    this.setData({
      selectQuestion
    })
  },

/**
 * 创建新话题内容变更时
 */
  createQuestionChange: function(event) {
    this.setData({
      selectQuestion: {
        id: '',
        title: event && event.detail && event.detail.value
      }
    })
  },

  /**
   * 换一批新的问题库
   */
  refreshQuestionLib: function() {
    this.queryTopics()
  },

  /**
   * 提交创建新的漂流瓶
   */
  submitCreateBottle: function() {
    let me = this;

    let { selectQuestion, target} = this.data;
    let address = (target && target.address) || [];
    let gender = target && target.gender;

    let provice = '',city = '',area = '';
    for (let i = 0; i < address.length; i++) {
      if(i == 0) {
        provice = address[i];
      } else if(i == 1) {
        city = address[i];
      } else if (i == 2) {
        area = address[i];
      }
    }

    let postUrl = app.globalData.bizUrl + '/bt/bottle/create';
    let params = {
      provice, city, area, gender,
      topicId: (selectQuestion && selectQuestion.id) || '',
      topicContent: (selectQuestion && selectQuestion.title) || '',
      type: 'text',
    };

    if (params.topicId == '' && params.topicContent == '') {
      wx.showToast({
        title: '请选择一个话题作为开始',
        icon: 'none',
        duration: 1000,
      })
      return
    }
    app.requestServer(postUrl, params, function (res) {
      if (res && res.errorCode == 9000) {
        wx.showToast({
          title: '扔的漂亮',
          icon: 'success',
          duration: 1000,
          success: function() {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      } else {
        wx.showToast({
          title: (res && res.errorMessage) || '创建出现差错了',
          icon: 'none',
          duration: 1000,
        })
      }
    }, undefined, false)

  },

})