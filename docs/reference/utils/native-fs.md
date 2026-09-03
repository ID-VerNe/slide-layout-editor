# 原生桥接 (Native & FS)

SlideGrid Studio 作为一个跨平台应用 (Web + Electron)，通过 `src/utils/native-fs.ts` 提供了一套统一的文件系统与原生功能访问接口。

---

## 1. `native-fs.ts`
渲染进程与 Electron 主进程通信的统一代理层。

- **文件**: `src/utils/native-fs.ts`
- **模式**: 单例模式，导出 `nativeFs` 实例

### 1.1 核心 API 参考

| 方法 | 返回值 | 说明 |
| :--- | :--- | :--- |
| `isElectron()` | `boolean` | 检测当前运行环境是否为 Electron（检测 `window.electronAPI` 存在性） |
| `getAppPaths()` | `Promise<{userData, thumbnails}>` | 获取 Electron 主进程的应用路径（userData、thumbnails 目录） |
| `captureThumbnail(projectId, rect)` | `Promise<string \| null>` | 调用主进程对指定区域截图生成缩略图 |
| `setActiveWorkspace(path)` | `Promise<void>` | 同步工作区路径到主进程 |
| `listProjects()` | `Promise<any[]>` | 扫描工作区物理目录，返回包含 metadata 的项目列表 |
| `setCurrentProject(id, name)` | `Promise<void>` | 同步当前项目上下文（用于资产路径解析） |
| `openExternal(url)` | `Promise<void>` | 外部链接打开（Electron: shell.openExternal, Web: window.open） |
| `selectDirectory()` | `Promise<NativeResponse>` | 打开原生文件夹选择对话框 |
| `saveFileBuffer(filePath, base64Data)` | `Promise<NativeResponse>` | 将 Base64 数据写入指定路径 |
| `saveProject(projectData, filePath?, defaultName?)` | `Promise<NativeResponse>` | 触发主进程保存项目。首个参数为 `ProjectSaveData` 对象。智能逻辑：如果 path 是文件夹 (Workspace)，则仅更新 project.json；如果是文件，则打包 .slgrid |
| `openProject()` | `Promise<NativeResponse>` | 触发主进程打开项目（支持文件选择） |
| `readProject(filePath)` | `Promise<NativeResponse>` | 从指定物理路径（文件夹或文件）加载项目数据 |
| `uploadAsset(filename, base64Data)` | `Promise<NativeResponse>` | 将图片发送至主进程 Sharp 流水线 |
| `readAssetFile(filename)` | `Promise<string \| null>` | 从物理文件系统读取资产文件的 Base64 数据 |
| `processResponsiveImages(input, formats)` | `Promise<any>` | 调用主进程 Sharp 生成响应式图片变体 |
| `deleteProject(projectPath)` | `Promise<NativeResponse>` | 删除指定路径的项目文件 |

### 1.2 接口定义

```typescript
interface NativeResponse {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
  canceled?: boolean;
  path?: string;
  url?: string;  // asset:// 协议路径
}
```

---

## 2. 通信链路
1. **渲染层调用**: `nativeFs.saveProject(...)`
2. **ContextBridge**: 通过 `window.electronAPI` 访问暴露的 IPC 方法。
3. **IPC 调用**: `ipcRenderer.invoke('save-project', ...)`
4. **主进程响应**: Electron `main.ts` 中的 handler 处理文件 I/O 并返回结果。

---

## 3. IPC 安全加固与文件系统防护

为了抵御潜在的恶意 ZIP 炸弹、路径穿越与 Windows 原生漏洞攻击，原生通信层在 Electron 主进程中强制实行多重安全校验：

1. **路径穿越沙箱防御 (`path.relative`)**:
   在解包工程归档时，严格校验目标释放路径，若 `path.relative(destDir, targetPath)` 以 `..` 开头或为绝对路径，立即阻断并抛出异常。
2. **NTFS 备用数据流 (ADS) 阻断**:
   解包文件名与资产命名中严禁出现 `:`（冒号），彻底封死 `file.txt:stream` 形式的隐藏流注入与权限绕过。
3. **Windows 保留设备名免疫**:
   文件名严格过滤 Windows 保留设备名称（`CON`, `PRN`, `AUX`, `NUL`, `COM1`~`COM9`, `LPT1`~`LPT9`），避免引发底层驱动死锁或系统异常。
4. **盘符格式与扩展名限制**:
   Windows 物理绝对路径强制通过 `^[a-zA-Z]:[/\\]` 校验；导出与导入操作仅限合规的文件后缀（`.slgrid`, `.png`, `.pdf`, `.json`）。

