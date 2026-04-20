import { defineAsyncComponent } from 'vue';

export const AppButton = defineAsyncComponent(() => import('./AppButton'));
export const AppInput = defineAsyncComponent(() => import('./AppInput'));
export const AppLink = defineAsyncComponent(() => import('./AppLink'));
