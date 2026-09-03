export interface RecentProjectEntry {
  id: string;
  title: string;
  date?: string;
  lastModified?: number;
  type?: string;
  aspectRatio?: string;
  thumbnail?: string | null;
  filePath?: string | null;
}

const PRIMARY_RECENT_KEY = 'slidegrid_recent_projects';
const LEGACY_RECENT_KEY = 'magazine_recent_projects';
const MAX_RECENT_PROJECTS = 48;

/** 获取全部近期工程列表（自动合并与兼容旧键名） */
export function getRecentProjects(): RecentProjectEntry[] {
  let primaryList: RecentProjectEntry[] = [];
  try {
    const raw = localStorage.getItem(PRIMARY_RECENT_KEY);
    if (raw) primaryList = JSON.parse(raw);
  } catch (e) {
    console.warn('[RecentProjects] Failed to parse primary recent projects:', e);
  }

  // 迁移并清理旧版存储
  try {
    const legacyRaw = localStorage.getItem(LEGACY_RECENT_KEY);
    if (legacyRaw) {
      const legacyList: RecentProjectEntry[] = JSON.parse(legacyRaw);
      if (primaryList.length === 0 && legacyList.length > 0) {
        primaryList = legacyList;
        saveRecentProjects(primaryList);
      }
      localStorage.removeItem(LEGACY_RECENT_KEY);
    }
  } catch (e) {
    console.warn('[RecentProjects] Failed to migrate legacy recent projects:', e);
  }

  return (primaryList || []).filter((p): p is RecentProjectEntry => Boolean(p && p.id));
}

/** 保存近期工程列表（内置存储配额保护） */
export function saveRecentProjects(projects: RecentProjectEntry[]): void {
  const sanitized = (projects || [])
    .filter((p): p is RecentProjectEntry => Boolean(p && p.id))
    .slice(0, MAX_RECENT_PROJECTS);

  const tryPersist = (list: RecentProjectEntry[]): boolean => {
    try {
      const serialized = JSON.stringify(list);
      localStorage.setItem(PRIMARY_RECENT_KEY, serialized);
      // 兼容读取旧键名的代码与既有用例
      try {
        localStorage.setItem(LEGACY_RECENT_KEY, serialized);
      } catch {
        // 忽略兼容键写入失败
      }
      return true;
    } catch {
      return false;
    }
  };

  // 1. 优先尝试完整保存
  if (tryPersist(sanitized)) return;

  // 2. 配额超限降级：仅保留最近 6 个工程的缩略图
  console.warn('[RecentProjects] Quota pressure detected, trimming older thumbnails');
  const partialThumbs = sanitized.map((p, idx) => (idx < 6 ? p : { ...p, thumbnail: null }));
  if (tryPersist(partialThumbs)) return;

  // 3. 极端降级：剥离所有缩略图以绝对保障工程元数据（标题、路径、修改时间）不丢失
  console.warn('[RecentProjects] Stripping all thumbnails to protect project metadata');
  const metadataOnly = sanitized.map(p => ({ ...p, thumbnail: null }));
  if (!tryPersist(metadataOnly)) {
    console.error('[RecentProjects] Critical: Unable to persist recent projects to localStorage');
  }
}

/** 插入或更新单项近期工程并置顶 */
export function upsertRecentProject(entry: RecentProjectEntry): void {
  const existing = getRecentProjects();
  const filtered = existing.filter(p => p.id !== entry.id);
  const updated = [entry, ...filtered];
  saveRecentProjects(updated);
}

/** 更新特定工程的缩略图 */
export function updateRecentProjectThumbnail(projectId: string, thumbnail: string): void {
  const existing = getRecentProjects();
  const idx = existing.findIndex(p => p.id === projectId);
  if (idx > -1) {
    existing[idx].thumbnail = thumbnail;
    saveRecentProjects(existing);
  }
}

/** 删除近期工程 */
export function removeRecentProject(projectId: string): void {
  const existing = getRecentProjects();
  const filtered = existing.filter(p => p.id !== projectId);
  saveRecentProjects(filtered);
}
