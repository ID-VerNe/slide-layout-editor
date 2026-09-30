# 4.3 GlobalSettings Props Drilling 消除

## 事实核对

报告对问题点的描述基本属实，但个别数字与代码存在偏差，先校正：

1. **透传属性数量**：报告称 `GlobalSettings` 接收 "16 个 Props"。实际 `GlobalSettingsProps` 接口定义了 **14 个属性**（`page`、`onUpdate`、`customFonts`、`setCustomFonts`、`theme`、`setTheme`、`imageQuality`、`setImageQuality`、`minimalCounter`、`setMinimalCounter`、`counterStyle`、`setCounterStyle`、`counterColor`、`setCounterColor`、`printSettings`、`setPrintSettings`），但组件函数实际解构使用的是其中 **12 个**（`theme`/`setTheme`/`counterColor`/`setCounterColor` 在组件内未被引用，仅出现在 `ColorToken` 的内联定义与 props 接口中）。报告的 "16" 偏高，实际透传 14 个、有效使用 12 个。

2. **`EditorPage` 解构数量**：报告称 `EditorPage` "解构 26 属性"。实际 `src/pages/EditorPage.tsx#L34-L43` 从 `useProject` 解构出 **23 个** 绑定。仍属严重过度耦合，但数字同样偏高。

3. **透传链路**：报告画的链路 `useStore → useProject → EditorPage → GlobalSettings` 正确。`useProject.ts#L9-L46` 一次性订阅了 **16 个 store 切片** 加 **13 个 action**，确实充当了聚合瓶颈。

4. **重渲染影响属实**：`GlobalSettings` 被包在 `EditorPage.tsx#L446-L465` 的 `Modal` 中，弹窗关闭时 `isOpen={showSettings}` 为 false 时 `Modal` 不渲染子树，问题被部分掩盖；但弹窗一旦打开，`EditorPage` 主体（`Sidebar`、`TopNav`、`PreviewArea`、`EditorPanel`）的任何状态变化都会引发 `GlobalSettings` 整树调和——因为父组件重渲染即触发子组件 props 浅比较失效。报告的 "用户在弹窗中修改计数器样式时主编辑页面跟着全量重渲染" 反过来也成立：弹窗内任何击键都会穿透回主视口。

5. **`counterColor` 字段定位**：`GlobalSettings` 的 props 接口里声明了 `counterColor`/`setCounterColor`，但组件实现里没有用到，`EditorPage.tsx#L460-L461` 仍在为它搬运数据。属于死透传，应在本次重构中直接删除。

## 根因

根本症结在于 **职责边界错位**：`EditorPage` 是主视口容器，本不该感知设置弹窗需要什么状态。它之所以承担 "数据搬运工"，是因为 `GlobalSettings` 被写成了纯受控组件——所有状态都从 props 进、所有变更都通过 callback 出。这是 React 类组件时代的写法，在已经引入 Zustand 的项目里是多余的中转层。

次要因素：

- `useProject` 被设计成 "一个 Hook 返回整个项目状态"，把 16 个切片聚合成单一返回对象，调用方不得不整包解构，导致任何切片变动都会让所有解构点失去浅比较资格。
- `GlobalSettings` 没有按渲染依赖分组订阅，`page`、`theme`、`printSettings` 等大对象变化都会触发整组件重渲染。

## 解决方案

让 `GlobalSettings` 直连 Zustand store，订阅自身需要的切片并调用 action；`EditorPage` 不再搬运 props。

### 设计原则（遵从 CLAUDE.md）

- **不保留向后兼容**：删除 `GlobalSettingsProps` 接口与全部透传，不保留中间兼容层。
- **最简实现**：组件直接 `useStore(s => s.xxx)`，不引入 selector wrapper 或额外抽象。
- **不破坏现有测试**：`__tests__/GlobalSettings.test.tsx` 通过 `render(<GlobalSettings {...baseProps} />)` 验证行为。本次重构把组件改为从 store 取数后，测试需同步改为在渲染前 `useStore.setState(...)` 注入初始状态、并 mock action 后断言 store 调用。行为断言不变，输入方式变更。

### 实施步骤

**Step 1：删除 `GlobalSettingsProps`，组件直连 store**

`src/components/editor/GlobalSettings.tsx` 改造：

