const store = require('../../utils/store')

Page({
  data: { profile: {}, plusStatus: false, metricValue: '', registerName: '', registerPhone: '' },
  onShow() {
    const profile = store.getProfile() || {}
    const user = store.getUser() || {}
    this.setData({ profile, plusStatus: !!user.plusStatus })
  },
  goOnboarding() { wx.navigateTo({ url: '/pages/onboarding/index' }) },
  onRegisterInput(e) {
    const k = e.currentTarget.dataset.k
    this.setData({ [k]: e.detail.value })
  },
  completeRegister() {
    if (!this.data.registerName || !this.data.registerPhone) return wx.showToast({ title: '请填写姓名和手机号', icon: 'none' })
    const profile = { ...this.data.profile, registerName: this.data.registerName, registerPhone: this.data.registerPhone, registered: true }
    store.setProfile(profile)
    this.setData({ profile, registerName: '', registerPhone: '' })
    wx.showToast({ title: '注册信息已保存' })
  },
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
