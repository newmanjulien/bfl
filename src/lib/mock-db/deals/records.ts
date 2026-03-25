import type { ActivityTrendChartData } from '$lib/domain/activity-trend';
import type {
	DealActivityRecord,
	DealBrokerLinkRecord,
	DealContextRecord,
	DealForecastRecord,
	DealInsightRecord,
	DealNewsRecord,
	DealRecord
} from '$lib/domain/deals';
import type { BrokerId } from '../reference/records';

type BrokerScopedDealActivity = DealActivityRecord<BrokerId>;
type BrokerScopedDealBrokerLink = DealBrokerLinkRecord<BrokerId>;
type BrokerScopedDealContext = DealContextRecord<BrokerId>;
type BrokerScopedDealInsight = DealInsightRecord<BrokerId>;

function createActivityTrend(
	dealId: string,
	values: readonly [number, number, number, number, number]
): ActivityTrendChartData {
	return {
		points: [
			{ id: `${dealId}-q2`, label: 'Q2', value: values[0] },
			{ id: `${dealId}-q3`, label: 'Q3', value: values[1] },
			{ id: `${dealId}-q4`, label: 'Q4', value: values[2] },
			{ id: `${dealId}-q1`, label: 'Q1', value: values[3] },
			{ id: `${dealId}-now`, label: 'Now', value: values[4] }
		],
		currentPointId: `${dealId}-now`
	};
}

