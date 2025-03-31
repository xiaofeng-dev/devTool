// index.ts
import { formatTime } from '../../utils/util'
import { MusicItem, musicService } from '../../utils/music'

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
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次页面显示时重新加载数据
    this.loadData();
  },

  // 加载音乐数据
  loadData() {
    const incompleteItems = musicService.getIncompleteItems();
    const completedItems = musicService.getCompletedItems();
    
    this.setData({
      incompleteItems,
      completedItems,
      displayIncompleteItems: incompleteItems,
      displayCompletedItems: completedItems,
    });

    // 如果有搜索文本，应用搜索过滤
    if (this.data.searchText) {
      this.applySearch(this.data.searchText);
    }
  },

  // 切换标签页
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 搜索输入事件
  onSearchInput(e: any) {
    const searchText = e.detail.value || '';
    this.setData({ searchText });
    this.applySearch(searchText);
  },

  // 应用搜索过滤
  applySearch(searchText: string) {
    if (!searchText) {
      // 如果搜索框为空，显示所有项目
      this.setData({
        displayIncompleteItems: this.data.incompleteItems,
        displayCompletedItems: this.data.completedItems
      });
      return;
    }

    // 过滤未完成的项目
    const filteredIncomplete = this.data.incompleteItems.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.artist.toLowerCase().includes(searchText.toLowerCase())
    );

    // 过滤已完成的项目
    const filteredCompleted = this.data.completedItems.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) || 
      item.artist.toLowerCase().includes(searchText.toLowerCase())
    );

    this.setData({
      displayIncompleteItems: filteredIncomplete,
      displayCompletedItems: filteredCompleted
    });
  },

  // 导航到详情页
  goToDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 格式化日期，供WXML使用
  formatDate(timestamp: number) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
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
})
