<template>
	<div ref="el" :style="style" class="fun-tab-item" @click="handleClick">
		<div class="fun-tab-item__wrap">
			<slot name="icon" />
			<div class="fun-tab-item__label">
				<slot>{{ title }}</slot>
			</div>
			<div v-if="badge" class="fun-tab-item__badge">
				{{ badge }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, inject, onMounted, onUnmounted, toRef } from 'vue';
import { TabsInjection, tabsInjectionKey, TabItemInstance } from './types';

export default defineComponent({
	name: 'FunTabItem',
	props: {
		title: String,
		name: [String, Number],
		badge: [String, Number],
	},
	setup(props) {
		const parent = inject(tabsInjectionKey);

		const el = ref();
		const style = computed(() => {
			return parent?.activeValue.value === props.name
				? {
						color: parent?.activeColor.value,
				  }
				: {};
		});
		const handleClick = () => {
			parent?.setActiveValue(props.name);
		};

		const instance: TabItemInstance = {
			name: toRef(props, 'name'),
			el,
		};

		onMounted(() => {
			(parent as TabsInjection).addItem?.(instance);
		});
		onUnmounted(() => {
			(parent as TabsInjection).removeItem?.(instance);
		});

		return {
			el,
			style,
			handleClick,
		};
	},
});
</script>

<style>
.fun-tab-item {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.fun-tab-item__wrap {
	position: relative;
}
.fun-tab-item__badge {
	position: absolute;
	top: 4px;
	right: -10px;
	padding: 0 4px;
	min-width: 8px;
	height: 14px;
	font-size: 9px;
	line-height: 14px;
	color: #fff;
	background: #ff411c;
	white-space: nowrap;
	border-radius: 100px;
	transform: translate(50%, -50%);
	text-align: center;
}
</style>
