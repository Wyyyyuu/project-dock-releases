import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = 'Wyyyyuu/project-dock-releases';
let release = JSON.parse(await fs.readFile(path.join(root, 'site/release.json'), 'utf8'));
if (process.argv.includes('--live')) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'ProjectDock-website-build' };
  if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Release lookup failed: HTTP ${response.status}. Existing deployed website is retained.`);
  release = await response.json();
}
if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name)) throw new Error('Expected a stable semantic release');
const version = release.tag_name.slice(1);
const prefix = `https://github.com/${repo}/releases/download/${release.tag_name}/`;
function verifiedAsset(asset) {
  if (!asset || !/^[a-zA-Z0-9._-]+$/.test(asset.name) || asset.browser_download_url !== prefix + asset.name || !(asset.size > 0)) throw new Error('Invalid or missing release asset');
  return asset;
}
const windows = verifiedAsset(release.assets.find(asset => asset.name === `ProjectDock-Setup-${version}.exe`));
const checksum = verifiedAsset(release.assets.find(asset => asset.name === 'SHA256SUMS.txt'));
const macCandidate = release.assets.find(asset => /^ProjectDock-.*\.(dmg|pkg)$/.test(asset.name));
const mac = macCandidate ? verifiedAsset(macCandidate) : null;
const releaseUrl = `https://github.com/${repo}/releases/tag/${release.tag_name}`;
const values = {
  VERSION: version, RELEASE_URL: releaseUrl, WINDOWS_URL: windows.browser_download_url,
  WINDOWS_SIZE: `${(windows.size / 1048576).toFixed(1)} MB`, CHECKSUM_URL: checksum.browser_download_url,
  MAC_STATUS: mac ? '正式版可用' : '尚未推出',
  MAC_DESCRIPTION: mac ? 'macOS 安装包现已提供下载。' : '目前尚无 macOS 安装包。',
  MAC_ACTION: mac ? `<a class="button button-primary full-width" href="${mac.browser_download_url}">下载 macOS 版 <span aria-hidden="true">↓</span></a>` : '<span class="unavailable">macOS 版尚未提供</span>',
  MAC_REQUIREMENT: mac ? '系统和芯片要求请查看版本发布说明。' : 'Windows 安装包无法在 macOS 上直接运行。',
  MAC_FAQ: mac ? '现已提供 macOS 安装包。请在下载区获取，并查看该版本发布说明中的系统和芯片要求。' : '目前正式版仅支持 Windows 10 / 11，尚未提供 macOS 安装包。网站会在正式发布 Mac 版本后提供对应下载入口，没有发布日期承诺。'
};
const out = path.join(root, 'dist');
await fs.mkdir(out, { recursive: true });
await fs.cp(path.join(root, 'site/assets'), path.join(out, 'assets'), { recursive: true });
for (const file of ['styles.css', 'app.js']) await fs.copyFile(path.join(root, 'site', file), path.join(out, file));
const template = await fs.readFile(path.join(root, 'site/index.html'), 'utf8');
const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => { if (!(key in values)) throw new Error(`Unknown placeholder: ${key}`); return values[key]; });
await fs.writeFile(path.join(out, 'index.html'), html);
await fs.writeFile(path.join(out, '.nojekyll'), '');
await fs.writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://wyyyyuu.github.io/project-dock-releases/sitemap.xml\n');
await fs.writeFile(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://wyyyyuu.github.io/project-dock-releases/</loc></url></urlset>');
await fs.writeFile(path.join(out, 'build-info.json'), JSON.stringify({ version, windows: windows.name, mac: mac?.name ?? null }, null, 2));
console.log(`Built product website for v${version}. Windows: available. macOS: ${mac ? 'available' : 'not released'}.`);
