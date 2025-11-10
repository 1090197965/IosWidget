import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileCache } from '../util/fileCache.class';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

const FAVORITE_CACHE_PREFIX = 'Favorite_Cache_';

interface SaveFavoriteDto {
  type: string;
  data: Record<string, unknown>;
}

interface VersionInfo {
  version: string; // v1, v2, v3 或 V20251110
  saveTime: string;
  jsonLength: number;
}

interface ArchiveInfo {
  version: string; // V20251110
  saveTime: string;
  jsonLength: number;
}

@Controller('favorite')
export class FavoriteController {
  constructor(
    @Inject(FileCache) private readonly cacheManager: FileCache,
  ) {}

  /**
   * 获取北京时间（东八区，UTC+8）的日期对象
   */
  private getBeijingTime(): Date {
    const now = new Date();
    // 获取 UTC 时间戳（毫秒）
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    // 转换为北京时间（UTC+8）
    const beijingTime = new Date(utcTime + (8 * 60 * 60 * 1000));
    return beijingTime;
  }

  /**
   * 获取当前日期格式的版本号，例如 V20251110（使用北京时间）
   */
  private getDateVersion(): string {
    const beijingTime = this.getBeijingTime();
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    return `V${year}${month}${day}`;
  }

  /**
   * 获取当前日期字符串，格式：YYYY-MM-DD（使用北京时间）
   */
  private getTodayString(): string {
    const beijingTime = this.getBeijingTime();
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取北京时间格式的 ISO 字符串，格式：YYYY-MM-DDTHH:mm:ss+08:00
   */
  private getBeijingTimeISOString(): string {
    const beijingTime = this.getBeijingTime();
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    const hours = String(beijingTime.getHours()).padStart(2, '0');
    const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
    const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
  }

  @Post('save')
  async save(@Body() body: SaveFavoriteDto, @Res() res: Response) {
    // 校验 type 参数
    if (!body.type || body.type.trim() === '') {
      res.status(400).json({
        code: 1,
        data: {
          type: body.type || '',
          message: 'type参数不能为空',
        },
        message: 'type参数不能为空',
      });
      return;
    }
    
    const cacheKey = FAVORITE_CACHE_PREFIX + body.type;
    const versionsKey = FAVORITE_CACHE_PREFIX + body.type + '_versions';
    const archivesKey = FAVORITE_CACHE_PREFIX + body.type + '_archives';
    const lastArchiveDateKey = FAVORITE_CACHE_PREFIX + body.type + '_lastArchiveDate';
    const v3Key = FAVORITE_CACHE_PREFIX + body.type + '_v3';
    
    // 获取当前版本列表
    let versions = await this.cacheManager.get<VersionInfo[]>(versionsKey) || [];
    
    // 每日归档功能：检查是否是今天的第一次保存
    const today = this.getTodayString();
    const lastArchiveDate = await this.cacheManager.get<string>(lastArchiveDateKey);
    
    if (lastArchiveDate !== today) {
      // 今天是第一次保存，需要归档当前最新记录
      // 获取当前最新记录（优先使用 v3，如果没有则使用 cacheKey）
      let latestData = await this.cacheManager.get<Record<string, unknown>>(v3Key);
      if (!latestData) {
        latestData = await this.cacheManager.get<Record<string, unknown>>(cacheKey);
      }
      
      if (latestData) {
        // 生成日期版本号
        const dateVersion = this.getDateVersion();
        const archiveKey = FAVORITE_CACHE_PREFIX + body.type + '_' + dateVersion;
        const archiveJsonString = JSON.stringify(latestData);
        const archiveJsonLength = archiveJsonString.length;
        const archiveSaveTime = this.getBeijingTimeISOString();
        
        // 保存归档数据
        await this.cacheManager.set(archiveKey, latestData);
        
        // 获取归档列表并添加新的归档记录
        let archives = await this.cacheManager.get<ArchiveInfo[]>(archivesKey) || [];
        archives.push({
          version: dateVersion,
          saveTime: archiveSaveTime,
          jsonLength: archiveJsonLength,
        });
        await this.cacheManager.set(archivesKey, archives);
        
        // 更新最后归档日期
        await this.cacheManager.set(lastArchiveDateKey, today);
      }
    }
    
    // 防重功能：检查新数据是否与上一个版本（v3）相同
    const v3Data = await this.cacheManager.get<Record<string, unknown>>(v3Key);
    if (v3Data) {
      // 使用 JSON.stringify 进行深度比较
      const newDataString = JSON.stringify(body.data);
      const v3DataString = JSON.stringify(v3Data);
      if (newDataString === v3DataString) {
        // 数据未发生变化，返回失败提示
        res.json({
          code: 1,
          data: {
            type: body.type,
            message: '无变化',
          },
          message: '无变化',
        });
        return;
      }
    }
    
    const jsonString = JSON.stringify(body.data);
    const jsonLength = jsonString.length;
    const saveTime = this.getBeijingTimeISOString();
    
    // 删除最旧的版本 v1
    const v1Key = FAVORITE_CACHE_PREFIX + body.type + '_v1';
    await this.cacheManager.del(v1Key);
    
    // 版本轮转：v2 -> v1, v3 -> v2
    const v2Key = FAVORITE_CACHE_PREFIX + body.type + '_v2';
    
    // 获取 v2 的数据（v3 已经在防重检查时获取过了）
    const v2Data = await this.cacheManager.get<Record<string, unknown>>(v2Key);
    
    // 如果 v2 存在，移动到 v1
    if (v2Data) {
      await this.cacheManager.set(v1Key, v2Data);
    }
    
    // 如果 v3 存在，移动到 v2
    if (v3Data) {
      await this.cacheManager.set(v2Key, v3Data);
    }
    
    // 新数据保存为 v3
    await this.cacheManager.set(v3Key, body.data);
    
    // 更新版本信息列表
    // 获取当前 v2 和 v3 的版本信息
    const v2Info = versions.find((v) => v.version === 'v2');
    const v3Info = versions.find((v) => v.version === 'v3');
    
    // 重新构建版本信息列表：v2 -> v1, v3 -> v2, 新数据 -> v3
    const newVersions: VersionInfo[] = [];
    
    // 如果 v2 存在，变成 v1
    if (v2Info) {
      newVersions.push({
        version: 'v1',
        saveTime: v2Info.saveTime,
        jsonLength: v2Info.jsonLength,
      });
    }
    
    // 如果 v3 存在，变成 v2
    if (v3Info) {
      newVersions.push({
        version: 'v2',
        saveTime: v3Info.saveTime,
        jsonLength: v3Info.jsonLength,
      });
    }
    
    // 添加新的 v3 版本信息
    newVersions.push({
      version: 'v3',
      saveTime,
      jsonLength,
    });
    
    versions = newVersions;
    
    // 保存版本列表
    await this.cacheManager.set(versionsKey, versions);
    
    // 保存最新版本数据（使用原key）
    await this.cacheManager.set(cacheKey, body.data);

    res.json({
      code: 0,
      data: {
        type: body.type,
        version: 'v3',
        message: '保存成功',
      },
      message: '',
    });
  }

  @Get('get')
  async get(
    @Query('type') type: string,
    @Res() res: Response,
    @Query('version') version?: string,
  ) {
    let data: Record<string, unknown> | undefined;
    let versionKey: string;
    let versionStr: string;
    
    if (version) {
      // 判断是归档版本（V开头）还是普通版本（v开头）
      if (version.startsWith('V') || version.startsWith('v')) {
        versionStr = version;
      } else {
        // 默认添加小写 v 前缀
        versionStr = 'v' + version;
      }
      versionKey = FAVORITE_CACHE_PREFIX + type + '_' + versionStr;
      data = await this.cacheManager.get<Record<string, unknown>>(versionKey);
    } else {
      // 查询最新版本（v3）
      versionStr = 'v3';
      versionKey = FAVORITE_CACHE_PREFIX + type + '_v3';
      data = await this.cacheManager.get<Record<string, unknown>>(versionKey);
      // 如果 v3 不存在，尝试使用原 key
      if (!data) {
        const cacheKey = FAVORITE_CACHE_PREFIX + type;
        data = await this.cacheManager.get<Record<string, unknown>>(cacheKey);
      }
    }

    res.json({
      code: 0,
      data: {
        type,
        version: versionStr || version || 'v3',
        data: data || null,
      },
      message: '',
    });
  }

  @Get('list')
  async list(@Query('type') type: string, @Res() res: Response) {
    const versionsKey = FAVORITE_CACHE_PREFIX + type + '_versions';
    const archivesKey = FAVORITE_CACHE_PREFIX + type + '_archives';
    
    // 获取版本记录（v1, v2, v3）
    let versions = await this.cacheManager.get<VersionInfo[]>(versionsKey) || [];
    const versionOrder = ['v1', 'v2', 'v3'];
    const sortedVersions = versionOrder.map((v) => {
      const found = versions.find((item) => item.version === v);
      return found || null;
    }).filter((v) => v !== null) as VersionInfo[];

    // 获取归档记录（V20251110格式）
    let archives = await this.cacheManager.get<ArchiveInfo[]>(archivesKey) || [];
    // 按日期倒序排列（最新的在前）
    archives = archives.sort((a, b) => {
      // 提取日期部分进行比较
      const dateA = a.version.replace('V', '');
      const dateB = b.version.replace('V', '');
      return dateB.localeCompare(dateA);
    });

    res.json({
      code: 0,
      data: {
        type,
        versions: sortedVersions.map((v) => ({
          version: v.version,
          saveTime: v.saveTime,
          jsonLength: v.jsonLength,
        })),
        archives: archives.map((a) => ({
          version: a.version,
          saveTime: a.saveTime,
          jsonLength: a.jsonLength,
        })),
      },
      message: '',
    });
  }

  /**
   * 预览图片接口
   * 接收图片URL和type参数，如果已保存则直接返回，否则下载保存后返回
   */
  @Get('previewImage')
  async previewImage(@Query('url') url: string, @Query('type') type: string, @Res() res: Response) {
    try {
      if (!url) {
        res.status(400).json({
          code: 1,
          message: 'URL参数不能为空',
        });
        return;
      }

      if (!type) {
        res.status(400).json({
          code: 1,
          message: 'type参数不能为空',
        });
        return;
      }

      // 解析URL，提取路径部分
      let urlPath: string;
      try {
        const urlObj = new URL(url);
        // 获取路径部分，去掉开头的斜杠
        urlPath = urlObj.pathname.startsWith('/') 
          ? urlObj.pathname.substring(1) 
          : urlObj.pathname;
      } catch (error) {
        res.status(400).json({
          code: 1,
          message: '无效的URL格式',
        });
        return;
      }

      // 获取项目根目录
      const cwdPath = path.resolve(process.cwd());
      // 构建保存目录路径（与 file_cache 同级，并在前面增加type目录）
      const imageDir = path.join(cwdPath, 'file_favorite_image', type);
      // 构建完整的文件保存路径
      const filePath = path.join(imageDir, urlPath);
      // 构建相对路径用于返回文件
      const relativePath = path.join('file_favorite_image', type, urlPath);

      // 检查文件是否存在
      let fileExists = false;
      try {
        await fs.access(filePath);
        fileExists = true;
      } catch (error) {
        // 文件不存在，需要下载保存
        fileExists = false;
      }

      // 如果文件不存在，下载并保存
      if (!fileExists) {
        try {
          // 获取文件所在目录
          const fileDir = path.dirname(filePath);
          // 确保目录存在
          await fs.mkdir(fileDir, { recursive: true });

          // 下载图片
          const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30秒超时
          });

          // 保存图片文件
          await fs.writeFile(filePath, Buffer.from(response.data));
        } catch (error) {
          console.error('下载保存图片失败:', error);
          res.status(500).json({
            code: 1,
            message: error.message || '下载保存图片失败',
          });
          return;
        }
      }

      // 发送图片文件（使用相对路径）
      res.sendFile(relativePath, { root: '.' });
    } catch (error) {
      console.error('预览图片失败:', error);
      res.status(500).json({
        code: 1,
        message: error.message || '预览图片失败',
      });
    }
  }
}

