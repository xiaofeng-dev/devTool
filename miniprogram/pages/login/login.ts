import { apiBaseUrl } from '../../utils/util';

interface LoginResult {
  msg: string;
  code: number;
  token: string;
}

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    errorMsg: ''
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    
    if (token) {
      const redirectUrl = wx.getStorageSync('redirectUrl') || '/pages/index/index';
      
      // 判断是否为tabBar页面，如果是则使用switchTab，否则使用redirectTo
      if (redirectUrl === '/pages/index/index' || 
          redirectUrl === '/pages/add/add' || 
          redirectUrl === '/pages/my/my') {
        wx.switchTab({
          url: redirectUrl.substring(1) // 移除前面的斜杠
        });
      } else {
        wx.redirectTo({
          url: redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl
        });
      }
    }
  },

  // 用户名输入
  onUsernameInput(e: any) {
    this.setData({
      username: e.detail.value,
      errorMsg: ''
    });
  },

  // 密码输入
  onPasswordInput(e: any) {
    this.setData({
      password: e.detail.value,
      errorMsg: ''
    });
  },

  // 登录
  login() {
    const { username, password } = this.data;
    
    // 输入验证
    if (!username.trim()) {
      this.setData({ errorMsg: '请输入用户名' });
      return;
    }
    
    if (!password.trim()) {
      this.setData({ errorMsg: '请输入密码' });
      return;
    }
    
    this.setData({ loading: true });
    
    // 调用登录API
    wx.request({
      url: apiBaseUrl + '/login',
      method: 'POST',
      data: {
        username,
        password
      },
      header: {
        'content-type': 'application/json;charset=UTF-8',
        'istoken': 'false'
      },
      success: (res: any) => {
        const result = res.data as LoginResult;
        
        if (result.code === 200 && result.token) {
          // 登录成功，保存token
          wx.setStorageSync('token', result.token);
          wx.setStorageSync('username', username);
          
          // 跳转到之前的页面或主页
          const redirectUrl = wx.getStorageSync('redirectUrl') || '/pages/index/index';
          wx.removeStorageSync('redirectUrl'); // 清除重定向记录
          
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1000
          });
          
          setTimeout(() => {
            // 判断是否为tabBar页面，如果是则使用switchTab，否则使用redirectTo
            try {
              if (redirectUrl === '/pages/index/index' || 
                  redirectUrl === '/pages/add/add' || 
                  redirectUrl === '/pages/my/my') {
                wx.switchTab({
                  url: '/pages/index/index'
                });
              } else {
                wx.redirectTo({
                  url: '/pages/index/index'
                });
              }
            } catch (error) {
              // 发生错误时直接尝试跳转到首页
              wx.switchTab({
                url: '/pages/index/index'
              });
            }
          }, 1000);
        } else {
          // 登录失败
          this.setData({
            errorMsg: result.msg || '登录失败，请检查用户名和密码'
          });
        }
      },
      fail: () => {
        this.setData({
          errorMsg: '登录失败，请检查网络连接'
        });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  }
}); 