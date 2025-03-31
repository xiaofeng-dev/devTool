// 超级简化版音乐服务
function createMusicService() {
  var service = {};
  
  // 内部存储所有数据
  var _incompleteItems = [];
  var _completedItems = [];
  var _initialized = false;
  
  // 初始化数据 - 立即初始化
  service.init = function() {
    if (_initialized) return;
    
    // 生成未完成数据
    _generateIncompleteItems();
    
    // 生成已完成数据
    _generateCompletedItems();
    
    _initialized = true;
    console.log("音乐服务初始化完成：未完成项目" + _incompleteItems.length + "个，已完成项目" + _completedItems.length + "个");
  };
  
  // 生成未完成项目数据（5个）
  function _generateIncompleteItems() {
    var songNames = [
      "无条件", "岁月如歌", "天外来物", "起风了", "最初的梦想"
    ];
    
    var artists = [
      "陈奕迅", "莫文蔚", "薛之谦", "买辣椒也用券", "范玮琪"
    ];
    
    var albums = [
      "rice & shine", "我们在中场相遇", "尘", "起风了", "最初的梦想"
    ];

    var priorityOptions = ["normal", "important", "urgent"];
    
    // 基准时间戳：2023年5月1日
    var baseTimestamp = new Date(2023, 4, 1).getTime();
    var dayMilliseconds = 24 * 60 * 60 * 1000;
    
    _incompleteItems = [];
    for (var i = 0; i < 5; i++) {
      _incompleteItems.push({
        id: String(i + 1),
        name: songNames[i],
        artist: artists[i],
        album: albums[i],
        notes: "请求" + (i + 1) + "：需要高音质版本" + (i % 3 === 0 ? "，最好有MV" : ""),
        imageUrl: "",
        downloadUrl: "",
        priority: priorityOptions[i % 3],
        createdAt: baseTimestamp + (5 - i) * dayMilliseconds,  // 最近的在前面
        completed: false
      });
    }
  }
  
  // 生成已完成项目数据（10个）
  function _generateCompletedItems() {
    var songNames = [
      "句号", "稻香", "光年之外", "倒数", "小城夏天",
      "可能否", "安静", "晴天", "夜曲", "星晴"
    ];
    
    var artists = [
      "邓紫棋", "周杰伦", "邓紫棋", "邓紫棋", "LBI利比",
      "木小雅", "周杰伦", "周杰伦", "周杰伦", "周杰伦"
    ];
    
    var albums = [
      "摩天动物园", "魔杰座", "光年之外", "倒数", "小城夏天",
      "可能否", "范特西", "叶惠美", "11月的萧邦", "Jay"
    ];
    
    // 基准时间戳：2023年3月1日
    var baseTimestamp = new Date(2023, 2, 1).getTime();
    var createBaseTimestamp = new Date(2023, 1, 1).getTime();
    var dayMilliseconds = 24 * 60 * 60 * 1000;
    
    _completedItems = [];
    for (var i = 0; i < 10; i++) {
      _completedItems.push({
        id: String(i + 6),  // 从6开始编号，避免和未完成项目ID冲突
        name: songNames[i],
        artist: artists[i],
        album: albums[i],
        notes: "请求" + (i + 1) + "：已完成下载，" + (i % 3 === 0 ? "包含MV" : "无损音质"),
        imageUrl: "",
        downloadUrl: "https://music.example.com/download/" + (10000 + i),
        priority: ["normal", "important", "urgent"][i % 3],
        createdAt: createBaseTimestamp + i * dayMilliseconds,
        completedAt: baseTimestamp + i * dayMilliseconds,
        completed: true
      });
    }
  }
  
  // 获取未完成项目总数
  service.getIncompleteCount = function() {
    if (!_initialized) this.init();
    return _incompleteItems.length;
  };
  
  // 获取已完成项目总数
  service.getCompletedCount = function() {
    if (!_initialized) this.init();
    return _completedItems.length;
  };
  
  // 获取未完成的音乐项目
  service.getIncompleteItems = function() {
    if (!_initialized) this.init();
    console.log("获取全部未完成项目：" + _incompleteItems.length + "条");
    return _incompleteItems;
  };
  
  // 获取已完成的音乐项目
  service.getCompletedItems = function() {
    if (!_initialized) this.init();
    console.log("获取全部已完成项目：" + _completedItems.length + "条");
    return _completedItems;
  };
  
  // 搜索未完成的音乐项目
  service.searchIncompleteItems = function(keyword) {
    if (!_initialized) this.init();
    
    console.log("搜索未完成项目，关键词：" + keyword);
    
    var filtered = _incompleteItems.filter(function(item) {
      return item.name.toLowerCase().includes(keyword.toLowerCase()) || 
             item.artist.toLowerCase().includes(keyword.toLowerCase());
    });
    
    return {
      items: filtered,
      total: filtered.length
    };
  };
  
  // 搜索已完成的音乐项目
  service.searchCompletedItems = function(keyword) {
    if (!_initialized) this.init();
    
    console.log("搜索已完成项目，关键词：" + keyword);
    
    var filtered = _completedItems.filter(function(item) {
      return item.name.toLowerCase().includes(keyword.toLowerCase()) || 
             item.artist.toLowerCase().includes(keyword.toLowerCase());
    });
    
    return {
      items: filtered,
      total: filtered.length
    };
  };

  // 根据ID获取单个音乐项目
  service.getItemById = function(id) {
    if (!_initialized) this.init();
    
    console.log("获取音乐项目详情，ID：" + id);
    
    var allItems = _incompleteItems.concat(_completedItems);
    var item = null;
    
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].id === id) {
        item = allItems[i];
        break;
      }
    }
    
    return item;
  };

  // 立即初始化，确保数据准备好
  service.init();

  return service;
}

// 创建并导出
var musicService = createMusicService();
exports.musicService = musicService; 