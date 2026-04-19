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
                        <input
                            v-model.trim="username"
                            type="text"
                            name="username"
                            autocomplete="username"
                            placeholder="Введите username"
                            required
                        >
                    </label>

                    <label class="auth-form__field">
                        <span>Password</span>
                        <input
                            v-model.trim="password"
                            type="password"
                            name="password"
                            autocomplete="current-password"
                            placeholder="Введите пароль"
                            required
                        >
                    </label>

                    <button class="auth-form__submit" type="submit">
                        Sign in
                    </button>
                </form>
            </div>

            <aside class="auth-card__aside">
                <p class="auth-card__aside-label">
                    Нет аккаунта?
                </p>
                <RouterLink class="auth-card__link" :to="{ name: 'register' }">
                    Перейти к регистрации
                </RouterLink>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
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
