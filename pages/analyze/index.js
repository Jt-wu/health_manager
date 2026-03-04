const api = require('../../services/api')
const store = require('../../utils/store')

Page({
  data: {
    loading: true,
    imageUrl: '',
    dishes: [],
    summary: { kcal: 0, sodium: 0 },
    conclusion: '',
    advice: []
  },
  async onLoad(query) {
    const imageUrl = decodeURIComponent(query.imageUrl || '')
    this.setData({ imageUrl, loading: true })
    const profile = store.getProfile() || {}
    const result = await api.analyzeMeal({ imageUrl, primaryGoal: profile.primaryGoal })
    this.setData({ ...result, loading: false })
  },
  async recalc(dishes) {
    const profile = store.getProfile() || {}
    const res = await api.recalcMeal({ dishes, primaryGoal: profile.primaryGoal })
    this.setData({ dishes, summary: res.summary, conclusion: res.conclusion, advice: res.advice })
  },
  adjustSize(e) {
    const { id, size } = e.currentTarget.dataset
    const factorMap = { small: 0.75, medium: 1, large: 1.3 }
    const dishes = this.data.dishes.map((d) => d.id === id ? { ...d, adjustMethod: 'size', finalGrams: Math.round(d.baseGrams * factorMap[size]) } : d)
    this.recalc(dishes)
  },
  removeDish(e) {
    const id = e.currentTarget.dataset.id
    const dishes = this.data.dishes.filter((d) => d.id !== id)
    this.recalc(dishes)
  },
  addDish() {
    const dish = { id: `n_${Date.now()}`, name: '新增菜品', cookMethod: '炒', baseGrams: 100, finalGrams: 100, adjustMethod: 'auto', nutrition: { kcal: 140, sodium: 120, protein: 8 } }
    this.recalc([dish, ...this.data.dishes])
  },
  async saveMeal() {
    const mealType = this.guessMealType()
    const meal = {
      mealId: `m_${Date.now()}`,
      userId: (store.getUser() || {}).openid,
      time: new Date().toISOString(),
      mealType,
      imageUrl: this.data.imageUrl,
      summary: this.data.summary,
      conclusion: this.data.conclusion,
      advice: this.data.advice,
      dishes: this.data.dishes
    }
    await api.saveMeal({ meal })
    wx.showToast({ title: '保存成功' })
    setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 400)
  },
  guessMealType() {
    const h = new Date().getHours()
    if (h < 10) return '早餐'
    if (h < 15) return '午餐'
    if (h < 21) return '晚餐'
    return '加餐'
  }
})
