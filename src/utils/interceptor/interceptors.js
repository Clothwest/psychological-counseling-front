import axios from "axios"

const instance = axios.create()

instance.interceptors.request.use(
    config => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'))
            if (user && user.token) {
                config.headers['Authorization'] = `Bearer ${user.token}`
            }
        }
        // console.info("data:", config.data)
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    result => {
        return result.data
    },
    error => {
        return Promise.reject(error)
    }
)

export default instance
