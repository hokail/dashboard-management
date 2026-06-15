<script setup>
import {socketStore} from './stores/mockSocketStore'

import {onMounted, onUnmounted} from "vue";

const useSocketStore = socketStore()

const {connectWebSocket,closeWebSocket} = useSocketStore

onMounted(() => {
  connectWebSocket()
})

onUnmounted(()=> {
  closeWebSocket()
})

</script>

<template>
    <router-view></router-view>
</template>
