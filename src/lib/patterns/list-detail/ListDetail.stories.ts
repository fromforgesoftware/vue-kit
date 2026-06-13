import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { Landmark, MoreHorizontal } from '@lucide/vue';
import ListDetail from './ListDetail.vue';
import ListDetailItem from './ListDetailItem.vue';
import ListDetailHeader from './ListDetailHeader.vue';
import Avatar from '../../general/avatar/Avatar.vue';
import Badge from '../../general/badge/Badge.vue';
import Button from '../../general/button/Button.vue';
import Icon from '../../general/icon/Icon.vue';
import Tabs from '../../general/tabs/Tabs.vue';
import TabsList from '../../general/tabs/TabsList.vue';
import TabsTrigger from '../../general/tabs/TabsTrigger.vue';
import TabsContent from '../../general/tabs/TabsContent.vue';

const meta: Meta<typeof ListDetail> = {
	title: 'Patterns/ListDetail',
	component: ListDetail,
	parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ListDetail>;

const ACCOUNTS = [
	{ id: 'a1', name: 'Checking', kind: 'Cash', balance: '€2,794.00' },
	{ id: 'a2', name: 'Brokerage', kind: 'Investment', balance: '€18,210.00' },
	{ id: 'a3', name: 'Mortgage', kind: 'Liability', balance: '−€142,000.00' },
];

export const Default: Story = {
	render: () => ({
		components: {
			ListDetail,
			ListDetailItem,
			ListDetailHeader,
			Avatar,
			Badge,
			Button,
			Icon,
			Tabs,
			TabsList,
			TabsTrigger,
			TabsContent,
		},
		setup() {
			const accounts = ACCOUNTS;
			const selected = ref<string | null>('a1');
			const current = () => accounts.find((a) => a.id === selected.value) ?? null;
			return { accounts, selected, current, Landmark, MoreHorizontal };
		},
		template: `
			<div style="height: 480px;" class="rounded-lg border border-border">
				<ListDetail :selected="selected" @back="selected = null">
					<template #list>
						<div class="p-2">
							<p class="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">Accounts</p>
							<ListDetailItem
								v-for="a in accounts"
								:key="a.id"
								:title="a.name"
								:subtitle="a.kind"
								:active="a.id === selected"
								@select="selected = a.id"
							>
								<template #leading>
									<Avatar :name="a.name" class="size-9" />
								</template>
								<template #trailing>
									<span class="text-sm font-medium tabular-nums">{{ a.balance }}</span>
								</template>
							</ListDetailItem>
						</div>
					</template>
					<template #detail>
						<div class="flex h-full flex-col">
							<ListDetailHeader :title="current()?.name" subtitle="EUR · Cash account">
								<template #leading><Avatar :name="current()?.name" class="size-11" /></template>
								<template #actions>
									<span class="text-lg font-semibold tabular-nums">{{ current()?.balance }}</span>
									<Button variant="ghost" size="icon"><Icon :icon="MoreHorizontal" size="sm" /></Button>
								</template>
							</ListDetailHeader>
							<Tabs default-value="activity" class="flex-1 p-4">
								<TabsList>
									<TabsTrigger value="overview">Overview</TabsTrigger>
									<TabsTrigger value="activity">Activity</TabsTrigger>
									<TabsTrigger value="details">Details</TabsTrigger>
								</TabsList>
								<TabsContent value="overview" class="pt-4 text-sm text-muted-foreground">Overview…</TabsContent>
								<TabsContent value="activity" class="pt-4 text-sm text-muted-foreground">Transactions…</TabsContent>
								<TabsContent value="details" class="pt-4 text-sm text-muted-foreground">Account details…</TabsContent>
							</Tabs>
						</div>
					</template>
					<template #empty>
						<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
							Select an account
						</div>
					</template>
				</ListDetail>
			</div>
		`,
	}),
};
