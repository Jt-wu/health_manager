const store = require('../../utils/store')

Page({
  data: { meal: null },
  onLoad(query) {
    const mealId = decodeURIComponent(query.mealId || '')
    const meal = store.getMeals().find((m) => m.mealId === mealId)
    if (!meal) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    this.setData({ meal })
  }
})
