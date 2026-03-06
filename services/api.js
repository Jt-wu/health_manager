const store = require('../utils/store')
const { extractDate } = require('../utils/date')

let visionConfig = {}
try {
  // eslint-disable-next-line global-require
  visionConfig = require('./vision.config')
} catch (e) {
  visionConfig = {}
}

const DEFAULT_ANALYZE_PATH = '/api/v1/vision/analyzeMeal'

function fakeDelay(data, delay = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}

function analyzeMeal({ imageUrl, primaryGoal }) {
  return analyzeMealByVisionModel({ imageUrl, primaryGoal }).catch(() => analyzeMealFallback({ imageUrl, primaryGoal }))
}

function analyzeMealByVisionModel({ imageUrl, primaryGoal }) {
  const endpoint = buildAnalyzeEndpoint()
  if (!endpoint) {
    return Promise.reject(new Error('vision_config_missing'))
  }

  const payload = {
    primaryGoal,
    model: 'gpt-4.1-vision',
    scene: 'meal_multi_dish'
  }

  const headers = buildAuthHeader()
  const isRemoteImage = /^https?:\/\//.test(imageUrl)

  if (isRemoteImage) {
    return requestAnalyzeByJson({ endpoint, payload: { ...payload, imageUrl }, headers, imageUrl, primaryGoal })
  }

  return uploadAnalyzeByFile({ endpoint, payload, headers, imageUrl, primaryGoal })
}

function requestAnalyzeByJson({ endpoint, payload, headers, imageUrl, primaryGoal }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: endpoint,
      method: 'POST',
      timeout: 15000,
      header: headers,
      data: payload,
      success: (res) => {
        try {
          resolve(normalizeAnalyzeResult(res.data, imageUrl, primaryGoal))
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
  })
}

function uploadAnalyzeByFile({ endpoint, payload, headers, imageUrl, primaryGoal }) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: endpoint,
      filePath: imageUrl,
      name: visionConfig.uploadFieldName || 'file',
      formData: payload,
      header: headers,
      timeout: 20000,
      success: (res) => {
        try {
          const parsedData = parseUploadData(res.data)
          resolve(normalizeAnalyzeResult(parsedData, imageUrl, primaryGoal))
        } catch (e) {
          reject(e)
        }
      },
      fail: reject
    })
  })
}

function parseUploadData(raw) {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (e) {
      throw new Error('invalid_upload_json')
    }
  }
  return {}
}

function normalizeAnalyzeResult(rawData, imageUrl, primaryGoal) {
  const body = rawData?.data || rawData?.result || rawData || {}
  const dishList = Array.isArray(body.dishes) ? body.dishes : []
  if (!dishList.length) {
    throw new Error('invalid_vlm_response')
  }

  const dishes = dishList.map(normalizeDish)
  const summary = normalizeSummary(body.summary, dishes)

  return {
    dishes,
    summary,
    conclusion: body.conclusion || buildConclusion(summary, primaryGoal),
    advice: Array.isArray(body.advice) ? body.advice : buildAdvice(summary, primaryGoal),
    confidence: Number(body.confidence || body.score || 0),
    imageUrl,
    modelProvider: body.modelProvider || body.provider || '视觉识别引擎'
  }
}

function normalizeSummary(inputSummary, dishes) {
  if (inputSummary && typeof inputSummary === 'object') {
    return {
      kcal: Number(inputSummary.kcal || inputSummary.energy || 0),
      sodium: Number(inputSummary.sodium || inputSummary.salt || 0),
      protein: Number(inputSummary.protein || 0)
    }
  }
  return calcSummary(dishes)
}

function buildAnalyzeEndpoint() {
  const baseUrl = (visionConfig.baseUrl || '').replace(/\/$/, '')
  const analyzePath = visionConfig.analyzePath || DEFAULT_ANALYZE_PATH
  if (!baseUrl) return ''
  return `${baseUrl}${analyzePath}`
}

function buildAuthHeader() {
  const header = {
    'content-type': 'application/json'
  }
  if (visionConfig.apiKey) {
    header.Authorization = `Bearer ${visionConfig.apiKey}`
  }
  return header
}

function analyzeMealFallback({ imageUrl, primaryGoal }) {
  const dishes = [
    { id: `d_${Date.now()}_1`, name: '西红柿炒蛋', cookMethod: '炒', baseGrams: 180, finalGrams: 180, adjustMethod: 'auto', confidence: 0.86, nutrition: { kcal: 220, sodium: 420, protein: 12 } },
    { id: `d_${Date.now()}_2`, name: '米饭', cookMethod: '蒸', baseGrams: 150, finalGrams: 150, adjustMethod: 'auto', confidence: 0.93, nutrition: { kcal: 170, sodium: 5, protein: 3 } }
  ]

  const summary = calcSummary(dishes)
  const conclusion = buildConclusion(summary, primaryGoal)
  const advice = [
    '当前为离线兜底结果，可能不准确',
    '请先完成视觉识别 API 配置后再使用拍照识别',
    ...buildAdvice(summary, primaryGoal)
  ]

  return fakeDelay({ dishes, summary, conclusion, advice, confidence: 0.2, imageUrl, modelProvider: '本地兜底识别' }, 500)
}

function normalizeDish(d, index) {
  const baseGrams = Number(d.baseGrams || d.base_grams || d.finalGrams || d.grams || 100)
  const nutrition = d.nutrition || {}
  return {
    id: d.id || d.dishId || `d_${Date.now()}_${index}`,
    name: d.name || d.dishName || '未命名菜品',
    cookMethod: d.cookMethod || d.cook_method || '未知',
    baseGrams,
    finalGrams: Number(d.finalGrams || d.final_grams || baseGrams),
    adjustMethod: d.adjustMethod || d.adjust_method || 'auto',
    confidence: Number(d.confidence || d.score || 0),
    nutrition: {
      kcal: Number(nutrition.kcal || nutrition.energy || d.kcal || 0),
      sodium: Number(nutrition.sodium || nutrition.salt || d.sodium || 0),
      protein: Number(nutrition.protein || d.protein || 0)
    }
  }
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
  const meals = store.getMeals().filter((m) => extractDate(m.time) === date)
  return fakeDelay({ meals })
}

function getWeeklyReport({ week, primaryGoal }) {
  const meals = store.getMeals()
  const days = new Set(meals.map((m) => extractDate(m.time)).filter(Boolean))
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
