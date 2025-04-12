import { formatTime } from '../../utils/util';
import { MusicItem, musicService } from '../../utils/music';
import { checkLogin } from '../../utils/auth';

// 导入分享工具
const share = require('../../utils/share');

// 引入app定义的接口
interface IAppOption {
  globalData: {
    userInfo?: any;
    musicService?: any;
    tempFile?: {
      path: string;
      name: string;
    }
  }
}

Page({
  data: {
    musicItem: null as MusicItem | null,
    musicId: '',
    downloadUrl: '',
    loading: true,
    isEditMode: false,
    priorityOptions: ['普通', '重要', '紧急'],
    priorityIndex: 0,
    tempImageUrl: '', // 临时图片路径
    tempImageFile: '' // 临时图片文件
  },

  onLoad(options: any) {
    // 移除登录检查，允许未登录用户查看详情
    if (options.id) {
      this.setData({
        musicId: options.id,
        loading: true
      });
      this.loadMusicItem(options.id);
      
      // 显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载音乐项目
  async loadMusicItem(id: string) {
    try {
      wx.showLoading({
        title: '加载中...'
      });
      
      console.log('正在加载音乐详情，ID:', id);
      const item = await musicService.getItemById(id);
      console.log('获取到的音乐详情:', item);
      
      if (item) {
        // 设置优先级索引
        const priorityIndex = this.getLevelIndex(item.level);
        
        this.setData({
          musicItem: item,
          downloadUrl: item.fileUrl || '',
          loading: false,
          priorityIndex
        });
      } else {
        this.setData({
          loading: false,
          musicItem: null
        });
        wx.showToast({
          title: '未找到该音乐',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('加载音乐详情失败:', error);
      this.setData({
        loading: false,
        musicItem: null
      });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 切换编辑模式
  toggleEditMode() {
    // 检查登录状态
    if (!checkLogin()) {
      return;
    }
    
    const isEditMode = !this.data.isEditMode;
    
    if (!isEditMode) {
      // 如果是退出编辑模式，重新加载数据以重置更改
      this.loadMusicItem(this.data.musicId);
    }
    
    this.setData({
      isEditMode
    });
  },
  
  // 选择图片
  chooseImage() {
    // 检查登录状态
    if (!checkLogin() || !this.data.isEditMode) return;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tempImageUrl: tempFilePath,
          tempImageFile: tempFilePath,
          'musicItem.imageUrl': tempFilePath // 显示预览图
        });
      }
    });
  },
  
  // 预览图片
  previewImage() {
    const { musicItem } = this.data;
    if (musicItem && musicItem.imageUrl) {
      wx.previewImage({
        current: musicItem.imageUrl, // 当前显示图片的http链接
        urls: [musicItem.imageUrl] // 需要预览的图片http链接列表
      });
    }
  },
  
  // 名称输入
  onNameChange(e: any) {
    this.setData({
      'musicItem.name': e.detail.value
    });
  },
  
  // 歌手输入
  onArtistChange(e: any) {
    this.setData({
      'musicItem.artist': e.detail.value
    });
  },
  
  // 专辑输入
  onAlbumChange(e: any) {
    this.setData({
      'musicItem.album': e.detail.value
    });
  },
  
  // 备注输入
  onRemarkChange(e: any) {
    this.setData({
      'musicItem.remark': e.detail.value
    });
  },
  
  // 优先级选择
  onLevelChange(e: any) {
    const index = parseInt(e.detail.value);
    const level = this.getLevelFromIndex(index);
    
    this.setData({
      priorityIndex: index,
      'musicItem.level': level
    });
  },
  
  // 获取优先级索引
  getLevelIndex(level: string): number {
    switch(level) {
      case '1': return 0;
      case '2': return 1;
      case '3': return 2;
      default: return 0;
    }
  },
  
  // 从索引获取优先级数值
  getLevelFromIndex(index: number): string {
    switch(index) {
      case 0: return '1';
      case 1: return '2';
      case 2: return '3';
      default: return '1';
    }
  },

  // 保存更改
  async saveChanges() {
    // 检查登录状态
    if (!checkLogin() || !this.data.musicItem) return;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });
      
      let updatedItem = {...this.data.musicItem};
      
      // 如果有新图片，先上传
      if (this.data.tempImageFile) {
        const imageUrl = await musicService.uploadFile(this.data.tempImageFile, 1);
        updatedItem.imageUrl = imageUrl;
      }
      
      // 更新音乐信息
      const result = await musicService.updateItem(this.data.musicId, updatedItem);
      
      if (result) {
        this.setData({
          musicItem: result,
          isEditMode: false,
          tempImageUrl: '',
          tempImageFile: ''
        });
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('保存更改失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 从level转换为优先级
  getPriorityFromLevel(level: string): 'normal' | 'important' | 'urgent' {
    if (!level) return 'normal';
    switch (level) {
      case '1': return 'normal';
      case '2': return 'important';
      case '3': return 'urgent';
      default: return 'normal';
    }
  },

  // 导航返回
  navigateBack() {
    wx.navigateBack();
  },

  // 输入下载地址
  inputDownloadUrl(e: any) {
    this.setData({
      downloadUrl: e.detail.value
    });
  },

  // 保存下载地址
  async saveDownloadUrl() {
    // 检查登录状态
    if (!checkLogin() || !this.data.musicId) return;
    
    try {
      wx.showLoading({
        title: '保存中...'
      });
      
      const result = await musicService.updateItem(this.data.musicId, {
        fileUrl: this.data.downloadUrl
      });
      
      if (result) {
        this.setData({
          musicItem: result
        });
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('保存下载地址失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 切换完成状态
  async toggleStatus() {
    // 检查登录状态
    if (!checkLogin() || !this.data.musicId || !this.data.musicItem) return;
    
    try {
      wx.showLoading({
        title: '更新中...'
      });
      
      let result;
      if (this.data.musicItem.flag) {
        result = await musicService.markAsIncomplete(this.data.musicId);
      } else {
        result = await musicService.markAsCompleted(this.data.musicId);
      }
      
      if (result) {
        this.setData({
          musicItem: result
        });
        
        wx.showToast({
          title: result.flag ? '已标记为完成' : '已标记为未完成',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('切换状态失败:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 复制下载地址
  copyDownloadUrl() {
    const url = this.data.musicItem && this.data.musicItem.fileUrl;
    if (!url) return;
    
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 在浏览器中打开音乐文件
  openMusicFile() {
    const url = this.data.musicItem && this.data.musicItem.fileUrl;
    if (!url) return;
    
    // 检查是否为可支持的音频格式
    const isAudioFile = /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(url);
    
    if (isAudioFile) {
      // 使用小程序内置播放器播放
      wx.showLoading({ title: '准备播放...' });
      
      wx.playBackgroundAudio({
        dataUrl: url,
        title: this.data.musicItem?.name || '音乐',
        coverImgUrl: this.data.musicItem?.imageUrl || '',
        success: () => {
          wx.hideLoading();
          wx.showToast({
            title: '开始播放',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.error('播放失败:', err);
          wx.hideLoading();
          
          // 播放失败时尝试在浏览器中打开
          wx.showModal({
            title: '播放失败',
            content: '是否在浏览器中打开该链接？',
            success: (res) => {
              if (res.confirm) {
                wx.setClipboardData({
                  data: url,
                  success: () => {
                    wx.showToast({
                      title: '链接已复制，请在浏览器中粘贴访问',
                      icon: 'none',
                      duration: 2000
                    });
                  }
                });
              }
            }
          });
        }
      });
    } else {
      // 非音频文件，在系统浏览器中打开
      wx.showModal({
        title: '提示',
        content: '该链接可能不是音频文件，是否在浏览器中打开？',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: url,
              success: () => {
                wx.showToast({
                  title: '链接已复制，请在浏览器中粘贴访问',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          }
        }
      });
    }
  },
  
  // 下载音乐文件
  downloadMusicFile() {
    const url = this.data.musicItem && this.data.musicItem.fileUrl;
    if (!url) return;
    
    // 显示简单提示
    wx.showModal({
      title: '下载功能暂未开放',
      content: '该功能正在完善中，敬请期待',
      showCancel: false,
      confirmText: '我知道了'
    });
  },
  
  // 原有的下载相关函数保留但不使用
  
  // 格式化日期时间，供WXML使用
  formatDateTime(timestamp: string | number) {
    if (!timestamp) return '';
    
    // 如果是字符串，尝试转换为日期
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    
    return formatTime(date);
  },
  
  // 分享到朋友
  onShareAppMessage() {
    const item = this.data.musicItem;
    if (!item) return share.onShareAppMessage();
    
    return {
      title: `音乐：${item.name} - ${item.artist}`,
      path: `/pages/detail/detail?id=${item.id}`,
      imageUrl: item.imageUrl || 'https://minio.xiaofeng.show/music-cover/card_image.png',
      desc: `快来看看"${item.name}"的音乐详情吧！`
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    const item = this.data.musicItem;
    if (!item) return share.onShareTimeline();
    
    return {
      title: `音乐：${item.name} - ${item.artist}`,
      query: `id=${item.id}`,
      imageUrl: item.imageUrl || 'https://minio.xiaofeng.show/music-cover/card_image.png'
    };
  }
}) 