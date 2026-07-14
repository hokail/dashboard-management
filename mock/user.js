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
            } else if (username === 'zhang' && password === 'zhang') {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        token: 'mock-token-' + Date.now(),
                        username: 'zhang',
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
                            userid: 'zhangsan',
                            username: '张三',
                            roles: ['user']
                        },
                        {
                            userid: 'lisi',
                            username: '李四',
                            roles: ['editor']
                        },
                        {
                            userid: 'wangwu',
                            username: '王五',
                            roles: ['user']
                        },
                        {
                            userid: 'zhaoliu',
                            username: '赵六',
                            roles: ['viewer']
                        },
                        {
                            userid: 'liqi',
                            username: '孙七',
                            roles: ['editor']
                        }
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
            } else if(username !== 'admin'){
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
