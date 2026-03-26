import { activeMeetingDateIso } from "$lib/dashboard/meeting-date";
import {
  buildAllActivityDetailHref,
  buildAllActivityListHref,
  isNonDefaultAllActivityView,
} from "$lib/dashboard/all-activity-routes";
import {
  buildMyDealsDetailHref,
  buildMyDealsListHref,
  isNonDefaultMyDealsView,
} from "$lib/dashboard/my-deals-routes";
import type { DetailRightRailData } from "$lib/dashboard/detail-rail-model";
import { getDashboardHeader } from "$lib/dashboard/shell/dashboard-header";
import { mockDb } from "$lib/mock-db";
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import {
  allActivityTableRows,
  getAllActivityDetailViewById,
  getAllActivityRowsForView,
} from "./all-activity/projection";
import { loadAllActivityListData } from "./all-activity/route-data";
import AllActivityTable from "./all-activity/AllActivityTable.svelte";
import MyDealsPage from "./my-deals/MyDealsPage.svelte";
import {
  getMyDealsDetailViewById,
  myDealsTableRows,
} from "./my-deals/projection";
import { loadMyDealsListData } from "./my-deals/route-data";
import {
  getOpportunityDetailViewById,
  opportunitiesTiles,
  opportunityRiskTiles,
} from "./opportunities/projection";
import {
  sinceLastMeetingDeals,
  sinceLastMeetingReferenceIso,
  sinceLastMeetingTimelineItems,
} from "./since-last-meeting/projection";

function getRightRailRow(rightRail: DetailRightRailData, rowId: string) {
  return (
    rightRail.sections
      .flatMap((section) => (section.kind === "rows" ? section.rows : []))
      .find((row) => row.id === rowId) ?? null
  );
}

function getRowsSection(rightRail: DetailRightRailData, sectionId: string) {
  const section = rightRail.sections.find(
    (candidate) => candidate.id === sectionId,
  );

  return section?.kind === "rows" ? section : null;
}

function getHelpfulContactsSection(rightRail: DetailRightRailData) {
  const section = rightRail.sections.find(
    (candidate) => candidate.id === "helpful-contacts",
  );

  return section?.kind === "helpful-contacts" ? section : null;
}

