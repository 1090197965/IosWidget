import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileCache } from '../util/fileCache.class';
import * as path from 'path';

@Controller('script')
export class ScriptController {
  constructor(@Inject(FileCache) private readonly cacheManager: FileCache) {}

  @Get(':fileName')
  getScript(@Param('fileName') fileName: string, @Res() res: Response) {
    // 在这里，您可以使用 fileName 变量进行后续操作
    // 例如，如果传入 /script/demo.js，则 fileName 的值将是 'demo'
    // 获取执行目录
    const cwdPath = path.resolve(process.cwd());
    const currentPath = __dirname;
    console.log('cwdPath', cwdPath);
    console.log('currentPath', currentPath);
    const realPath = currentPath
      .replace(cwdPath, '')
      .replace(`${path.sep}dist${path.sep}controller`, '');
    console.log('realPath', realPath);
    res.sendFile(
      realPath + `${path.sep}dist${path.sep}resources${path.sep}` + fileName,
      { root: '.' },
    );
  }
}