export const deals = [
	{
		dealId: 'deal-3m',
		dealNumber: 74,
		accountName: '3M',
		dealName: '3M deal',
		probability: 25,
		stage: 'Discovery',
		activityTrend: createActivityTrend('deal-3m', [0, 10, 35, 48, 58]),
		lastActivityAtIso: '2026-03-08T12:00:00Z'
	},
	{
		dealId: 'deal-fedex',
		dealNumber: 92,
		accountName: 'FedEx',
		dealName: 'FedEx deal',
		probability: 60,
		stage: 'Proposal',
		activityTrend: createActivityTrend('deal-fedex', [28, 44, 63, 78, 91]),
		lastActivityAtIso: '2026-03-07T18:00:00Z'
	},
	{
		dealId: 'deal-caterpillar',
		dealNumber: 87,
		accountName: 'Caterpillar',
		dealName: 'Caterpillar deal',
		probability: 35,
		stage: 'Negotiation',
		activityTrend: createActivityTrend('deal-caterpillar', [16, 31, 47, 54, 58]),
		lastActivityAtIso: '2026-03-08T15:00:00Z'
	},
	{
		dealId: 'deal-southwest',
		dealNumber: 90,
		accountName: 'Southwest Airlines',
		dealName: 'Southwest Airlines deal',
		probability: 75,
		stage: 'Negotiation',
		activityTrend: createActivityTrend('deal-southwest', [24, 36, 51, 64, 73]),
		lastActivityAtIso: '2026-03-08T14:00:00Z'
	},
	{
		dealId: 'deal-john-deere',
		dealNumber: 31,
		accountName: 'John Deere',
		dealName: 'John Deere deal',
		probability: 100,
		stage: 'Closed won',
		activityTrend: createActivityTrend('deal-john-deere', [62, 59, 48, 34, 28]),
		lastActivityAtIso: '2026-03-05T13:00:00Z'
	},
	{
		dealId: 'deal-hilton',
		dealNumber: 86,
		accountName: 'Hilton',
		dealName: 'Hilton deal',
		probability: 0,
		stage: 'Closed lost',
		activityTrend: createActivityTrend('deal-hilton', [31, 23, 18, 15, 12]),
		lastActivityAtIso: '2026-03-01T16:00:00Z'
	},
	{
		dealId: 'deal-whirlpool',
		dealNumber: 104,
		accountName: 'Whirlpool',
		dealName: 'Whirlpool deal',
		probability: 25,
		stage: 'Discovery',
		activityTrend: createActivityTrend('deal-whirlpool', [6, 10, 14, 18, 22])
	},
	{
		dealId: 'deal-tyson',
		dealNumber: 105,
		accountName: 'Tyson Foods',
		dealName: 'Tyson Foods deal',
		probability: 85,
		stage: 'Proposal',
		activityTrend: createActivityTrend('deal-tyson', [22, 36, 49, 67, 78])
	},
	{
		dealId: 'deal-honeywell',
		dealNumber: 118,
		accountName: 'Honeywell',
		dealName: 'Honeywell deal',
		probability: 40,
		stage: 'Discovery'
	},
	{
		dealId: 'deal-sherwin-williams',
		dealNumber: 101,
		accountName: 'Sherwin-Williams',
		dealName: 'Sherwin-Williams deal',
		probability: 68,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-general-mills',
		dealNumber: 102,
		accountName: 'General Mills',
		dealName: 'General Mills deal',
		probability: 28,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-kroger',
		dealNumber: 103,
		accountName: 'Kroger',
		dealName: 'Kroger deal',
		probability: 14,
		stage: 'Discovery'
	},
	{
		dealId: 'deal-waste-management',
		dealNumber: 107,
		accountName: 'Waste Management',
		dealName: 'Waste Management deal',
		probability: 40,
		stage: 'Negotiation'
	},
	{
		dealId: 'deal-republic-services',
		dealNumber: 108,
		accountName: 'Republic Services',
		dealName: 'Republic Services deal',
		probability: 18,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-delta',
		dealNumber: 106,
		accountName: 'Delta Air Lines',
		dealName: 'Delta Air Lines deal',
		probability: 80,
		stage: 'Negotiation'
	},
	{
		dealId: 'deal-home-depot',
		dealNumber: 116,
		accountName: 'Home Depot',
		dealName: 'Home Depot deal',
		probability: 42,
		stage: 'Discovery'
	},
	{
		dealId: 'deal-costco',
		dealNumber: 109,
		accountName: 'Costco',
		dealName: 'Costco deal',
		probability: 86,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-marriott',
		dealNumber: 110,
		accountName: 'Marriott',
		dealName: 'Marriott deal',
		probability: 92,
		stage: 'Negotiation'
	},
	{
		dealId: 'deal-ups',
		dealNumber: 111,
		accountName: 'UPS',
		dealName: 'UPS deal',
		probability: 94,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-lowes',
		dealNumber: 112,
		accountName: "Lowe's",
		dealName: "Lowe's deal",
		probability: 30,
		stage: 'Discovery'
	},
	{
		dealId: 'deal-ikea',
		dealNumber: 113,
		accountName: 'IKEA',
		dealName: 'IKEA deal',
		probability: 48,
		stage: 'Discovery'
	},
	{
		dealId: 'deal-united-rentals',
		dealNumber: 114,
		accountName: 'United Rentals',
		dealName: 'United Rentals deal',
		probability: 60,
		stage: 'Proposal'
	},
	{
		dealId: 'deal-sysco',
		dealNumber: 115,
		accountName: 'Sysco',
		dealName: 'Sysco deal',
		probability: 90,
		stage: 'Negotiation'
	}
] as const satisfies readonly DealRecord[];