describe("dashboard data adapters", () => {
  it("renders unassigned owners cleanly in deal list projections", () => {
    expect(
      allActivityTableRows.find((row) => row.id === "deal-fedex")?.owner,
    ).toBeNull();
    expect(
      myDealsTableRows.find((row) => row.id === "deal-fedex")?.owner,
    ).toBeNull();
  });

  it("uses the route view as the source of truth for all-activity tables", () => {
    expect(getAllActivityRowsForView("deals")).toEqual(allActivityTableRows);
    expect(
      getAllActivityRowsForView("need-support").map((row) => row.id),
    ).toEqual(["deal-tyson", "deal-hilton", "deal-fedex"]);
    expect(
      getAllActivityRowsForView("duplicated-work").map((row) => row.id),
    ).toEqual(["deal-3m"]);
    expect(
      getAllActivityRowsForView("no-activity").map((row) => row.id),
    ).toEqual(["deal-whirlpool", "deal-honeywell"]);
    expect(isNonDefaultAllActivityView("need-support")).toBe(true);
    expect(isNonDefaultAllActivityView("duplicated-work")).toBe(true);
    expect(isNonDefaultAllActivityView("no-activity")).toBe(true);
    expect(isNonDefaultAllActivityView("deals")).toBe(false);
    expect(isNonDefaultAllActivityView("unexpected-view")).toBe(false);
    expect(buildAllActivityListHref("deals")).toBe("/all-activity");
    expect(buildAllActivityListHref("need-support")).toBe(
      "/all-activity/need-support",
    );
    expect(buildAllActivityListHref("no-activity")).toBe(
      "/all-activity/no-activity",
    );
    expect(buildAllActivityDetailHref("deal-3m", "deals")).toBe(
      "/all-activity/detail/deal-3m",
    );
    expect(buildAllActivityDetailHref("deal-3m", "duplicated-work")).toBe(
      "/all-activity/duplicated-work/detail/deal-3m",
    );
    expect(buildAllActivityDetailHref("deal-whirlpool", "no-activity")).toBe(
      "/all-activity/no-activity/detail/deal-whirlpool",
    );
    expect(getAllActivityRowsForView("duplicated-work")[0]?.navigation).toEqual(
      {
        kind: "detail",
        href: "/all-activity/duplicated-work/detail/deal-3m",
      },
    );
    expect(
      getAllActivityRowsForView("no-activity").every(
        (row) => row.lastActivity.kind === "text",
      ),
    ).toBe(true);
  });

  it("builds a no-activity list header menu option and fallback last-activity copy", () => {
    const noActivityListData = loadAllActivityListData("no-activity");
    const noActivityHtml = render(AllActivityTable, {
      props: {
        rows: noActivityListData.rows,
      },
    }).body;

    expect(noActivityListData.headerTitleMenu.activeLabel).toBe("No activity");
    expect(
      noActivityListData.headerTitleMenu.options.map((option) => option.label),
    ).toEqual(["Deals", "Need support", "Duplicated work", "No activity"]);
    expect(
      noActivityListData.headerTitleMenu.options.find(
        (option) => option.id === "no-activity",
      ),
    ).toEqual({
      id: "no-activity",
      label: "No activity",
      href: "/all-activity/no-activity",
      current: true,
    });
    expect(noActivityHtml).toContain("No recorded activity");
  });

  it("uses the route view as the source of truth for my-deals list routes", () => {
    const newsListData = loadMyDealsListData();
    const dealsListData = loadMyDealsListData("deals");

    expect(isNonDefaultMyDealsView("deals")).toBe(true);
    expect(isNonDefaultMyDealsView("news")).toBe(false);
    expect(isNonDefaultMyDealsView("unexpected-view")).toBe(false);
    expect(buildMyDealsListHref("news")).toBe("/my-deals");
    expect(buildMyDealsListHref("deals")).toBe("/my-deals/deals");
    expect(buildMyDealsDetailHref("deal-3m", "news")).toBe(
      "/my-deals/detail/deal-3m",
    );
    expect(buildMyDealsDetailHref("deal-3m", "deals")).toBe(
      "/my-deals/deals/detail/deal-3m",
    );
    expect(dealsListData.rows).toEqual(myDealsTableRows);
    expect(newsListData.headerTitleMenu.activeLabel).toBe("This week's news");
    expect(
      newsListData.headerTitleMenu.options.map((option) => option.label),
    ).toEqual(["This week's news", "Deals"]);
    expect(
      newsListData.headerTitleMenu.options.find(
        (option) => option.id === "news",
      ),
    ).toEqual({
      id: "news",
      label: "This week's news",
      href: "/my-deals",
      current: true,
    });
    expect(
      dealsListData.headerTitleMenu.options.find(
        (option) => option.id === "deals",
      ),
    ).toEqual({
      id: "deals",
      label: "Deals",
      href: "/my-deals/deals",
      current: true,
    });
    expect(
      dealsListData.rows.find((row) => row.id === "deal-3m")?.navigation,
    ).toEqual({
      kind: "detail",
      href: "/my-deals/deals/detail/deal-3m",
    });
    expect(
      dealsListData.rows.find((row) => row.id === "deal-3m")
        ?.isReservedInEpic,
    ).toBe(true);
    expect(
      dealsListData.rows.find((row) => row.id === "deal-fedex")
        ?.isReservedInEpic,
    ).toBe(true);
    expect(newsListData.newsItems.map((item) => item.id)).toEqual([
      "news-3m-1",
      "news-3m-2",
      "news-3m-3",
    ]);
    expect(
      newsListData.newsItems.map((item) => item.publishedOnIso),
    ).toEqual([
      "2026-03-08",
      "2026-03-06",
      "2026-03-03",
    ]);
  });

  it("uses the canonical deal number for deal detail views", () => {
    const allActivityDetail = getAllActivityDetailViewById("deal-3m");
    const myDealsDetail = getMyDealsDetailViewById("deal-3m");
    const allActivityDealNumberRow = allActivityDetail
      ? getRightRailRow(allActivityDetail.rightRail, "deal-number")
      : null;
    const myDealsDealNumberRow = myDealsDetail
      ? getRightRailRow(myDealsDetail.rightRail, "deal-number")
      : null;

    expect(allActivityDetail?.hero.dealNumber).toBe(74);
    expect(myDealsDetail?.hero.dealNumber).toBe(74);
    expect("metaId" in (allActivityDetail?.hero ?? {})).toBe(false);
    expect(allActivityDealNumberRow?.kind).toBe("deal-number");
    expect(myDealsDealNumberRow?.kind).toBe("deal-number");

    if (
      allActivityDealNumberRow?.kind !== "deal-number" ||
      myDealsDealNumberRow?.kind !== "deal-number"
    ) {
      throw new Error("Expected detail rails to include a deal-number row.");
    }

    expect(allActivityDealNumberRow.dealNumber).toBe(74);
    expect(myDealsDealNumberRow.dealNumber).toBe(74);
  });

  it("only opts helpful contacts into all-activity detail rails", () => {
    const allActivityDetail = getAllActivityDetailViewById("deal-3m");
    const myDealsDetail = getMyDealsDetailViewById("deal-3m");
    const helpfulContacts = allActivityDetail
      ? getHelpfulContactsSection(allActivityDetail.rightRail)?.contacts
      : undefined;

    expect(helpfulContacts).toBeDefined();
    expect(helpfulContacts).toHaveLength(3);

    for (const contact of helpfulContacts ?? []) {
      expect(contact.title).toBeTruthy();
      expect(contact.company).toBeTruthy();
      expect(contact.linkedInUrl).toMatch(
        /^https:\/\/www\.linkedin\.com\/in\//,
      );
    }

    expect(
      myDealsDetail ? getHelpfulContactsSection(myDealsDetail.rightRail) : null,
    ).toBeNull();
  });

  it("uses the parent deal number for opportunity and risk views", () => {
    const opportunityTile = opportunitiesTiles.find(
      (tile) => tile.id === "insight-118",
    );
    const riskTile = opportunityRiskTiles.find(
      (tile) => tile.id === "insight-119",
    );
    const riskDetail = getOpportunityDetailViewById("insight-119");
    const riskDealNumberRow = riskDetail
      ? getRightRailRow(riskDetail.rightRail, "deal-number")
      : null;

    expect(opportunityTile?.dealNumber).toBe(118);
    expect(riskTile?.dealNumber).toBe(74);
    expect(riskDetail?.hero.dealNumber).toBe(74);
    expect(riskDealNumberRow?.kind).toBe("deal-number");

    if (riskDealNumberRow?.kind !== "deal-number") {
      throw new Error(
        "Expected risk detail rail to include a deal-number row.",
      );
    }

    expect(riskDealNumberRow.dealNumber).toBe(74);
  });

  it("builds opportunity detail rails from explicit sections only", () => {
    const opportunityDetail = getOpportunityDetailViewById("insight-118");
    const opportunityDealNumberRow = opportunityDetail
      ? getRightRailRow(opportunityDetail.rightRail, "deal-number")
      : null;

    expect(opportunityDetail?.hero.dealNumber).toBe(118);
    expect(opportunityDetail).not.toBeNull();

    if (!opportunityDetail) {
      throw new Error("Expected a detail view for the Honeywell opportunity.");
    }

    expect(opportunityDetail.rightRail.sections).toHaveLength(1);
    expect(
      getRowsSection(opportunityDetail.rightRail, "deal-overview"),
    ).not.toBeNull();
    expect(
      getRowsSection(opportunityDetail.rightRail, "deal-timing"),
    ).toBeNull();
    expect(getHelpfulContactsSection(opportunityDetail.rightRail)).toBeNull();
    expect(getRightRailRow(opportunityDetail.rightRail, "claimed")).toBeNull();
    expect(
      getRightRailRow(opportunityDetail.rightRail, "last-activity"),
    ).toBeNull();
    expect(opportunityDealNumberRow?.kind).toBe("deal-number");

    if (opportunityDealNumberRow?.kind !== "deal-number") {
      throw new Error(
        "Expected opportunity detail rail to include a deal-number row.",
      );
    }

    expect(opportunityDealNumberRow.dealNumber).toBe(118);
  });

  it("derives since-last-meeting screens from canonical deal data", () => {
    expect(sinceLastMeetingReferenceIso).toBe(activeMeetingDateIso);
    expect(mockDb.meetings.listDateIsos()).toContain(activeMeetingDateIso);
    expect(sinceLastMeetingTimelineItems.map((item) => item.id)).toEqual([
      "activity-tyson-second-meeting",
      "activity-whirlpool-cfo",
      "activity-3m-legal-signoff",
    ]);
    expect(sinceLastMeetingDeals.map((deal) => deal.id)).toEqual([
      "deal-tyson",
      "deal-whirlpool",
      "deal-3m",
    ]);
    expect(sinceLastMeetingDeals.map((deal) => deal.activityLevel)).toEqual([
      "high",
      "low",
      "high",
    ]);
  });

  it("renders the shared my-deals page for news and deals views", () => {
    const newsHtml = render(MyDealsPage, {
      props: {
        data: loadMyDealsListData(),
      },
    }).body;
    const dealsHtml = render(MyDealsPage, {
      props: {
        data: loadMyDealsListData("deals"),
      },
    }).body;

    expect(newsHtml.match(/role="tab"/g) ?? []).toHaveLength(1);
    expect(newsHtml).toContain("This week's news");
    expect(newsHtml).toContain(
      "Procurement review reopened familiar rollout concerns",
    );
    expect(newsHtml).toContain("Mar 8");
    expect(newsHtml).toContain("max-width: 48rem;");
    expect(newsHtml).not.toContain(
      "Finance leadership responsibilities expanded during the review",
    );
    expect(newsHtml).not.toContain('aria-label="My deals table"');
    expect(dealsHtml).toContain('aria-label="My deals table"');
    expect(dealsHtml).toContain("Latest news");
    expect(dealsHtml).toContain("Reserved in Epic");
    expect(dealsHtml.match(/Reserved in Epic: Yes/g) ?? []).toHaveLength(3);
    expect(dealsHtml.match(/Reserved in Epic: No/g) ?? []).toHaveLength(3);
    expect(dealsHtml).toContain("max-width: 88rem;");
  });
});

