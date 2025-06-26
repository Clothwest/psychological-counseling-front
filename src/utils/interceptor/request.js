import interceptor from "./interceptors"

export const loginRequest = (data) => interceptor.post('/api/auth/login', data)
export const changePasswordRequest = (data) => interceptor.post('/api/users/changePassword', data)

export const fetchUsers = (currentPage, pageSize, username) => interceptor.get('/api/admin/users/pageQuery', {params: {page: currentPage, size: pageSize, username: username}})
export const addUser = (data) => interceptor.post('/api/admin/user/create', data)
export const deleteUser = (id) => interceptor.delete('/api/admin/users/' + id)
