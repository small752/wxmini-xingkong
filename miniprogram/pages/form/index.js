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

    let user_location = [];
    let { wxUserLocation, wxUserInfo} = app.globalData;

    user_location.push(wxUserLocation.province);
    user_location.push(wxUserLocation.city);
    user_location.push(wxUserLocation.district);
    let current_target = me.data.target;
    current_target.address = user_location;

    let gender = wxUserInfo.gender == 1 ? 'female' : 'male';
    current_target.gender = gender;

    me.setData({ target: current_target, questionLibs, })
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
        id: 'create',
        title: event && event.detail && event.detail.value
      }
    })
  },

  /**
   * 换一批新的问题库
   */
  refreshQuestionLib: function() {
    console.info('换一批新的问题库')
  },

  /**
   * 提交创建新的漂流瓶
   */
  submitCreateBottle: function() {
    console.info('提交创建新的漂流瓶')
  },

})