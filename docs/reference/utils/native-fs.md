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
| `isElectron()` | `boolean` | 检测当前运行环境是否为 Electron |
| `setActiveWorkspace(path)` | `Promise<void>` | 同步工作区路径到主进程 |
| `listProjects()` | `Promise<any[]>` | **新增**: 扫描工作区物理目录，返回包含 metadata 的项目列表 |
| `setCurrentProject(id, name)` | `Promise<void>` | 同步当前项目上下文 (用于资产路径解析) |
| `openExternal(url)` | `Promise<void>` | 外部链接打开 (Electron: shell.openExternal, Web: window.open) |
| `selectDirectory()` | `Promise<NativeResponse>` | 打开原生文件夹选择对话框 |
| `saveFileBuffer(path, base64)` | `Promise<NativeResponse>` | 将 Base64 数据写入指定路径 |
| `saveProject(data, path?, name?)` | `Promise<NativeResponse>` | 触发主进程保存项目。**智能逻辑**: 如果 path 是文件夹 (Workspace)，则仅更新 project.json；如果是文件，则打包 .slgrid |
| `openProject()` | `Promise<NativeResponse>` | 触发主进程打开项目 (支持文件选择) |
| `readProject(path)` | `Promise<NativeResponse>` | **新增**: 从指定物理路径 (文件夹或文件) 加载项目数据 |
| `uploadAsset(name, base64)` | `Promise<NativeResponse>` | 将图片发送至主进程 Sharp 流水线 |

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
