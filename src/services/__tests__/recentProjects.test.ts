import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRecentProjects,
  saveRecentProjects,
  upsertRecentProject,
  updateRecentProjectThumbnail,
  removeRecentProject,
  RecentProjectEntry,
} from '../recentProjects';

describe('recentProjects service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no projects saved', () => {
    expect(getRecentProjects()).toEqual([]);
  });

  it('upserts a new project and places it at the beginning', () => {
    const p1: RecentProjectEntry = { id: 'p1', title: 'Project 1', lastModified: 100 };
    const p2: RecentProjectEntry = { id: 'p2', title: 'Project 2', lastModified: 200 };

    upsertRecentProject(p1);
    expect(getRecentProjects()).toHaveLength(1);
    expect(getRecentProjects()[0].id).toBe('p1');

    upsertRecentProject(p2);
    const list = getRecentProjects();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('p2');
    expect(list[1].id).toBe('p1');
  });

  it('updates thumbnail for an existing project', () => {
    const p1: RecentProjectEntry = { id: 'p1', title: 'Project 1', lastModified: 100 };
    upsertRecentProject(p1);

    updateRecentProjectThumbnail('p1', 'data:image/png;base64,abc');
    const updated = getRecentProjects();
    expect(updated[0].thumbnail).toBe('data:image/png;base64,abc');
  });

  it('removes project by id', () => {
    const p1: RecentProjectEntry = { id: 'p1', title: 'Project 1', lastModified: 100 };
    upsertRecentProject(p1);
    expect(getRecentProjects()).toHaveLength(1);

    removeRecentProject('p1');
    expect(getRecentProjects()).toHaveLength(0);
  });

  it('migrates legacy key when primary key is missing', () => {
    const legacy = [{ id: 'old-1', title: 'Old Project' }];
    localStorage.setItem('magazine_recent_projects', JSON.stringify(legacy));

    const projects = getRecentProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('old-1');
  });
});
