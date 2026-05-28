export default [
    {
        url: '/api/user/login',
        method: 'post',
        response: ({ body }) => {
            const { username, password } = body
            if (username === 'admin' && password === '12345') {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        token: 'mock-token-' + Date.now(),
                        username: 'admin',
                        role: 'admin'
                    }
                }
            } else {
                return {
                    code: 401,
                    message: '用户名或密码错误',
                    data: null
                }
            }
        }
    },
    {
        url: '/api/user/info',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    username: 'admin',
                    nickname: '管理员',
                    avatar: 'https://example.com/avatar.png',
                    roles: ['admin']
                }
            }
        }
    }
]
