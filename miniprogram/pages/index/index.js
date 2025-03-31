var formatTime = require('../../utils/util').formatTime;
var musicService = require('../../utils/music').musicService;

// 获取应用实例
var app = getApp();

// 显示回顶部按钮的滚动阈值
var SCROLL_THRESHOLD = 200;

Page({
  data: {
    activeTab: 'incomplete',
    incompleteItems: [],
    completedItems: [],
    displayIncompleteItems: [],
    displayCompletedItems: [],
    searchText: '',
    // 加载状态
    incompleteLoading: false,
    completedLoading: false,
    // 滚动相关
    incompleteScrollTop: 0,
    completedScrollTop: 0,
    showBackToTop: false
  },

  onLoad: function() {
    // 加载初始数据
    this.loadDataForCurrentTab();
  },

  onShow: function() {
    // 每次页面显示时重新加载当前标签页的数据
    this.loadDataForCurrentTab();
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '音乐下载请求小助手',
      path: '/pages/index/index',
      imageUrl: '/images/share_cover.png' // 可选，分享图片
    }
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '音乐下载请求小助手',
      query: '',
      imageUrl: '/images/share_cover.png' // 可选，分享图片
    }
  },

  // 加载当前标签页的数据
  loadDataForCurrentTab: function() {
    if (this.data.activeTab === 'incomplete') {
      this.loadIncompleteData();
    } else {
      this.loadCompletedData();
    }
  },

  // 加载未完成的音乐数据
  loadIncompleteData: function() {
    // 设置加载状态
    this.setData({ incompleteLoading: true });
    
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    try {
      // 如果有搜索关键词，使用搜索接口
      if (this.data.searchText) {
        var result = musicService.searchIncompleteItems(this.data.searchText);
        
        this.setData({
          incompleteItems: result.items,
          displayIncompleteItems: result.items,
          incompleteLoading: false,
          // 重置滚动位置
          incompleteScrollTop: 0,
          showBackToTop: false
        });
      } else {
        // 获取所有未完成数据
        var items = musicService.getIncompleteItems();
        
        this.setData({
          incompleteItems: items,
          displayIncompleteItems: items,
          incompleteLoading: false,
          // 重置滚动位置
          incompleteScrollTop: 0,
          showBackToTop: false
        });
      }
      
      wx.hideLoading();
      
      console.log("未完成项目加载成功，共" + this.data.incompleteItems.length + "项");
    } catch (error) {
      console.error('加载未完成数据失败:', error);
      this.setData({ incompleteLoading: false });
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 加载已完成的音乐数据
  loadCompletedData: function() {
    // 设置加载状态
    this.setData({ completedLoading: true });
    
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    try {
      // 如果有搜索关键词，使用搜索接口
      if (this.data.searchText) {
        var result = musicService.searchCompletedItems(this.data.searchText);
        
        this.setData({
          completedItems: result.items,
          displayCompletedItems: result.items,
          completedLoading: false,
          // 重置滚动位置
          completedScrollTop: 0,
          showBackToTop: false
        });
      } else {
        // 获取所有已完成数据
        var items = musicService.getCompletedItems();
        
        this.setData({
          completedItems: items,
          displayCompletedItems: items,
          completedLoading: false,
          // 重置滚动位置
          completedScrollTop: 0,
          showBackToTop: false
        });
      }
      
      wx.hideLoading();
      
      console.log("已完成项目加载成功，共" + this.data.completedItems.length + "项");
    } catch (error) {
      console.error('加载已完成数据失败:', error);
      this.setData({ completedLoading: false });
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 监听未完成列表的滚动
  onIncompleteScroll: function(e) {
    if (e.detail.scrollTop > SCROLL_THRESHOLD && !this.data.showBackToTop) {
      this.setData({ showBackToTop: true });
    } else if (e.detail.scrollTop <= SCROLL_THRESHOLD && this.data.showBackToTop) {
      this.setData({ showBackToTop: false });
    }
  },

  // 监听已完成列表的滚动
  onCompletedScroll: function(e) {
    if (e.detail.scrollTop > SCROLL_THRESHOLD && !this.data.showBackToTop) {
      this.setData({ showBackToTop: true });
    } else if (e.detail.scrollTop <= SCROLL_THRESHOLD && this.data.showBackToTop) {
      this.setData({ showBackToTop: false });
    }
  },

  // 回到顶部
  backToTop: function() {
    if (this.data.activeTab === 'incomplete') {
      this.setData({ incompleteScrollTop: 0 });
    } else {
      this.setData({ completedScrollTop: 0 });
    }
    this.setData({ showBackToTop: false });
  },

  // 切换标签页
  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      showBackToTop: false
    });
    
    // 加载对应标签页的数据
    if (tab === 'incomplete') {
      this.loadIncompleteData();
    } else {
      this.loadCompletedData();
    }
  },

  // 搜索输入事件
  onSearchInput: function(e) {
    var searchText = e.detail.value || '';
    this.setData({ 
      searchText: searchText
    });
    
    // 加载当前标签页数据
    this.loadDataForCurrentTab();
  },

  // 导航到详情页
  goToDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },

  // 格式化日期，供WXML使用
  formatDate: function(timestamp) {
    if (!timestamp) return '';
    var date = new Date(timestamp);
    return date.getMonth() + 1 + '-' + date.getDate();
  }
}); 