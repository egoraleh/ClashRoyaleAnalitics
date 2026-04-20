import { doRequest } from '@api/doRequest.ts';

export const useRequest = () => {
    const getRequest = async (
        url: string,
        headers: { [key: string]: string },
        errorMessage: string,
        pathToRedirect: string = '',
        axiosConfig = {},
    ) => {
        return await doRequest(url, 'GET', {}, headers, errorMessage, pathToRedirect, false, axiosConfig);
    };

    const postRequest = async (
        url: string,
        body: { [key: string]: unknown },
        headers: { [key: string]: string },
        errorMessage: string,
        pathToRedirect = '',
        axiosConfig = {},
    ) => {
        return await doRequest(url, 'POST', body, headers, errorMessage, pathToRedirect, false, axiosConfig);
    };

    const putRequest = async (
        url: string,
        body: { [key: string]: unknown },
        headers: { [key: string]: string },
        errorMessage: string,
        pathToRedirect = '',
        axiosConfig = {},
    ) => {
        return await doRequest(url, 'PUT', body, headers, errorMessage, pathToRedirect, false, axiosConfig);
    };

    const patchRequest = async (
        url: string,
        body: { [key: string]: unknown },
        headers: { [key: string]: string },
        errorMessage: string,
        pathToRedirect = '',
        axiosConfig = {},
    ) => {
        return await doRequest(url, 'PATCH', body, headers, errorMessage, pathToRedirect, false, axiosConfig);
    };

    const deleteRequest = async (
        url: string,
        headers: { [key: string]: string },
        errorMessage: string,
        pathToRedirect = '',
        axiosConfig = {},
    ) => {
        return await doRequest(url, 'DELETE', {}, headers, errorMessage, pathToRedirect, false, axiosConfig);
    };

    return {
        get: getRequest,
        post: postRequest,
        put: putRequest,
        patch: patchRequest,
        delete: deleteRequest,
    };
};
