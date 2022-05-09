import type { Ref, InjectionKey } from 'vue';

type name = string | number | undefined;

export interface TabItemInstance {
	name: Ref<name>;
	el: Ref<HTMLElement>;
}

export interface TabsInjection {
	activeValue: Ref<string | number>;
	activeColor: Ref<string>;
	addItem(tabItem: TabItemInstance): void;
	removeItem(tabItem: TabItemInstance): void;
	setActiveValue(name: name): void;
}

export interface TabBarInjection {
	activeValue: Ref<string | number>;
	activeColor: Ref<string>;
	setActiveValue(name: name): void;
}

export const tabsInjectionKey: InjectionKey<TabsInjection | TabBarInjection> = Symbol();
