import request from "../request"

export const loginRequest = (user) => request.post('/api/auth/login', user)
