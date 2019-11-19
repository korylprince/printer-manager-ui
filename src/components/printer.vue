<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading_skel" width="100%" max-width="600px"></v-skeleton-loader>
            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">
                        <template v-if="id && edit">Edit Printer</template>
                        <template v-else-if="id">Printer</template>
                        <template v-else>Create Printer</template>
                    </div>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom v-if="id && !edit">
                        <template v-slot:activator="{on}">
                            <v-btn text icon v-on="on" @click="edit = true">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Printer</span>
                    </v-tooltip>
                </v-card-title>

                <validation-observer ref="form" v-slot="{pristine}">
                    <form novalidate @submit.prevent="id ? do_update(building_id, location_id, id, location.id, model.id, hostname, driver_extra) : do_create(location.building_id, location.id, model.id, hostname, driver_extra)">
                        <v-card-text>
                            <validation-provider name="location" rules="required" mode="passive" v-slot="{errors}">
                                <v-autocomplete
                                    label="Location"
                                    :items="location_cache"
                                    item-text="search_name"
                                    item-value="id"
                                    v-model="location_id_local"
                                    :error-messages="errors"
                                    :readonly="(id && !edit) || (!id && !!location_id)"
                                    required>
                                    <template v-slot:append-outer v-if="location">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{on}">
                                                <v-btn text icon v-on="on" :to="{name: 'update-location', params: {building_id: location.building_id, id: location.id}}" exact>
                                                    <v-icon>mdi-open-in-new</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>View Location</span>
                                        </v-tooltip>
                                    </template>
                                </v-autocomplete>
                            </validation-provider>

                            <validation-provider name="model" rules="required" mode="passive" v-slot="{errors}">
                                <v-autocomplete
                                    label="Model"
                                    :items="model_cache"
                                    item-text="search_name"
                                    item-value="id"
                                    v-model="model_id_local"
                                    :error-messages="errors"
                                    :readonly="(id && !edit) || (!id && !!manufacturer_id)"
                                    required>
                                    <template v-slot:append-outer v-if="model">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{on}">
                                                <v-btn text icon v-on="on" :to="{name: 'update-model', params: {manufacturer_id: model.manufacturer_id, id: model.id}}" exact>
                                                    <v-icon>mdi-open-in-new</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>View Model</span>
                                        </v-tooltip>
                                    </template>
                                </v-autocomplete>
                            </validation-provider>

                            <validation-provider name="hostname" rules="required" mode="passive" v-slot="{errors}">
                                <v-text-field
                                    ref="hostname"
                                    label="Hostname"
                                    v-model="hostname"
                                    autofocus
                                    :error-messages="errors"
                                    :readonly="id && !edit"
                                    required>
                                </v-text-field>
                            </validation-provider>

                            <span class="v-label v-label--active theme--light" style="font-size: 0.9em">Driver Override</span>
                            <validation-provider name="driver_extra" rules="is_json_obj">
                                <app-json
                                    v-model="driver_extra"
                                    :readonly="id && !edit"
                                    @error="driver_error = $event">
                                </app-json>
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
                                   @click="do_delete(building_id, location_id, id)">
                                Delete
                            </v-btn>
                            <v-btn color="accent"
                                   v-if="!id"
                                   text
                                   @click="do_create(location.building_id, location.id, model.id, hostname, driver_extra, true)"
                                   :loading="_loading"
                                   :disabled="location_id_local == null || model_id_local == null || hostname === '' || driver_error">
                                Create &amp; Edit
                            </v-btn>
                            <v-btn type="submit"
                                   color="primary"
                                   v-if="!id || edit"
                                   text
                                   :loading="_loading"
                                   :disabled="pristine || location_id_local == null || model_id_local == null || hostname === '' || driver_error">
                                <template v-if="id">Update</template>
                                <template v-else>Create</template>
                            </v-btn>
                        </v-card-actions>
                    </form>
                </validation-observer>
            </v-card>
        </v-row>
    </v-col>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import BackMixin from "./back-mixin.js"
