<template>
  <app-list
    name="User"
    :headers="user_headers"
    :items="user_cache"
    sort-by="display_name"
    :update-route="{ name: 'read-user', params: {} }"
    :loading="_loading"
  >
  </app-list>
</template>

<script>
import {mapGetters} from "vuex"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import AppList from "./list.vue"
export default {
    name: "app-users",
    mixins: [AuthorizedMixin],
    components: {AppList},
    data() {
        return {
            user_headers: [
                {text: "Name", value: "display_name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "user_cache"]),
        _loading() {
            return this.is_loading(CacheTypes.User)
        },
    },
}
</script>
