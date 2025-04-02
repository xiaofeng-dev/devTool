// app.js
var musicService = require('./utils/music').musicService;
var share = require('./utils/share');

App({
  globalData: {
    musicService: musicService,
    userInfo: null,
    // 全局分享设置
    shareInfo: {
      title: '音乐查找助手',
      desc: '帮你快速查找和收集音乐资源',
      path: '/pages/index/index',
      imageUrl: '/images/home_selected.png'
    }
  },
  onLaunch: function() {
    // 初始化音乐服务
    musicService.init();
    
    // 初始化全局分享信息
    share.setShareInfo({
      title: '音乐查找助手',
      desc: '帮你快速查找和收集音乐资源',
      path: '/pages/index/index',
      imageUrl: '/images/home_selected.png'
    });

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
  },
  
  // 全局方法：应用分享配置到页面
  applyShareConfig: function(pageObj) {
    return share.configurePageShare(pageObj);
  }
}); 