// my.js
var musicService = require('../../utils/music').musicService;
var auth = require('../../utils/auth');
var isLoggedIn = auth.isLoggedIn;
var logout = auth.logout;
var apiBaseUrl = require('../../utils/util').apiBaseUrl;

// 获取应用实例
var app = getApp();

var defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    incompleteCount: 0,
    completedCount: 0,
    totalCount: 0,
    isLoggedIn: false,
    username: '',
    avatarUrl: defaultAvatarUrl
  },

  onLoad: function() {
    // 判断是否支持获取用户信息的新接口
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 获取本地存储的用户信息
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo),
        hasUserInfo: true
      });
    }

    this.updateStats();
    this.updateLoginStatus();
  },

  onShow: function() {
    this.updateStats();
    this.updateLoginStatus();
  },

  // 更新统计数据
  updateStats: function() {
    var that = this;
    
    // 使用Promise处理两个请求
    Promise.all([
      musicService.getList({
        flag: false,
        pageNum: 1,
        pageSize: 1
      }),
      musicService.getList({
        flag: true,
        pageNum: 1,
        pageSize: 1
      })
    ]).then(function(results) {
      // results[0]是未完成列表的结果，results[1]是已完成列表的结果
      var incompleteResult = results[0];
      var completedResult = results[1];
      
      that.setData({
        incompleteCount: incompleteResult.total || 0,
        completedCount: completedResult.total || 0,
        totalCount: (incompleteResult.total || 0) + (completedResult.total || 0)
      });
    }).catch(function(error) {
      console.error('获取统计数据失败:', error);
      // 出错时使用本地方法获取
      that.getStatsLocally();
    });
  },

  // 本地获取统计数据（作为备选方案）
  getStatsLocally: function() {
    var that = this;
    Promise.all([
      musicService.getIncompleteItems(),
      musicService.getCompletedItems()
    ]).then(function(results) {
      var incompleteItems = results[0];
      var completedItems = results[1];
      
      that.setData({
        incompleteCount: incompleteItems.length || 0,
        completedCount: completedItems.length || 0,
        totalCount: (incompleteItems.length || 0) + (completedItems.length || 0)
      });
    }).catch(function(error) {
      console.error('获取本地统计数据失败:', error);
      that.setData({
        incompleteCount: 0,
        completedCount: 0,
        totalCount: 0
      });
    });
  },

  // 获取用户信息
  getUserProfile: function() {
    if (!this.data.canIUseGetUserProfile) {
      wx.showToast({
        title: '您的微信版本不支持此功能',
        icon: 'none'
      });
      return;
    }

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        var userInfo = res.userInfo;
        this.setData({
          userInfo,
          hasUserInfo: true
        });
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', JSON.stringify(userInfo));
      },
      fail: () => {
        wx.showToast({
          title: '已取消授权',
          icon: 'none'
        });
      }
    });
  },

  // 关于应用
  goToAbout: function() {
    wx.showModal({
      title: '关于应用',
      content: '音乐查找助手是一款帮助用户管理音乐查找请求的工具。您可以记录朋友分享的音乐，并在找到后记录下载地址。\n\n版本：1.0.0',
      showCancel: false
    });
  },

  // 意见反馈
  showFeedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的使用！如有任何建议或问题，请联系我们：\n\n电子邮件：zhangyuliang94@126.com',
      showCancel: false
    });
  },

  // 版本说明
  showVersionInfo: function() {
    wx.showModal({
      title: '版本说明',
      content: '当前版本：1.0.0\n\n更新内容：\n1. 支持音乐信息管理\n2. 支持音乐文件链接管理\n3. 优化界面交互体验\n4. 支持按优先级排序\n5. 增加图片预览功能',
      showCancel: false
    });
  },

  // 更新登录状态
  updateLoginStatus: function() {
    var loggedIn = isLoggedIn();
    var username = wx.getStorageSync('username') || '';
    
    this.setData({
      isLoggedIn: loggedIn,
      username
    });
  },
  
  // 跳转到登录页
  navigateToLogin: function() {
    if (this.data.isLoggedIn) {
      // 已登录时显示是否登出的确认框
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            logout();
            this.updateLoginStatus();
          }
        }
      });
    } else {
      // 未登录时直接跳转到登录页
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
  
  // 登出
  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          this.updateLoginStatus();
        }
      }
    });
  },
  
  // 修改密码
  changePassword: function() {
    wx.navigateTo({
      url: '/pages/changePassword/changePassword'
    });
  },
  
  // 关于我们
  aboutUs: function() {
    wx.showModal({
      title: '关于我们',
      content: '音乐收藏助手 v1.0.0\n帮助您收集和管理喜爱的音乐',
      showCancel: false
    });
  },
  
  // 联系客服
  contactCustomerService: function() {
    wx.showModal({
      title: '联系客服',
      content: '如有任何问题，请联系我们的客服团队。\n\n客服邮箱：zhangyuliang94@126.com',
      showCancel: false
    });
  },

  // 分享到朋友
  onShareAppMessage: function() {
    return {
      title: '音乐查找助手 - 您的音乐收藏管家',
      path: '/pages/my/my',
      imageUrl: 'https://minio.xiaofeng.show/music-cover/card_image.png',
      desc: '整理您喜爱的音乐，轻松找到每一首好听的歌'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '音乐查找助手 - 您的音乐收藏管家',
      query: '',
      imageUrl: 'https://minio.xiaofeng.show/music-cover/card_image.png'
    };
  },

  // 显示分享菜单
  showShareMenu: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function() {
        console.log('显示分享菜单成功');
      },
      fail: function(err) {
        console.log('显示分享菜单失败', err);
      }
    });
  }
}); 