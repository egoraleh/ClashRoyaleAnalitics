<template>
    <button
        class="app-button"
        :class="buttonClasses"
        :type="type"
        :disabled="disabled"
        @click="handleClick"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AppButtonProps } from './types.d.ts';

const props = withDefaults(defineProps<AppButtonProps>(), {
    size: 'md',
    theme: 'primary',
    type: 'button',
    disabled: false,
    wide: false,
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

const buttonClasses = computed<Record<string, boolean>>(() => ({
    [`app-button--size-${props.size}`]: true,
    [`app-button--theme-${props.theme}`]: true,
    'app-button--wide': props.wide,
}));

const handleClick = (event: MouseEvent) => {
    emit('click', event);
};
</script>

<style scoped lang="scss">
@use '@styles/colors.scss' as *;

.app-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 18px;
    border: 1px solid transparent;
    border-radius: 16px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease,
        background-color 0.2s ease,
        color 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:focus-visible {
        outline: 2px solid rgba($color-accent-secondary, 0.65);
        outline-offset: 3px;
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }
}

.app-button--wide {
    width: 100%;
}

.app-button--size-xs {
    min-height: 32px;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
}

.app-button--size-sm {
    min-height: 38px;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.9rem;
}

.app-button--size-md {
    min-height: 48px;
    font-size: 1rem;
}

.app-button--size-lg {
    min-height: 56px;
    padding: 16px 22px;
    border-radius: 18px;
    font-size: 1.05rem;
}

.app-button--theme-primary {
    color: $color-bg;
    background: linear-gradient(135deg, $color-accent 0%, #ffdb92 100%);
    box-shadow: 0 14px 28px rgba($color-accent, 0.24);
}

.app-button--theme-secondary {
    color: $color-text;
    background: linear-gradient(135deg, rgba($color-accent-secondary, 0.28), rgba($color-accent-secondary, 0.14));
    border-color: rgba($color-accent-secondary, 0.3);
}

.app-button--theme-ghost {
    color: $color-text;
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
}

.app-button--theme-danger {
    color: $color-text;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(196, 62, 62, 0.95));
    box-shadow: 0 14px 28px rgba(196, 62, 62, 0.2);
}
</style>
