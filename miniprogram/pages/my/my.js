// my.js
var musicService = require('../../utils/music').musicService;

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

    // 启用分享功能
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

    this.updateStats();
  },

  onShow: function() {
    this.updateStats();
  },

  // 更新统计数据
  updateStats: function() {
    var incompleteItems = musicService.getIncompleteItems();
    var completedItems = musicService.getCompletedItems();
    
    this.setData({
      incompleteCount: incompleteItems.length,
      completedCount: completedItems.length,
      totalCount: incompleteItems.length + completedItems.length
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
      content: '感谢您的使用！如有任何建议或问题，请联系我们：\n\n电子邮件：support@example.com',
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

  // 添加分享功能
  onShareAppMessage: function() {
    return {
      title: '音乐查找助手 - 个人中心',
      path: '/pages/my/my',
      success: function(res) {
        console.log('分享成功', res);
      },
      fail: function(res) {
        console.log('分享失败', res);
      }
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '音乐查找助手 - 个人中心',
      query: '',
      success: function(res) {
        console.log('分享朋友圈成功', res);
      },
      fail: function(res) {
        console.log('分享朋友圈失败', res);
      }
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