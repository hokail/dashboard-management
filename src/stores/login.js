import {defineStore} from "pinia";
import {ref} from 'vue'
import {message} from "ant-design-vue";
import {useRouter} from "vue-router";



export const userStore =  defineStore('login', () => {
    const router = useRouter()
    let isLogin = ref(false)
    let loginLoading = ref(false)
    let userForm = ref({username: '', password: ''})


    async function login() {
        loginLoading.value = true
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userForm.value.username,
                    password: userForm.value.password
                })
            })
            const result = await response.json()


            if (result.code === 200) {
                isLogin.value = true
                message.success('登录成功')
                localStorage.setItem('token', result.data.token)
                router.push('/home')
            }else if(result.code === 401) {
                message.error('用户名或密码错误')
            }

        } catch (error) {
            message.error('网络请求失败')

        } finally {
            loginLoading.value = false
        }
    }



    return {
        userForm,
        isLogin,
        login,
        loginLoading

    }
})