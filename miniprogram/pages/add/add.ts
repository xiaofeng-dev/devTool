import { musicService } from '../../utils/music';
import { checkLogin } from '../../utils/auth';

Page({
  data: {
    formData: {
      name: '',
      artist: '',
      album: '',
      notes: '',
      priority: 'normal' as 'normal' | 'important' | 'urgent',
      flag: false, // 完成状态标志，默认未完成
    },
    tempImageUrl: '', // 临时图片路径
    tempImageFile: '', // 临时图片文件路径（用于上传）
    musicFileName: '', // 音乐文件名
    tempMusicFile: '', // 临时音乐文件路径（用于上传）
  },

  onLoad() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
  },

  // 选择图片
  chooseImage() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImageUrl: tempFilePath,
          tempImageFile: tempFilePath
        });
      }
    });
  },

  // 输入歌曲名称
  inputName(e: any) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 输入歌手名称
  inputArtist(e: any) {
    this.setData({
      'formData.artist': e.detail.value
    });
  },

  // 输入专辑名称
  inputAlbum(e: any) {
    this.setData({
      'formData.album': e.detail.value
    });
  },

  // 输入备注
  inputNotes(e: any) {
    this.setData({
      'formData.notes': e.detail.value
    });
  },

  // 设置优先级
  setPriority(e: any) {
    const priority = e.currentTarget.dataset.priority;
    this.setData({
      'formData.priority': priority
    });
  },

  // 表单验证
  validateForm(): boolean {
    const { name, artist } = this.data.formData;
    
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

  // 选择音乐文件
  chooseMusicFile() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
    
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'ogg'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path;
        const fileName = res.tempFiles[0].name;
        this.setData({
          musicFileName: fileName,
          tempMusicFile: tempFilePath
        });
      }
    });
  },

  // 保存音乐请求
  async saveMusic() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
    
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({
      title: '保存中...',
    });

    try {
      let imageUrl = '';
      let fileUrl = '';
      
      // 如果有图片，先上传图片
      if (this.data.tempImageFile) {
        imageUrl = await musicService.uploadFile(this.data.tempImageFile, 1);
      }
      
      // 如果有音乐文件，上传音乐文件
      if (this.data.tempMusicFile) {
        fileUrl = await musicService.uploadFile(this.data.tempMusicFile, 2);
      }
      
      // 保存音乐信息
      await musicService.add({
        name: this.data.formData.name,
        artist: this.data.formData.artist,
        album: this.data.formData.album || '',
        remark: this.data.formData.notes || '',
        level: this.getPriorityLevel(),
        flag: false, // 默认未完成
        imageUrl,
        fileUrl
      });
      
      wx.hideLoading();
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 延迟返回首页，让用户看到提示
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
      console.error('保存失败:', error);
    }
  },
  
  // 获取优先级对应的数字
  getPriorityLevel(): string {
    const priority = this.data.formData.priority;
    switch (priority) {
      case 'normal': return '1';
      case 'important': return '2';
      case 'urgent': return '3';
      default: return '1';
    }
  }
}) 