import AppJson from "./json.vue"
export default {
    name: "app-printer",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppJson},
    props: ["building_id", "location_id", "manufacturer_id", "model_id", "id"],
    data() {
        return {
            clean: null,
            edit: false,
            location_id_local: null,
            model_id_local: null,
            hostname: "",
            driver_extra: {},
            driver_error: false,
        }
    },
    computed: {
        ...mapGetters(["is_loading", "location_cache", "location_cache_map", "model_cache", "model_cache_map"]),
        _loading() {
            return this.is_loading(api.create_printer, api.read_printer, api.update_printer, api.delete_printer)
        },
        _loading_skel() {
            return this.is_loading(api.read_printer)
        },
        location() {
            return this.location_cache_map[this.location_id_local]
        },
        model() {
            return this.model_cache_map[this.model_id_local]
        },
    },
    watch: {
        id(newID) {
            this.do_read(this.building_id, this.location_id, newID)
        },
        edit(val) {
            if (!val) {
                return
            }
            this.$refs.hostname.focus()
        },
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "ADD_FEEDBACK", "UPDATE_CONFIRMATION"]),
        ...mapActions(["api_action", "update_cache"]),
        cancel() {
            this.edit = false
            this.$nextTick(() => {
                this.location_id_local = this.clean.location_id
                this.model_id_local = this.clean.model_id
                this.hostname = this.clean.hostname
                this.driver_extra = this.clean.driver_extra
                this.$refs.form.reset()
            })
        },
        async do_create(building_id, location_id, model_id, hostname, driver_extra, edit=false) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const printer = await this.api_action({action: api.create_printer, params: [building_id, location_id, model_id, hostname, driver_extra]})
                this.update_cache([CacheTypes.Printer])
                if (edit) {
                    this.$router.replace({name: "update-printer", params: {building_id, location_id, id: printer.id}})
                } else {
                    this.clean = printer
                    this.$nextTick(() => {
                        if (!(this.location_id)) {
                            this.location_id_local = null
                        }
                        if (!(this.model_id)) {
                            this.model_id_local = null
                        }
                        this.hostname = ""
                        this.driver_extra = {}
                        this.$refs.hostname.focus()
                        this.$refs.form.reset()
                    })
                }
                this.ADD_FEEDBACK("Printer created")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer already exists")
                }
            }
        },
        async do_read(building_id, location_id, id) {
            if (id != null) {
                try {
                    const printer = await this.api_action({action: api.read_printer, params: [building_id, location_id, id]})
                    this.clean = printer
                    this.$nextTick(() => {
                        this.location_id_local = printer.location_id
                        this.model_id_local = printer.model_id
                        this.hostname = printer.hostname
                        this.driver_extra = printer.driver_extra
                        this.$refs.form.reset()
                    })
                } catch (err) {
                    if (err.response !== null && err.response.status === 404) {
                        this.$back()
                        this.ADD_FEEDBACK("Printer not found")
                    }
                }
            } else {
                this.$nextTick(() => {
                    this.location_id_local = this.location_id
                    this.model_id_local = this.model_id
                    this.hostname = ""
                    this.driver_extra = {}
                    this.$refs.form.reset()
                })
            }
        },
        async do_update(building_id, location_id, id, location_id_new, model_id, hostname, driver_extra) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const printer = await this.api_action({action: api.update_printer, params: [building_id, location_id, id, location_id_new, model_id, hostname, driver_extra]})
                this.update_cache([CacheTypes.Printer])
                if (location_id !== location_id_new) {
                    const l = this.location_cache_map[location_id_new]
                    this.$router.replace({name: "update-printer", params: {building_id: l.building_id, location_id: l.id, id}})
                }
                this.clean = printer
                this.edit = false
                this.$nextTick(() => {
                    this.$refs.form.reset()
                })
                this.ADD_FEEDBACK("Printer updated")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer already exists")
                }
            }
        },
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
                this.$back()
                this.ADD_FEEDBACK("Printer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer still in use")
                }
            }
        },
    },
    created() {
        this.do_read(this.building_id, this.location_id, this.id)
    },
}
</script>
