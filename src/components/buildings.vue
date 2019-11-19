<template>
    <app-list name="Building"
              :headers="building_headers"
              :items="building_cache"
              sort-by="name"
              :create-route="{name: 'create-building', params: {}}"
              :update-route="{name: 'update-building', params: {}}"
              show-delete @delete="do_delete($event.id)"
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
    name: "app-buildings",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            building_headers: [{text: "Name", value: "name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "building_cache"]),
        _loading() {
            return this.is_loading(api.delete_building, CacheTypes.Building)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        do_delete(id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Building?",
                text: "Are you sure you want to delete this Building?",
                callback: this.do_delete_callback,
                params: [id],
            })
        },
        async do_delete_callback(id) {
            try {
                await this.api_action({action: api.delete_building, params: [id]})
                this.update_cache([CacheTypes.Building])
                this.ADD_FEEDBACK("Building deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Building still in use")
                }
            }
        },
    },
}
</script>
