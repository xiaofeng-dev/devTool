import { musicService } from '../../utils/music';
import { isLoggedIn, logout } from '../../utils/auth';
import { apiBaseUrl } from '../../utils/util';

// 获取应用实例
const app = getApp<IAppOption>()

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    userInfo: {} as WechatMiniprogram.UserInfo,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    incompleteCount: 0,
    completedCount: 0,
    totalCount: 0,
    isLoggedIn: false,
    username: '',
    avatarUrl: defaultAvatarUrl
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
    this.updateLoginStatus();
  },

  onShow() {
    this.updateStats();
    this.updateLoginStatus();
  },

  // 更新统计数据
  async updateStats() {
    try {
      // 向后台发送请求获取未完成数量
      const incompleteResult = await musicService.getList({
        flag: false,
        pageNum: 1,
        pageSize: 1  // 只需要获取总数，所以pageSize设为1即可
      });
      
      // 向后台发送请求获取已完成数量
      const completedResult = await musicService.getList({
        flag: true,
        pageNum: 1,
        pageSize: 1  // 只需要获取总数，所以pageSize设为1即可
      });
      
      // 更新数据，使用从后台获取的total值
      this.setData({
        incompleteCount: incompleteResult.total || 0,
        completedCount: completedResult.total || 0,
        totalCount: (incompleteResult.total || 0) + (completedResult.total || 0)
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 出错时使用本地方法获取
      this.getStatsLocally();
    }
  },

  // 本地获取统计数据（作为备选方案）
  async getStatsLocally() {
    try {
      const incompleteItems = await musicService.getIncompleteItems();
      const completedItems = await musicService.getCompletedItems();
      
      this.setData({
        incompleteCount: incompleteItems.length || 0,
        completedCount: completedItems.length || 0,
        totalCount: (incompleteItems.length || 0) + (completedItems.length || 0)
      });
    } catch (error) {
      console.error('获取本地统计数据失败:', error);
      this.setData({
        incompleteCount: 0,
        completedCount: 0,
        totalCount: 0
      });
    }
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

  // 更新登录状态
  updateLoginStatus() {
    const loggedIn = isLoggedIn();
    const username = wx.getStorageSync('username') || '';
    
    this.setData({
      isLoggedIn: loggedIn,
      username
    });
  },
  
  // 跳转到登录页
  navigateToLogin() {
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
  handleLogout() {
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
  changePassword() {
    wx.navigateTo({
      url: '/pages/changePassword/changePassword'
    });
  },
  
  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '音乐收藏助手 v1.0.0\n帮助您收集和管理喜爱的音乐',
      showCancel: false
    });
  },
  
  // 联系客服
  contactCustomerService() {
    wx.showModal({
      title: '联系客服',
      content: '如有任何问题，请联系我们的客服团队。\n\n客服邮箱：support@example.com',
      showCancel: false
    });
  }
}) 