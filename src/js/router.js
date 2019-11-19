import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

import AppSignin from "../components/signin.vue"
import AppDashboard from "../components/dashboard.vue"
import AppNotFound from "../components/not-found.vue"
import AppSync from "../components/sync.vue"
import AppBuilding from "../components/building.vue"
import AppBuildings from "../components/buildings.vue"
import AppLocation from "../components/location.vue"
import AppLocations from "../components/locations.vue"
import AppPrinter from "../components/printer.vue"
import AppPrinters from "../components/printers.vue"
import AppManufacturer from "../components/manufacturer.vue"
import AppManufacturers from "../components/manufacturers.vue"
import AppModel from "../components/model.vue"
import AppModels from "../components/models.vue"
import AppUser from "../components/user.vue"
import AppUsers from "../components/users.vue"
import AppGroup from "../components/group.vue"
import AppGroups from "../components/groups.vue"

const router = new VueRouter({
    mode: "history",
    routes: [
        {name: "signin", path: "/signin", component: AppSignin},
        {name: "dashboard", path: "/", component: AppDashboard},
        {name: "sync", path: "/sync", component: AppSync},
        {name: "create-building", path: "/buildings/create", component: AppBuilding},
        {name: "update-building", path: "/buildings/:id", component: AppBuilding, props: true},
        {name: "list-buildings", path: "/buildings", component: AppBuildings},
        {name: "create-location", path: "/locations/create", component: AppLocation},
        {name: "create-building-location", path: "/buildings/:building_id/locations/create", component: AppLocation, props: true},
        {name: "update-location", path: "/buildings/:building_id/locations/:id", component: AppLocation, props: true},
        {name: "list-locations", path: "/locations", component: AppLocations},
        {name: "create-printer", path: "/printers/create", component: AppPrinter},
        {name: "create-location-printer", path: "/buildings/:building_id/locations/:location_id/printers/create", component: AppPrinter, props: true},
        {name: "create-model-printer", path: "/manufacturers/:manufacturer_id/models/:model_id/printers/create", component: AppPrinter, props: true},
        {name: "update-printer", path: "/buildings/:building_id/locations/:location_id/printers/:id", component: AppPrinter, props: true},
        {name: "list-printers", path: "/printers", component: AppPrinters},
        {name: "create-manufacturer", path: "/manufacturers/create", component: AppManufacturer},
        {name: "update-manufacturer", path: "/manufacturers/:id", component: AppManufacturer, props: true},
        {name: "list-manufacturers", path: "/manufacturers", component: AppManufacturers},
        {name: "create-model", path: "/models/create", component: AppModel},
        {name: "create-manufacturer-model", path: "/manufacturers/:manufacturer_id/models/create", component: AppModel, props: true},
        {name: "update-model", path: "/manufacturers/:manufacturer_id/models/:id", component: AppModel, props: true},
        {name: "list-models", path: "/models", component: AppModels},
        {name: "read-user", path: "/users/:id", component: AppUser, props: true},
        {name: "list-users", path: "/users", component: AppUsers},
        {name: "read-group", path: "/groups/:id", component: AppGroup, props: true},
        {name: "list-groups", path: "/groups", component: AppGroups},
        {path: "*", component: AppNotFound},
    ],
    scrollBehavior(to, from, savedPosition) {
        return {x: 0, y: 0}
    },
})

export default router
