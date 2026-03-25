export type CanvasHeroIconKind = 'opportunity' | 'risk' | 'rss' | 'list';

export type CanvasHeroData = {
	title: string;
	description?: string;
	dealNumber?: number;
	iconKind?: CanvasHeroIconKind;
};
