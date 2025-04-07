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
    priorityIndex: 0
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
          priorityIndex,
          isEditMode: false
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
  
  // 获取优先级索引
  getLevelIndex(level: string): number {
    switch(level) {
      case '1': return 0;
      case '2': return 1;
      case '3': return 2;
      default: return 0;
    }
  },
  
  // 获取优先级类名
  getPriorityFromLevel(level: string): 'normal' | 'important' | 'urgent' {
    switch(level) {
      case '1': return 'normal';
      case '2': return 'important';
      case '3': return 'urgent';
      default: return 'normal';
    }
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },
  
  // 复制下载链接
  copyDownloadUrl() {
    const { fileUrl } = this.data.musicItem as MusicItem;
    if (fileUrl) {
      wx.setClipboardData({
        data: fileUrl,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    }
  },
  
  // 打开音乐文件
  openMusicFile() {
    const { fileUrl } = this.data.musicItem as MusicItem;
    if (!fileUrl) {
      wx.showToast({
        title: '链接无效',
        icon: 'error'
      });
      return;
    }
    
    wx.showLoading({
      title: '准备播放...'
    });
    
    // 检查是否为可支持的音频格式
    const isAudioFile = /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(fileUrl);
    
    if (isAudioFile) {
      // 使用小程序内置播放器播放
      const bgAudio = wx.getBackgroundAudioManager();
      bgAudio.title = this.data.musicItem?.name || '音乐';
      bgAudio.singer = this.data.musicItem?.artist || '';
      bgAudio.coverImgUrl = this.data.musicItem?.imageUrl || '';
      bgAudio.src = fileUrl;
      
      bgAudio.onPlay(() => {
        wx.hideLoading();
        wx.showToast({
          title: '开始播放',
          icon: 'success'
        });
      });
      
      bgAudio.onError((err) => {
        console.error('播放失败:', err);
        wx.hideLoading();
        
        // 播放失败时尝试在浏览器中打开
        wx.showModal({
          title: '播放失败',
          content: '是否复制链接到剪贴板？',
          success: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: fileUrl,
                success: () => {
                  wx.showToast({
                    title: '链接已复制',
                    icon: 'success',
                    duration: 2000
                  });
                }
              });
            }
          }
        });
      });
    } else {
      // 非音频文件，提示复制链接
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '该链接可能不是音频文件，是否复制链接？',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: fileUrl,
              success: () => {
                wx.showToast({
                  title: '链接已复制',
                  icon: 'success',
                  duration: 2000
                });
              }
            });
          }
        }
      });
    }
  },
  
  // 格式化时间
  formatDateTime(timestamp: string | number) {
    if (!timestamp) return '';
    
    return formatTime(new Date(timestamp));
  },
  
  // 分享到聊天
  onShareAppMessage() {
    return share.onShareAppMessage({
      title: `音乐 - ${this.data.musicItem?.name}`,
      path: `/pages/detail/detail?id=${this.data.musicId}`
    });
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return share.onShareTimeline({
      title: `音乐 - ${this.data.musicItem?.name}`,
      query: `id=${this.data.musicId}`
    });
  }
}); 