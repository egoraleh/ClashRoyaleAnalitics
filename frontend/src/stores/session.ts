import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSessionStore = defineStore('app', () => {
    const accessToken = ref<string>(localStorage.getItem('accessToken') as string);
    const refreshToken = ref<string>(localStorage.getItem('refreshToken') as string);

    const getAccessToken = computed((): string => accessToken.value);

    const getRefreshToken = computed((): string => refreshToken.value);

    const setAccessToken = (value: string) => {
        accessToken.value = value.trim();
    };

    const setRefreshToken = (value: string) => {
        refreshToken.value = value.trim();
    };

    return {
        getAccessToken,
        getRefreshToken,
        setAccessToken,
        setRefreshToken,
    };
});
