# fun-tab

[ly-tab](https://github.com/ScoutYin/ly-tab)的 Vue3 版本，更名为 fun-tab。

## 基本效果展示

![v3 0 0](https://user-images.githubusercontent.com/32835712/166098427-fef7c973-00aa-4a3a-82a5-41ce74dbe62f.gif)

## 安装

```shell
pnpm add fun-tab
# or
yarn add fun-tab
# or
npm i fun-tab
```
## 使用

### 全局注册

```js
import { createApp } from 'vue'
import FunTab from 'fun-tab'
import 'fun-tab/dist/index.css'
import App from './App.vue'

const app = createApp(App)

app.use(FunTab)

app.mount('#app')
```

### 局部注册

```js
<script setup>
import { FunTabs, FunTabBar, FunTabItem } from 'fun-tab';

// ...
</script>
```

## FunTabs

### 简易示例

```javascript
<fun-tabs v-model="value">
  <fun-tab-item name="1" title="选项卡1" />
  <fun-tab-item name="2" title="选项卡2" />
</fun-tabs>
```

```javascript
<script setup>
import { ref } from 'vue'

const value = ref('1')
</script>
```

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| ---- | -----|---|----|
| modelValue | 当前激活的 `tab` 的 name 属性值 | `string \| number` | '' |
| lineWidth | 当前激活 `tab` 下划线的宽度，单位 `px`，为`auto`时表示当前激活 `tab` 项的宽度 | `number \| string` | 30 |
| lineHeight | 当前激活 `tab` 下划线的高度，单位 `px` | `number` | 3 |
| activeColor | 激活状态下 `tab` 文案及下划线的颜色 | `string` | #1677ff |
| additionalX | 近似等于超出边界时最大可拖动距离，单位 `px` | `number` | 50 |
| reBoundExponent | 惯性回弹指数，值越大，惯性回弹距离越长 | `number` | 10 |
| inertialDuration | 惯性滑动过程的持续时间，值越小，感知上阻力越大，可近似认为惯性滑动过程速度减为零所需的时间(ms) | `number` | 1000 |
| reBoundingDuration | 回弹过程动画duration，单位 `ms` | `number` | 360 |

### 事件

| 事件名 | 说明 | 回调参数 |
| ----- | ---- | ----- |
| update:modelValue | 切换激活 tab 项的回调 | `name: string \| number` |
| change | 切换激活 tab 项的回调 | `name: string \| number` |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
| ----- | ---- | ---- | ---- |
| resize | 外层元素大小或组件布局、尺寸变化时，可以调用此方法来进行重绘 | - | - |

### 插槽

| 名称 | 说明 |
| --- | ---- |
| default | 默认插槽，放置 `FunTabItem` 组件 |

## FunTabItem

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| ---- | -----|---|----|
| title | 选项卡显示文字 | `string` | - |
| name | 选项卡标识符 | `string \| number` | 选项卡索引 |
| badge | 右上角徽标内容 | `string \| number` | - |

### 插槽

| 名称 | 说明 |
| --- | ---- |
| default | 选项卡文字内容插槽，优先级高于传入的 `title` 属性 |
| icon | 选项卡图标 |

## FunTabBar

### 简易示例

```javascript
<fun-tab-bar v-model="value">
  <fun-tab-item name="1" title="选项卡1" />
  <fun-tab-item name="2" title="选项卡2" />
</fun-tab-bar>
```

```javascript
<script setup>
import { ref } from 'vue'

const value = ref('1')
</script>
```

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| ---- | -----|---|----|
| modelValue | 当前激活的 `tab` 的 name 属性值 | `string \| number` | '' |
| activeColor | 激活状态下 `tab` 文案及icon的颜色 | `string` | #1677ff |

### 事件

| 事件名 | 说明 | 回调参数 |
| ----- | ---- | ----- |
| update:modelValue | 切换激活 tab 项的回调 | `name: string \| number` |
| change | 切换激活 tab 项的回调 | `name: string \| number` |

### 插槽

| 名称 | 说明 |
| --- | ---- |
| default | 默认插槽，放置 `FunTabItem` 组件 |
