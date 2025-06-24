import axios from "axios"
import router from "@/router"

const instance = axios.create()

instance.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    result => {
        return result
    },
    error => {
        return Promise.reject(error)
    }
)

export default instance
