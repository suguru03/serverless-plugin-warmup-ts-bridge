import * as path from 'path';

const cwd = process.cwd();
const modulePath = path.join(cwd, 'node_modules');

const fs = require(path.join(modulePath, 'fs-extra'));

const warmupDir = '_warmup';
const buildFolder = '.build';

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
        return super.rootFileNames.filter(filepath => fs.existsSync(path.resolve(cwd, filepath)));
      }
      beforeArtifacts = async () => {
        await this.compileTs();
        const target = path.resolve(path.join(buildFolder, warmupDir));
        if (!fs.existsSync(target)) {
          fs.symlinkSync(path.resolve(warmupDir), target);
        }
      };
      afterArtifacts = async () => {
        await this.moveArtifacts();
        // Restore service path
        this.serverless.config.servicePath = this.originalServicePath;
      };
      finalize = async () => fs.removeSync(path.join(this.originalServicePath, buildFolder));
    }
);

export = class {};

function modify(dependency: string, handler) {
  const filepath = path.join(modulePath, dependency);
  const Class = require(filepath);
  const re = new RegExp(dependency);
  const cachePath = Object.keys(require.cache).find(p => re.test(p))!;
  require.cache[cachePath].exports = handler(Class);
}
