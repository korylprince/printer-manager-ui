<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading_skel" width="100%" max-width="600px"></v-skeleton-loader>
            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">User/Group Sync</div>
                </v-card-title>

                <v-card-text>
                    <p>
                        <strong>Last Sync:</strong> {{last_run | relative}}
                    </p>
                    <p>
                        <strong>Next Sync:</strong> {{next_run | relative}}
                    </p>
                    <p>
                        <strong>Users Synced:</strong> <router-link :to="{name: 'list-users'}">{{user_cache.length}}</router-link>
                    </p>
                    <p>
                        <strong>Groups Synced:</strong> <router-link :to="{name: 'list-groups'}">{{group_cache.length}}</router-link>
                    </p>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="accent"
                           text
                           @click="$back()">
                        Back
                    </v-btn>
                    <v-btn color="primary"
                           text
                           :loading="_loading"
                           @click="do_trigger">
                        Sync Now
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
    </v-col>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import {parseISO, formatRelative} from "date-fns"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import BackMixin from "./back-mixin.js"
export default {
    name: "app-sync",
    mixins: [AuthorizedMixin, BackMixin],
    filters: {
        relative(d) {
            try {
                return formatRelative(parseISO(d), new Date())
            } catch {
                return "Unknown"
            }
        },
    },
    data() {
        return {
            loaded: false,
            last_run: null,
            next_run: null,
        }
    },
    computed: {
        ...mapGetters(["is_loading", "user_cache", "group_cache"]),
        _loading() {
            return this.is_loading(api.sync_stats, api.sync_trigger)
        },
        _loading_skel() {
            return this.is_loading(api.sync_stats) && !(this.loaded)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK"]),
        ...mapActions(["api_action", "update_cache"]),
        async do_read() {
            const stats = await this.api_action({action: api.sync_stats, params: []})
            this.last_run = stats.last_run
            this.next_run = stats.next_run
            this.loaded = true
        },
        async do_trigger() {
            await this.api_action({action: api.sync_trigger, params: []})
            this.ADD_FEEDBACK("Sync completed")
            this.do_read()
            this.update_cache([CacheTypes.User, CacheTypes.Group])
        },
    },
    async created() {
        this.do_read()
    },
}
</script>
