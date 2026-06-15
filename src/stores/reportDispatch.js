import {ref} from 'vue'
import {defineStore, storeToRefs} from "pinia";
import {message} from "ant-design-vue";

export const reportStore =  defineStore('report', () => {

    const userList = ref( [])

    async function getUserList(){
        try {
            const response = await fetch('/api/user/getUserList')
            const result = await response.json()
            if (result.code === 200){
                userList.value = result.data.userList.map(e =>{
                    return {
                        label: e.username,
                        value: e.userid
                    }
                })
            }else {
                message.error('获取用户列表失败')
            }
        } catch (error) {
            console.log( error)
        }
    }

    async function sendDispatchList(records){
        try {
            const response = await fetch('/api/report/sendDispatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    list: records,

                })
            })
            const result = await response.json()
            if (result.code === 200){
                message.success('派单成功')
                return true
            }else {
                message.error('派单失败')
            }
        }catch (e){
            message.error('派单失败')
        }

    }

    return {
        userList,
        sendDispatchList,
        getUserList
    }
})