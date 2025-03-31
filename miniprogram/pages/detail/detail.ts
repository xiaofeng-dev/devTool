import { formatTime } from '../../utils/util';
import { MusicItem, musicService } from '../../utils/music';

Page({
  data: {
    musicItem: null as MusicItem | null,
    musicId: '',
    downloadUrl: '',
  },

  onLoad(options: any) {
    if (options.id) {
      this.setData({
        musicId: options.id
      });
      this.loadMusicItem(options.id);
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
  loadMusicItem(id: string) {
    const item = musicService.getItemById(id);
    if (item) {
      this.setData({
        musicItem: item,
        downloadUrl: item.downloadUrl || ''
      });
    } else {
      wx.showToast({
        title: '未找到该音乐',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 输入下载地址
  inputDownloadUrl(e: any) {
    this.setData({
      downloadUrl: e.detail.value
    });
  },

  // 保存下载地址
  saveDownloadUrl() {
    if (!this.data.musicId) return;
    
    const result = musicService.updateItem(this.data.musicId, {
      downloadUrl: this.data.downloadUrl
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
  },

  // 切换完成状态
  toggleStatus() {
    if (!this.data.musicId || !this.data.musicItem) return;
    
    let result;
    if (this.data.musicItem.completed) {
      result = musicService.markAsIncomplete(this.data.musicId);
    } else {
      result = musicService.markAsCompleted(this.data.musicId);
    }
    
    if (result) {
      this.setData({
        musicItem: result
      });
      
      wx.showToast({
        title: result.completed ? '已标记为完成' : '已标记为未完成',
        icon: 'success'
      });
    }
  },

  // 复制下载地址
  copyDownloadUrl() {
    const url = this.data.musicItem && this.data.musicItem.downloadUrl;
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

  // 格式化时间，供WXML使用
  formatTime(timestamp: number) {
    if (!timestamp) return '';
    return formatTime(new Date(timestamp));
  }
}) 