export const getNewQuery = (
    message: string,
    code?: number,
    color?: string,
) => {
    return {
        errorMessage: message,
        ...(code != null && { statusCode: code }),
        ...(color != null && { color: color }),
    };
};
