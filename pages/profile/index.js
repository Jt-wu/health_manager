const store = require('../../utils/store')

Page({
  data: { profile: {}, plusStatus: false, metricValue: '' },
  onShow() {
    const profile = store.getProfile() || {}
    const user = store.getUser() || {}
    this.setData({ profile, plusStatus: !!user.plusStatus })
  },
  goOnboarding() { wx.navigateTo({ url: '/pages/onboarding/index' }) },
  onMetricInput(e) { this.setData({ metricValue: e.detail.value }) },
  saveWeight() {
    if (!this.data.metricValue) return wx.showToast({ title: '请输入体重', icon: 'none' })
    store.addMetric({ type: 'weight', value: this.data.metricValue, measuredAt: new Date().toISOString() })
    wx.showToast({ title: '已保存' })
    if (Number(this.data.metricValue) > 200 || Number(this.data.metricValue) < 20) {
      wx.showModal({ title: '提示', content: '指标异常，请咨询医生', showCancel: false })
    }
  },
  togglePlus() {
    const user = store.getUser() || {}
    const next = { ...user, plusStatus: !user.plusStatus }
    store.setUser(next)
    this.setData({ plusStatus: next.plusStatus })
  }
})
