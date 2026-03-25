class DashboardShellState {
	isSidebarExpanded = $state(true);
	isMobileDrawerOpen = $state(false);
	openMenuId = $state<string | null>(null);

	toggleSidebar() {
		this.isSidebarExpanded = !this.isSidebarExpanded;
	}

	setSidebarExpanded(expanded: boolean) {
		this.isSidebarExpanded = expanded;
	}

	toggleMobileDrawer() {
		this.setMobileDrawerOpen(!this.isMobileDrawerOpen);
	}

	setMobileDrawerOpen(open: boolean) {
		this.isMobileDrawerOpen = open;
		if (open) {
			this.openMenuId = null;
		}
	}

	setMenuOpen(menuId: string, open: boolean) {
		if (open) {
			this.isMobileDrawerOpen = false;
			this.openMenuId = menuId;
			return;
		}

		this.openMenuId = this.openMenuId === menuId ? null : this.openMenuId;
	}

	isMenuOpen(menuId: string) {
		return this.openMenuId === menuId;
	}
}

export const shellState = new DashboardShellState();
