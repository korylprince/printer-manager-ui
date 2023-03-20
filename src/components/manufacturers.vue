<template>
  <app-list
    name="Manufacturer"
    :headers="manufacturer_headers"
    :items="manufacturer_cache"
    sort-by="name"
    :create-route="{ name: 'create-manufacturer', params: {} }"
    :update-route="{ name: 'update-manufacturer', params: {} }"
    show-delete
    @delete="do_delete($event.id)"
    :loading="_loading"
  >
  </app-list>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppList from "./list.vue"
export default {
    name: "app-manufacturers",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            manufacturer_headers: [
                {text: "Name", value: "name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "manufacturer_cache"]),
        _loading() {
            return this.is_loading(api.delete_manufacturer, CacheTypes.Manufacturer)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        do_delete(id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Manufacturer?",
                text: "Are you sure you want to delete this Manufacturer?",
                callback: this.do_delete_callback,
                params: [id],
            })
        },
        async do_delete_callback(id) {
            try {
                await this.api_action({
                    action: api.delete_manufacturer,
                    params: [id],
                })
                this.update_cache([CacheTypes.Manufacturer])
                this.ADD_FEEDBACK("Manufacturer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Manufacturer still in use")
                }
            }
        },
    },
}
</script>
