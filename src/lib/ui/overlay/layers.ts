export const OVERLAY_LAYER_CLASS = {
	base: 'app-layer-base',
	shell: 'app-layer-shell',
	floating: 'app-layer-floating',
	drawer: 'app-layer-drawer',
	dialog: 'app-layer-dialog',
	toast: 'app-layer-toast'
} as const;

export type OverlayLayer = keyof typeof OVERLAY_LAYER_CLASS;
