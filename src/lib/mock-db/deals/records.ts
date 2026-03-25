import type {
	DealActivityRecord,
	DealBrokerLinkRecord,
	DealContextRecord,
	DealInsightRecord,
	DealNewsRecord,
	DealRecord
} from '$lib/domain/deals';
import type { BrokerId } from '../reference/records';

type BrokerScopedDeal = DealRecord<BrokerId>;
type BrokerScopedDealActivity = DealActivityRecord<BrokerId>;
type BrokerScopedDealBrokerLink = DealBrokerLinkRecord<BrokerId>;
type BrokerScopedDealContext = DealContextRecord<BrokerId>;
type BrokerScopedDealInsight = DealInsightRecord<BrokerId>;

const threeMRiskInsights = [
	{
		id: 'insight-119',
		dealId: 'deal-3m',
		kind: 'risk',
		title: "We've lost multiple RFPs at 3M",
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

const honeywellInsights = [
	{
		id: 'insight-118',
		dealId: 'deal-honeywell',
		kind: 'opportunity',
		title: 'CFO was a customer at his last job',
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
	}
] as const satisfies readonly BrokerScopedDealInsight[];

export const deals: readonly BrokerScopedDeal[] = [
	{
		dealId: 'deal-3m',
		dealNumber: 74,
		accountName: '3M',
		dealName: '3M deal',
		probability: 25,
		stage: 'Discovery',
		activityLevel: 'high',
		lastActivityAtIso: '2026-03-08T12:00:00Z',
		insights: threeMRiskInsights
	},
	{
		dealId: 'deal-fedex',
		dealNumber: 92,
		accountName: 'FedEx',
		dealName: 'FedEx deal',
		probability: 60,
		stage: 'Proposal',
		activityLevel: 'high',
		lastActivityAtIso: '2026-03-07T18:00:00Z'
	},
	{
		dealId: 'deal-caterpillar',
		dealNumber: 87,
		accountName: 'Caterpillar',
		dealName: 'Caterpillar deal',
		probability: 35,
		stage: 'Negotiation',
		activityLevel: 'medium',
		lastActivityAtIso: '2026-03-08T15:00:00Z'
	},
	{
		dealId: 'deal-southwest',
		dealNumber: 90,
		accountName: 'Southwest Airlines',
		dealName: 'Southwest Airlines deal',
		probability: 75,
		stage: 'Negotiation',
		activityLevel: 'high',
		lastActivityAtIso: '2026-03-08T14:00:00Z'
	},
	{
		dealId: 'deal-john-deere',
		dealNumber: 31,
		accountName: 'John Deere',
		dealName: 'John Deere deal',
		probability: 100,
		stage: 'Closed won',
		activityLevel: 'low',
		lastActivityAtIso: '2026-03-05T13:00:00Z'
	},
	{
		dealId: 'deal-hilton',
		dealNumber: 86,
		accountName: 'Hilton',
		dealName: 'Hilton deal',
		probability: 0,
		stage: 'Closed lost',
		activityLevel: 'low',
		lastActivityAtIso: '2026-03-01T16:00:00Z'
	},
	{
		dealId: 'deal-whirlpool',
		dealNumber: 104,
		accountName: 'Whirlpool',
		dealName: 'Whirlpool deal',
		probability: 25,
		stage: 'Discovery',
		activityLevel: 'low'
	},
	{
		dealId: 'deal-tyson',
		dealNumber: 105,
		accountName: 'Tyson Foods',
		dealName: 'Tyson Foods deal',
		probability: 85,
		stage: 'Proposal',
		activityLevel: 'high',
		lastActivityAtIso: '2026-03-08T11:00:00Z'
	},
	{
		dealId: 'deal-honeywell',
		dealNumber: 118,
		accountName: 'Honeywell',
		dealName: 'Honeywell deal',
		probability: 40,
		stage: 'Discovery',
		activityLevel: 'low',
		insights: honeywellInsights
	}
];

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
		},
		helpfulContacts: [
			{
				id: 'helpful-contact-3m-amy-chen',
				name: 'Amy Chen',
				title: 'Former Chief Information Security Officer',
				company: 'ServiceNow',
				linkedInUrl: 'https://www.linkedin.com/in/amy-chen-servicenow'
			},
			{
				id: 'helpful-contact-3m-marcus-reed',
				name: 'Marcus Reed',
				title: 'VP, Procurement Transformation',
				company: 'Delta Air Lines',
				linkedInUrl: 'https://www.linkedin.com/in/marcus-reed-procurement'
			},
			{
				id: 'helpful-contact-3m-priya-shah',
				name: 'Priya Shah',
				title: 'Enterprise Rollout Advisor',
				company: 'Atlassian',
				linkedInUrl: 'https://www.linkedin.com/in/priya-shah-enterprise-rollouts'
			}
		]
	}
] as const satisfies readonly BrokerScopedDealContext[];
