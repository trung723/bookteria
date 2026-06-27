export const CONFIG = {
  API_GATEWAY: "http://localhost:8888/api/v1",
};

export const API = {
  LOGIN: "/identity/auth/token",
  MY_INFO: "/profile/users/my-profile",
  GET_PROFILE_BY_USERID: "/profile/users/by-userid",
  MY_POST: "/post/my-posts",
  FEED: "/post/feed",
  CREATE_POST: "/post/create",
  UPDATE_POST: "/post",
  DELETE_POST: "/post",
  LIKE_POST: "/post",
  COMMENT_POST: "/post",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  SEARCH_USER: "/profile/users/search",
  FOLLOW_USER: "/profile/users",
  GET_FOLLOWING: "/profile/users",
  GET_FOLLOWERS: "/profile/users",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_CONVERSATION_MESSAGES: "/chat/messages",
};
