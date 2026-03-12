import { type URLTransformer } from 'unpic';

export const transform: URLTransformer = (url) => {
    return url.toString();
};