export type AppButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type AppButtonTheme = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps {
    size?: AppButtonSize;
    theme?: AppButtonTheme;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    wide?: boolean;
}
