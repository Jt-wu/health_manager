const api = require('../../services/api')
const store = require('../../utils/store')

Page({
  data: { report: { metrics: [], advice: [], insights: { topSources: [], riskDistribution: {} } }, primaryGoal: '', plusStatus: false },
  async onShow() {
    const profile = store.getProfile() || {}
    const user = store.getUser() || {}
    const week = this.currentWeek()
    const report = await api.getWeeklyReport({ week, primaryGoal: profile.primaryGoal })
    this.setData({ report, primaryGoal: profile.primaryGoal || '未设置', plusStatus: !!user.plusStatus })
  },
  currentWeek() {
    return `${new Date().toISOString().slice(0, 10)}`
  }
})
