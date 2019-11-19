<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading" width="100%" max-width="600px"></v-skeleton-loader>

            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">Group</div>
                </v-card-title>

                <v-card-text>
                    <v-text-field
                        label="Name"
                        v-model="display_name"
                        readonly>
                    </v-text-field>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary"
                           text
                           @click="$back()">
                        Back
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-row>

        <v-row v-if="id" align-content="center" justify="center" style="margin-top: 20px">
            <app-list name="Location"
                      :headers="location_headers"
                      :items="locations"
                      multi-sort
                      :sort-by="['building_name', 'name']"
                      :show-assign="assignable_locations.length > 0"
                      @assign="$refs.assign_location.activate()"
                      :update-route="(location) => ({name: 'update-location', params: {building_id: location.building_id, id: location.id}})"
                      show-unassign @unassign="do_unassign_location($event.building_id, $event.id, id)"
                      :loading="locations_loading">
            </app-list>
        </v-row>

        <v-row v-if="id" align-content="center" justify="center" style="margin-top: 20px">
            <app-list name="User"
                      :headers="user_headers"
                      :items="users"
                      sort-by="search_name"
                      :update-route="{name: 'read-user', params: {}}"
                      :loading="users_loading">
            </app-list>
        </v-row>

        <app-assign-dialog ref="assign_location"
                           name="Location"
                           attr="search_name"
                           :items="assignable_locations"
                           @selection="do_assign_location($event.building_id, $event.id, id)"
                           :loading="locations_loading">
        </app-assign-dialog>
    </v-col>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import AuthorizedMixin from "./authorized-mixin.js"
import BackMixin from "./back-mixin.js"
import AppList from "./list.vue"
import AppAssignDialog from "./assign-dialog.vue"
export default {
    name: "app-group",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppList, AppAssignDialog},
    props: ["id"],
    data() {
        return {
            display_name: "",
            location_headers: [{text: "Building", value: "building_name"}, {text: "Name", value: "name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
            local_locations: [],
            user_headers: [{text: "Name", value: "search_name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
            local_users: [],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "location_cache", "location_cache_map", "user_cache_map"]),
        _loading() {
            return this.is_loading(api.read_group)
        },
        locations() {
            const locations = []
            for (const l of this.local_locations) {
                locations.push(this.location_cache_map[l.id])
            }
            return locations
        },
        assignable_locations() {
            const ids = new Set()
            for (const l of this.locations) {
                ids.add(l.id)
            }
            const locations = []
            for (const l of this.location_cache) {
                if (!(ids.has(l.id))) {
                    locations.push(l)
                }
            }
            return locations
        },
        locations_loading() {
            return this.is_loading(api.read_group_locations, api.assign_building_location_group, api.unassign_building_location_group)
        },
        users() {
            const users = []
            for (const u of this.local_users) {
                users.push(this.user_cache_map[u.id])
            }
            return users
        },
        users_loading() {
            return this.is_loading(api.read_group_users)
        },
    },
    watch: {
        id(newID) {
            this.do_read(newID)
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action"]),
        async do_read(id) {
            try {
                const [group, locations, users] = await Promise.all([
                    this.api_action({action: api.read_group, params: [id]}),
                    this.api_action({action: api.read_group_locations, params: [id]}),
                    this.api_action({action: api.read_group_users, params: [id]}),
                ])
                this.display_name = group.display_name
                this.local_locations= locations
                this.local_users = users
            } catch (err) {
                if (err.response !== null && err.response.status === 404) {
                    this.$back()
                    this.ADD_FEEDBACK("Group not found")
                }
            }
        },
        async do_assign_location(building_id, location_id, group_id) {
            await this.api_action({action: api.assign_building_location_group, params: [building_id, location_id, group_id]})
            this.local_locations = await this.api_action({action: api.read_group_locations, params: [group_id]})
            this.ADD_FEEDBACK("Location assigned")
        },
        do_unassign_location(building_id, location_id, group_id) {
            this.UPDATE_CONFIRMATION({
                title: "Unassign Location?",
                text: "Are you sure you want to unassign this Location?",
                callback: this.do_unassign_location_callback,
                params: [building_id, location_id, group_id],
            })
        },
        async do_unassign_location_callback(building_id, location_id, group_id) {
            await this.api_action({action: api.unassign_building_location_group, params: [building_id, location_id, group_id]})
            this.local_locations = await this.api_action({action: api.read_group_locations, params: [group_id]})
            this.ADD_FEEDBACK("Location unassigned")
        },
    },
    created() {
        this.do_read(this.id)
    },
}
</script>
