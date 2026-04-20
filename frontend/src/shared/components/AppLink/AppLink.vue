<template>
    <span
        v-if="asChild"
        class="app-link app-link--as-child"
        :class="linkClasses"
    >
        <slot />
    </span>

    <a
        v-else
        class="app-link"
        :class="linkClasses"
        :href="resolvedHref"
        :target="target"
        :rel="rel"
        :download="download"
    >
        <slot />
    </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { AppLinkProps } from './types.d.ts';

const props = withDefaults(defineProps<AppLinkProps>(), {
    href: undefined,
    to: undefined,
    size: 'md',
    theme: 'primary',
    decoration: 'none',
    linkType: 'default',
    asChild: false,
});

const linkClasses = computed<Record<string, boolean>>(() => ({
    [`app-link--size-${props.size}`]: true,
    [`app-link--theme-${props.theme}`]: true,
    [`app-link--decoration-${props.decoration}`]: true,
}));

const resolvedHref = computed(() => {
    if (typeof props.to === 'string') {
        return props.to;
    }

    return props.href;
});

const target = computed(() => (props.linkType === 'blank' ? '_blank' : undefined));
const rel = computed(() => (props.linkType === 'blank' ? 'noopener noreferrer' : undefined));
const download = computed(() => (props.linkType === 'download' ? true : undefined));
</script>

<style scoped lang="scss">
@use '@styles/colors.scss' as *;

.app-link {
    --app-link-color: #{$color-bg};
    --app-link-background: #{$color-accent};
    --app-link-border: transparent;
    --app-link-decoration: none;
    --app-link-padding: 12px 18px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: fit-content;
    border: 1px solid var(--app-link-border);
    border-radius: 999px;
    color: var(--app-link-color);
    text-decoration: var(--app-link-decoration);
    background: var(--app-link-background);
    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        background-color 0.2s ease;

    &:hover {
        transform: translateY(-1px);
    }
}

.app-link--as-child {
    padding: 0;
    border: 0;
    background: transparent;

    :deep(a) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: fit-content;
        padding: var(--app-link-padding);
        border: 1px solid var(--app-link-border);
        border-radius: inherit;
        color: var(--app-link-color);
        text-decoration: var(--app-link-decoration);
        background: var(--app-link-background);
        transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            background-color 0.2s ease;
    }

    :deep(a:hover) {
        transform: translateY(-1px);
    }
}

.app-link--size-sm {
    --app-link-padding: 8px 12px;

    padding: var(--app-link-padding);
    font-size: 0.9rem;
    font-weight: 600;
}

.app-link--size-md {
    --app-link-padding: 12px 18px;

    padding: var(--app-link-padding);
    font-size: 0.98rem;
    font-weight: 700;
}

.app-link--size-lg {
    --app-link-padding: 14px 20px;

    padding: var(--app-link-padding);
    font-size: 1.05rem;
    font-weight: 700;
}

.app-link--theme-primary {
    --app-link-color: #{$color-bg};
    --app-link-background: #{$color-accent};
}

.app-link--theme-secondary {
    --app-link-color: #{$color-text};
    --app-link-background: #{rgba($color-accent-secondary, 0.18)};
    --app-link-border: #{rgba($color-accent-secondary, 0.26)};
}

.app-link--theme-muted {
    --app-link-color: #{$color-text-muted};
    --app-link-background: transparent;
}

.app-link--theme-ghost {
    --app-link-color: #{$color-text};
    --app-link-background: rgba(255, 255, 255, 0.04);
    --app-link-border: rgba(255, 255, 255, 0.1);
}

.app-link--decoration-none {
    --app-link-decoration: none;
}

.app-link--decoration-underline {
    --app-link-decoration: underline;
}

.app-link--decoration-pill {
    border-radius: 999px;
}
</style>
