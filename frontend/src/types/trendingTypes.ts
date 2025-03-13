import { Post } from './postTypes';

export type Trending = {
    name: string;
    posts: Post[];
};

export type TrendingResponse = {
    hashtags: Trending[];
    themes: Trending[];
};
