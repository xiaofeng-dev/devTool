// 全局分享配置
const globalShareInfo = {
  title: '音乐查找助手',
  desc: '帮你快速查找和收集音乐资源',
  path: '/pages/index/index',
  imageUrl: '/images/home_selected.png'
};

// 更新全局分享信息
function setShareInfo(shareInfo) {
  if (shareInfo.title) globalShareInfo.title = shareInfo.title;
  if (shareInfo.desc) globalShareInfo.desc = shareInfo.desc;
  if (shareInfo.path) globalShareInfo.path = shareInfo.path;
  if (shareInfo.imageUrl) globalShareInfo.imageUrl = shareInfo.imageUrl;
}

// 获取全局分享信息
function getShareInfo() {
  return { ...globalShareInfo };
}

// 为页面添加分享功能
function configurePageShare(pageObj) {
  if (!pageObj.onShareAppMessage) {
    pageObj.onShareAppMessage = function(options) {
      console.log('页面分享到朋友', options);
      return {
        title: globalShareInfo.title,
        path: globalShareInfo.path,
        imageUrl: globalShareInfo.imageUrl
      };
    };
  }
  
  if (!pageObj.onShareTimeline) {
    pageObj.onShareTimeline = function() {
      console.log('页面分享到朋友圈');
      return {
        title: globalShareInfo.title,
        query: '',
        imageUrl: globalShareInfo.imageUrl
      };
    };
  }
  
  const originalOnLoad = pageObj.onLoad;
  pageObj.onLoad = function(options) {
    // 调用原始的onLoad
    if (originalOnLoad) {
      originalOnLoad.call(this, options);
    }
    
    // 显示分享菜单
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
  };
  
  return pageObj;
}

// 分享到朋友
function onShareAppMessage(options) {
  console.log('分享到朋友', options);
  return {
    title: globalShareInfo.title,
    desc: globalShareInfo.desc,
    path: globalShareInfo.path,
    imageUrl: globalShareInfo.imageUrl
  };
}

// 分享到朋友圈
function onShareTimeline() {
  console.log('分享到朋友圈');
  return {
    title: globalShareInfo.title,
    query: '',
    imageUrl: globalShareInfo.imageUrl
  };
}

module.exports = {
  setShareInfo,
  getShareInfo,
  onShareAppMessage,
  onShareTimeline,
  configurePageShare
}; 