<template>
    <app-list name="Group"
              :headers="group_headers"
              :items="group_cache"
              sort-by="display_name"
              :update-route="{name: 'read-group', params: {}}"
              :loading="_loading">
    </app-list>
</template>

<script>
import {mapGetters} from "vuex"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppList from "./list.vue"
export default {
    name: "app-groups",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            group_headers: [{text: "Name", value: "display_name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "group_cache"]),
        _loading() {
            return this.is_loading(CacheTypes.Group)
        },
    },
}
</script>
