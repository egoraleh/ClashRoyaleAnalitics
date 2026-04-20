import { useSessionStore } from '@stores/session.ts';

export const getAuthHeaders = () => {
    const { accessTokenValue } = useSessionStore();
    return {
        Authorization: `Bearer ${ accessTokenValue }`,
    };
};
