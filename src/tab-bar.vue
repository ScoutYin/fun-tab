<template>
	<div class="fun-tab-bar">
		<div class="fun-tab-bar-wrap">
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watch, provide } from 'vue';
import { tabsInjectionKey } from './types';

export default defineComponent({
	name: 'FunTabBar',
	props: {
		modelValue: {
			type: [String, Number],
			default: '',
		},
		activeColor: {
			type: String,
			default: '#1677ff',
		},
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const activeValue = ref(props.modelValue);

		watch(
			() => props.modelValue,
			(v) => {
				activeValue.value = v;
			}
		);

		/**
		 * 设置激活值，供 FunTabItem 实例调用
		 * @param {*} value
		 */
		const setActiveValue = (value: typeof props.modelValue): void => {
			activeValue.value = value;
			emit('update:modelValue', value);
			emit('change', value);
		};

		provide(tabsInjectionKey, {
			activeValue,
			activeColor: toRef(props, 'activeColor'),
			setActiveValue,
		});
	},
});
</script>

<style>
.fun-tab-bar-wrap {
	display: flex;
	flex-wrap: nowrap;
	align-items: stretch;
	min-height: 50px;
	background: #fff;
}
.fun-tab-bar .fun-tab-item {
	flex: 1 1;
	font-size: 12px;
}
.fun-tab-bar .fun-tab-item__badge {
	top: 2px;
	right: 0;
}
</style>
