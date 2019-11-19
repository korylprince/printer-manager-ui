<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading_skel" width="100%" max-width="600px"></v-skeleton-loader>
            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">
                        <template v-if="id && edit">Edit Model</template>
                        <template v-else-if="id">Model</template>
                        <template v-else>Create Model</template>
                    </div>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom v-if="id && !edit">
                        <template v-slot:activator="{on}">
                            <v-btn text icon v-on="on" @click="edit = true">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Model</span>
                    </v-tooltip>
                </v-card-title>

                <validation-observer ref="form" v-slot="{pristine}">
                    <form novalidate @submit.prevent="id ? do_update(manufacturer_id, id, manufacturer.id, name, driver) : do_create(manufacturer.id, name, driver)">
                        <v-card-text>
                            <validation-provider name="manufacturer" rules="required" mode="passive" v-slot="{errors}">
                                <v-autocomplete
                                    label="Manufacturer"
                                    :items="manufacturer_cache"
                                    item-text="name"
                                    item-value="id"
                                    v-model="manufacturer_id_local"
                                    :error-messages="errors"
                                    :readonly="(id && !edit) || (!id && !!manufacturer_id)"
                                    required>
                                    <template v-slot:append-outer v-if="manufacturer">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{on}">
                                                <v-btn text icon v-on="on" :to="{name: 'update-manufacturer', params: {id: manufacturer.id}}" exact>
                                                    <v-icon>mdi-open-in-new</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>View Manufacturer</span>
                                        </v-tooltip>
                                    </template>
                                </v-autocomplete>
                            </validation-provider>

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

                            <span class="v-label v-label--active theme--light" style="font-size: 0.9em">Driver</span>
                            <validation-provider name="driver" rules="is_json_obj">
                                <app-json
                                    v-model="driver"
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
                                   @click="do_delete(manufacturer_id, id)">
                                Delete
                            </v-btn>
                            <v-btn color="accent"
                                   v-if="!id"
                                   text
                                   @click="do_create(manufacturer.id, name, driver, true)"
                                   :loading="_loading"
                                   :disabled="manufacturer_id_local == null || name === '' || driver === '' || driver_error">
                                Create &amp; Edit
                            </v-btn>
                            <v-btn type="submit"
                                   color="primary"
                                   v-if="!id || edit"
                                   text
                                   :loading="_loading"
                                   :disabled="pristine || manufacturer_id_local == null || name === '' || driver === '' || driver_error">
                                <template v-if="id">Update</template>
                                <template v-else>Create</template>
                            </v-btn>
                        </v-card-actions>
                    </form>
                </validation-observer>
            </v-card>
        </v-row>

        <v-row v-if="id" align-content="center" justify="center" style="margin-top: 20px">
            <app-list name="Printer"
                      :headers="printer_headers"
                      :items="printers"
                      sort-by="search_name"
                      :create-route="{name: 'create-model-printer', params: {manufacturer_id, model_id: id}}"
                      :update-route="(printer) => ({name: 'update-printer', params: {building_id: printer.building_id, location_id: printer.location_id, id: printer.id}})"
                      show-delete @delete="do_delete_printer($event.building_id, $event.location_id, $event.id)"
                      :loading="printers_loading">
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
import AppJson from "./json.vue"
export default {
    name: "app-model",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppList, AppJson},
    props: ["manufacturer_id", "id"],
    data() {
        return {
            clean: null,
            edit: false,
            manufacturer_id_local: null,
            name: "",
            driver: {},
            driver_error: false,
            printer_headers: [{text: "Hostname", value: "search_name"}, {text: "Location", value: "location_search_name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
            local_printers: [],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "manufacturer_cache", "manufacturer_cache_map", "printer_cache_map"]),
        _loading() {
            return this.is_loading(api.create_model, api.read_model, api.update_model, api.delete_model)
        },
        _loading_skel() {
            return this.is_loading(api.read_model)
        },
        manufacturer() {
            return this.manufacturer_cache_map[this.manufacturer_id_local]
        },
        printers() {
            const printers = []
            for (const p of this.local_printers) {
                printers.push(this.printer_cache_map[p.id])
            }
            return printers
        },
        printers_loading() {
            return this.is_loading(api.query_printers, api.delete_printer)
        },
    },
    watch: {
        id(newID) {
            this.do_read(this.manufacturer_id, newID)
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
                this.manufacturer_id_local = this.clean.manufacturer_id
                this.name = this.clean.name
                this.driver = this.clean.driver
                this.$refs.form.reset()
            })
        },
        async do_create(manufacturer_id, name, driver, edit=false) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const model = await this.api_action({action: api.create_model, params: [manufacturer_id, name, driver]})
                this.update_cache([CacheTypes.Model])
                if (edit) {
                    this.$router.replace({name: "update-model", params: {manufacturer_id, id: model.id}})
                } else {
                    this.clean = model
                    this.$nextTick(() => {
                        if (!(this.manufacturer_id)) {
                            this.manufacturer_id_local = null
                        }
                        this.name = ""
                        this.driver = {}
                        this.$refs.name.focus()
                        this.$refs.form.reset()
                    })
                }
                this.ADD_FEEDBACK("Model created")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${this.manufacturer.name} ${name} already exists`)
                }
            }
        },
        async do_read(manufacturer_id, id) {
            if (id != null) {
                try {
                    const [model, printers] = await Promise.all([
                        this.api_action({action: api.read_model, params: [manufacturer_id, id]}),
                        this.api_action({action: api.query_printers, params: [{model_id: id}]}),
                    ])
                    this.clean = model
                    this.$nextTick(() => {
                        this.manufacturer_id_local = model.manufacturer_id
                        this.name = model.name
                        this.driver = model.driver
                        this.local_printers = printers
                        this.$refs.form.reset()
                    })
                } catch (err) {
                    if (err.response !== null && err.response.status === 404) {
                        this.$back()
                        this.ADD_FEEDBACK("Model not found")
                    }
                }
            } else {
                this.$nextTick(() => {
                    this.manufacturer_id_local = manufacturer_id
                    this.name = ""
                    this.driver = {}
                    this.$refs.form.reset()
                })
            }
        },
        async do_update(manufacturer_id, id, manufacturer_id_new, name, driver) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const model = await this.api_action({action: api.update_model, params: [manufacturer_id, id, manufacturer_id_new, name, driver]})
                this.update_cache([CacheTypes.Model])
                if (manufacturer_id !== manufacturer_id_new) {
                    this.$router.replace({name: "update-model", params: {manufacturer_id: manufacturer_id_new, id}})
                }
                this.clean = model
                this.edit = false
                this.$nextTick(() => {
                    this.$refs.form.reset()
                })
                this.ADD_FEEDBACK("Model updated")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${this.manufacturer.name} ${name} already exists`)
                }
            }
        },
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
                await this.api_action({action: api.delete_model, params: [manufacturer_id, id]})
                this.update_cache([CacheTypes.Model])
                this.ADD_FEEDBACK("Model deleted")
                this.$back()
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Model still in use")
                }
            }
        },
        do_delete_printer(building_id, location_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Printer?",
                text: "Are you sure you want to delete this Printer?",
                callback: this.do_delete_printer_callback,
                params: [building_id, location_id, id],
            })
        },
        async do_delete_printer_callback(building_id, location_id, id) {
            try {
                await this.api_action({action: api.delete_printer, params: [building_id, location_id, id]})
                this.update_cache([CacheTypes.Printer])
                this.local_printers = await this.api_action({action: api.query_printers, params: [{model_id: this.id}]})
                this.ADD_FEEDBACK("Printer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer still in use")
                }
            }
        },
    },
    created() {
        this.do_read(this.manufacturer_id, this.id)
    },
}
</script>
