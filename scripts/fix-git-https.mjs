#!/usr/bin/env node
/**
 * 配置 git 使用 HTTPS 拉取 GitHub，避免 SSH 权限问题（Permission denied publickey）
 * 执行一次即可，之后 pnpm install 应能正常拉取 git 依赖
 */
import { execSync } from 'child_process';

try {
  execSync(
    'git config --global url."https://github.com/".insteadOf "git@github.com:"',
    { stdio: 'inherit' }
  );
  console.log('已配置 git 使用 HTTPS 拉取 GitHub');
} catch (e) {
  console.warn('git 配置失败（可能未安装 git），请手动执行:');
  console.warn('  git config --global url."https://github.com/".insteadOf "git@github.com:"');
  // 不中断，继续尝试安装（override 可能已足够）
}