export const dealBrokerLinks = [
	{
		id: 'deal-link-3m-owner',
		dealId: 'deal-3m',
		brokerId: 'julien',
		relationship: 'owner'
	},
	{
		id: 'deal-link-3m-member',
		dealId: 'deal-3m',
		brokerId: 'julien',
		relationship: 'member'
	},
	{
		id: 'deal-link-fedex-member',
		dealId: 'deal-fedex',
		brokerId: 'julien',
		relationship: 'member'
	},
	{
		id: 'deal-link-caterpillar-owner',
		dealId: 'deal-caterpillar',
		brokerId: 'julien',
		relationship: 'owner'
	},
	{
		id: 'deal-link-caterpillar-member',
		dealId: 'deal-caterpillar',
		brokerId: 'julien',
		relationship: 'member'
	},
	{
		id: 'deal-link-southwest-owner',
		dealId: 'deal-southwest',
		brokerId: 'yash',
		relationship: 'owner'
	},
	{
		id: 'deal-link-southwest-member',
		dealId: 'deal-southwest',
		brokerId: 'yash',
		relationship: 'member'
	},
	{
		id: 'deal-link-john-deere-owner',
		dealId: 'deal-john-deere',
		brokerId: 'yash',
		relationship: 'owner'
	},
	{
		id: 'deal-link-john-deere-member',
		dealId: 'deal-john-deere',
		brokerId: 'yash',
		relationship: 'member'
	},
	{
		id: 'deal-link-hilton-owner',
		dealId: 'deal-hilton',
		brokerId: 'julien',
		relationship: 'owner'
	},
	{
		id: 'deal-link-hilton-member',
		dealId: 'deal-hilton',
		brokerId: 'julien',
		relationship: 'member'
	}
] as const satisfies readonly BrokerScopedDealBrokerLink[];

export const dealActivities = [
	{
		kind: 'headline',
		id: 'activity-3m-procurement-repeat',
		dealId: 'deal-3m',
		stream: 'deal-detail',
		marker: { kind: 'dot' },
		title: 'Procurement recycled objections from prior evaluations',
		occurredOnIso: '2026-01-17',
		body: "3M's latest scorecard again emphasized implementation risk, security review depth, and proof that a rollout can land without disrupting existing processes."
	},
	{
		kind: 'headline',
		id: 'activity-3m-rebuttal-pack',
		dealId: 'deal-3m',
		stream: 'deal-detail',
		marker: { kind: 'dot' },
		title: 'Champion asked for a tighter rebuttal pack',
		occurredOnIso: '2026-02-03',
		body: "Julien's internal champion requested a concise packet covering security posture, referenceable enterprise wins, and a cleaner implementation plan before the next procurement meeting."
	},
	{
		kind: 'actor-action',
		id: 'activity-3m-security-follow-up',
		dealId: 'deal-3m',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'julien' },
		actorBrokerId: 'julien',
		action: 'followed up after security prep review',
		occurredOnIso: '2026-03-08',
		body: 'The team aligned on sending a shorter implementation narrative and a side-by-side security response so 3M can move the evaluation forward without reopening every prior objection.'
	},
	{
		kind: 'headline',
		id: 'activity-3m-legal-signoff',
		dealId: 'deal-3m',
		stream: 'meeting-update',
		marker: { kind: 'dot' },
		title: 'Legal signoff from 3M',
		occurredOnIso: '2026-01-26',
		body: 'Julien drove the contract through legal by coordinating redlines, resolving liability and security terms, and keeping both counsels moving on deadlines. Legal signoff was secured, clearing the deal to proceed.'
	},
	{
		kind: 'actor-action',
		id: 'activity-fedex-proposal-recap',
		dealId: 'deal-fedex',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'julien' },
		actorBrokerId: 'julien',
		action: 'shared a tailored proposal recap',
		occurredOnIso: '2026-03-07',
		body: 'Julien shared a tailored proposal recap and next-step plan so the account team can tighten the path to commercial alignment.'
	},
	{
		kind: 'actor-action',
		id: 'activity-caterpillar-checkpoint',
		dealId: 'deal-caterpillar',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'julien' },
		actorBrokerId: 'julien',
		action: 'framed the next negotiation checkpoint',
		occurredOnIso: '2026-03-08',
		body: 'Julien followed up with the account team to keep negotiations active and frame the next internal checkpoint around decision criteria.'
	},
	{
		kind: 'actor-action',
		id: 'activity-southwest-follow-up',
		dealId: 'deal-southwest',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'yash' },
		actorBrokerId: 'yash',
		action: 'advanced the negotiation follow-up',
		occurredOnIso: '2026-03-08',
		body: 'Yash advanced the deal with a negotiation follow-up that centered the commercial path and reinforced the current buying momentum.'
	},
	{
		kind: 'actor-action',
		id: 'activity-john-deere-closeout',
		dealId: 'deal-john-deere',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'yash' },
		actorBrokerId: 'yash',
		action: 'closed the customer loop',
		occurredOnIso: '2026-03-05',
		body: 'Yash closed the loop with the customer team and captured the outcome so it can support future broker conversations and proof points.'
	},
	{
		kind: 'actor-action',
		id: 'activity-hilton-loss-review',
		dealId: 'deal-hilton',
		stream: 'deal-detail',
		marker: { kind: 'broker-avatar', brokerId: 'julien' },
		actorBrokerId: 'julien',
		action: 'documented the final loss context',
		occurredOnIso: '2026-03-01',
		body: 'Julien documented the final loss context to preserve learnings for future broker-led deal reviews and qualification decisions.'
	},
	{
		kind: 'headline',
		id: 'activity-tyson-second-meeting',
		dealId: 'deal-tyson',
		stream: 'meeting-update',
		marker: { kind: 'dot' },
		title: '2nd meeting with Tyson Foods',
		occurredOnIso: '2026-01-13',
		body: 'Julien coordinated the 2nd meeting, aligned stakeholders on a refreshed proposal, and walked Tyson through pricing, implementation, and timeline. They captured objections live and left the call with clear next steps and owners.'
	},
	{
		kind: 'headline',
		id: 'activity-whirlpool-cfo',
		dealId: 'deal-whirlpool',
		stream: 'meeting-update',
		marker: { kind: 'dot' },
		title: "1:1 with Whirlpool's CFO",
		occurredOnIso: '2026-01-25',
		body: 'Julien completed a dedicated 1:1 with the CFO, presented the ROI case and risk mitigation plan, and addressed budget/timing questions. They confirmed approval criteria and the internal path to a decision.'
	}
] as const satisfies readonly BrokerScopedDealActivity[];

