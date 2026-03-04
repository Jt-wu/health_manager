Page({
  data: { imageUrl: '' },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => this.setData({ imageUrl: res.tempFiles[0].tempFilePath }),
      fail: () => wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    })
  },
  goAnalyze() {
    wx.navigateTo({ url: `/pages/analyze/index?imageUrl=${encodeURIComponent(this.data.imageUrl)}` })
  }
})
