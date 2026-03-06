const api = require('../../services/api')
const store = require('../../utils/store')

const MEAL_TYPES = ['早餐', '午餐', '晚餐', '点心', '夜宵']
const COOK_METHODS = ['蒸', '煮', '炒', '煎', '炸', '凉拌', '烤', '汤']

Page({
  data: {
    meal: null,
    editableMeal: null,
    mealTypes: MEAL_TYPES,
    cookMethods: COOK_METHODS,
    mealTypeIndex: -1
  },
  onLoad(query) {
    const mealId = decodeURIComponent(query.mealId || '')
    const meal = store.getMeals().find((m) => m.mealId === mealId)
    if (!meal) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 500)
      return
    }
    const editableMeal = this.toEditableMeal(meal)
    this.setData({
      meal,
      editableMeal,
      mealTypeIndex: this.getMealTypeIndex(editableMeal.mealType)
    })
  },
  toEditableMeal(meal) {
    const dishes = (meal.dishes || []).map((d) => ({
      ...d,
      cookMethodIndex: this.getCookMethodIndex(d.cookMethod)
    }))
    return { ...meal, dishes }
  },
  getMealTypeIndex(mealType) {
    const idx = MEAL_TYPES.indexOf(mealType)
    return idx >= 0 ? idx : 0
  },
  getCookMethodIndex(method) {
    const idx = COOK_METHODS.indexOf(method)
    return idx >= 0 ? idx : 0
  },
  onMealTypeChange(e) {
    const mealTypeIndex = Number(e.detail.value)
    const mealType = this.data.mealTypes[mealTypeIndex]
    this.setData({
      mealTypeIndex,
      'editableMeal.mealType': mealType
    })
  },
  onDishNameInput(e) {
    const id = e.currentTarget.dataset.id
    const value = (e.detail.value || '').trim()
    this.updateDishById(id, (dish) => ({ ...dish, name: value || dish.name }))
  },
  onCookMethodChange(e) {
    const id = e.currentTarget.dataset.id
    const cookMethodIndex = Number(e.detail.value)
    const cookMethod = this.data.cookMethods[cookMethodIndex]
    this.updateDishById(id, (dish) => ({ ...dish, cookMethod, cookMethodIndex }))
  },
  onFinalGramsInput(e) {
    const id = e.currentTarget.dataset.id
    const grams = Number(e.detail.value)
    if (!grams || grams <= 0) return
    this.updateDishById(id, (dish) => ({ ...dish, finalGrams: Math.round(grams), adjustMethod: 'manual' }))
  },
  updateDishById(id, updater) {
    const dishes = (this.data.editableMeal?.dishes || []).map((dish) => (dish.id === id ? updater(dish) : dish))
    this.recalcAndSet(dishes)
  },
  async recalcAndSet(dishes) {
    const profile = store.getProfile() || {}
    const { summary, conclusion, advice } = await api.recalcMeal({ dishes, primaryGoal: profile.primaryGoal })
    this.setData({
      'editableMeal.dishes': dishes,
      'editableMeal.summary': summary,
      'editableMeal.conclusion': conclusion,
      'editableMeal.advice': advice
    })
  },
  async saveChanges() {
    const editableMeal = this.data.editableMeal
    const meals = store.getMeals()
    const idx = meals.findIndex((m) => m.mealId === editableMeal.mealId)
    if (idx < 0) {
      wx.showToast({ title: '记录不存在', icon: 'none' })
      return
    }
    meals[idx] = {
      ...editableMeal,
      dishes: editableMeal.dishes.map(({ cookMethodIndex, ...dish }) => dish)
    }
    store.setMeals(meals)
    this.setData({ meal: meals[idx] })
    wx.showToast({ title: '修改已保存' })
  }
})
