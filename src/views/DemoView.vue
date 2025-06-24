<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginRequest } from '@/utils/request/api/user'
import axios from 'axios'

// function
const router = useRouter()
const login = () => {
  loginRequest(user.value).then(res => {
    console.info(res)
  })
}

// variant
const user = ref({
  username: '',
  password: ''
})

</script>

<template>
  <div>
    用户名<input type="text" v-model="user.username" /><br/>
    密码<input type="text" v-model="user.password" /><br/>
    <button @click="login">登录</button>
  </div>
</template>

<style scoped>

</style>
