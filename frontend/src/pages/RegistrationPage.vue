<template>
    <section class="auth-page auth-page--register">
        <div class="auth-card auth-card--register">
            <div class="auth-card__content">
                <h1 class="auth-card__title">
                    Создание аккаунта
                </h1>

                <form class="auth-form auth-form--register">
                    <label class="auth-form__field">
                        <span>Username</span>
                        <input
                            v-model.trim="username"
                            type="text"
                            name="username"
                            autocomplete="username"
                            placeholder="Введите username"
                            minlength="3"
                            maxlength="50"
                            required
                        >
                    </label>

                    <label class="auth-form__field">
                        <span>Player Tag</span>
                        <input
                            v-model.trim="playerTag"
                            type="text"
                            name="playerTag"
                            placeholder="#2ABCDEF"
                            required
                        >
                    </label>

                    <label class="auth-form__field">
                        <span>Email</span>
                        <input
                            v-model.trim="email"
                            type="email"
                            name="email"
                            autocomplete="email"
                            placeholder="Введите email"
                            required
                        >
                    </label>

                    <label class="auth-form__field">
                        <span>Password</span>
                        <input
                            v-model="password"
                            type="password"
                            name="password"
                            autocomplete="new-password"
                            placeholder="Минимум 6 символов"
                            minlength="6"
                            required
                        >
                    </label>

                    <button class="auth-form__submit" type="submit">
                        Create account
                    </button>
                </form>
            </div>

            <aside class="auth-card__aside">
                <p class="auth-card__aside-label">
                    Уже есть аккаунт?
                </p>
                <RouterLink class="auth-card__link" :to="{ name: 'login' }">
                    Перейти ко входу
                </RouterLink>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const username = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const playerTag = ref<string>('');
</script>

<style scoped lang="scss">
@use '@styles/auth.scss';
@use '@styles/colors.scss' as *;

.auth-page--register {
    background:
        radial-gradient(circle at top right, rgba($color-accent, 0.18), transparent 35%),
        radial-gradient(circle at bottom left, rgba($color-accent-secondary, 0.22), transparent 30%),
        linear-gradient(180deg, $color-bg 0%, $color-surface-strong 100%);
}

.auth-card--register {
    width: min(100%, 1080px);
    grid-template-columns: minmax(0, 1.3fr) minmax(240px, 0.7fr);
}

.auth-card--register .auth-card__aside {
    background:
        linear-gradient(180deg, rgba($color-accent-secondary, 0.1), rgba($color-accent, 0.08)),
        rgba(255, 255, 255, 0.02);
}

.auth-form--register {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.auth-form--register .auth-form__field:last-of-type,
.auth-form--register .auth-form__field:nth-last-of-type(2),
.auth-form--register .auth-form__submit {
    grid-column: span 2;
}

@media (max-width: 860px) {
    .auth-form--register {
        grid-template-columns: 1fr;
    }

    .auth-form--register .auth-form__field,
    .auth-form--register .auth-form__submit {
        grid-column: span 1;
    }
}
</style>