export const dealNews = [
	{
		id: 'news-3m-1',
		dealId: 'deal-3m',
		title: 'Procurement review reopened familiar rollout concerns',
		source: 'news',
		publishedOnIso: '2026-03-08'
	},
	{
		id: 'news-3m-2',
		dealId: 'deal-3m',
		title: 'Security committee asked for tighter implementation proof',
		source: 'news',
		publishedOnIso: '2026-03-06'
	},
	{
		id: 'news-3m-3',
		dealId: 'deal-3m',
		title: 'Champion is pressing for a cleaner rebuttal packet',
		source: 'news',
		publishedOnIso: '2026-03-03'
	},
	{
		id: 'news-3m-4',
		dealId: 'deal-3m',
		title: 'Finance leadership responsibilities expanded during the review',
		source: 'news',
		publishedOnIso: '2026-02-27'
	},
	{
		id: 'news-3m-5',
		dealId: 'deal-3m',
		title: 'Internal review shifted toward rebuttal-package quality',
		source: 'news',
		publishedOnIso: '2026-02-24'
	},
	{
		id: 'news-3m-6',
		dealId: 'deal-3m',
		title: '3M has a new CFO who is also doing the COO job',
		source: 'news',
		publishedOnIso: '2026-02-16'
	},
	{
		id: 'news-fedex-1',
		dealId: 'deal-fedex',
		title: 'Proposal review is now centered on rollout confidence',
		source: 'news',
		publishedOnIso: '2026-03-07'
	},
	{
		id: 'news-caterpillar-1',
		dealId: 'deal-caterpillar',
		title: 'Negotiation momentum now depends on executive alignment',
		source: 'linkedin',
		publishedOnIso: '2026-03-08'
	},
	{
		id: 'news-southwest-1',
		dealId: 'deal-southwest',
		title: 'Buyer engagement strengthened during negotiation',
		source: 'linkedin',
		publishedOnIso: '2026-03-08'
	},
	{
		id: 'news-john-deere-1',
		dealId: 'deal-john-deere',
		title: 'Closed-won rollout is becoming a strong reference account',
		source: 'news',
		publishedOnIso: '2026-03-05'
	},
	{
		id: 'news-hilton-1',
		dealId: 'deal-hilton',
		title: 'Closed-lost review is now informing qualification decisions',
		source: 'news',
		publishedOnIso: '2026-03-01'
	}
] as const satisfies readonly DealNewsRecord[];

