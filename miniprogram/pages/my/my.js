// my.js
var musicService = require('../../utils/music').musicService;
var auth = require('../../utils/auth');
var isLoggedIn = auth.isLoggedIn;
var logout = auth.logout;
var apiBaseUrl = require('../../utils/util').apiBaseUrl;

// 获取应用实例
var app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    incompleteCount: 0,
    completedCount: 0,
    totalCount: 0,
    isLoggedIn: false,
    username: ''
  },

  onLoad: function() {
    console.log('[my页面] onLoad');
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

    // 检查登录状态
    this.setData({
      isLoggedIn: isLoggedIn()
    });
    
    if (this.data.isLoggedIn) {
      var username = wx.getStorageSync('username');
      if (username) {
        this.setData({
          username: username
        });
      }
    }

    // 启用分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    this.updateStats();
  },

  onShow: function() {
    console.log('[my页面] onShow');
    // 每次显示页面时更新登录状态
    this.setData({
      isLoggedIn: isLoggedIn()
    });
    
    if (this.data.isLoggedIn) {
      var username = wx.getStorageSync('username');
      if (username) {
        this.setData({
          username: username
        });
      }
    }
    
    this.updateStats();
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
    var that = this;
    
    if (!this.data.canIUseGetUserProfile) {
      wx.showToast({
        title: '您的微信版本不支持此功能',
        icon: 'none'
      });
      return;
    }

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: function(res) {
        var userInfo = res.userInfo;
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', JSON.stringify(userInfo));
      },
      fail: function() {
        wx.showToast({
          title: '已取消授权',
          icon: 'none'
        });
      }
    });
  },

  // 关于应用
  goToAbout: function() {
    console.log('[my页面] 点击了关于应用');
    wx.showModal({
      title: '关于应用',
      content: '音乐查找助手是一款帮助用户管理音乐查找请求的工具。您可以记录朋友分享的音乐，并在找到后记录下载地址。\n\n版本：1.0.0',
      showCancel: false
    });
  },

  // 意见反馈
  showFeedback: function() {
    console.log('[my页面] 点击了意见反馈');
    // 注意这里的邮箱地址修改为了指定的地址
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的使用！如有任何建议或问题，请联系我们：\n\n电子邮件：zhangyuliang94@126.com',
      showCancel: false
    });
  },

  // 版本说明
  showVersionInfo: function() {
    console.log('[my页面] 点击了版本说明');
    wx.showModal({
      title: '版本说明',
      content: '当前版本：1.0.0\n\n更新内容：\n1. 支持音乐查询和记录功能\n2. 优化用户界面体验\n3. 增加分享功能\n4. 修复已知问题',
      showCancel: false
    });
  },

  // 清空数据
  clearData: function() {
    var that = this;
    
    wx.showModal({
      title: '清空数据',
      content: '确定要清空所有音乐请求数据吗？此操作不可恢复！',
      success: function(res) {
        if (res.confirm) {
          // 实际应用中可以实现真正的清空数据功能
          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          });
          
          // 更新统计数据
          that.setData({
            incompleteCount: 0,
            completedCount: 0,
            totalCount: 0
          });
        }
      }
    });
  },

  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 处理退出登录
  handleLogout: function() {
    var that = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          // 调用退出登录函数
          logout();
          
          // 更新页面状态
          that.setData({
            isLoggedIn: false,
            username: ''
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 添加分享功能
  onShareAppMessage: function() {
    return {
      title: '音乐查找助手 - 个人中心',
      path: '/pages/my/my'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '音乐查找助手 - 个人中心',
      query: ''
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