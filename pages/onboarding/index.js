const store = require('../../utils/store')

Page({
  data: {
    step: 1,
    sexOptions: ['男', '女'],
    activityOptions: ['久坐', '轻', '中', '高'],
    goalOptions: ['减脂', '高血压', '高尿酸', '脂肪肝', '高血脂', '抗炎'],
    form: {
      height: '', weight: '', sex: '', activity_level: '', goals: [], primaryGoal: '',
      bp: '', ua: '', lipid: '', allergiesText: '', avoidFoodsText: '',
      registerName: '', registerPhone: '', registered: false
    }
  },
  onInput(e) {
    const k = e.currentTarget.dataset.k
    this.setData({ [`form.${k}`]: e.detail.value })
  },
  onSexChange(e) { this.setData({ 'form.sex': this.data.sexOptions[e.detail.value] }) },
  onActivityChange(e) { this.setData({ 'form.activity_level': this.data.activityOptions[e.detail.value] }) },
  onGoalChange(e) { this.setData({ 'form.goals': e.detail.value, 'form.primaryGoal': '' }) },
  onPrimaryGoalChange(e) { this.setData({ 'form.primaryGoal': this.data.form.goals[e.detail.value] || '' }) },
  skipMetric() { wx.showToast({ title: '已标记稍后补充', icon: 'none' }) },
  skipRegister() {
    this.setData({ 'form.registered': false, 'form.registerName': '', 'form.registerPhone': '' })
    wx.showToast({ title: '已跳过注册，后续可在档案页完成', icon: 'none' })
  },
  prev() { this.setData({ step: this.data.step - 1 }) },
  next() {
    const { step, form } = this.data
    if (step === 1 && (!form.height || !form.weight)) return wx.showToast({ title: '请填写身高体重', icon: 'none' })
    if (step === 2 && (!form.goals.length || !form.primaryGoal)) return wx.showToast({ title: '请选择目标与主目标', icon: 'none' })
    if (step < 4) return this.setData({ step: step + 1 })

    const registered = !!(form.registerName && form.registerPhone)
    const profile = {
      ...form,
      registered,
      allergies: form.allergiesText ? form.allergiesText.split('，').join(',').split(',').map((s) => s.trim()).filter(Boolean) : [],
      avoid_foods: form.avoidFoodsText ? form.avoidFoodsText.split('，').join(',').split(',').map((s) => s.trim()).filter(Boolean) : []
    }
    store.setProfile(profile)
    getApp().globalData.profile = profile
    wx.switchTab({ url: '/pages/home/index' })
  }
})
