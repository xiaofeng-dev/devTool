// 音乐服务API封装
import { apiBaseUrl } from './util';
import { getAuthHeader } from './auth';

// 基础API路径
const apiPath = '/music';

// 完整接口地址
const apiUrl = apiBaseUrl + apiPath;

// 定义接口
export interface MusicItem {
  id: number;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  fileUrl: string;
  level: string;
  flag: boolean;
  remark: string;
  createTime: string;
  updateTime: string;
}

// 微信请求结果接口
interface WxRequestResult<T> {
  data: {
    code: number;
    msg: string;
    rows?: T[];
    total?: number;
    data?: T;
  };
  statusCode: number;
  header: Record<string, string>;
  cookies: string[];
}

// 音乐API服务
class MusicService {
  /**
   * 初始化音乐服务
   */
  init() {
    console.log('初始化音乐服务API...');
    // 在这里可以添加一些初始化操作，如加载缓存数据等
    try {
      // 读取存储的配置或执行其他初始化操作
      // ...
      
      console.log('音乐服务API初始化成功');
      return true;
    } catch (error) {
      console.error('音乐服务API初始化失败:', error);
      return false;
    }
  }

  /**
   * 获取音乐列表
   * @param flag 是否完成标志
   * @param keyword 搜索关键词
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  async getList(params: { flag?: boolean, keyword?: string, pageNum?: number, pageSize?: number } = {}) {
    try {
      const { flag, keyword, pageNum = 1, pageSize = 10 } = params;
      
      // 构建查询参数
      const queryParams: Record<string, any> = {
        pageNum,
        pageSize
      };
      
      if (flag !== undefined) {
        queryParams.flag = flag;
      }
      
      if (keyword) {
        queryParams.keyword = keyword;
      }
      
      // 将查询参数转换为URL参数字符串
      const queryString = Object.keys(queryParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      
      // 发起请求
      return new Promise<{rows: MusicItem[], total: number}>((resolve, reject) => {
        wx.request({
          url: `${apiUrl}/list?${queryString}`,
          method: 'GET',
          header: {
            'content-type': 'application/json;charset=UTF-8',
            'istoken': 'false'
          },
          success(res: WxRequestResult<MusicItem>) {
            // 检查返回结果
            if (res.statusCode === 200 && res.data.code === 200) {
              resolve({
                rows: res.data.rows || [],
                total: res.data.total || 0
              });
            } else {
              reject(new Error(res.data.msg || '获取音乐列表失败'));
            }
          },
          fail(err) {
            console.error('获取音乐列表失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('获取音乐列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取音乐详情
   * @param id 音乐ID
   */
  async getDetail(id: string | number) {
    try {
      return new Promise<MusicItem>((resolve, reject) => {
        wx.request({
          url: `${apiUrl}/${id}`,
          method: 'GET',
          header: {
            'content-type': 'application/json;charset=UTF-8',
            'istoken': 'false'
          },
          success(res: WxRequestResult<MusicItem>) {
            if (res.statusCode === 200 && res.data.code === 200) {
              resolve(res.data.data as MusicItem);
            } else {
              reject(new Error(res.data.msg || '获取音乐详情失败'));
            }
          },
          fail(err) {
            console.error('获取音乐详情失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('获取音乐详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 新增音乐
   * @param data 音乐数据
   */
  async add(data: Partial<MusicItem>) {
    try {
      return new Promise<any>((resolve, reject) => {
        wx.request({
          url: apiUrl,
          method: 'POST',
          data,
          header: getAuthHeader(),
          success(res: WxRequestResult<any>) {
            if (res.statusCode === 200 && res.data.code === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.msg || '新增音乐失败'));
            }
          },
          fail(err) {
            console.error('新增音乐失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('新增音乐失败:', error);
      throw error;
    }
  }
  
  /**
   * 修改音乐
   * @param data 音乐数据
   */
  async edit(data: Partial<MusicItem>) {
    try {
      return new Promise<any>((resolve, reject) => {
        wx.request({
          url: apiUrl,
          method: 'PUT',
          data,
          header: getAuthHeader(),
          success(res: WxRequestResult<any>) {
            if (res.statusCode === 200 && res.data.code === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.msg || '修改音乐失败'));
            }
          },
          fail(err) {
            console.error('修改音乐失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('修改音乐失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除音乐
   * @param ids 音乐ID数组或单个ID
   */
  async delete(ids: number[] | string[] | number | string) {
    try {
      // 如果是单个ID，转换为数组
      const idsArray = Array.isArray(ids) ? ids : [ids];
      
      return new Promise<any>((resolve, reject) => {
        wx.request({
          url: `${apiUrl}/${idsArray.join(',')}`,
          method: 'DELETE',
          header: getAuthHeader(),
          success(res: WxRequestResult<any>) {
            if (res.statusCode === 200 && res.data.code === 200) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.msg || '删除音乐失败'));
            }
          },
          fail(err) {
            console.error('删除音乐失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('删除音乐失败:', error);
      throw error;
    }
  }
  
  /**
   * 上传文件
   * @param filePath 本地临时文件路径
   * @param type 文件类型，1:封面图片，2:音乐文件
   */
  async uploadFile(filePath: string, type: number = 1) {
    try {
      const authHeader = getAuthHeader();
      return new Promise<any>((resolve, reject) => {
        wx.uploadFile({
          url: `${apiUrl}/upload`,
          filePath,
          name: 'file',
          formData: {
            type: type
          },
          header: {
            ...authHeader,
            'content-type': 'multipart/form-data'
          },
          success(res) {
            // uploadFile返回的数据是字符串，需要转换为对象
            try {
              const data = JSON.parse(res.data);
              if (res.statusCode === 200 && data.code === 200) {
                resolve(data.data);
              } else {
                reject(new Error(data.msg || '上传文件失败'));
              }
            } catch (e) {
              reject(new Error('解析上传结果失败'));
            }
          },
          fail(err) {
            console.error('上传文件失败:', err);
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取未完成的音乐列表
   */
  async getIncompleteItems() {
    try {
      console.log('正在获取未完成音乐列表...');
      const result = await this.getList({ flag: false });
      console.log('获取未完成音乐列表成功:', result);
      return result.rows || [];
    } catch (error) {
      console.error('获取未完成音乐列表失败:', error);
      return [];
    }
  }
  
  /**
   * 获取已完成的音乐列表
   */
  async getCompletedItems() {
    try {
      console.log('正在获取已完成音乐列表...');
      const result = await this.getList({ flag: true });
      console.log('获取已完成音乐列表成功:', result);
      return result.rows || [];
    } catch (error) {
      console.error('获取已完成音乐列表失败:', error);
      return [];
    }
  }
  
  /**
   * 根据ID获取音乐项
   * @param id 音乐ID
   */
  async getItemById(id: string | number) {
    try {
      console.log('正在获取音乐详情，ID:', id);
      const result = await this.getDetail(id);
      console.log('获取音乐详情成功:', result);
      return result;
    } catch (error) {
      console.error('获取音乐详情失败:', error);
      return null;
    }
  }
  
  /**
   * 更新音乐项
   * @param id 音乐ID
   * @param data 要更新的数据
   */
  async updateItem(id: string | number, data: Partial<MusicItem>) {
    try {
      console.log('正在更新音乐，ID:', id, '数据:', data);
      // 先获取完整数据
      const existingItem = await this.getDetail(id);
      if (!existingItem) {
        throw new Error('音乐不存在');
      }
      
      // 合并数据
      const updatedData = {
        ...existingItem,
        ...data
      };
      
      // 调用编辑接口
      await this.edit(updatedData);
      
      // 返回更新后的数据
      return updatedData;
    } catch (error) {
      console.error('更新音乐失败:', error);
      return null;
    }
  }
  
  /**
   * 标记音乐为已完成
   * @param id 音乐ID
   */
  async markAsCompleted(id: string | number) {
    return this.updateItem(id, { flag: true });
  }
  
  /**
   * 标记音乐为未完成
   * @param id 音乐ID
   */
  async markAsIncomplete(id: string | number) {
    return this.updateItem(id, { flag: false });
  }
}

// 导出实例
export const musicService = new MusicService();
