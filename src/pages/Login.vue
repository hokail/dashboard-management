<script setup>

import { message } from 'ant-design-vue'

import {userStore} from "../stores/login.js"
import {storeToRefs} from "pinia"

const usUserStore = userStore()


let {userForm,loginLoading} = storeToRefs(usUserStore)
let {login} = usUserStore

const handleLogin = async () => {
  if (!userForm.value.username) {
    message.warning('请输入用户名')
    return
  }
  if (!userForm.value.password) {
    message.warning('请输入密码')
    return
  }

  await login()


}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>系统登录</h1>
        <p>欢迎使用数据管理平台</p>
      </div>

      <a-form
        :model="userForm"
        name="loginForm"
        @finish="handleLogin"
        layout="vertical"
      >
        <a-form-item label="用户名">
          <a-input
            v-model:value="userForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <span class="icon">👤</span>
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码">
          <a-input-password
            v-model:value="userForm.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <span class="icon">🔒</span>
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loginLoading"
            block
          >
            {{ loginLoading ? '登录中...' : '登 录' }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.icon {
  font-size: 16px;
}

:deep(.ant-input-affix-wrapper) {
  padding: 0 11px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #333;
}
</style>