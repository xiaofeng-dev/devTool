// app.js
var musicService = require('./utils/music').musicService;

App({
  globalData: {
    musicService: musicService
  },
  onLaunch: function() {
    // 初始化音乐服务
    musicService.init();

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 登录
    wx.login({
      success: function(res) {
        console.log(res.code);
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
  }
}); 