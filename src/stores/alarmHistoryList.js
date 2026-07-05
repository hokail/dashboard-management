import {defineStore} from "pinia";
import {message} from "ant-design-vue";
import {ref} from "vue";

export const alarmHistoryListStore  = defineStore('alarmHistoryList',()=>{
    const alarmHistoryList = ref([])
    const userList = ref([])

    async function getAlarmHistoryList(){
        try {
            const response = await fetch('/api/alarmHistoryList/getAlarmHistoryList')
            const result = await response.json()
            if (result.code === 200){
                alarmHistoryList.value = result.data
            }
        } catch (error) {
            console.error('Error fetching alarm history list:', error);
        }
    }
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
    return {
        userList,
        alarmHistoryList,
        getAlarmHistoryList,
        getUserList
    }
})