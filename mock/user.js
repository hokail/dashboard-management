export default [
    {
        url: '/api/user/login',
        method: 'post',
        response: ({ body }) => {
            const { username, password } = body
            if (username === 'admin' && password === 'admin') {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        token: 'mock-token-' + Date.now(),
                        username: 'admin',
                    }
                }
            } else if (username === 'user' && password === 'user') {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        token: 'mock-token-' + Date.now(),
                        username: 'user',
                    }
                }
            }{
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
                    roles: ['admin']
                }
            }
        },

    },
    {
        url: '/api/user/getUserList',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: 'success',
                data: {
                    userList: [
                        {
                            userid: 'admin',
                            username: '管理员',
                            roles: ['admin']
                        },
                        {
                            userid: 'user',
                            username: '用户',
                            roles: ['user']
                        },
                    ]
                }
            }
        },

    },
    {
        url: '/api/user/getUserInfo',
        method: 'post',
        response: ({ body }) => {
            const { username } = body
            if (username === 'admin') {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        role: 'admin'
                    }
                }
            } else if(username === 'user'){
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        role: 'user'
                    }
                }
            }else {
                return {
                    code: 401,
                    message: '用户名或密码错误',
                    data: null
                }
            }
        }
    }
]
