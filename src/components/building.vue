<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading_skel" width="100%" max-width="600px"></v-skeleton-loader>
            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">
                        <template v-if="id && edit">Edit Building</template>
                        <template v-else-if="id">Building</template>
                        <template v-else>Create Building</template>
                    </div>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom v-if="id && !edit">
                        <template v-slot:activator="{on}">
                            <v-btn text icon v-on="on" @click="edit = true">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Building</span>
                    </v-tooltip>
                </v-card-title>

                <validation-observer ref="form" v-slot="{pristine}">
                    <form novalidate @submit.prevent="id ? do_update(id, name) : do_create(name)">
                        <v-card-text>
                            <validation-provider name="name" rules="required" mode="passive" v-slot="{errors}">
                                <v-text-field
                                    ref="name"
                                    label="Name"
                                    v-model="name"
                                    autofocus
                                    :error-messages="errors"
                                    :readonly="id && !edit"
                                    required>
                                </v-text-field>
                            </validation-provider>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn :color="id ? 'primary' : 'accent'"
                                v-if="!id || !edit"
                                text
                                @click="$back()">
                                Back
                            </v-btn>
                            <v-btn color="accent"
                                   v-if="id && edit"
                                   text
                                   @click="cancel">
                                Cancel
                            </v-btn>
                            <v-btn color="accent"
                                   v-if="id && edit"
                                   text
                                   @click="do_delete(id)">
                                Delete
                            </v-btn>
                            <v-btn color="accent"
                                   v-if="!id"
                                   text
                                   @click="do_create(name, true)"
                                   :loading="_loading"
                                   :disabled="name === ''">
                                Create &amp; Edit
                            </v-btn>
                            <v-btn type="submit"
                                   color="primary"
                                   v-if="!id || edit"
                                   text
                                   :loading="_loading"
                                   :disabled="pristine || name === ''">
                                <template v-if="id">Update</template>
                                <template v-else>Create</template>
                            </v-btn>
                        </v-card-actions>
                    </form>
                </validation-observer>
            </v-card>
        </v-row>

        <v-row v-if="id" align-content="center" justify="center" style="margin-top: 20px">
            <app-list name="Location"
                      :headers="location_headers"
                      :items="locations"
                      sort-by="name"
                      :create-route="{name: 'create-building-location', params: {building_id: id}}"
                      :update-route="{name: 'update-location', params: {building_id: id}}"
                      show-delete @delete="do_delete_location(id, $event.id)"
                      :loading="locations_loading">
            </app-list>
        </v-row>
    </v-col>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import BackMixin from "./back-mixin.js"
import AppList from "./list.vue"
export default {
    name: "app-building",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppList},
    props: ["id"],
    data() {
        return {
            clean: null,
            edit: false,
            name: "",
            location_headers: [{text: "Name", value: "name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
            local_locations: [],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "location_cache_map"]),
        _loading() {
            return this.is_loading(api.create_building, api.read_building, api.update_building, api.delete_building)
        },
        _loading_skel() {
            return this.is_loading(api.read_building)
        },
        locations() {
            const locations = []
            for (const l of this.local_locations) {
                locations.push(this.location_cache_map[l.id])
            }
            return locations
        },
        locations_loading() {
            return this.is_loading(api.query_building_locations, api.delete_location)
        },
    },
    watch: {
        id(newID) {
            this.do_read(newID)
        },
        edit(val) {
            if (!val) {
                return
            }
            this.$refs.name.focus()
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        cancel() {
            this.edit = false
            this.$nextTick(() => {
                this.name = this.clean.name
                this.$refs.form.reset()
            })
        },
        async do_create(name, edit=false) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const building = await this.api_action({action: api.create_building, params: [name]})
                this.update_cache([CacheTypes.Building])
                if (edit) {
                    this.$router.replace({name: "update-building", params: {id: building.id}})
                } else {
                    this.clean = building
                    this.$nextTick(() => {
                        this.name = ""
                        this.$refs.name.focus()
                        this.$refs.form.reset()
                    })
                }
                this.ADD_FEEDBACK("Building created")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} already exists`)
                }
            }
        },
        async do_read(id) {
            if (id != null) {
                try {
                    const [building, locations] = await Promise.all([
                        this.api_action({action: api.read_building, params: [id]}),
                        this.api_action({action: api.query_building_locations, params: [this.id]}),
                    ])
                    this.clean = building
                    this.$nextTick(() => {
                        this.name = building.name
                        this.local_locations = locations
                        this.$refs.form.reset()
                    })
                } catch (err) {
                    if (err.response !== null && err.response.status === 404) {
                        this.$back()
                        this.ADD_FEEDBACK("Building not found")
                    }
                }
            } else {
                this.$nextTick(() => {
                    this.name = ""
                    this.$refs.form.reset()
                })
            }
        },
        async do_update(id, name) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const building = await this.api_action({action: api.update_building, params: [id, name]})
                this.update_cache([CacheTypes.Building])
                this.clean = building
                this.edit = false
                this.$nextTick(() => {
                    this.$refs.form.reset()
                })
                this.ADD_FEEDBACK("Building updated")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} already exists`)
                }
            }
        },
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
                this.$back()
                this.ADD_FEEDBACK("Building deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Building still in use")
                }
            }
        },
        do_delete_location(building_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Location?",
                text: "Are you sure you want to delete this Location?",
                callback: this.do_delete_location_callback,
                params: [building_id, id],
            })
        },
        async do_delete_location_callback(building_id, id) {
            try {
                await this.api_action({action: api.delete_location, params: [building_id, id]})
                this.update_cache([CacheTypes.Location])
                this.local_locations = await this.api_action({action: api.query_building_locations, params: [this.id]}),
                this.ADD_FEEDBACK("Location deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Location still in use")
                }
            }
        },
    },
    async created() {
        this.do_read(this.id)
    },
}
</script>
