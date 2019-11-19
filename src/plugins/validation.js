import Vue from "vue"
import {ValidationProvider, ValidationObserver, extend} from "vee-validate"
import {required} from "vee-validate/dist/rules"
import en from "vee-validate/dist/locale/en"

extend("required", {...required, message: en.messages["required"]})
extend("is_json_obj", {
    getMessage(field) {
        `The ${field} is not valid JSON`
    },
    validate(value) {
        if (typeof myVar === "string") {
            try {
                JSON.parse(value)
            } catch {
                return false
            }
            return true
        }
        try {
            JSON.stringify(value)
        } catch {
            return false
        }
        return true
    },
})
Vue.component("ValidationProvider", ValidationProvider)
Vue.component("ValidationObserver", ValidationObserver)
