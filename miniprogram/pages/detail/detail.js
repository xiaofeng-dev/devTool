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

  // 预览图片
  previewImage: function() {
    var item = this.data.item;
    if (item && item.imageUrl) {
      wx.previewImage({
        current: item.imageUrl, // 当前显示图片的http链接
        urls: [item.imageUrl] // 需要预览的图片http链接列表
      });
    }
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 分享给朋友
  onShareAppMessage: function() {
    var item = this.data.item;
    var title = item ? (item.name + ' - ' + item.artist) : '音乐详情';
    var path = '/pages/detail/detail?id=' + (item ? item.id : '');
    
    return {
      title: title,
      path: path,
      imageUrl: item && item.imageUrl ? item.imageUrl : 'https://minio.xiaofeng.show/music-cover/card_image.png',
      desc: item ? `快来看看"${item.name}"的音乐详情吧！` : '整理您喜爱的音乐，轻松找到每一首好听的歌'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    var item = this.data.item;
    var title = item ? (item.name + ' - ' + item.artist) : '音乐详情';
    var query = 'id=' + (item ? item.id : '');
    
    return {
      title: title,
      query: query,
      imageUrl: item && item.imageUrl ? item.imageUrl : 'https://minio.xiaofeng.show/music-cover/card_image.png'
    };
  }
}); 