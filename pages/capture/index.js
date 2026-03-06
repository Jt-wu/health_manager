const MEAL_TYPES = ['早餐', '午餐', '晚餐', '点心', '夜宵']
const { formatDate } = require('../../utils/date')

Page({
  data: {
    imageUrl: '',
    mealTypes: MEAL_TYPES,
    mealTypeIndex: -1,
    recordDate: formatDate(),
    today: formatDate()
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => this.setData({ imageUrl: res.tempFiles[0].tempFilePath }),
      fail: () => wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    })
  },
  onMealTypeChange(e) {
    this.setData({ mealTypeIndex: Number(e.detail.value) })
  },
  onDateChange(e) {
    this.setData({ recordDate: e.detail.value })
  },
  goAnalyze() {
    const mealType = this.data.mealTypeIndex >= 0 ? this.data.mealTypes[this.data.mealTypeIndex] : ''
    const query = `imageUrl=${encodeURIComponent(this.data.imageUrl)}&mealType=${encodeURIComponent(mealType)}&recordDate=${encodeURIComponent(this.data.recordDate)}`
    wx.navigateTo({ url: `/pages/analyze/index?${query}` })
  }
})
