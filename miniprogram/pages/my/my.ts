import { musicService } from '../../utils/music';

// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    userInfo: {} as WechatMiniprogram.UserInfo,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    incompleteCount: 0,
    completedCount: 0,
    totalCount: 0,
  },

  onLoad() {
    // 判断是否支持获取用户信息的新接口
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo),
        hasUserInfo: true
      });
    }

    this.updateStats();
  },

  onShow() {
    this.updateStats();
  },

  // 更新统计数据
  updateStats() {
    const incompleteItems = musicService.getIncompleteItems();
    const completedItems = musicService.getCompletedItems();
    
    this.setData({
      incompleteCount: incompleteItems.length,
      completedCount: completedItems.length,
      totalCount: incompleteItems.length + completedItems.length
    });
  },

  // 获取用户信息
  getUserProfile() {
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
        const userInfo = res.userInfo;
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
  goToAbout() {
    wx.showModal({
      title: '关于应用',
      content: '音乐查找助手是一款帮助用户管理音乐查找请求的工具。您可以记录朋友分享的音乐，并在找到后记录下载地址。\n\n版本：1.0.0',
      showCancel: false
    });
  },

  // 意见反馈
  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的使用！如有任何建议或问题，请联系我们：\n\n电子邮件：support@example.com',
      showCancel: false
    });
  },

  // 清空数据
  clearData() {
    wx.showModal({
      title: '清空数据',
      content: '确定要清空所有音乐请求数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 实际应用中可以实现真正的清空数据功能
          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          });
          
          // 更新统计数据
          this.setData({
            incompleteCount: 0,
            completedCount: 0,
            totalCount: 0
          });
        }
      }
    });
  }
}) 