```tsx
// 之前
interface GlobalSettingsProps {
  page: PageData;
  onUpdate: (page: PageData) => void;
  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;
  // ... 其余 12 个
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ page, onUpdate, ... }) => { ... }

// 之后：删除整个 props 接口
const GlobalSettings: React.FC = () => {
  // 弹窗自身需要的切片：当前页与全局设置项
  const currentPageIndex = useStore(s => s.currentPageIndex);
  const pages = useStore(s => s.pages);
  const page = pages[currentPageIndex] || pages[0];

  const customFonts = useStore(s => s.customFonts);
  const setCustomFonts = useStore(s => s.setCustomFonts);
  const imageQuality = useStore(s => s.imageQuality);
  const setImageQuality = useStore(s => s.setImageQuality);
  const minimalCounter = useStore(s => s.minimalCounter);
  const setMinimalCounter = useStore(s => s.setMinimalCounter);
  const counterStyle = useStore(s => s.counterStyle);
  const setCounterStyle = useStore(s => s.setCounterStyle);
  const printSettings = useStore(s => s.printSettings);
  const setPrintSettings = useStore(s => s.setPrintSettings);
  const updatePage = useStore(s => s.updatePage);

  // onUpdate 在组件内部派生
  const onUpdate = useCallback((next: PageData) => updatePage(next), [updatePage]);

  // theme/setTheme 在弹窗中实际未被使用，可一并删除（见 Step 2 验证）
  // counterColor/setCounterColor 死代码，直接删除
  ...
};
```

**Step 2：核对死字段**

在改造前需确认两点（用 `Grep` 验证 `GlobalSettings.tsx` 内部对 `theme`、`setTheme`、`counterColor`、`setCounterColor` 的引用是否为 0）：

- `theme`/`setTheme`：`ColorToken` 子组件在 `EditorPage` 弹窗外已被移除使用（`EditorPage.tsx#L452-L453` 透传但组件未消费），保留也只是为了让接口完整。若 `ColorToken` 确实未被 `GlobalSettings` 渲染调用，则连同 `theme` 订阅一并删除。
- `counterColor`/`setCounterColor`：组件实现内零引用，直接删除透传与接口字段。

**Step 3：`EditorPage` 卸载搬运职责**

`src/pages/EditorPage.tsx#L446-L465` 改为：

```tsx
<Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Global Settings" type="custom" maxWidth="max-w-2xl">
  <GlobalSettings />
</Modal>
```

`EditorPage` 不再需要从 `useProject` 解构 `customFonts`、`setCustomFonts`、`theme`、`setTheme`、`imageQuality`、`setImageQuality`、`minimalCounter`、`setMinimalCounter`、`counterStyle`、`setCounterStyle`、`printSettings`、`setPrintSettings` 这 12 个绑定——仅当这些字段在 `EditorPage` 其他位置（`PreviewArea`、`Sidebar` 等）仍被直接消费时才保留。从代码看，`EditorPage.tsx#L53` 把 `printSettings`、`minimalCounter` 透传给 `usePreview`，`L442` 透传给 `PreviewArea`，这些主视口消费链路独立于本次重构，不动它们。

**Step 4：测试同步**

`src/components/editor/EditorPage/__tests__/GlobalSettings.test.tsx` 改造：

```tsx
// 之前
const baseProps = { page, onUpdate: vi.fn(), customFonts: [], ... };
render(<GlobalSettings {...baseProps} />);

// 之后
beforeEach(() => {
  useStore.setState({
    pages: [page],
    currentPageIndex: 0,
    customFonts: [],
    imageQuality: 0.9,
    minimalCounter: false,
    counterStyle: 'number',
    printSettings,
    setPrintSettings: vi.fn(),
    setImageQuality: vi.fn(),
    setMinimalCounter: vi.fn(),
    setCounterStyle: vi.fn(),
    setCustomFonts: vi.fn(),
    updatePage: vi.fn(),
  });
});

it('调整图片质量滑块调用 setImageQuality', () => {
  const setSpy = vi.spyOn(useStore.getState(), 'setImageQuality');
  render(<GlobalSettings />);
  const slider = screen.getAllByRole('slider')[0];
  fireEvent.change(slider, { target: { value: '0.6' } });
  expect(setSpy).toHaveBeenCalledWith(0.6);
});
```

其余 8 个用例的 DOM 断言（`getByText('90%')`、`findByText('Mechanical Print Engine')`、`findByTestId('font-manager')` 等）保持不变，因为渲染产物未改。

## Before / After

### Before

`EditorPage.tsx#L447-L464`（18 行 props 透传）：

```tsx
<GlobalSettings 
  page={currentPage || pages[0]} 
  onUpdate={updatePage} 
  customFonts={customFonts} 
  setCustomFonts={setCustomFonts} 
  theme={theme} 
  setTheme={setTheme} 
  imageQuality={imageQuality} 
  setImageQuality={setImageQuality} 
  minimalCounter={minimalCounter || false} 
  setMinimalCounter={setMinimalCounter} 
  counterStyle={counterStyle} 
  setCounterStyle={setCounterStyle} 
  counterColor={currentPage?.counterColor || ''} 
  setCounterColor={(value) => currentPage && updatePage({ ...currentPage, counterColor: value })} 
  printSettings={printSettings} 
  setPrintSettings={setPrintSettings} 
/>
```

