const store = require('../../utils/store')

Page({
  data: {
    meal: null
  },
  onLoad(query) {
    const mealId = query.mealId
    const meal = store.getMeals().find((m) => m.mealId === mealId) || null
    this.setData({ meal })
  }
})
