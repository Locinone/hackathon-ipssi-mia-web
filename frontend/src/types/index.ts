export * from './apiTypes';
export * from './postTypes';
export * from './userTypes';

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T | null;
}

export interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        name?: string;
        username: string;
        image?: string;
        email?: string;
    };
    post?: string;
    parentComment?: string;
    createdAt?: string;
    likes?: any[];
    replies?: Comment[];
    reposts?: number;
}

export interface Notification {
    _id: string;
    sender: {
        _id: string;
        name: string;
        username: string;
        image?: string;
    };
    receiver: string;
    type:
        | 'like'
        | 'unlike'
        | 'comment'
        | 'uncomment'
        | 'follow'
        | 'unfollow'
        | 'post'
        | 'retweet'
        | 'answer';
    post?: string;
    message?: string;
    isRead: boolean;
    createdAt: string;
}

export interface FollowResponse {
    follower: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
    };
    following: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
    };
}

export interface UnfollowResponse {
    follower: {
        _id: string;
        username: string;
    };
    unfollowed: {
        _id: string;
        username: string;
    };
}
