<template>
    <section class="auth-page auth-page--login">
        <div class="auth-card">
            <div class="auth-card__content">
                <h1 class="auth-card__title">
                    Вход в аккаунт
                </h1>

                <form class="auth-form">
                    <label class="auth-form__field">
                        <span>Username</span>
                        <AppInput
                            v-model.trim="username"
                            type="text"
                            name="username"
                            autocomplete="username"
                            placeholder="Введите username"
                            size="lg"
                            required
                        />
                    </label>

                    <label class="auth-form__field">
                        <span>Password</span>
                        <AppInput
                            v-model.trim="password"
                            type="password"
                            name="password"
                            autocomplete="current-password"
                            placeholder="Введите пароль"
                            size="lg"
                            required
                        />
                    </label>

                    <AppButton
                        class="auth-form__submit"
                        type="submit"
                        size="lg"
                        wide
                    >
                        Войти
                    </AppButton>
                </form>
            </div>

            <aside class="auth-card__aside">
                <img
                    class="auth-card__aside-logo"
                    src="/logo.png"
                    alt="Clash Royale Analytics"
                >
                <div>
                    <p class="auth-card__aside-label">
                        Нет аккаунта?
                    </p>
                    <AppLink
                        class="auth-card__link"
                        as-child
                        size="md"
                        theme="secondary"
                        decoration="pill"
                    >
                        <RouterLink :to="{ name: 'register' }">
                            Перейти к регистрации
                        </RouterLink>
                    </AppLink>
                </div>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import {
    AppButton,
    AppInput,
    AppLink,
} from '@ui';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const username = ref<string>('');
const password = ref<string>('');
</script>

<style scoped lang="scss">
@use '@styles/auth.scss';
@use '@styles/colors.scss' as *;

.auth-page--login {
    background:
        radial-gradient(circle at top left, rgba($color-accent, 0.18), transparent 35%),
        radial-gradient(circle at bottom right, rgba($color-accent-secondary, 0.2), transparent 30%),
        linear-gradient(180deg, $color-bg 0%, $color-surface-strong 100%);
}
</style>
