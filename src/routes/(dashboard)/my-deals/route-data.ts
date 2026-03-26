import { error } from "@sveltejs/kit";
import {
  DEFAULT_MY_DEALS_VIEW,
  MY_DEALS_VIEW_OPTIONS,
  buildMyDealsListHref,
  getMyDealsViewLabel,
  type MyDealsView,
} from "$lib/dashboard/my-deals-routes";
import type { DashboardHeaderTitleMenu } from "$lib/dashboard/shell/dashboard-header";
import {
  getMyDealsDetailViewById,
  getMyDealsNewsItems,
  getMyDealsTableRowsForView,
} from "./projection";
import type { CanvasHeroData } from "$lib/ui/custom/canvas-hero";

const MY_DEALS_NEWS_HERO = {
  title: "This week's news",
  description:
    "Get a quick overview of this week's news across the deals you are working on.",
} satisfies CanvasHeroData;

function buildMyDealsHeaderTitleMenu(selectedView: MyDealsView) {
  return {
    kind: "link-menu",
    menuId: "desktop-my-deals-view",
    ariaLabel: "Change my deals view",
    sectionLabel: "Select view",
    activeLabel: getMyDealsViewLabel(selectedView),
    options: MY_DEALS_VIEW_OPTIONS.map((option) => ({
      id: option.id,
      label: option.label,
      href: buildMyDealsListHref(option.id),
      current: option.id === selectedView,
    })),
  } satisfies DashboardHeaderTitleMenu;
}

export function loadMyDealsListData(
  selectedView: MyDealsView = DEFAULT_MY_DEALS_VIEW,
) {
  return {
    selectedView,
    hero: selectedView === "news" ? MY_DEALS_NEWS_HERO : undefined,
    rows: getMyDealsTableRowsForView(selectedView),
    newsItems: getMyDealsNewsItems(),
    headerTitleMenu: buildMyDealsHeaderTitleMenu(selectedView),
  };
}

export function loadMyDealsDetailData(
  detailId: string,
  selectedView: MyDealsView = DEFAULT_MY_DEALS_VIEW,
) {
  const detail = getMyDealsDetailViewById(detailId);

  if (!detail) {
    throw error(404, "Not found");
  }

  return {
    hero: detail.hero,
    newsItems: detail.newsItems,
    activityItems: detail.activityItems,
    update: detail.update,
    rightRail: detail.rightRail,
    headerBackHref: buildMyDealsListHref(selectedView),
  };
}
