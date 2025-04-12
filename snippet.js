// 获取应用实例 / 用于确保更新
Page({
  // 意见反馈
  showFeedback: function() {
    console.log("意见反馈 被点击");
    wx.showModal({
      title: "意见反馈",
      content: "感谢您的使用！如有任何建议或问题，请联系我们：\n\n电子邮件：zhangyuliang94@126.com",
      showCancel: false
    });
  },

  // 版本说明
  showVersionInfo: function() {
    console.log("版本说明 被点击");
    wx.showModal({
      title: "版本说明",
      content: "当前版本：1.0.0\n\n更新内容：\n1. 支持音乐查询和记录功能\n2. 优化用户界面体验\n3. 增加分享功能\n4. 修复已知问题",
      showCancel: false
    });
  }
});

