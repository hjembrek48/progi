let access_token = null;

export function setAccessToken(token) {
    access_token = token;
}

export function getAccessToken() {
    return access_token;
}

export function deleteTokenFromVariable() {
    access_token = null;
}