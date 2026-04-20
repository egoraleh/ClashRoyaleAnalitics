import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const playerName = ref<string>('');
    const playerTag = ref<string>('');

    const playerNameValue = computed<string>(() => playerName.value);

    const playerTagValue = computed<string>(() => playerTag.value);

    const setPlayerTag = (value: string) => {
        playerTag.value = value.trim().toUpperCase();
    };

    const setPlayerName = (value: string) => {
        playerName.value = value.trim();
    };

    return {
        playerNameValue,
        playerTagValue,

        setPlayerTag,
        setPlayerName,
    };
});
