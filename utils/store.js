const KEY_USER = 'hm_user'
const KEY_PROFILE = 'hm_profile'
const KEY_MEALS = 'hm_meals'
const KEY_METRICS = 'hm_metrics'

function getUser() { return wx.getStorageSync(KEY_USER) || null }
function setUser(user) { wx.setStorageSync(KEY_USER, user) }

function getProfile() { return wx.getStorageSync(KEY_PROFILE) || null }
function setProfile(profile) { wx.setStorageSync(KEY_PROFILE, profile) }

function getMeals() { return wx.getStorageSync(KEY_MEALS) || [] }
function setMeals(meals) { wx.setStorageSync(KEY_MEALS, meals) }

function addMeal(meal) {
  const meals = getMeals()
  meals.unshift(meal)
  setMeals(meals)
}

function getMetrics() { return wx.getStorageSync(KEY_METRICS) || [] }
function addMetric(metric) {
  const metrics = getMetrics()
  metrics.unshift(metric)
  wx.setStorageSync(KEY_METRICS, metrics)
}

module.exports = { getUser, setUser, getProfile, setProfile, getMeals, setMeals, addMeal, getMetrics, addMetric }