export const dealInsights = [
	{
		id: 'insight-118',
		dealId: 'deal-honeywell',
		kind: 'opportunity',
		title: 'CFO was a customer at his last job',
		activityLevel: 'low',
		ownerBrokerIds: ['yash', 'julien'],
		timeline: [
			{
				kind: 'headline',
				id: 'insight-118-prior-rollout',
				dealId: 'deal-honeywell',
				stream: 'deal-detail',
				marker: { kind: 'dot' },
				title: 'CFO referenced a successful prior rollout',
				occurredOnIso: '2026-02-11',
				body: 'During discovery, the CFO said her last team solved similar reporting pain with a modern workflow and was open to revisiting that playbook here.'
			},
			{
				kind: 'headline',
				id: 'insight-118-intro-path',
				dealId: 'deal-honeywell',
				stream: 'deal-detail',
				marker: { kind: 'dot' },
				title: 'Finance champion offered to broker an executive intro',
				occurredOnIso: '2026-02-19',
				body: "Honeywell's finance ops lead said Julien can get time with the CFO if the team packages a short migration story and a concrete ROI example first."
			}
		],
		orgChartRoot: {
			id: 'nina-brooks',
			name: 'Nina Brooks',
			role: 'Chief Financial Officer',
			lastContactedById: 'yash',
			lastContactedOnIso: '2026-02-19',
			directReports: [
				{
					id: 'adam-cole',
					name: 'Adam Cole',
					role: 'VP, Finance Operations',
					lastContactedById: 'julien',
					lastContactedOnIso: '2026-02-21',
					directReports: [
						{
							id: 'maya-ross',
							name: 'Maya Ross',
							role: 'Director, RevOps Systems',
							lastContactedById: 'yash',
							lastContactedOnIso: '2026-02-23'
						}
					]
				},
				{
					id: 'leah-wu',
					name: 'Leah Wu',
					role: 'Procurement Lead',
					lastContactedById: 'julien',
					lastContactedOnIso: '2026-02-14'
				}
			]
		}
	},
	{
		id: 'insight-119',
		dealId: 'deal-3m',
		kind: 'risk',
		title: "We've lost multiple RFPs at 3M",
		activityLevel: 'high',
		ownerBrokerIds: ['yash', 'julien'],
		timeline: [
			{
				kind: 'headline',
				id: 'insight-119-scorecard-repeat',
				dealId: 'deal-3m',
				stream: 'deal-detail',
				marker: { kind: 'dot' },
				title: 'Procurement recycled objections from prior evaluations',
				occurredOnIso: '2026-01-17',
				body: "The latest 3M scorecard again emphasized implementation risk, security review depth, and proof that a rollout can land without disrupting existing processes."
			},
			{
				kind: 'headline',
				id: 'insight-119-rebuttal-pack',
				dealId: 'deal-3m',
				stream: 'deal-detail',
				marker: { kind: 'dot' },
				title: 'Internal champion asked for a tighter rebuttal pack',
				occurredOnIso: '2026-02-03',
				body: "Julien's champion requested a concise packet covering security posture, referenceable enterprise wins, and a cleaner implementation plan before the next procurement meeting."
			}
		],
		orgChartRoot: {
			id: 'daniel-ortega',
			name: 'Daniel Ortega',
			role: 'VP, Strategic Sourcing',
			lastContactedById: 'julien',
			lastContactedOnIso: '2026-02-03',
			directReports: [
				{
					id: 'erica-mills',
					name: 'Erica Mills',
					role: 'Director, Security Review',
					lastContactedById: 'yash',
					lastContactedOnIso: '2026-01-30'
				},
				{
					id: 'paul-rivera',
					name: 'Paul Rivera',
					role: 'Business Systems Lead',
					lastContactedById: 'julien',
					lastContactedOnIso: '2026-02-12',
					directReports: [
						{
							id: 'sana-kapoor',
							name: 'Sana Kapoor',
							role: 'Senior Procurement Manager',
							lastContactedById: 'julien',
							lastContactedOnIso: '2026-02-18'
						}
					]
				}
			]
		}
	}
] as const satisfies readonly BrokerScopedDealInsight[];

