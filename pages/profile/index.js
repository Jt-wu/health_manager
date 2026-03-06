const store = require('../../utils/store')

Page({
  data: { profile: {}, plusStatus: false },
  onShow() {
    const profile = store.getProfile() || {}
    const user = store.getUser() || {}
    this.setData({ profile, plusStatus: !!user.plusStatus })
  },
  goOnboarding() { wx.navigateTo({ url: '/pages/onboarding/index' }) },
  togglePlus() {
    const user = store.getUser() || {}
    const next = { ...user, plusStatus: !user.plusStatus }
    store.setUser(next)
    this.setData({ plusStatus: next.plusStatus })
  }
})
