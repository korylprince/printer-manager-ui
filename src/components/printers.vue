<template>
    <app-list name="Printer"
              max-width="960px"
              :headers="printer_headers"
              :items="printer_cache"
              multi-sort
              :sort-by="['building_name', 'location_name']"
              :create-route="{name: 'create-printer', params: {}}"
              :update-route="(printer) => ({name: 'update-printer', params: {building_id: printer.building_id, location_id: printer.location_id, id: printer.id}})"
              show-delete @delete="do_delete($event.building_id, $event.location_id, $event.id)"
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
    name: "app-printers",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            printer_headers: [{text: "Building", value: "building_name"}, {text: "Location", value: "location_name"}, {text: "Hostname", value: "hostname"}, {text: "Model", value: "model_search_name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "printer_cache"]),
        _loading() {
            return this.is_loading(api.delete_printer, CacheTypes.Printer)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        do_delete(building_id, location_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Printer?",
                text: "Are you sure you want to delete this Printer?",
                callback: this.do_delete_callback,
                params: [building_id, location_id, id],
            })
        },
        async do_delete_callback(building_id, location_id, id) {
            try {
                await this.api_action({action: api.delete_printer, params: [building_id, location_id, id]})
                this.update_cache([CacheTypes.Printer])
                this.ADD_FEEDBACK("Printer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer still in use")
                }
            }
        },
    },
}
</script>
