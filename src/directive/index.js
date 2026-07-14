import {permission} from './permission.js'

export default  {
    install(app) {
        app.directive('permission', permission)
    }
}