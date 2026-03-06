const store = require('../../utils/store')

function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (!value) return []
  return String(value)
    .split('，')
    .join(',')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

Page({
  data: {
    step: 1,
    sexOptions: ['男', '女'],
    activityOptions: ['久坐', '轻', '中', '高'],
    goalOptions: ['减脂', '高血压', '高尿酸', '脂肪肝', '高血脂', '抗炎'],
    form: {
      height: '', weight: '', sex: '', activity_level: '', goals: [], primaryGoal: '',
      bp: '', ua: '', lipid: '', allergiesText: '', avoidFoodsText: ''
    }
  },
  onLoad() {
    const profile = store.getProfile()
    if (!profile) return

    const goals = normalizeList(profile.goals)
    const primaryGoal = profile.primaryGoal && goals.includes(profile.primaryGoal)
      ? profile.primaryGoal
      : (goals[0] || '')

    this.setData({
      form: {
        height: profile.height || '',
        weight: profile.weight || '',
        sex: profile.sex || '',
        activity_level: profile.activity_level || '',
        goals,
        primaryGoal,
        bp: profile.bp || '',
        ua: profile.ua || '',
        lipid: profile.lipid || '',
        allergiesText: normalizeList(profile.allergies).join(','),
        avoidFoodsText: normalizeList(profile.avoid_foods).join(',')
      }
    })
  },
  onInput(e) {
    const k = e.currentTarget.dataset.k
    this.setData({ [`form.${k}`]: e.detail.value })
  },
  onSexChange(e) { this.setData({ 'form.sex': this.data.sexOptions[e.detail.value] }) },
  onActivityChange(e) { this.setData({ 'form.activity_level': this.data.activityOptions[e.detail.value] }) },
  toggleGoal(e) {
    const goal = e.currentTarget.dataset.goal
    const currentGoals = this.data.form.goals || []
    const exists = currentGoals.includes(goal)
    const goals = exists ? currentGoals.filter((item) => item !== goal) : [...currentGoals, goal]
    const primaryGoal = goals.includes(this.data.form.primaryGoal) ? this.data.form.primaryGoal : (goals[0] || '')
    this.setData({ 'form.goals': goals, 'form.primaryGoal': primaryGoal })
  },
  onPrimaryGoalChange(e) { this.setData({ 'form.primaryGoal': this.data.form.goals[e.detail.value] || '' }) },
  skipMetric() { wx.showToast({ title: '已标记稍后补充', icon: 'none' }) },
  prev() { this.setData({ step: this.data.step - 1 }) },
  next() {
    const { step, form } = this.data
    if (step === 1 && (!form.height || !form.weight)) return wx.showToast({ title: '请填写身高体重', icon: 'none' })
    if (step === 2 && (!form.goals.length || !form.primaryGoal)) return wx.showToast({ title: '请选择目标与主目标', icon: 'none' })
    if (step < 4) return this.setData({ step: step + 1 })

    const profile = {
      ...form,
      goals: normalizeList(form.goals),
      allergies: normalizeList(form.allergiesText),
      avoid_foods: normalizeList(form.avoidFoodsText)
    }
    store.setProfile(profile)
    getApp().globalData.profile = profile
    wx.switchTab({ url: '/pages/home/index' })
  }
})
