import { PageData, ProjectData, ProjectTheme, DesignSystem, PrintSettings, CustomFont, CounterStyle } from '../types';
import { getProject } from '../utils/storage/projectDb';
import { migrateToV3 } from '../utils/migrations/v2-to-v3';
import { nativeFs } from '../utils/native-fs';
import { DEFAULT_THEME, DEFAULT_DESIGN_SYSTEM, DEFAULT_PRINT_SETTINGS } from '../constants/theme';
import { validateProject } from '../utils/validation/projectSchema';
import { cacheFontBinaries, clearFontBinaryCache } from './slices/historySlice';

export interface LoadResult {
  pages: PageData[];
  projectTitle: string;
  theme: ProjectTheme;
  designSystem: DesignSystem;
  customFonts: CustomFont[];
  imageQuality: number;
  minimalCounter: boolean;
  counterStyle: CounterStyle;
  printSettings: PrintSettings;
  currentFilePath: string | null;
  currentPageIndex: number;
}

/**
 * 工程加载的纯 IO 管道:读取 -> 迁移 -> 校验 -> IPC 同步 -> 字体二进制登记。
 * 不触碰 store,只返回可写入的状态快照;过时请求返回 null。
 */
export async function loadProjectPipeline(
  idOrData: string | (Partial<ProjectData> & Record<string, unknown>),
  filePath: string | null,
  projectId: string,
  isStale: () => boolean,
): Promise<LoadResult | null> {
  let projectData: ProjectData | null = null;

  if (typeof idOrData === 'string') {
    projectData = (await getProject(idOrData)) as ProjectData | null;
  } else {
    projectData = idOrData as ProjectData;
  }
  if (isStale()) return null;

  if (!projectData) return null;

  const migratedData = migrateToV3(projectData);

  // 迁移后做结构校验:失败不阻断,回退迁移数据并留痕
  const parsed = validateProject(migratedData);
  if (!parsed.success) {
    console.warn(
      '[Store] Project validation failed, falling back to migrated data',
      parsed.error.issues
    );
  }
  const validatedPages = parsed.success ? parsed.data.pages : migratedData.pages;
  const safePages: PageData[] = Array.isArray(validatedPages) ? validatedPages as PageData[] : [];

  if (nativeFs.isElectron()) {
    const title = migratedData.title || migratedData.projectTitle || 'Untitled Project';
    nativeFs.setCurrentProject(projectId, title);
  }

  // 登记字体二进制进会话缓存,供 undo/redo rehydrate
  cacheFontBinaries(migratedData.customFonts || []);

  return {
    pages: safePages,
    projectTitle: migratedData.title || migratedData.projectTitle || '',
    theme: migratedData.theme || DEFAULT_THEME,
    designSystem: migratedData.designSystem || DEFAULT_DESIGN_SYSTEM,
    customFonts: migratedData.customFonts || [],
    imageQuality: migratedData.imageQuality ?? 0.95,
    minimalCounter: migratedData.minimalCounter ?? false,
    counterStyle: migratedData.counterStyle || (migratedData.pages?.[0]?.counterStyle) || 'number',
    printSettings: migratedData.printSettings || DEFAULT_PRINT_SETTINGS,
    currentFilePath: filePath || migratedData.filePath || null,
    currentPageIndex: 0,
  };
}

export { clearFontBinaryCache };