describe("dashboard header model", () => {
  it("exposes the my-deals title menu while preserving the add-deal extra", () => {
    const titleMenu = {
      kind: "link-menu" as const,
      menuId: "desktop-my-deals-view",
      ariaLabel: "Change my deals view",
      sectionLabel: "Select view",
      activeLabel: "This week's news",
      options: [
        {
          id: "news",
          label: "This week's news",
          href: "/my-deals",
          current: true,
        },
        {
          id: "deals",
          label: "Deals",
          href: "/my-deals/deals",
          current: false,
        },
      ],
    };
    const header = getDashboardHeader("/my-deals", {
      headerTitleMenu: titleMenu,
    });

    expect(header).toEqual({
      leading: {
        kind: "title-menu",
        title: "My deals",
        menu: titleMenu,
      },
      actions: ["share"],
      extra: { kind: "add-deal" },
    });
  });

  it("renders the my-deals non-default route as a title-menu header", () => {
    const titleMenu = {
      kind: "link-menu" as const,
      menuId: "desktop-my-deals-view",
      ariaLabel: "Change my deals view",
      sectionLabel: "Select view",
      activeLabel: "Deals",
      options: [
        {
          id: "news",
          label: "This week's news",
          href: "/my-deals",
          current: false,
        },
        {
          id: "deals",
          label: "Deals",
          href: "/my-deals/deals",
          current: true,
        },
      ],
    };
    const header = getDashboardHeader("/my-deals/deals", {
      headerTitleMenu: titleMenu,
    });

    expect(header).toEqual({
      leading: {
        kind: "title-menu",
        title: "My deals",
        menu: titleMenu,
      },
      actions: ["share"],
      extra: { kind: "add-deal" },
    });
  });

  it("exposes the all-activity title menu without replacing the existing header filters", () => {
    const titleMenu = {
      kind: "link-menu" as const,
      menuId: "desktop-all-activity-view",
      ariaLabel: "Change all activity view",
      sectionLabel: "Select all activity view",
      activeLabel: "Need support",
      options: [
        {
          id: "deals",
          label: "Deals",
          href: "/all-activity",
          current: false,
        },
        {
          id: "need-support",
          label: "Need support",
          href: "/all-activity/need-support",
          current: true,
        },
        {
          id: "duplicated-work",
          label: "Duplicated work",
          href: "/all-activity/duplicated-work",
          current: false,
        },
        {
          id: "no-activity",
          label: "No activity",
          href: "/all-activity/no-activity",
          current: false,
        },
      ],
    };
    const header = getDashboardHeader("/all-activity/need-support", {
      headerTitleMenu: titleMenu,
    });

    expect(header).toEqual({
      leading: {
        kind: "title-menu",
        title: "All activity",
        menu: titleMenu,
      },
      actions: ["share"],
      extra: {
        kind: "filters",
        filters: ["broker", "activity-level"],
      },
    });
  });

  it("renders dashboard overview routes as control-title headers", () => {
    expect(getDashboardHeader("/since-last-meeting")).toEqual({
      leading: {
        kind: "control-title",
        title: "Since last meeting",
        control: { kind: "meeting-date" },
      },
      actions: ["share", "broker-switch"],
    });

    expect(getDashboardHeader("/opportunities")).toEqual({
      leading: {
        kind: "control-title",
        title: "Opportunities & risks",
        control: { kind: "meeting-date" },
      },
      actions: ["share", "broker-switch"],
    });
  });

  it("preserves the current all-activity view in the detail back link", () => {
    const header = getDashboardHeader(
      "/all-activity/duplicated-work/detail/deal-3m",
      {
        hero: { title: "3M deal" },
        headerBackHref: "/all-activity/need-support",
      },
    );

    expect(header).toEqual({
      leading: {
        kind: "control-title",
        title: "3M deal",
        control: {
          kind: "back-link",
          href: "/all-activity/need-support",
          label: "Need support",
        },
      },
      actions: ["share"],
    });
  });

  it("uses the default all-activity subsection label for detail back links", () => {
    const header = getDashboardHeader("/all-activity/detail/deal-3m", {
      hero: { title: "3M deal" },
    });

    expect(header).toEqual({
      leading: {
        kind: "control-title",
        title: "3M deal",
        control: {
          kind: "back-link",
          href: "/all-activity",
          label: "Deals",
        },
      },
      actions: ["share"],
    });
  });

  it("preserves the current my-deals view in the detail back link", () => {
    const header = getDashboardHeader("/my-deals/deals/detail/deal-3m", {
      hero: { title: "3M deal" },
      headerBackHref: "/my-deals/deals",
    });

    expect(header).toEqual({
      leading: {
        kind: "control-title",
        title: "3M deal",
        control: {
          kind: "back-link",
          href: "/my-deals/deals",
          label: "Deals",
        },
      },
      actions: ["share"],
    });
  });

  it("uses the default my-deals subsection label for detail back links", () => {
    const header = getDashboardHeader("/my-deals/detail/deal-3m", {
      hero: { title: "3M deal" },
    });

    expect(header).toEqual({
      leading: {
        kind: "control-title",
        title: "3M deal",
        control: {
          kind: "back-link",
          href: "/my-deals",
          label: "This week's news",
        },
      },
      actions: ["share"],
    });
  });
});
