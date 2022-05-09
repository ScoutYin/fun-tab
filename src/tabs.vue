<template>
	<div ref="viewAreaRef" class="fun-tabs">
		<div ref="listRef" :style="listStyle" class="fun-tabs__tab-list">
			<slot />
			<div :style="activeBarStyle" class="fun-tabs__active-line" />
		</div>
	</div>
</template>

<script lang="ts">
import {
	defineComponent,
	provide,
	ref,
	computed,
	watch,
	toRef,
	onMounted,
	onBeforeUnmount,
	nextTick,
	PropType,
	Ref,
} from 'vue';
import { TabsInjection, tabsInjectionKey, TabItemInstance } from './types';
import { windowInit } from './utils/requestAnimationFrame';

export default defineComponent({
	name: 'FunTabs',
	props: {
		modelValue: {
			type: [String, Number] as PropType<string | number>,
			default: '',
		},
		lineWidth: {
			type: [Number, String] as PropType<number | string>,
			default: 30,
		},
		lineHeight: {
			type: Number,
			default: 3,
		},
		activeColor: {
			type: String,
			default: '#1677ff',
		},
		// 近似等于超出边界时最大可拖动距离(px);
		additionalX: {
			type: Number,
			default: 50,
		},
		// 惯性回弹指数(值越大，幅度越大，惯性回弹距离越长);
		reBoundExponent: {
			type: Number,
			default: 10,
			validator(v: number) {
				return v > 0;
			},
		},
		// 惯性滑动过程的持续时间，值越小，感知上阻力越大，可近似认为惯性滑动过程速度减为零所需的时间(ms);
		inertialDuration: {
			type: Number,
			default: 1000,
			validator(v: number) {
				return v > 0;
			},
		},
		// 回弹过程duration
		reBoundingDuration: {
			type: Number,
			default: 360,
		},
	} as const,
	emits: ['update:modelValue', 'change'],

	setup(props, { emit, expose }) {
		let refreshTask: Promise<void> | null = null;
		const children: TabItemInstance[] = [];

		// refs
		const viewAreaRef = ref<HTMLElement>() as Ref<HTMLElement>;
		const listRef = ref<HTMLElement>() as Ref<HTMLElement>;
		const activeValue = ref(props.modelValue);
		const lineOffset = ref(0);
		const activeLineWidth = ref(0);
		// 可视区宽度;
		const viewAreaWidth = ref(0);
		// 可视区与可滑动元素宽度差值;
		const offsetX = ref(0);
		// 滑动速度(正常滑动时一般不会超过10);
		const speed = ref(0);
		// 是否处于touch状态;
		const touching = ref(false);
		// 是否处于回弹过程;
		const reBounding = ref(false);
		const translateX = ref(0);
		const startX = ref(0);
		const lastX = ref(0);
		const currentX = ref(0);
		const startMoveTime = ref(0);
		const endMoveTime = ref(0);
		// 每个动画帧的ms数
		const frameTime = ref(16.7);
		const frameStartTime = ref(0);
		const frameEndTime = ref(0);
		const inertiaFrame = ref(0);
		// 当speed绝对值小于该值时认为速度为0 (可用于控制惯性滚动结束期的顺滑度)
		const zeroSpeed = ref(0.001);
		// 惯性滑动加速度;
		const acceleration = ref(0.001);

		const listStyle = computed(() => {
			const duration = reBounding.value && !touching.value ? props.reBoundingDuration : 0;

			return {
				transitionTimingFunction: reBounding.value
					? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
					: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
				transitionDuration: `${duration}ms`,
				transform: `translate3d(${translateX.value}px, 0px, 0px)`,
			};
		});

		const activeBarStyle = computed(() => {
			return {
				transition: `all 300ms`,
				width: `${activeLineWidth.value}px`,
				height: `${props.lineHeight}px`,
				transform: `translate3d(${lineOffset.value}px, 0, 0)`,
				backgroundColor: props.activeColor,
			};
		});
		// 是否向左惯性滚动;
		const isMoveLeft = computed(() => currentX.value <= startX.value);

		watch(
			() => props.modelValue,
			(v) => {
				activeValue.value = v;
				refreshState();
			}
		);

		const refreshState = () => {
			if (refreshTask) {
				return;
			}

			// 避免在单次事件循环中重复执行多次计算逻辑，造成不必要的性能浪费
			refreshTask = new Promise((resolve) => {
				nextTick(() => {
					resize();
					resolve();
					refreshTask = null;
				});
			});
		};

		/**
		 * 设置激活值，供 FunTabItem 实例调用
		 * @param {*} value
		 */
		const setActiveValue = (value: typeof props.modelValue): void => {
			activeValue.value = value;
			emit('update:modelValue', value);
			emit('change', value);
		};

		/**
		 * 供 FunTabItem 实例调用，用于注册 tab item
		 */
		const addItem = (tabItem: TabItemInstance): void => {
			children.push(tabItem);
			refreshState();
		};
		/**
		 * 供 FunTabItem 实例调用，用于移除 tab item
		 */
		const removeItem = (tabItem: TabItemInstance): void => {
			const index = children.findIndex((item) => item.name === tabItem.name);
			if (index === -1) return;

			children.splice(index, 1);
			refreshState();
		};

		const injection: TabsInjection = {
			activeValue,
			activeColor: toRef(props, 'activeColor'),
			addItem,
			removeItem,
			setActiveValue,
		};

		provide(tabsInjectionKey, injection);

		/**
		 * will be exposed
		 */
		const resize = () => {
			// 重新计算可视区宽度
			viewAreaWidth.value = viewAreaRef.value.offsetWidth;
			offsetX.value = listRef.value.offsetWidth - viewAreaWidth.value;
			checkPosition();
			calcLineOffset();
		};

		/**
		 * 如果需要回弹则进行回弹操作，并返回true;
		 */
		const reboundIfNeeded = () => {
			reBounding.value = false;
			if (translateX.value > 0) {
				reBounding.value = true;
				translateX.value = 0;
			} else if (translateX.value < -offsetX.value) {
				reBounding.value = true;
				translateX.value = -offsetX.value;
			}
			return reBounding.value;
		};

		/**
		 * touch拖动
		 */
		const moveFollowTouch = () => {
			// 向左拖动
			if (isMoveLeft.value) {
				if (
					(translateX.value <= 0 && translateX.value + offsetX.value > 0) ||
					translateX.value > 0
				) {
					translateX.value += currentX.value - lastX.value;
				} else if (translateX.value + offsetX.value <= 0) {
					translateX.value +=
						(props.additionalX * (currentX.value - lastX.value)) /
						(viewAreaWidth.value + Math.abs(translateX.value + offsetX.value));
				}
			} else {
				// 向右拖动
				if (translateX.value >= 0) {
					translateX.value +=
						(props.additionalX * (currentX.value - lastX.value)) /
						(viewAreaWidth.value + translateX.value);
				} else if (
					(translateX.value <= 0 && translateX.value + offsetX.value >= 0) ||
					translateX.value + offsetX.value <= 0
				) {
					translateX.value += currentX.value - lastX.value;
				}
			}
			lastX.value = currentX.value;
		};

		/**
		 * 惯性滑动
		 */
		const moveByInertia = () => {
			frameEndTime.value = Date.now();
			frameTime.value = frameEndTime.value - frameStartTime.value;

			// 向左惯性滑动;
			if (isMoveLeft.value) {
				// 超出边界的阶段;
				if (translateX.value <= -offsetX.value) {
					// 加速度指数变化;
					acceleration.value *=
						(props.reBoundExponent + Math.abs(translateX.value + offsetX.value)) /
						props.reBoundExponent;
					// 为避免减速过程过短，此处加速度没有乘上frameTime;
					speed.value = Math.min(speed.value - acceleration.value, 0);
				} else {
					speed.value = Math.min(speed.value - acceleration.value * frameTime.value, 0);
				}
			} else {
				// 向右惯性滑动;
				if (translateX.value >= 0) {
					acceleration.value *= (props.reBoundExponent + translateX.value) / props.reBoundExponent;
					speed.value = Math.max(speed.value - acceleration.value, 0);
				} else {
					speed.value = Math.max(speed.value - acceleration.value * frameTime.value, 0);
				}
			}
			translateX.value += (speed.value * frameTime.value) / 2;
			if (Math.abs(speed.value) <= zeroSpeed.value) {
				reboundIfNeeded();
				return;
			}
			frameStartTime.value = frameEndTime.value;
			inertiaFrame.value = requestAnimationFrame(moveByInertia);
		};

		/**
		 * 获取当前激活 item 的 dom 元素 $el
		 */
		const getActiveItemEl = () => {
			if (!children.length) {
				return;
			}
			const target = children.find((child) => child.name.value === activeValue.value);
			return target && target.el.value;
		};

		/**
		 * 计算activeBar的translateX
		 */
		const calcLineOffset = () => {
			const itemEl = getActiveItemEl();
			if (!itemEl) {
				return;
			}

			const itemWidth = itemEl.offsetWidth;
			const itemLeft = itemEl.offsetLeft;
			const { lineWidth } = props;

			if (lineWidth === 'auto') {
				// 等于当前激活item元素的宽度
				activeLineWidth.value = itemWidth;
			} else if (lineWidth < 1) {
				// 0~1表示占当前激活item元素宽度的比例
				activeLineWidth.value = itemWidth * (lineWidth as number);
			} else {
				activeLineWidth.value = lineWidth as number;
			}

			lineOffset.value = itemLeft + (itemWidth - activeLineWidth.value) / 2;
		};

		/**
		 * 点击切换item时，调整位置使当前item尽可能往中间显示
		 */
		const checkPosition = () => {
			const activeItemEl = getActiveItemEl();
			if (!activeItemEl) {
				return;
			}
			const offsetLeft = activeItemEl.offsetLeft;
			// 让 activeItem 展示在正中间时，其距视图左右边距为 half
			const half = (viewAreaWidth.value - activeItemEl.offsetWidth) / 2;
			// 在当前的translateX基础上需要调整的距离
			let changeX = 0;
			const absTransX = Math.abs(translateX.value);

			// item偏左，需要往右移（往中间靠）
			if (offsetLeft <= absTransX + half) {
				// 这种情况下translateX.value是负数
				changeX = half - (offsetLeft + translateX.value);
			} else {
				// item偏右，需要往左移
				changeX = -(offsetLeft - absTransX - half);
			}
			let targetX = changeX + translateX.value;
			// 左边界
			if (targetX > 0) {
				targetX = 0;
			}
			// 右边界
			if (targetX < -offsetX.value) {
				targetX = -offsetX.value;
			}
			reBounding.value = true;
			translateX.value = targetX;
		};

		/**
		 * touchstart
		 */
		const handleTouchStart = (event: TouchEvent) => {
			event.stopPropagation();
			cancelAnimationFrame(inertiaFrame.value);
			lastX.value = event.touches[0].clientX;
		};

		/**
		 * touchmove
		 */
		const handleTouchMove = (event: TouchEvent) => {
			if (offsetX.value <= 0) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			touching.value = true;
			startMoveTime.value = endMoveTime.value;
			startX.value = lastX.value;
			currentX.value = event.touches[0].clientX;
			moveFollowTouch();
			// 此次touchmove事件触发的时间戳;
			endMoveTime.value = event.timeStamp;
		};

		/**
		 * touchend
		 * @param {*} event
		 */
		const handleTouchEnd = (event: TouchEvent) => {
			touching.value = false;
			if (reboundIfNeeded()) {
				cancelAnimationFrame(inertiaFrame.value);
			} else {
				let silenceTime = event.timeStamp - endMoveTime.value;
				let timeStamp = endMoveTime.value - startMoveTime.value;
				timeStamp = timeStamp > 0 ? timeStamp : 8;

				// 停顿时间超过100ms不产生惯性滑动;
				if (silenceTime > 100) {
					return;
				}

				speed.value = (lastX.value - startX.value) / timeStamp;
				acceleration.value = speed.value / props.inertialDuration;
				frameStartTime.value = Date.now();
				inertiaFrame.value = requestAnimationFrame(moveByInertia);
			}
		};

		const bindEvents = () => {
			const el = viewAreaRef.value;
			el.addEventListener('touchstart', handleTouchStart, false);
			el.addEventListener('touchmove', handleTouchMove, false);
			el.addEventListener('touchend', handleTouchEnd, false);
		};

		const removeEvents = () => {
			const el = viewAreaRef.value;
			el.removeEventListener('touchstart', handleTouchStart);
			el.removeEventListener('touchmove', handleTouchMove);
			el.removeEventListener('touchend', handleTouchEnd);
		};

		onMounted(() => {
			windowInit();
			bindEvents();
			refreshState();
		});

		onBeforeUnmount(() => {
			removeEvents();
		});

		expose({
			resize,
		});

		return {
			// refs
			viewAreaRef,
			listRef,

			// data
			activeValue,
			lineOffset,
			activeLineWidth,
			viewAreaWidth,
			offsetX,
			speed,
			touching,
			reBounding,
			translateX,
			startX,
			lastX,
			currentX,
			startMoveTime,
			endMoveTime,
			frameTime,
			frameStartTime,
			frameEndTime,
			inertiaFrame,
			zeroSpeed,
			acceleration,

			// computed
			listStyle,
			activeBarStyle,
			isMoveLeft,
		};
	},
});
</script>

<style>
.fun-tabs {
	overflow: hidden;
	position: relative;
	width: 100%;
	border-bottom: 1px solid #eee;
	background: #fff;
}

.fun-tabs__tab-list {
	position: relative;
	display: flex;
	flex-wrap: nowrap;
	min-width: 100%;
	width: min-content;
}

.fun-tabs__active-line {
	position: absolute;
	bottom: 3px;
	left: 0;
	width: 30px;
	height: 3px;
	border-radius: 4px;
}

.fun-tabs .fun-tab-item {
	padding: 10px 12px;
	flex: 1 1 auto;
	font-size: 14px;
	text-align: center;
	white-space: nowrap;
}
</style>
