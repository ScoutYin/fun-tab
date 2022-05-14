<template>
	<div>
		<fun-tabs v-model="tabsValue" @change="handleTabsChange">
			<fun-tab-item
				v-for="item in tabsItems"
				:key="item.value"
				:title="item.title"
				:name="item.value"
				:badge="item.badge"
			/>
		</fun-tabs>

		<div class="demo-tab-bar">
			<fun-tab-bar v-model="tabBarValue" @change="handleTabBarChange">
				<fun-tab-item
					v-for="item in tabBarItems"
					:key="item.value"
					:title="item.title"
					:name="item.value"
					:badge="item.badge"
				>
					<template #icon>
						<i :class="item.icon" />
					</template>
				</fun-tab-item>
			</fun-tab-bar>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { FunTabs, FunTabBar, FunTabItem } from '../src/index';

interface ItemConfig {
	title: string;
	value: string | number;
	badge?: string | number;
	icon?: string;
}

const tabsValue = ref('fe');
const tabsItems: Ref<ItemConfig[]> = ref([
	{ title: '首页', value: 'home' },
	{ title: '推荐', value: 'recommend' },
	{ title: 'Android', value: 'android' },
	{ title: '前端', value: 'fe', badge: 22 },
	{ title: '后端', value: 'be' },
	{ title: 'iOS', value: 'ios' },
	{ title: '产品', value: 'pm' },
	{ title: '人工智能', value: 'ai' },
	{ title: '设计', value: 'design' },
] as ItemConfig[]);

const tabBarValue = ref('home');
const tabBarItems: Ref<ItemConfig[]> = ref([
	{ title: '首页', icon: 'ly-icon ly-icon-home', value: 'home' },
	{ title: '沸点', icon: 'ly-icon ly-icon-icon--', value: 'pins' },
	{
		title: '发现',
		icon: 'ly-icon ly-icon-sousuo',
		value: 'find',
		badge: 3,
	},
	{ title: '我', icon: 'ly-icon ly-icon-wode', value: 'mine' },
] as ItemConfig[]);

const handleTabsChange = (value: string) => {
	console.log('FunTabs change:', value);
};
const handleTabBarChange = (value: string) => {
	console.log('FunTabBar change:', value);
};
</script>

<style>
@import './assets/icon/iconfont.css';
body {
	margin: 0;
	min-height: 100vh;
	background: rgb(250, 251, 252);
}
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}
.demo-tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
}
</style>
