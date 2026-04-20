export type AppInputSize = 'sm' | 'md' | 'lg';

export type AppInputTheme = 'primary' | 'secondary' | 'ghost';

export type AppInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

export interface AppInputProps {
    modelValue?: string;
    modelModifiers?: {
        trim?: boolean;
    };
    size?: AppInputSize;
    theme?: AppInputTheme;
    type?: AppInputType;
    placeholder?: string;
    name?: string;
    autocomplete?: string;
    regular?: RegExp;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    minlength?: number;
    maxlength?: number;
}
