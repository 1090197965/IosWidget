import { Module } from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { ScriptController } from './controller/script.controller';
import { AppService } from './service/app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FileCache } from './util/fileCache.class';
import { ScriptableController } from './controller/scriptable.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController, ScriptController, ScriptableController],
  providers: [AppService, FileCache],
})
export class AppModule {}
