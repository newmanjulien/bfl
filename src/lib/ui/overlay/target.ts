export const OVERLAY_ROOT_ID = 'app-overlays';

export function getOverlayTarget() {
	if (typeof document === 'undefined') {
		return undefined;
	}

	return document.getElementById(OVERLAY_ROOT_ID) ?? document.body;
}
