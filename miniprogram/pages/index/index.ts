// index.ts
import { formatTime } from '../../utils/util'
import { MusicItem, musicService } from '../../utils/music'
import { isLoggedIn, checkLogin } from '../../utils/auth'

// 导入分享工具
const share = require('../../utils/share');

// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    activeTab: 'incomplete' as 'incomplete' | 'completed',
    incompleteItems: [] as MusicItem[],
    completedItems: [] as MusicItem[],
    displayIncompleteItems: [] as MusicItem[],
    displayCompletedItems: [] as MusicItem[],
    searchText: '',
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    // 分页相关数据
    incompletePageNum: 1,
    completedPageNum: 1,
    incompleteTotal: 0,
    completedTotal: 0,
    pageSize: 10,
    loading: false,
    incompleteHasMore: true,
    completedHasMore: true
  },

  onLoad() {
    this.loadData();
    
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShow() {
    // 每次页面显示时重新加载数据
    this.resetAndLoadData();
  },

  // 重置分页并加载数据
  resetAndLoadData() {
    this.setData({
      incompleteItems: [],
      completedItems: [],
      displayIncompleteItems: [],
      displayCompletedItems: [],
      incompletePageNum: 1,
      completedPageNum: 1,
      incompleteTotal: 0,
      completedTotal: 0,
      incompleteHasMore: true,
      completedHasMore: true
    });
    this.loadData();
  },

  // 加载音乐数据
  async loadData() {
    if (this.data.loading) return;
    
    console.log('开始加载音乐数据...');
    this.setData({ loading: true });
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      // 根据当前标签页加载对应数据
      if (this.data.activeTab === 'incomplete') {
        await this.loadIncompleteItems();
      } else {
        await this.loadCompletedItems();
      }
      
      console.log('音乐数据加载完成:', { 
        未完成: this.data.incompleteItems.length, 
        已完成: this.data.completedItems.length 
      });
    } catch (error) {
      console.error('加载音乐数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 加载未完成的项目
  async loadIncompleteItems() {
    if (!this.data.incompleteHasMore) return;
    
    try {
      const result = await musicService.getList({
        flag: false,
        pageNum: this.data.incompletePageNum,
        pageSize: this.data.pageSize,
        keyword: this.data.searchText
      });
      
      // 更新数据
      const newItems = [...this.data.incompleteItems, ...result.rows];
      const hasMore = newItems.length < result.total;
      
      this.setData({
        incompleteItems: newItems,
        displayIncompleteItems: newItems,
        incompleteTotal: result.total,
        incompletePageNum: this.data.incompletePageNum + 1,
        incompleteHasMore: hasMore
      });
    } catch (error) {
      console.error('加载未完成项目失败:', error);
      throw error;
    }
  },

  // 加载已完成的项目
  async loadCompletedItems() {
    if (!this.data.completedHasMore) return;
    
    try {
      const result = await musicService.getList({
        flag: true,
        pageNum: this.data.completedPageNum,
        pageSize: this.data.pageSize,
        keyword: this.data.searchText
      });
      
      // 更新数据
      const newItems = [...this.data.completedItems, ...result.rows];
      const hasMore = newItems.length < result.total;
      
      this.setData({
        completedItems: newItems,
        displayCompletedItems: newItems,
        completedTotal: result.total,
        completedPageNum: this.data.completedPageNum + 1,
        completedHasMore: hasMore
      });
    } catch (error) {
      console.error('加载已完成项目失败:', error);
      throw error;
    }
  },

  // 切换标签页
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    
    // 切换标签页后按需加载数据
    if (tab === 'incomplete' && this.data.incompleteItems.length === 0) {
      this.loadIncompleteItems();
    } else if (tab === 'completed' && this.data.completedItems.length === 0) {
      this.loadCompletedItems();
    }
  },

  // 搜索输入事件
  onSearchInput(e: any) {
    const searchText = e.detail.value || '';
    this.setData({ 
      searchText,
      incompletePageNum: 1,
      completedPageNum: 1,
      incompleteItems: [],
      completedItems: [],
      displayIncompleteItems: [],
      displayCompletedItems: [],
      incompleteHasMore: true,
      completedHasMore: true
    });
    
    // 搜索时重新加载数据
    this.loadData();
  },
  
  // 滚动到底部加载更多
  onReachBottom() {
    if (this.data.activeTab === 'incomplete') {
      this.loadIncompleteItems();
    } else {
      this.loadCompletedItems();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.resetAndLoadData();
    wx.stopPullDownRefresh();
  },
  
  // 滚动到底部事件处理函数
  onScrollToBottom() {
    console.log('滚动到底部，加载更多数据');
    // 根据当前标签页加载对应数据
    if (this.data.activeTab === 'incomplete') {
      this.loadIncompleteItems();
    } else {
      this.loadCompletedItems();
    }
  },

  // 导航到详情页
  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 格式化日期，供WXML使用
  formatDate(timestamp: string | number) {
    if (!timestamp) return '';
    
    // 如果是字符串，尝试转换为日期
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    
    return `${date.getMonth() + 1}-${date.getDate()}`;
  },

  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
  },

  // 分享到朋友
  onShareAppMessage() {
    return {
      title: '音乐查找助手 - 帮你管理音乐收藏',
      path: '/pages/index/index',
      imageUrl: '/images/home_selected.png'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '音乐查找助手 - 帮你管理音乐收藏',
      query: '',
      imageUrl: '/images/home_selected.png'
    };
  }
})
