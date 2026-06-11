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
                            userid: '3',
                            username: '张三',
                            roles: ['user']
                        },
                        {
                            userid: '4',
                            username: '李四',
                            roles: ['editor']
                        },
                        {
                            userid: '5',
                            username: '王五',
                            roles: ['user']
                        },
                        {
                            userid: '6',
                            username: '赵六',
                            roles: ['viewer']
                        },
                        {
                            userid: '7',
                            username: '孙七',
                            roles: ['editor']
                        }
                    ]
                }
            }
        },

    }
]
