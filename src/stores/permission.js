import {defineStore} from "pinia";
import {message} from "ant-design-vue";
import {ref} from "vue";

export const permissionStore = defineStore('permission',() =>{
    const userRole = ref('');
    const permissionLoaded = ref(false)

    async function getUserPermission(username){
        try {
            const response = await fetch('/api/user/getUserInfo',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username
                })
            })
            const result = await response.json()
            if (result.code === 200){
                userRole.value = result.data.role
            }else {
                message.error('获取用户权限失败')
            }

        } catch (error) {
            console.log( error)
        }
    }

    function clearPermission(){
        userRole.value = ''
    }

    return {
        userRole,
        getUserPermission,
        clearPermission
    }
})