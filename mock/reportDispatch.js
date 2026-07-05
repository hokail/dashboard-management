export default [
    {
        url: '/api/report/sendDispatch',
        method: 'post',
        response: ({ body }) => {
            const { list } = body
            if (list[0]) {
                return {
                    code: 200,
                    message: '登录成功',
                    data: {
                        dispatchList: list.map(e =>{
                            return {
                                ...e,
                                status: 'dispatched',
                            }
                        })
                    }
                }
            } else {
                return {
                    code: 401,
                    message: '派单数据错误',
                    data: null
                }
            }
        }
    },
]