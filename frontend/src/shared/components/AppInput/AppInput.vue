<template>
    <input
        :value="modelValue"
        class="app-input"
        :class="inputClasses"
        :type="inputType"
        :name="name"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        :inputmode="inputMode"
        @input="handleInput"
    >
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AppInputProps } from './types.d.ts';

const props = withDefaults(defineProps<AppInputProps>(), {
    modelValue: '',
    modelModifiers: () => ({}),
    size: 'md',
    theme: 'primary',
    type: 'text',
    placeholder: '',
    name: '',
    autocomplete: '',
    regular: undefined,
    disabled: false,
    readonly: false,
    required: false,
    minlength: undefined,
    maxlength: undefined,
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    input: [value: string, event: Event];
}>();

const inputClasses = computed<Record<string, boolean>>(() => ({
    [`app-input--size-${props.size}`]: true,
    [`app-input--theme-${props.theme}`]: true,
}));

const inputType = computed(() => (props.type === 'number' ? 'text' : props.type));
const inputMode = computed(() => (props.type === 'number' ? 'numeric' : undefined));

const sanitizeValue = (value: string) => {
    const fallbackPattern = props.type === 'number' ? /\D/g : undefined;
    const pattern = props.regular ?? fallbackPattern;
    const normalizedValue = props.modelModifiers.trim ? value.trim() : value;

    return pattern ? normalizedValue.replace(pattern, '') : normalizedValue;
};

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const sanitizedValue = sanitizeValue(target.value);

    if (target.value !== sanitizedValue) {
        target.value = sanitizedValue;
    }

    emit('update:modelValue', sanitizedValue);
    emit('input', sanitizedValue, event);
};
</script>

<style scoped lang="scss">
@use '@styles/colors.scss' as *;

.app-input {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: $color-text;
    background: rgba(255, 255, 255, 0.04);
    outline: none;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;

    &::placeholder {
        color: rgba($color-text, 0.36);
    }

    &:focus {
        border-color: rgba($color-accent, 0.56);
        box-shadow: 0 0 0 4px rgba($color-accent, 0.08);
    }

    &:disabled,
    &:read-only {
        opacity: 0.7;
        cursor: not-allowed;
    }
}

.app-input--size-sm {
    min-height: 40px;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.92rem;
}

.app-input--size-md {
    min-height: 48px;
    padding: 14px 16px;
    font-size: 1rem;
}

.app-input--size-lg {
    min-height: 56px;
    padding: 16px 18px;
    border-radius: 18px;
    font-size: 1.05rem;
}

.app-input--theme-primary {
    background: rgba(255, 255, 255, 0.04);
}

.app-input--theme-secondary {
    border-color: rgba($color-accent-secondary, 0.28);
    background: rgba($color-accent-secondary, 0.08);
}

.app-input--theme-ghost {
    border-color: rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.08);
}
</style>
