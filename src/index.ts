import type { App } from 'vue';

import FunTabBar from './tab-bar.vue';
import FunTabItem from './tab-item.vue';
import FunTabs from './tabs.vue';

const install = (app: App) => {
	app.component(FunTabs.name, FunTabs);
	app.component(FunTabItem.name, FunTabItem);
	app.component(FunTabBar.name, FunTabBar);
};

export default { install };

export { FunTabs, FunTabBar, FunTabItem };
