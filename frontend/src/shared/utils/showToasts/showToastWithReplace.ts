import { getNewQuery } from '@utils/showToasts/getNewQuery';
import { useRouter } from 'vue-router';

export const showToastWithReplace = async (
    message: string,
    code?: number,
    color?: string,
) => {
    const router = useRouter();

    await router.replace(
        {
            query: getNewQuery(
                message,
                code,
                color,
            ),
        },
    );
};
