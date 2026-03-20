# API Endpoints Documentation

## 1. User Authentication Check
- **Endpoint**: `GET /users/me`
- **Description**: Retrieves the details of the currently logged-in user. This endpoint is used in `AuthContext.tsx` to check the user's authentication status.

## 2. Google OAuth2 Login
- **Endpoint**: `GET /oauth2/authorization/google`
- **Description**: Redirects the user to the Google OAuth2 authorization page for login. This is implemented in `LoginPage.tsx`.

## Usage
- To fetch user details, use the `/users/me` endpoint after checking if the user is logged in.
- For logging in, redirect users to the `/oauth2/authorization/google` endpoint.

## Axios Configuration
- **Base URL**: `http://localhost:8080/api/v1`
- Ensure to include `withCredentials: true` for handling HTTP-only JWT tokens.
