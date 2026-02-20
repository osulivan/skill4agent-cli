import axios from 'axios';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const API_BASE = 'https://skill4agent.com/api';

export interface SkillInfo {
  skillName: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  descriptionTranslated: string;
  category: {
    nameCn: string;
    nameEn: string;
  } | null;
  tags: string;
  tagsCn: string;
  originalLanguage: string;
  hasTranslation: boolean;
  hasScript: boolean;
  scriptCount: number;
  scriptCheckResult: string;
  hasDownloaded: boolean;
  downloadStatus: string;
  totalInstalls: number;
  trending24h: number;
}

export async function downloadSkill(
  topSource: string,
  skillName: string,
  type: 'original' | 'translated' = 'original'
): Promise<string> {
  const url = `${API_BASE}/download?top_source=${encodeURIComponent(topSource)}&skill_name=${encodeURIComponent(skillName)}&type=${type}`;

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill4agent-'));
  const fileName = `${skillName}.zip`;
  const filePath = path.join(tempDir, fileName);

  fs.writeFileSync(filePath, Buffer.from(response.data));

  return filePath;
}

export async function getSkillInfo(topSource: string, skillName: string): Promise<{ skill: SkillInfo | null; sourceExists: boolean }> {
  try {
    const url = `${API_BASE}/skills/info?top_source=${encodeURIComponent(topSource)}&skill_name=${encodeURIComponent(skillName)}`;
    const response = await axios.get(url);
    
    if (response.status === 404) {
      return { skill: null, sourceExists: false };
    }
    
    const skill = response.data.data;
    if (!skill) {
      return { skill: null, sourceExists: true };
    }
    
    return {
      skill: {
        skillName: skill.skillName,
        name: skill.name,
        nameCn: skill.nameCn,
        description: skill.description,
        descriptionCn: skill.descriptionCn,
        descriptionTranslated: skill.descriptionTranslated,
        category: skill.category,
        tags: skill.tags,
        tagsCn: skill.tagsCn,
        originalLanguage: skill.originalLanguage,
        hasTranslation: skill.hasTranslation,
        hasScript: skill.hasScript,
        scriptCount: skill.scriptCount,
        scriptCheckResult: skill.scriptCheckResult,
        hasDownloaded: skill.hasDownloaded,
        downloadStatus: skill.downloadStatus,
        totalInstalls: skill.totalInstalls,
        trending24h: skill.trending24h,
      },
      sourceExists: true,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { skill: null, sourceExists: false };
    }
    return { skill: null, sourceExists: false };
  }
}

export function getDownloadUrl(topSource: string, skillName: string, type: 'original' | 'translated' = 'original'): string {
  return `${API_BASE}/download?top_source=${encodeURIComponent(topSource)}&skill_name=${encodeURIComponent(skillName)}&type=${type}`;
}

export async function incrementInstallCount(topSource: string, skillName: string): Promise<void> {
  try {
    const url = `${API_BASE}/skills/install`;
    await axios.post(url, {
      top_source: topSource,
      skill_name: skillName,
    });
  } catch (error) {
    // 静默失败，不影响安装流程
  }
}

export interface SearchResult {
  skillId: string;
  skillName: string;
  description: string;
  tags: string;
  categoryName: string;
  totalInstalls: number;
  originalLanguage: string;
  hasTranslation: boolean;
  relevance: number;
  has_script: boolean;
}

export interface SearchResponse {
  skills: SearchResult[];
  totalResults: number;
  returnedCount: number;
  query: string;
}

export async function searchSkills(keyword: string, limit: number = 10): Promise<SearchResponse> {
  const url = `${API_BASE}/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const response = await axios.get<SearchResponse>(url);
  return response.data;
}
