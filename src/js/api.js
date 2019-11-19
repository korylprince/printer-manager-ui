/* global API_BASE */

import axios from "axios"

import store from "./store.js"

const api = {
    authenticate(username, password) {
        return axios.post(`${API_BASE}/auth`, {username, password})
    },

    sync_stats() {
        return store.getters.$http.get(`${API_BASE}/sync/stats`)
    },
    sync_trigger() {
        return store.getters.$http.post(`${API_BASE}/sync/trigger`)
    },

    create_building(name) {
        return store.getters.$http.post(`${API_BASE}/buildings`, {name})
    },
    read_building(id) {
        return store.getters.$http.get(`${API_BASE}/buildings/${id}`)
    },
    update_building(id, name) {
        return store.getters.$http.put(`${API_BASE}/buildings/${id}`, {name})
    },
    delete_building(id) {
        return store.getters.$http.delete(`${API_BASE}/buildings/${id}`)
    },
    query_buildings(params) {
        return store.getters.$http.get(`${API_BASE}/buildings`, {params})
    },

    create_location(building_id, name) {
        return store.getters.$http.post(`${API_BASE}/buildings/${building_id}/locations`, {name})
    },
    read_location(building_id, id) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations/${id}`)
    },
    update_location(building_id, id, building_id_new, name) {
        return store.getters.$http.put(`${API_BASE}/buildings/${building_id}/locations/${id}`, {building_id: building_id_new, name})
    },
    delete_location(building_id, id) {
        return store.getters.$http.delete(`${API_BASE}/buildings/${building_id}/locations/${id}`)
    },
    query_building_locations(building_id, params) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations`, {params})
    },
    query_locations(params) {
        return store.getters.$http.get(`${API_BASE}/locations`, {params})
    },

    create_printer(building_id, location_id, model_id, hostname, driver_extra) {
        return store.getters.$http.post(`${API_BASE}/buildings/${building_id}/locations/${location_id}/printers`, {model_id, hostname, driver_extra})
    },
    read_printer(building_id, location_id, id) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations/${location_id}/printers/${id}`)
    },
    update_printer(building_id, location_id, id, location_id_new, model_id, hostname, driver_extra) {
        return store.getters.$http.put(`${API_BASE}/buildings/${building_id}/locations/${location_id}/printers/${id}`, {location_id: location_id_new, model_id, hostname, driver_extra})
    },
    delete_printer(building_id, location_id, id) {
        return store.getters.$http.delete(`${API_BASE}/buildings/${building_id}/locations/${location_id}/printers/${id}`)
    },
    query_building_location_printers(building_id, location_id, params) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations/${location_id}/printers`, {params})
    },
    query_printers(params) {
        return store.getters.$http.get(`${API_BASE}/printers`, {params})
    },

    create_manufacturer(name) {
        return store.getters.$http.post(`${API_BASE}/manufacturers`, {name})
    },
    read_manufacturer(id) {
        return store.getters.$http.get(`${API_BASE}/manufacturers/${id}`)
    },
    update_manufacturer(id, name) {
        return store.getters.$http.put(`${API_BASE}/manufacturers/${id}`, {name})
    },
    delete_manufacturer(id) {
        return store.getters.$http.delete(`${API_BASE}/manufacturers/${id}`)
    },
    query_manufacturers(params) {
        return store.getters.$http.get(`${API_BASE}/manufacturers`, {params})
    },

    create_model(manufacturer_id, name, driver) {
        return store.getters.$http.post(`${API_BASE}/manufacturers/${manufacturer_id}/models`, {name, driver})
    },
    read_model(manufacturer_id, id) {
        return store.getters.$http.get(`${API_BASE}/manufacturers/${manufacturer_id}/models/${id}`)
    },
    update_model(manufacturer_id, id, manufacturer_id_new, name, driver) {
        return store.getters.$http.put(`${API_BASE}/manufacturers/${manufacturer_id}/models/${id}`, {manufacturer_id: manufacturer_id_new, name, driver})
    },
    delete_model(manufacturer_id, id) {
        return store.getters.$http.delete(`${API_BASE}/manufacturers/${manufacturer_id}/models/${id}`)
    },
    query_manufacturer_models(manufacturer_id, params) {
        return store.getters.$http.get(`${API_BASE}/manufacturers/${manufacturer_id}/models`, {params})
    },
    query_models(params) {
        return store.getters.$http.get(`${API_BASE}/models`, {params})
    },

    read_user(id) {
        return store.getters.$http.get(`${API_BASE}/users/${id}`)
    },
    query_users(params) {
        return store.getters.$http.get(`${API_BASE}/users`, {params})
    },

    read_group(id) {
        return store.getters.$http.get(`${API_BASE}/groups/${id}`)
    },
    query_groups(params) {
        return store.getters.$http.get(`${API_BASE}/groups`, {params})
    },

    read_group_users(id) {
        return store.getters.$http.get(`${API_BASE}/groups/${id}/users`)
    },
    read_user_groups(id) {
        return store.getters.$http.get(`${API_BASE}/users/${id}/groups`)
    },

    read_building_location_users(building_id, id) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations/${id}/users`)
    },
    read_user_locations(id) {
        return store.getters.$http.get(`${API_BASE}/users/${id}/locations`)
    },
    assign_building_location_user(building_id, location_id, user_id) {
        return store.getters.$http.put(`${API_BASE}/buildings/${building_id}/locations/${location_id}/users/${user_id}/assign`)
    },
    unassign_building_location_user(building_id, location_id, user_id) {
        return store.getters.$http.delete(`${API_BASE}/buildings/${building_id}/locations/${location_id}/users/${user_id}/assign`)
    },

    read_building_location_groups(building_id, id) {
        return store.getters.$http.get(`${API_BASE}/buildings/${building_id}/locations/${id}/groups`)
    },
    read_group_locations(id) {
        return store.getters.$http.get(`${API_BASE}/groups/${id}/locations`)
    },
    assign_building_location_group(building_id, location_id, group_id) {
        return store.getters.$http.put(`${API_BASE}/buildings/${building_id}/locations/${location_id}/groups/${group_id}/assign`)
    },
    unassign_building_location_group(building_id, location_id, group_id) {
        return store.getters.$http.delete(`${API_BASE}/buildings/${building_id}/locations/${location_id}/groups/${group_id}/assign`)
    },
}

export default api