export const dealForecasts = [
	{
		id: 'forecast-sherwin-williams',
		dealId: 'deal-sherwin-williams',
		overbaseProbability: 82,
		description:
			'The economic buyer confirmed budget in email. Procurement started vendor setup and shared a timeline. Security is marked complete with no blockers.'
	},
	{
		id: 'forecast-john-deere',
		dealId: 'deal-john-deere',
		overbaseProbability: 90,
		description:
			'Legal returned a marked-up agreement with targeted edits. The CFO asked rollout and success questions for sign-off. Kickoff is already penciled in on the calendar.'
	},
	{
		id: 'forecast-3m',
		dealId: 'deal-3m',
		overbaseProbability: 74,
		description:
			'Security is approved in the tracker. Procurement confirmed steps and a target PO date. They hired a new VP who has rolled this out before at a current customer.'
	},
	{
		id: 'forecast-general-mills',
		dealId: 'deal-general-mills',
		overbaseProbability: 62,
		description:
			'A decision meeting is on the calendar with an exec sponsor. Success criteria and a decision date are agreed. The sponsor asked for a contract draft to review.'
	},
	{
		id: 'forecast-tyson',
		dealId: 'deal-tyson',
		overbaseProbability: 40,
		description:
			'Pain is tied to a KPI and the team is engaged. The economic buyer has not joined a call yet. Tasks are assigned but there is no decision date.'
	},
	{
		id: 'forecast-kroger',
		dealId: 'deal-kroger',
		overbaseProbability: 24,
		description:
			'There is a new champion but they cannot name the budget owner. The criteria keeps changing. The next meeting is exploratory, not a decision checkpoint.'
	},
	{
		id: 'forecast-southwest',
		dealId: 'deal-southwest',
		overbaseProbability: 96,
		description:
			'The decision maker committed in the meeting notes. Implementation time is blocked. The buyer agreed to a signature date and procurement steps.'
	},
	{
		id: 'forecast-waste-management',
		dealId: 'deal-waste-management',
		overbaseProbability: 84,
		description:
			'They gave a hard go-live date tied to an internal program. Security is approved with no blockers. Procurement asked for final terms to issue a PO.'
	},
	{
		id: 'forecast-republic-services',
		dealId: 'deal-republic-services',
		overbaseProbability: 82,
		description:
			'There is an off-CRM thread coordinating procurement and legal. They shared a target signature week and an approver list. They also posted an RFP and job listings for this workflow.'
	},
	{
		id: 'forecast-caterpillar',
		dealId: 'deal-caterpillar',
		overbaseProbability: 90,
		description:
			'Redlines are in flight and getting resolved. The buyer confirmed who signs and what procurement needs. There is a dated close plan with owners.'
	},
	{
		id: 'forecast-hilton',
		dealId: 'deal-hilton',
		overbaseProbability: 54,
		description:
			'Budget is pending and the owner is not confirmed in writing. Stakeholders disagree on must-haves. A meeting is booked to align before a decision.'
	},
	{
		id: 'forecast-delta',
		dealId: 'deal-delta',
		overbaseProbability: 76,
		description:
			'The buyer confirmed success criteria and the implementation plan. The economic buyer asked for the final contract package. Signature authority and a target close date are known.'
	},
	{
		id: 'forecast-home-depot',
		dealId: 'deal-home-depot',
		overbaseProbability: 46,
		description:
			'The last meeting ended with no owners for next steps. There is no decision date and the follow-up is a check-in. The economic buyer is not engaged.'
	},
	{
		id: 'forecast-whirlpool',
		dealId: 'deal-whirlpool',
		overbaseProbability: 62,
		description:
			'Calls turned defensive and they asked for concessions before agreeing to a next step. The champion stopped replying after the pricing doc. A competitor was added to the next eval call.'
	},
	{
		id: 'forecast-costco',
		dealId: 'deal-costco',
		overbaseProbability: 36,
		description:
			'Scope expanded after the last review. New approvers joined late and reopened evaluation. The next meeting slipped twice and the decision date is gone.'
	},
	{
		id: 'forecast-marriott',
		dealId: 'deal-marriott',
		overbaseProbability: 70,
		description:
			'Legal is engaged but not at signature. Procurement reopened pricing and asked for re-approval paperwork. They want a revised quote before continuing redlines.'
	},
	{
		id: 'forecast-fedex',
		dealId: 'deal-fedex',
		overbaseProbability: 22,
		description:
			'Tone turned defensive and next steps got vague. They asked for a side-by-side against two vendors. A new competitor bundle is in their eval doc.'
	},
	{
		id: 'forecast-ups',
		dealId: 'deal-ups',
		overbaseProbability: 54,
		description:
			'The champion is supportive but cannot bypass procurement. Procurement added new compliance questions after pricing. Legal and procurement steps are not mapped to a close date.'
	},
	{
		id: 'forecast-lowes',
		dealId: 'deal-lowes',
		overbaseProbability: 16,
		description:
			'The budget owner has not joined any meetings. Email responses slowed from days to weeks. There is no next meeting scheduled.'
	},
	{
		id: 'forecast-ikea',
		dealId: 'deal-ikea',
		overbaseProbability: 18,
		description:
			'Pilot usage plateaued and the end date passed. The sponsor changed roles and lost influence. Procurement and legal steps never started.'
	},
	{
		id: 'forecast-united-rentals',
		dealId: 'deal-united-rentals',
		overbaseProbability: 36,
		description:
			'Procurement asked for a fresh scoring matrix and new requirements. Late stakeholders are re-running discovery. The original close date was removed from the plan.'
	},
	{
		id: 'forecast-sysco',
		dealId: 'deal-sysco',
		overbaseProbability: 28,
		description:
			'Procurement paused onboarding and asked to wait for direction. The buyer said they are reducing tool count. Their acquisition plan is pushing standardization and vendor cuts.'
	}
] as const satisfies readonly DealForecastRecord[];

export const dealContexts = [
	{
		dealId: 'deal-3m',
		summary:
			'Procurement and security objections look like a repeat of earlier lost evaluations, so Julien needs a tighter rebuttal package before the next review.',
		claimedAtIso: '2023-03-22T00:00:00Z',
		orgChartRoot: {
			id: 'daniel-ortega',
			name: 'Daniel Ortega',
			role: 'VP, Strategic Sourcing',
			lastContactedById: 'julien',
			lastContactedOnIso: '2026-03-08',
			directReports: [
				{
					id: 'erica-mills',
					name: 'Erica Mills',
					role: 'Director, Security Review',
					lastContactedById: 'yash',
					lastContactedOnIso: '2026-03-05'
				},
				{
					id: 'paul-rivera',
					name: 'Paul Rivera',
					role: 'Business Systems Lead',
					lastContactedById: 'julien',
					lastContactedOnIso: '2026-03-08',
					directReports: [
						{
							id: 'sana-kapoor',
							name: 'Sana Kapoor',
							role: 'Senior Procurement Manager',
							lastContactedById: 'julien',
							lastContactedOnIso: '2026-03-06'
						}
					]
				}
			]
		}
	}
] as const satisfies readonly BrokerScopedDealContext[];
