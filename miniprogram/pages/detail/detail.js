var formatTime = require('../../utils/util').formatTime;
var musicService = require('../../utils/music').musicService;

Page({
  data: {
    item: null,
    loading: true
  },

  onLoad: function(options) {
    var id = options.id;
    
    this.setData({ loading: true });
    
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    try {
      // 获取音乐项目详情
      var item = musicService.getItemById(id);
      
      this.setData({ 
        item: item,
        loading: false
      });
      
      // 设置页面标题
      if (item && item.name) {
        wx.setNavigationBarTitle({
          title: item.name
        });
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('获取音乐详情失败:', error);
      this.setData({ loading: false });
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 格式化日期时间
  formatDateTime: function(timestamp) {
    if (!timestamp) return '';
    return formatTime(new Date(timestamp));
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
}); 