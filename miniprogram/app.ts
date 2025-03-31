// app.ts
import { musicService } from './utils/music';

App<IAppOption>({
  globalData: {
    musicService
  },
  onLaunch() {
    // 初始化音乐服务
    musicService.init();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})