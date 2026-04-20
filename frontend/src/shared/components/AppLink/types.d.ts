import type { RouteLocationRaw } from 'vue-router';

export type AppLinkSize = 'sm' | 'md' | 'lg';

export type AppLinkTheme = 'primary' | 'secondary' | 'muted' | 'ghost';

export type AppLinkDecoration = 'none' | 'underline' | 'pill';

export type AppLinkType = 'default' | 'blank' | 'download';

export interface AppLinkProps {
    href?: string;
    to?: RouteLocationRaw;
    size?: AppLinkSize;
    theme?: AppLinkTheme;
    decoration?: AppLinkDecoration;
    linkType?: AppLinkType;
    asChild?: boolean;
}
