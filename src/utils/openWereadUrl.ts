import { Notice, Platform } from 'obsidian';
import { get } from 'svelte/store';
import { settingsStore } from '../settings';
import { getPcUrl } from '../parser/parseResponse';
import type WereadPlugin from '../../main';

export function buildBestBookmarkDeepLink(
	bookId: string,
	chapterUid: number,
	range: string
): string {
	const [start, end] = range.split('-');
	const rangeEnd = end || start;
	return `weread://bestbookmark?bookId=${bookId}&chapterUid=${chapterUid}&rangeStart=${start}&rangeEnd=${rangeEnd}`;
}

export async function openWereadDeepLink(url: string): Promise<boolean> {
	if (!url.startsWith('weread://')) {
		window.open(url);
		return true;
	}

	if (Platform.isDesktopApp) {
		try {
			const { shell } = require('electron') as typeof import('electron');
			await shell.openExternal(url);
			return true;
		} catch (error) {
			console.error('[weread plugin] openExternal failed', url, error);
		}
	} else {
		window.open(url);
		return true;
	}

	return false;
}

export async function openWereadHighlightLocation(
	plugin: WereadPlugin,
	bookId: string,
	chapterUid: number,
	range: string
): Promise<void> {
	const settings = get(settingsStore);
	const appDeepLink = buildBestBookmarkDeepLink(bookId, chapterUid, range);

	if (settings.bookOpenMode === 'app') {
		const opened = await openWereadDeepLink(appDeepLink);
		if (opened) {
			return;
		}
		new Notice('无法打开微信读书 App，请确认已安装客户端，或改用网页版阅读入口');
		return;
	}

	await plugin.openPreferredReadingView(getPcUrl(bookId));
}
