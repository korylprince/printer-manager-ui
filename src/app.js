import Vue from "vue"
import vuetify from "./plugins/vuetify.js"
import "./plugins/validation.js"

import router from "./js/router.js"
import store, {CacheTypes as ct} from "./js/store.js"

// signin/signout actions
store.watch((state, getters) => getters.signed_in, signed_in => {
    if (!signed_in) {
        store.commit("UPDATE_NEXT_ROUTE", router.currentRoute)
        router.push({name: "signin"})
    } else {
        store.dispatch("next_route", router)
        store.dispatch("next_dispatch")
        store.dispatch("update_cache", [ct.Building, ct.Location, ct.Manufacturer, ct.Model, ct.Printer, ct.User, ct.Group])
    }
})

import MyApp from "./components/app.vue"

const App = new (Vue.extend(MyApp))({
    el: "#root",
    router,
    store,
    vuetify,
    created() {
        store.dispatch("update_cache", [ct.Building, ct.Location, ct.Manufacturer, ct.Model, ct.Printer, ct.User, ct.Group])
    },
})

export default App
