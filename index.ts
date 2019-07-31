import * as path from 'path';

const modulePath = path.join(__dirname, '..');
const fs = require(path.join(modulePath, 'fs-extra'));

const defaultDir = '_warmup';
const opts = {
  warmupDir: defaultDir,
  buildFolder: '.build'
};

modify(
  'serverless-plugin-typescript',
  Class =>
    class extends Class {
      constructor(...args: any[]) {
        super(...args);
        this.hooks = {
          ...this.hooks,
          'before:package:createDeploymentArtifacts': this.beforeArtifacts,
          'after:package:createDeploymentArtifacts': this.afterArtifacts,
          'deploy:finalize': this.finalize
        };
      }
      get rootFileNames() {
        return super.rootFileNames.filter(filepath => fs.existsSync(path.resolve(this.originalServicePath, filepath)));
      }
      beforeArtifacts = async () => {
        await this.compileTs();
        const target = path.resolve(this.serverless.config.servicePath, opts.warmupDir);
        const warmUpDirectory = path.resolve(this.originalServicePath, opts.warmupDir);

        if (fs.existsSync(warmUpDirectory) && !fs.existsSync(target)) fs.symlinkSync(warmUpDirectory, target);
      };
      afterArtifacts = async () => {
        await this.moveArtifacts();
        // Restore service path
        this.serverless.config.servicePath = this.originalServicePath;
      };
      finalize = async () => fs.removeSync(path.resolve(this.originalServicePath, opts.buildFolder));
    }
);

export = class {
  constructor(serverless) {
    const config = (serverless.service.custom && serverless.service.custom.warmup) || {};
    opts.warmupDir = config.folderName || defaultDir;
  }
};

function modify(dependency: string, handler) {
  const filepath = path.join(modulePath, dependency);
  const Class = require(filepath);
  const re = new RegExp(dependency);
  const cachePath = Object.keys(require.cache).find(p => re.test(p))!;
  require.cache[cachePath].exports = handler(Class);
}
