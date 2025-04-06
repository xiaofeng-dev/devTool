// app.ts
import { musicService } from './utils/music';

interface UserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
}

interface IAppOption {
  globalData: {
    userInfo?: UserInfo;
    musicService?: any;
    tempFile?: {
      path: string;
      name: string;
    }
  }
  // ... 其他属性
}

App<IAppOption>({
  globalData: {
    musicService
  },
  onLaunch() {
    // 初始化音乐服务
    musicService.init();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    console.log('小程序启动');

    // 登录
    wx.login({
      success: res => {
        console.log('微信登录成功，code:', res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail: err => {
        console.error('微信登录失败:', err);
      }
    });
    
    // 捕获全局未处理的Promise错误
    wx.onUnhandledRejection((res) => {
      console.error('全局未处理的Promise错误:', res.reason);
    });
    
    // 捕获全局脚本错误
    wx.onError((err) => {
      console.error('全局脚本错误:', err);
    });
  },
  
  // 小程序错误处理函数
  onError(err: string) {
    console.error('小程序发生错误:', err);
  },
  
  // 小程序页面找不到处理函数
  onPageNotFound(res: any) {
    console.error('页面不存在:', res.path);
    // 跳转到首页
    wx.switchTab({
      url: 'pages/index/index'
    });
  }
})