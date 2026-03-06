const api = require('../../services/api')
const store = require('../../utils/store')
const { formatDateTime } = require('../../utils/date')

const COOK_METHODS = ['蒸', '煮', '炒', '煎', '炸', '凉拌', '烤', '汤']

Page({
  data: {
    loading: true,
    imageUrl: '',
    mealType: '',
    dishes: [],
    summary: { kcal: 0, sodium: 0 },
    conclusion: '',
    advice: [],
    confidence: 0,
    modelProvider: '',
    confidencePercent: 0
  },
  async onLoad(query) {
    const imageUrl = decodeURIComponent(query.imageUrl || '')
    const mealType = decodeURIComponent(query.mealType || '')
    this.setData({ imageUrl, mealType, loading: true })

    const profile = store.getProfile() || {}
    const result = await api.analyzeMeal({ imageUrl, primaryGoal: profile.primaryGoal })
    this.setData({ ...result, confidencePercent: Math.round((result.confidence || 0) * 100), loading: false })

  },
  onReady() {
    this.setData({ cookMethods: COOK_METHODS })
  },
  async recalc(dishes) {
    const profile = store.getProfile() || {}
    const res = await api.recalcMeal({ dishes, primaryGoal: profile.primaryGoal })
    this.setData({ dishes, summary: res.summary, conclusion: res.conclusion, advice: res.advice })
  },
  getCookMethodIndex(method) {
    const methodList = this.data.cookMethods || COOK_METHODS
    const idx = methodList.indexOf(method)
    return idx >= 0 ? idx : 0
  },
  updateDishById(id, updater) {
    const dishes = this.data.dishes.map((d) => (d.id === id ? updater(d) : d))
    this.recalc(dishes)
  },
  onDishNameInput(e) {
    const { id } = e.currentTarget.dataset
    const name = (e.detail.value || '').trim()
    this.updateDishById(id, (d) => ({ ...d, name: name || d.name }))
  },
  onCookMethodChange(e) {
    const { id } = e.currentTarget.dataset
    const methodList = this.data.cookMethods || COOK_METHODS
    const cookMethod = methodList[Number(e.detail.value)]
    this.updateDishById(id, (d) => ({ ...d, cookMethod, cookMethodIndex: Number(e.detail.value) }))
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
    const dish = {
      id: `n_${Date.now()}`,
      name: '新增菜品',
      cookMethod: '炒',
      cookMethodIndex: this.getCookMethodIndex('炒'),
      baseGrams: 100,
      finalGrams: 100,
      adjustMethod: 'auto',
      nutrition: { kcal: 140, sodium: 120, protein: 8 }
    }
    this.recalc([dish, ...this.data.dishes])
  },
  async saveMeal() {
    const mealType = this.data.mealType || this.guessMealType()
    const meal = {
      mealId: `m_${Date.now()}`,
      userId: (store.getUser() || {}).openid,
      time: formatDateTime(),
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
    return '点心'
  }
})
