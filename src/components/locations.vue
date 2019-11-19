<template>
    <app-list name="Location"
              :headers="location_headers"
              :items="location_cache"
              multi-sort
              :sort-by="['building_name', 'name']"
              :create-route="{name: 'create-location'}"
              :update-route="(location) => ({name: 'update-location', params: {building_id: location.building_id, id: location.id}})"
              show-delete @delete="do_delete($event.building_id, $event.id)"
              :loading="_loading">
    </app-list>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppList from "./list.vue"
export default {
    name: "app-locations",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            location_headers: [{text: "Building", value: "building_name"}, {text: "Name", value: "name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "location_cache"]),
        _loading() {
            return this.is_loading(api.delete_location, CacheTypes.Location)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        do_delete(building_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Location?",
                text: "Are you sure you want to delete this Location?",
                callback: this.do_delete_callback,
                params: [building_id, id],
            })
        },
        async do_delete_callback(building_id, id) {
            try {
                await this.api_action({action: api.delete_location, params: [building_id, id]})
                this.update_cache([CacheTypes.Location])
                this.ADD_FEEDBACK("Location deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Location still in use")
                }
            }
        },
    },
}
</script>
