app.directive('permission',{
    mounted(el, binding) {
        const permissions = store.getUserPermissions // ['user:add', 'user:delete']
        const requiredPermission = binding.value     // 'user:add'

        if (!permissions.includes(requiredPermission)) {
            el.parentNode?.removeChild(el)
        }
    },
})