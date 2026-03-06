const store = require('../../utils/store')
const { formatDateKey, getLocalDayKey } = require('../../utils/date')

Page({
  data: { todayMeals: [], todayKcal: 0, primaryGoal: '' },
  onShow() {
    const profile = store.getProfile() || {}
    const date = formatDateKey()
    const meals = store.getMeals().filter((m) => getLocalDayKey(m.time) === date)
    const kcal = meals.reduce((n, m) => n + (m.summary?.kcal || 0), 0)
    this.setData({ todayMeals: meals, todayKcal: kcal, primaryGoal: profile.primaryGoal || '' })
  },
  goCapture() {
    const p = store.getProfile()
    if (!p || !p.height || !p.weight || !p.primaryGoal) {
      wx.showToast({ title: '请先完成建档', icon: 'none' })
      wx.redirectTo({ url: '/pages/onboarding/index' })
      return
    }
    wx.navigateTo({ url: '/pages/capture/index' })
  }
})
