<template>
  <app-list
    name="Model"
    :headers="model_headers"
    :items="model_cache"
    multi-sort
    :sort-by="['manufacturer_name', 'name']"
    :create-route="{ name: 'create-model' }"
    :update-route="
      (model) => ({
        name: 'update-model',
        params: { manufacturer_id: model.manufacturer_id, id: model.id },
      })
    "
    show-delete
    @delete="do_delete($event.manufacturer_id, $event.id)"
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
    name: "app-models",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            model_headers: [
                {text: "Manufacturer", value: "manufacturer_name"},
                {text: "Name", value: "name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "model_cache"]),
        _loading() {
            return this.is_loading(api.delete_model, CacheTypes.Model)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        do_delete(manufacturer_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Model?",
                text: "Are you sure you want to delete this Model?",
                callback: this.do_delete_callback,
                params: [manufacturer_id, id],
            })
        },
        async do_delete_callback(manufacturer_id, id) {
            try {
                await this.api_action({
                    action: api.delete_model,
                    params: [manufacturer_id, id],
                })
                this.update_cache([CacheTypes.Model])
                this.ADD_FEEDBACK("Model deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Model still in use")
                }
            }
        },
    },
}
</script>
