// 导入音乐服务
var musicService = require('../../utils/music').musicService;

Page({
  data: {
    formData: {
      name: '',
      artist: '',
      album: '',
      notes: '',
      priority: 'normal', // 'normal' | 'important' | 'urgent'
    },
    tempImageUrl: '', // 临时图片路径
    tempImageFile: '', // 临时图片文件路径（用于上传）
  },

  // 选择图片
  chooseImage: function() {
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: function(res) {
        var tempFilePath = res.tempFiles[0].tempFilePath;
        that.setData({
          tempImageUrl: tempFilePath,
          tempImageFile: tempFilePath
        });
      }
    });
  },

  // 输入歌曲名称
  inputName: function(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 输入歌手名称
  inputArtist: function(e) {
    this.setData({
      'formData.artist': e.detail.value
    });
  },

  // 输入专辑名称
  inputAlbum: function(e) {
    this.setData({
      'formData.album': e.detail.value
    });
  },

  // 输入备注
  inputNotes: function(e) {
    this.setData({
      'formData.notes': e.detail.value
    });
  },

  // 设置优先级
  setPriority: function(e) {
    var priority = e.currentTarget.dataset.priority;
    this.setData({
      'formData.priority': priority
    });
  },

  // 表单验证
  validateForm: function() {
    var name = this.data.formData.name;
    var artist = this.data.formData.artist;
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入歌曲名称',
        icon: 'none'
      });
      return false;
    }
    
    if (!artist.trim()) {
      wx.showToast({
        title: '请输入歌手名称',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 保存音乐请求
  saveMusic: function() {
    var that = this;
    
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({
      title: '保存中...',
    });

    // 如果有图片，先上传图片
    var saveData = function() {
      // 实际项目中这里应该上传图片到服务器，但微信小程序Demo中我们保存到本地
      var imageUrl = that.data.tempImageUrl || ''; // 在实际项目中，这里应该是服务器返回的URL
      
      // 保存音乐请求
      musicService.addItem({
        name: that.data.formData.name,
        artist: that.data.formData.artist,
        album: that.data.formData.album || '',
        notes: that.data.formData.notes || '',
        priority: that.data.formData.priority,
        imageUrl: imageUrl,
      });

      wx.hideLoading();
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: function() {
          // 延迟返回首页，让用户看到提示
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      });
    };

    // 执行保存
    saveData();
  }
}); 