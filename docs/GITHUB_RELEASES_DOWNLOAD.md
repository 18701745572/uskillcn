# uskillcn GitHub Releases 下载地址

> 本文档由 CI/CD 流程自动生成，包含所有平台的安装包下载链接。

## 发布页面

- **发布主页**: https://github.com/18701745572/uskillcn/releases
- **最新版本**: https://github.com/18701745572/uskillcn/releases/latest
- **当前版本 (v0.1.24-alpha.10)**: https://github.com/18701745572/uskillcn/releases/tag/v0.1.24-alpha.10

---

## 下载地址格式

```
https://github.com/18701745572/uskillcn/releases/download/{版本标签}/{文件名}
```

---

## 各平台下载地址

### macOS

| 架构 | 格式 | 下载地址 |
|------|------|----------|
| Apple Silicon (M1/M2/M3/M4) | DMG | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-arm64.dmg` |
| Intel (x64) | DMG | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-x64.dmg` |
| Apple Silicon (M1/M2/M3/M4) | ZIP | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-arm64.zip` |
| Intel (x64) | ZIP | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-x64.zip` |

**安装说明**:
1. 下载 `.dmg` 文件
2. 双击打开，将应用拖到 Applications 文件夹
3. 首次运行如遇"无法验证开发者"，前往 系统设置 → 隐私与安全 → 允许

---

### Windows

| 架构 | 格式 | 下载地址 |
|------|------|----------|
| x64 (64位) | EXE | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-win-x64.exe` |
| ARM64 | EXE | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-win-arm64.exe` |

**安装说明**:
1. 下载 `.exe` 文件
2. 双击运行安装程序
3. 如遇 SmartScreen 拦截，点击"更多信息" → "仍要运行"

---

### Linux

| 架构 | 格式 | 下载地址 |
|------|------|----------|
| x64 | AppImage (推荐) | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage` |
| ARM64 | AppImage | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-arm64.AppImage` |
| x64 | DEB (Debian/Ubuntu) | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-amd64.deb` |
| ARM64 | DEB (Debian/Ubuntu) | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-arm64.deb` |
| x64 | RPM (RedHat/CentOS/Fedora) | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-x86_64.rpm` |

**安装说明**:

**AppImage (通用格式，推荐)**:
```bash
# 1. 下载并添加执行权限
chmod +x uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage

# 2. 运行
./uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage

# Ubuntu 22.04+ 可能需要安装 libfuse2
# Ubuntu 22.04: sudo apt install libfuse2
# Ubuntu 24.04: sudo apt install libfuse2t64
```

**DEB (Debian/Ubuntu)**:
```bash
# Ubuntu 24.04 先安装依赖
sudo apt install libgtk-3-0t64 libnotify4t64 libxss1t64

# 安装
curl -LO https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-amd64.deb
sudo dpkg -i uskillcn-0.1.24-alpha.10-linux-amd64.deb
sudo apt-get install -f  # 修复依赖
```

**RPM (RedHat/CentOS/Fedora)**:
```bash
sudo rpm -i uskillcn-0.1.24-alpha.10-linux-x86_64.rpm
```

---

## 自动更新配置文件

用于 `electron-updater` 自动更新的元数据文件：

| 平台 | 文件 | 下载地址 |
|------|------|----------|
| macOS | alpha-mac.yml | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/alpha-mac.yml` |
| Windows | alpha.yml | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/alpha.yml` |
| Linux | alpha-linux.yml | `https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/alpha-linux.yml` |

---

## 快速下载脚本

### macOS (Apple Silicon)
```bash
curl -LO https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-arm64.dmg
open uskillcn-0.1.24-alpha.10-mac-arm64.dmg
```

### macOS (Intel)
```bash
curl -LO https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-mac-x64.dmg
open uskillcn-0.1.24-alpha.10-mac-x64.dmg
```

### Windows (PowerShell)
```powershell
Invoke-WebRequest -Uri "https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-win-x64.exe" -OutFile "uskillcn-setup.exe"
.\uskillcn-setup.exe
```

### Linux (AppImage)
```bash
curl -LO https://github.com/18701745572/uskillcn/releases/download/v0.1.24-alpha.10/uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage
chmod +x uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage
./uskillcn-0.1.24-alpha.10-linux-x86_64.AppImage
```

---

## 版本历史

查看所有历史版本：
- https://github.com/18701745572/uskillcn/releases

---

## 常见问题

**Q: 下载速度慢的解决方案？**
A: GitHub Releases 在国内可能访问较慢，可以尝试：
1. 使用 GitHub 镜像加速服务
2. 使用代理/VPN
3. 等待一段时间后重试

**Q: 如何验证下载文件的完整性？**
A: 每个发布版本都包含 `.blockmap` 文件用于校验。你可以在发布页面查看文件的 SHA256 校验值。

**Q: 自动更新失败怎么办？**
A: 手动下载最新版本的安装包覆盖安装即可。应用数据不会丢失。

---

*文档生成时间: 2025-01-15*  
*对应版本: v0.1.24-alpha.10*
