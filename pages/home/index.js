const store = require('../../utils/store')
const { formatDate, extractDate } = require('../../utils/date')

Page({
  data: { todayMeals: [], todayKcal: 0, primaryGoal: '' },
  onShow() {
    const profile = store.getProfile() || {}
    const date = formatDate()
    const meals = store.getMeals().filter((m) => extractDate(m.time) === date)
    const kcal = meals.reduce((n, m) => n + (m.summary?.kcal || 0), 0)
    this.setData({ todayMeals: meals, todayKcal: kcal, primaryGoal: profile.primaryGoal || '' })
  },
  openMeal(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/meal-detail/index?mealId=${encodeURIComponent(id)}` })
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
