const store = require('../utils/store')

function fakeDelay(data, delay = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

function analyzeMeal({ imageUrl, primaryGoal }) {
  const dishes = [
    { id: `d_${Date.now()}_1`, name: '西红柿炒蛋', cookMethod: '炒', baseGrams: 180, finalGrams: 180, adjustMethod: 'auto', confidence: 0.86, nutrition: { kcal: 220, sodium: 420, protein: 12 } },
    { id: `d_${Date.now()}_2`, name: '米饭', cookMethod: '蒸', baseGrams: 150, finalGrams: 150, adjustMethod: 'auto', confidence: 0.93, nutrition: { kcal: 170, sodium: 5, protein: 3 } }
  ]

  const summary = calcSummary(dishes)
  const conclusion = buildConclusion(summary, primaryGoal)
  const advice = buildAdvice(summary, primaryGoal)

  return fakeDelay({ dishes, summary, conclusion, advice, confidence: 0.84, imageUrl }, 800)
}

function recalcMeal({ dishes, primaryGoal }) {
  const summary = calcSummary(dishes)
  const conclusion = buildConclusion(summary, primaryGoal)
  const advice = buildAdvice(summary, primaryGoal)
  return fakeDelay({ summary, conclusion, advice }, 250)
}

function saveMeal({ meal }) {
  store.addMeal(meal)
  return fakeDelay({ ok: true, mealId: meal.mealId })
}

function getDayLog(date) {
  const meals = store.getMeals().filter((m) => (m.time || '').slice(0, 10) === date)
  return fakeDelay({ meals })
}

function getWeeklyReport({ week, primaryGoal }) {
  const meals = store.getMeals().filter((meal) => isMealInWeek(meal, week))
  const days = new Set(meals.map((m) => (m.time || '').slice(0, 10)))
  const energyTargetRate = meals.length ? Math.min(100, Math.round(65 + meals.length * 3)) : 0
  const metrics = goalMetrics(primaryGoal, energyTargetRate)
  return fakeDelay({
    week,
    recordedDays: days.size,
    energyTargetRate,
    metrics,
    advice: ['晚餐减少高盐酱料', '每餐补充一份蔬菜', '优先蒸/煮，少炸少煎'],
    insights: {
      topSources: ['外卖汤面', '咸菜类', '加工肉制品'],
      riskDistribution: { dinner: 52, takeout: 48 }
    }
  })
}

function isMealInWeek(meal, week) {
  const mealTime = parseDate(meal.time)
  const weekAnchor = parseDate(week)
  if (!mealTime || !weekAnchor) return false

  const range = weekRange(weekAnchor)
  return mealTime >= range.start && mealTime <= range.end
}

function weekRange(anchorDate) {
  const start = new Date(anchorDate)
  start.setHours(0, 0, 0, 0)

  const day = start.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - diffToMonday)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function parseDate(value) {
  if (!value) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function calcSummary(dishes) {
  return dishes.reduce((acc, d) => {
    const factor = (d.finalGrams || d.baseGrams) / d.baseGrams
    acc.kcal += Math.round(d.nutrition.kcal * factor)
    acc.sodium += Math.round((d.nutrition.sodium || 0) * factor)
    acc.protein += Math.round((d.nutrition.protein || 0) * factor)
    return acc
  }, { kcal: 0, sodium: 0, protein: 0 })
}

function buildConclusion(summary, primaryGoal) {
  if (primaryGoal === '高血压' && summary.sodium > 900) return '⚠️谨慎'
  if (summary.kcal > 900) return '⚠️谨慎'
  return '✅适合'
}

function buildAdvice(summary, primaryGoal) {
  if (primaryGoal === '高血压') {
    return [
      summary.sodium > 900 ? '本餐钠偏高，下餐以清淡蒸煮为主' : '本餐钠控制不错，继续保持',
      '少用酱油、蚝油等隐形盐来源',
      '搭配深色蔬菜提升钾摄入'
    ]
  }
  return ['优先选择蒸煮炖，减少油炸', '主食适量，补充优质蛋白', '每餐至少1拳蔬菜']
}

function goalMetrics(goal, energyTargetRate) {
  const map = {
    '减脂': [
      { name: '能量达标率', value: `${energyTargetRate}%` },
      { name: '蛋白达标率', value: '71%' },
      { name: '蔬菜/纤维达标率', value: '63%' }
    ],
    '高血压': [
      { name: '能量达标率', value: `${energyTargetRate}%` },
      { name: '高钠餐次数', value: '3次' },
      { name: '蔬果频次评分', value: '76分' }
    ]
  }
  return map[goal] || [
    { name: '能量达标率', value: `${energyTargetRate}%` },
    { name: '风险次数', value: '2次' },
    { name: '保护性摄入评分', value: '72分' }
  ]
}

module.exports = { analyzeMeal, recalcMeal, saveMeal, getDayLog, getWeeklyReport }
