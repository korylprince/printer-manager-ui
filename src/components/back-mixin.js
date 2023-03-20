import router from "../js/router.js"
export default {
    computed: {
        $backAvailable() {
            return window.history.length > 1
        },
    },
    methods: {
        $back() {
            if (this.$backAvailable) {
                router.go(-1)
                return
            }
            router.push({path: "/"})
        },
    },
}
