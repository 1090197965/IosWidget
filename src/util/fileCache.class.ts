import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CacheObject {
  data: unknown;
  ttl?: number;
  createdAt: number;
}

@Injectable()
export class FileCache {
  private readonly cacheDir = path.join(__dirname, '../..', 'file_cache');

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const filePath = this.getFilePath(key);
    const cacheObject: CacheObject = {
      data: value,
      ttl,
      createdAt: Date.now(),
    };
    await fs.writeFile(filePath, JSON.stringify(cacheObject));
  }

  async get<T>(key: string): Promise<T | undefined> {
    console.log('this.cacheDir', this.cacheDir);
    const filePath = this.getFilePath(key);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const cacheObject = JSON.parse(data) as CacheObject;
      if (
        cacheObject.ttl !== undefined &&
        Date.now() > cacheObject.createdAt + cacheObject.ttl
      ) {
        await this.del(key);
        return undefined;
      }
      return cacheObject.data as T;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`Error reading file cache for key ${key}:`, err);
      }
      return undefined;
    }
  }

  async del(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`Error deleting file cache for key ${key}:`, err);
      }
    }
  }

  async reset(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map((file) => fs.unlink(path.join(this.cacheDir, file))),
      );
    } catch (err) {
      console.error('Error resetting file cache:', err);
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  private getFilePath(key: string): string {
    return path.join(this.cacheDir, key);
  }
}
