import { useSessionStore } from '@stores/session.ts';
import { showToastWithRedirect } from '@utils/showToasts/showToastWithRedirect';
import { showToastWithReplace } from '@utils/showToasts/showToastWithReplace';
import axios, { AxiosError } from 'axios';
import { storeToRefs } from 'pinia';

type ApiErrorData = { message?: string };

const BASE_API_URL = import.meta.env.VITE_BASE_URL;

export const doRequest = async (
    path: string,
    method: string,
    body: { [key: string]: unknown },
    headers: { [key: string]: string },
    errorMessage: string,
    pathToRedirect: string,
    isRetry: boolean = false,
    axiosConfig = {},
): Promise<unknown> => {
    const sessionStore = useSessionStore();

    const {
        setAccessToken,
        setRefreshToken,
        clearTokens,
    } = sessionStore;

    const {
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken,
    } = storeToRefs(sessionStore);

    const url = BASE_API_URL + path;

    const config = {
        method,
        url,
        headers,
        data: body,
        ...axiosConfig,
    };

    try {
        return await axios(config);
    } catch (error: unknown) {
        const axiosError = error as AxiosError;

        if (
            axiosError.response?.status === 401 &&
            !path.includes('login') &&
            !isRetry
        ) {
            try {
                if (!accessToken.value) {
                    clearTokens();

                    await showToastWithRedirect(
                        '/login',
                        'Ваша сессия истекла, войдите в аккаунт заново',
                        401,
                    );

                    return;
                }

                const refreshConfig = {
                    method: 'POST',
                    url: BASE_API_URL + '/refresh',
                    data: { refreshToken: refreshToken.value },
                };

                const refreshResponse = await axios(refreshConfig);
                const { newAccessToken, newRefreshToken } = refreshResponse.data;

                setAccessToken(newAccessToken);
                setRefreshToken(newRefreshToken);

                if (config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return await doRequest(
                    path,
                    method,
                    body,
                    config.headers,
                    errorMessage,
                    pathToRedirect,
                    true,
                );
            } catch (err: unknown) {
                const refreshError = err as AxiosError;
                const response = refreshError.response;
                const message = (response?.data as ApiErrorData)?.message;

                if (response?.status === 401) {
                    clearTokens();

                    await showToastWithRedirect(
                        '/login',
                        'Ваша сессия истекла, войдите в аккаунт заново',
                        401,
                    );

                    return;
                }

                await showToastWithReplace(
                    message || errorMessage,
                    response?.status || 500,
                );

                throw err;
            }
        }

        const response = axiosError.response;
        const message = (response?.data as ApiErrorData)?.message;

        if (pathToRedirect) {
            await showToastWithRedirect(
                pathToRedirect,
                message || errorMessage,
                response?.status || 500,
            );
        } else {
            await showToastWithReplace(
                message || errorMessage,
                response?.status || 500,
            );
        }

        throw error;
    }
};
