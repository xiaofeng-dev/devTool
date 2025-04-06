// app.js
var musicService = require('./utils/music').musicService;
var share = require('./utils/share');

// 导入TypeScript版本的音乐服务（如果编译后可以直接使用）
// 注意：TypeScript文件在运行时会编译为JavaScript，实际引用的是编译后的JS文件
try {
  // 尝试导入新版本音乐服务API
  const { musicService: newMusicService } = require('./utils/music.js');
  // 如果导入成功，替换旧版本服务
  if (newMusicService) {
    console.log('使用新版本音乐服务API');
    musicService = newMusicService;
  }
} catch(e) {
  console.log('使用旧版本音乐服务', e);
  // 保持使用旧版本服务
}

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
    },
    // API基础地址
    apiBaseUrl: 'https://ruoyi-back.xiaofeng.show/dev-tool'
  },
  onLaunch: function (options) {
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

    // 处理群分享进入的场景
    if (options.shareTicket) {
      // 获取转发信息
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success: function(res) {
          // 解密数据
          console.log('分享信息：', res);
          // res.encryptedData 需要发送到开发者服务器进行解密
          // res.iv 需要发送到开发者服务器进行解密
        },
        fail: function(res) {
          console.error('获取分享信息失败：', res);
        }
      });
    }
  },
  
  onShow: function (options) {
    // 处理从群分享卡片进入的场景
    if (options.shareTicket) {
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success: function(res) {
          console.log('分享信息：', res);
          // res.encryptedData 需要发送到开发者服务器进行解密
          // res.iv 需要发送到开发者服务器进行解密
        },
        fail: function(res) {
          console.error('获取分享信息失败：', res);
        }
      });
    }
  },
  
  // 全局方法：应用分享配置到页面
  applyShareConfig: function(pageObj) {
    return share.configurePageShare(pageObj);
  }
}); 