// auth.ts
// 用于处理小程序的身份验证相关功能

/**
 * 检查用户是否已登录
 * @returns 返回用户是否已登录
 */
export const isLoggedIn = (): boolean => {
  const token = wx.getStorageSync('token');
  return !!token;
};

/**
 * 获取用户token
 * @returns 返回存储的token
 */
export const getToken = (): string => {
  return wx.getStorageSync('token') || '';
};

/**
 * 获取请求头
 * @returns 返回包含token的请求头
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return {
    'content-type': 'application/json;charset=UTF-8',
    'istoken': !!token ? 'true' : 'false',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * 检查登录状态，未登录则跳转到登录页
 * @param redirectPath 重定向路径
 * @returns 返回是否已登录
 */
export const checkLogin = (redirectPath?: string): boolean => {
  if (!isLoggedIn()) {
    // 保存当前页面路径，登录后返回
    if (redirectPath) {
      console.log("保存重定向路径:", redirectPath);
      wx.setStorageSync('redirectUrl', redirectPath);
    } else {
      // 获取当前页面路径
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        const url = `/${currentPage.route}`;
        console.log("保存当前页面路径:", url);
        wx.setStorageSync('redirectUrl', url);
      }
    }
    
    // 跳转到登录页
    wx.navigateTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

/**
 * 登出
 */
export const logout = (): void => {
  // 清除存储的token和用户信息
  wx.removeStorageSync('token');
  wx.removeStorageSync('username');
  
  // 跳转到登录页
  wx.redirectTo({
    url: '/pages/login/login'
  });
}; 