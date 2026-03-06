const store = require('../../utils/store')
const { formatDateKey, getLocalDayKey } = require('../../utils/date')

Page({
  data: { date: formatDateKey(), meals: [] },
  onShow() { this.loadMeals() },
  onDateChange(e) { this.setData({ date: e.detail.value }); this.loadMeals() },
  loadMeals() {
    const meals = store.getMeals().filter((m) => getLocalDayKey(m.time) === this.data.date)
    this.setData({ meals })
  },
  copyMeal(e) {
    const id = e.currentTarget.dataset.id
    const target = store.getMeals().find((m) => m.mealId === id)
    if (!target) return
    const copied = { ...target, mealId: `m_${Date.now()}`, time: new Date().toISOString() }
    store.addMeal(copied)
    wx.showToast({ title: '已复制到当天' })
    this.loadMeals()
  },
  deleteMeal(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: (res) => {
        if (!res.confirm) return
        const meals = store.getMeals().filter((m) => m.mealId !== id)
        store.setMeals(meals)
        this.loadMeals()
      }
    })
  }
})
