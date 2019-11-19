import axios from "axios"

import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

import api from "./api.js"

const CacheTypes = Object.freeze({
    Building: Symbol("building"),
    Location: Symbol("location"),
    Manufacturer: Symbol("manufacturer"),
    Model: Symbol("model"),
    Printer: Symbol("printer"),
    User: Symbol("user"),
    Group: Symbol("group"),
})

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    state: {
        last_error: null,
        _loading: {},
        display_name: window.localStorage.getItem("display_name"),
        username: window.localStorage.getItem("username"),
        session_id: window.localStorage.getItem("session_id"),
        _next_route: null,
        _next_dispatch_action: null,
        _next_dispatch_payload: null,
        _feedback: [],
        _feedback_delay: false,
        confirm_dialog: null,
        _building_cache: [],
        _location_cache: [],
        _manufacturer_cache: [],
        _model_cache: [],
        _printer_cache: [],
        _user_cache: [],
        _group_cache: [],
    },
    getters: {
        is_loading(state) {
            return (...keys) => {
                for (const key of keys) {
                    if (key in state._loading && state._loading[key] !== 0) {
                        return true
                    }
                }
                return false
            }
        },
        next_route(state) {
            if (state._next_route == null) {
                return null
            }
            return {
                name: state._next_route.name,
                path: state._next_route.path,
                params: state._next_route.params,
                query: state._next_route.query,
            }
        },
        signed_in(state) {
            return state.session_id != null
        },
        initials(state) {
            const names = state.display_name.split(" ")
            let initials = ""
            for (const n of names) {
                initials += n[0].toUpperCase()
            }
            return initials
        },
        show_dialog(state) {
            return state.last_error != null
        },
        $http(state) {
            return axios.create({
                headers: {Authorization: "Bearer " + state.session_id},
            })
        },
        current_feedback(state) {
            if (state._feedback_delay || state._feedback.length === 0) {
                return null
            }
            return state._feedback[0]
        },
        building_cache(state) {
            const buildings = []
            for (const b of state._building_cache) {
                buildings.push({
                    ...b,
                    type: CacheTypes.Building,
                    search_name: b.name,
                })
            }
            return buildings
        },
        building_cache_map(state, getters) {
            const map = {}
            for (const b of getters.building_cache) {
                map[b.id] = b
            }
            return map
        },
        location_cache(state, getters) {
            if (!getters.building_cache_map) {
                return []
            }

            const locations = []
            for (const l of state._location_cache) {
                const name = getters.building_cache_map[l.building_id].name
                locations.push({
                    ...l,
                    type: CacheTypes.Location,
                    building_name: name,
                    search_name: `${name} ${l.name}`,
                })
            }
            return locations
        },
        location_cache_map(state, getters) {
            const map = {}
            for (const l of getters.location_cache) {
                map[l.id] = l
            }
            return map
        },
        manufacturer_cache(state) {
            const manufacturers = []
            for (const m of state._manufacturer_cache) {
                manufacturers.push({
                    ...m,
                    type: CacheTypes.Manufacturer,
                    search_name: m.name,
                })
            }
            return manufacturers
        },
        manufacturer_cache_map(state, getters) {
            const map = {}
            for (const m of getters.manufacturer_cache) {
                map[m.id] = m
            }
            return map
        },
        model_cache(state, getters) {
            if (!getters.manufacturer_cache_map) {
                return []
            }

            const models = []
            for (const m of state._model_cache) {
                const name = getters.manufacturer_cache_map[m.manufacturer_id].name
                models.push({
                    ...m,
                    type: CacheTypes.Model,
                    manufacturer_name: name,
                    search_name: `${name} ${m.name}`,
                })
            }
            return models
        },
        model_cache_map(state, getters) {
            const map = {}
            for (const m of getters.model_cache) {
                map[m.id] = m
            }
            return map
        },
        printer_cache(state, getters) {
            if (!getters.location_cache_map || !getters.model_cache_map) {
                return []
            }

            const printers = []
            for (const p of state._printer_cache) {
                const l = getters.location_cache_map[p.location_id]
                const m = getters.model_cache_map[p.model_id]
                printers.push({
                    ...p,
                    type: CacheTypes.Printer,
                    building_name: l.building_name,
                    building_id: l.building_id,
                    location_name: l.name,
                    location_search_name: l.search_name,
                    manufacturer_name: m.manufacturer_name,
                    manufacturer_id: m.manufacturer_id,
                    model_name: m.name,
                    model_search_name: m.search_name,
                    search_name: p.hostname,
                })
            }
            return printers
        },
        printer_cache_map(state, getters) {
            const map = {}
            for (const p of getters.printer_cache) {
                map[p.id] = p
            }
            return map
        },
        user_cache(state) {
            const users = []
            for (const u of state._user_cache) {
                users.push({
                    ...u,
                    type: CacheTypes.User,
                    search_name: u.display_name,
                })
            }
            return users
        },
        user_cache_map(state, getters) {
            const map = {}
            for (const u of getters.user_cache) {
                map[u.id] = u
            }
            return map
        },
        group_cache(state) {
            const groups = []
            for (const g of state._group_cache) {
                groups.push({
                    ...g,
                    type: CacheTypes.Group,
                    search_name: g.display_name,
                })
            }
            return groups
        },
        group_cache_map(state, getters) {
            const map = {}
            for (const g of getters.group_cache) {
                map[g.id] = g
            }
            return map
        },
    },
    mutations: {
        UPDATE_ERROR(state, error) {
            state.last_error = error
        },
        START_LOADING(state, key) {
            if (!(key in state._loading)) {
                Vue.set(state._loading, key, 0)
            }
            state._loading[key]++
            state.last_error = null
        },
        STOP_LOADING(state, key) {
            state._loading[key]--
        },
        UPDATE_CREDENTIALS(state, {display_name, username, session_id}) {
            state.display_name = display_name
            window.localStorage.setItem("display_name", display_name)
            state.username = username
            window.localStorage.setItem("username", username)
            state.session_id = session_id
            window.localStorage.setItem("session_id", session_id)
        },
        SIGNOUT(state) {
            state.display_name = null
            window.localStorage.removeItem("display_name")
            state.username = null
            window.localStorage.removeItem("username")
            state.session_id = null
            window.localStorage.removeItem("session_id")
        },
        UPDATE_NEXT_ROUTE(state, route) {
            state._next_route = route
        },
        UPDATE_NEXT_DISPATCH(state, {action, payload}) {
            state._next_dispatch_action = action
            state._next_dispatch_payload = payload
        },
        ADD_FEEDBACK(state, msg) {
            if (state._feedback[state._feedback.length - 1] !== msg) {
                state._feedback.push(msg)
            }
        },
        CLEAR_FEEDBACK(state) {
            // remove first element
            state._feedback.splice(0, 1)
            state._feedback_delay = true
        },
        CLEAR_FEEDBACK_DELAY(state) {
            state._feedback_delay = false
        },
        UPDATE_CONFIRMATION(state, opts) {
            state.confirm_dialog = opts
        },
        UPDATE_BUILDING_CACHE(state, buildings) {
            state._building_cache = buildings
        },
        UPDATE_LOCATION_CACHE(state, locations) {
            state._location_cache = locations
        },
        UPDATE_MANUFACTURER_CACHE(state, manufacturers) {
            state._manufacturer_cache = manufacturers
        },
        UPDATE_MODEL_CACHE(state, models) {
            state._model_cache = models
        },
        UPDATE_PRINTER_CACHE(state, printers) {
            state._printer_cache = printers
        },
        UPDATE_USER_CACHE(state, users) {
            state._user_cache = users
        },
        UPDATE_GROUP_CACHE(state, groups) {
            state._group_cache = groups
        },
    },
    actions: {
        async authenticate(context, {username, password}) {
            context.commit("START_LOADING", api.authenticate)

            try {
                const response = await api.authenticate(username, password)
                context.commit("STOP_LOADING", api.authenticate)
                context.commit("UPDATE_CREDENTIALS", {display_name: response.data.display_name, username, session_id: response.data.session_id})
            } catch (err) {
                context.commit("STOP_LOADING", api.authenticate)
                if (err.response !== null && err.response.status === 401) {
                    context.commit("UPDATE_ERROR", "Wrong username or password")
                    return
                }
                context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                console.error({error: err})
                return
            }
        },
        async signout(context) {
            context.commit("SIGNOUT")
        },
        next_route(context, router) {
            let next = context.getters.next_route
            if (next == null) {
                next = {name: "dashboard"}
            }
            router.push(next)
            context.commit("UPDATE_NEXT_ROUTE", null)
        },
        async next_dispatch(context) {
            if (context.state._next_dispatch_action == null) {
                return
            }
            await context.dispatch(context.state._next_dispatch_action, context.state._next_dispatch_payload)
            context.commit("UPDATE_NEXT_DISPATCH", {action: null, payload: null})
        },
        clear_feedback(context) {
            context.commit("CLEAR_FEEDBACK")
            window.setTimeout(() => {
                context.commit("CLEAR_FEEDBACK_DELAY")
            }, 500)
        },
        async update_cache(context, caches) {
            if (!context.getters.signed_in) {
                return
            }
            try {
                const promises = []
                for (const cache of caches) {
                    context.commit("START_LOADING", cache)
                    switch (cache) {
                        case CacheTypes.Building:
                            promises.push(api.query_buildings())
                            break
                        case CacheTypes.Location:
                            promises.push(api.query_locations())
                            break
                        case CacheTypes.Manufacturer:
                            promises.push(api.query_manufacturers())
                            break
                        case CacheTypes.Model:
                            promises.push(api.query_models())
                            break
                        case CacheTypes.Printer:
                            promises.push(api.query_printers())
                            break
                        case CacheTypes.User:
                            promises.push(api.query_users())
                            break
                        case CacheTypes.Group:
                            promises.push(api.query_groups())
                            break
                    }
                }

                const responses = await Promise.all(promises)

                for (const [idx, response] of responses.entries()) {
                    context.commit("STOP_LOADING", caches[idx])
                    switch (caches[idx]) {
                        case CacheTypes.Building:
                            context.commit("UPDATE_BUILDING_CACHE", response.data)
                            break
                        case CacheTypes.Location:
                            context.commit("UPDATE_LOCATION_CACHE", response.data)
                            break
                        case CacheTypes.Manufacturer:
                            context.commit("UPDATE_MANUFACTURER_CACHE", response.data)
                            break
                        case CacheTypes.Model:
                            context.commit("UPDATE_MODEL_CACHE", response.data)
                            break
                        case CacheTypes.Printer:
                            context.commit("UPDATE_PRINTER_CACHE", response.data)
                            break
                        case CacheTypes.User:
                            context.commit("UPDATE_USER_CACHE", response.data)
                            break
                        case CacheTypes.Group:
                            context.commit("UPDATE_GROUP_CACHE", response.data)
                            break
                    }
                }
            } catch (err) {
                for (const cache of caches) {
                    context.commit("STOP_LOADING", cache)
                }
                if (err.response !== null && err.response.status === 401) {
                    context.dispatch("signout")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in")
                } else {
                    context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                    console.error({err: err})
                }
                return
            }
        },
        async api_action(context, {action, params}) {
            context.commit("START_LOADING", action)
            try {
                const response = await action(...params)
                context.commit("STOP_LOADING", action)
                return response.data
            } catch (err) {
                context.commit("STOP_LOADING", action)
                if (err.response !== null && err.response.status === 401) {
                    context.dispatch("signout")
                    context.commit("ADD_FEEDBACK", "Session expired. Please sign back in")
                } else if (err.response !== null && (err.response.status === 404 || err.response.status === 409)) {
                    // pass
                } else {
                    context.commit("UPDATE_ERROR", "Oops! Something bad happened. Contact your system administrator")
                    console.error({err: err})
                }
                // handle in caller
                throw (err)
            }
        },
    },
})

export {store as default, CacheTypes}
