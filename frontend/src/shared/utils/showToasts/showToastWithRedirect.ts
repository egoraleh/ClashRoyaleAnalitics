import { getNewQuery } from '@utils/showToasts/getNewQuery';
import { useRouter } from 'vue-router';

export const showToastWithRedirect = async (
    route: string,
    message: string,
    code?: number,
    color?: string,
) => {
    const router = useRouter();

    await router.push(
        {
            path: route,
            query: getNewQuery(
                message,
                code,
                color,
            ),
        },
    );
};
