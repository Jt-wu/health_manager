const store = require('../../utils/store')

Page({
  data: { agreed: false },
  onAgreeChange(e) {
    this.setData({ agreed: e.detail.value.includes('protocol') })
  },
  onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先勾选协议', icon: 'none' })
      return
    }
    const user = { openid: `openid_${Date.now()}`, unionid: `union_${Date.now()}`, createdAt: new Date().toISOString(), plusStatus: false }
    store.setUser(user)
    getApp().globalData.user = user
    const profile = store.getProfile()
    if (profile && profile.height && profile.weight && profile.primaryGoal) {
      wx.switchTab({ url: '/pages/home/index' })
      return
    }
    wx.redirectTo({ url: '/pages/onboarding/index' })
  }
})
