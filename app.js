const store = require('./utils/store')

App({
  globalData: {
    user: null,
    profile: null
  },
  onLaunch() {
    const user = store.getUser()
    const profile = store.getProfile()
    this.globalData.user = user
    this.globalData.profile = profile
  }
})
