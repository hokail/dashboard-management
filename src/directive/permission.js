import {permissionStore} from "../stores/permission.js";
import {storeToRefs} from "pinia";

export const permission = {
    mounted(el, binding) {

        // store的使用写在内部
        const usePermissionStore = permissionStore()
        const {userRole} = storeToRefs(usePermissionStore)

        const requiredPermission = binding.value     // 'user:add'

        if (requiredPermission && !requiredPermission.includes(userRole.value)) {
            el.parentNode?.removeChild(el)
        }
    }
}