`EditorPage` 从 `useProject` 解构 23 个绑定，其中 12 个仅服务于这个透传。

### After

`EditorPage.tsx`：

```tsx
<GlobalSettings />
```

`GlobalSettings.tsx` 内部直连 store，订阅 11 个切片 + 6 个 action。`EditorPage` 解构面收敛到主视口真正消费的字段（`pages`、`projectTitle`、`currentPageIndex`、`updatePage` 等主流程），不再为弹窗代持状态。

## 风险与回滚

### 风险

1. **测试覆盖断裂**：现有测试以 props 注入驱动，改为 store 注入后若 `beforeEach` 未正确 `setState`，所有用例会因初始状态空而失败。需在改造时一次性同步所有用例。**严重度：低，可控。**
2. **`useProject` 聚合订阅问题未根治**：本次只解除 `GlobalSettings` 的透传链，`useProject` 仍聚合 16 个切片，`EditorPage` 主体仍受其影响（对应报告 5.1 节）。这是预期边界——本方案只解决 4.3，不越界扩张。**严重度：已知遗留，由 5.1 方案单独处理。**
3. **弹窗打开时的 `pages` 订阅**：`GlobalSettings` 订阅 `pages` 后，主视口的击键（编辑当前页内容）会让弹窗组件收到新 `pages` 引用并重渲染。但弹窗组件只在 `isOpen` 为 true 时挂载，且其内部只关心 `page.backgroundPattern` 与 `page.counterColor` 两个字段，可后续用 `useStore(s => s.pages[s.currentPageIndex]?.backgroundPattern)` 这种窄 selector 进一步收敛。本次先按最简实现，不做微优化。**严重度：低。**
4. **`currentPage` 来源变化**：原代码 `page={currentPage || pages[0]}`，`currentPage` 来自 `useProject` 的 `pages[currentPageIndex]`。改造后由组件内部自取，语义等价。需确认 `pages[0]` 的回退在空项目场景下不会崩——`GlobalSettings` 仅在 `Modal isOpen` 时渲染，此时项目必然已加载，`pages.length > 0`，回退路径安全。**严重度：极低。**

### 回滚

改造集中在 3 个文件：

- `src/components/editor/GlobalSettings.tsx`
- `src/pages/EditorPage.tsx`（仅 `L446-L465` 区段）
- `src/components/editor/__tests__/GlobalSettings.test.tsx`

回滚即 `git revert` 对应提交。无数据迁移、无 store schema 变更，回滚无副作用。

## 验证方式

1. **类型与单测**：
   - `npx tsc --noEmit` 确认 `GlobalSettingsProps` 删除后无残留引用。
   - `npm test -- GlobalSettings` 跑通改造后的 9 个用例。
   - `npm test -- useStore` 确认 store 测试不受影响。

2. **行为人工验证**（遵从项目 verify skill 精神，驱动真实流程而非只看测试）：
   - 启动 dev server，打开任意项目。
   - 点开 `Sidebar` 的 `Global Settings` 按钮，弹窗打开。
   - 在 `General` 标签下：滑动 WebP Quality 滑块、切换 Counter Style、切换 Minimal UI、切换 Texture Patterns，确认状态写入 store（可在 React DevTools 的 Zustand 面板观察）且关闭重开弹窗后状态保留。
   - 切到 `Assets` 标签，点 `FontManager` 的 Add，确认字体列表更新。
   - 切到 `Print` 标签，开启 Engine、修改 Width/Height/Gutter、切换 Spine/Cut 方向、切换 Visual Helpers，确认打印设置写入 store。
   - 关键回归：弹窗打开时在背后主视口编辑当前页文本，确认弹窗内 `Texture Patterns` 高亮状态随 `backgroundPattern` 变化而同步（验证订阅正确）。

3. **渲染性能回归**（可选，用 React Profiler）：
   - 改造前：弹窗打开时编辑主视口文本，Profiler 应显示 `GlobalSettings` 重渲染。
   - 改造后：同样操作，`GlobalSettings` 不应出现在 Profiler 的重渲染列表中（除非 `backgroundPattern`/`counterColor` 真的变了）。

## 涉及文件

- `src/components/editor/GlobalSettings.tsx` — 删除 props 接口，改为直连 store。
- `src/pages/EditorPage.tsx`（`L446-L465` 区段）— 移除 18 行 props 透传。
- `src/components/editor/__tests__/GlobalSettings.test.tsx` — 同步测试注入方式。
