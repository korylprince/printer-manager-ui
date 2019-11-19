<template>
    <v-col>
        <v-row align-content="center" justify="center">
            <v-skeleton-loader type="article, actions" v-if="_loading_skel" width="100%" max-width="600px"></v-skeleton-loader>
            <v-card width="100%" max-width="600px" v-else>
                <v-card-title primary-title>
                    <div class="headline">
                        <template v-if="id && edit">Edit Manufacturer</template>
                        <template v-else-if="id">Manufacturer</template>
                        <template v-else>Create Manufacturer</template>
                    </div>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom v-if="id && !edit">
                        <template v-slot:activator="{on}">
                            <v-btn text icon v-on="on" @click="edit = true">
                                <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                        </template>
                        <span>Edit Manufacturer</span>
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
            <app-list name="Model"
                      :headers="model_headers"
                      :items="models"
                      sort-by="name"
                      :create-route="{name: 'create-manufacturer-model', params: {manufacturer_id: id}}"
                      :update-route="{name: 'update-model', params: {manufacturer_id: id}}"
                      show-delete @delete="do_delete_model(id, $event.id)"
                      :loading="models_loading">
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
    name: "app-manufacturer",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppList},
    props: ["id"],
    data() {
        return {
            clean: null,
            edit: false,
            name: "",
            model_headers: [{text: "Name", value: "name"}, {text: "Actions", value: "actions", sortable: false, align: "end"}],
            local_models: [],
        }
    },
    computed: {
        ...mapGetters(["is_loading", "model_cache_map"]),
        _loading() {
            return this.is_loading(api.create_manufacturer, api.read_manufacturer, api.update_manufacturer, api.delete_manufacturer)
        },
        _loading_skel() {
            return this.is_loading(api.read_manufacturer)
        },
        models() {
            const models = []
            for (const l of this.local_models) {
                models.push(this.model_cache_map[l.id])
            }
            return models
        },
        models_loading() {
            return this.is_loading(api.query_manufacturer_models, api.delete_model)
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
                const manufacturer = await this.api_action({action: api.create_manufacturer, params: [name]})
                this.update_cache([CacheTypes.Manufacturer])
                if (edit) {
                    this.$router.replace({name: "update-manufacturer", params: {id: manufacturer.id}})
                } else {
                    this.clean = manufacturer
                    this.$nextTick(() => {
                        this.name = ""
                        this.$refs.name.focus()
                        this.$refs.form.reset()
                    })
                }
                this.ADD_FEEDBACK("Manufacturer created")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} already exists`)
                }
            }
        },
        async do_read(id) {
            if (id != null) {
                try {
                    const [manufacturer, models] = await Promise.all([
                        this.api_action({action: api.read_manufacturer, params: [id]}),
                        this.api_action({action: api.query_manufacturer_models, params: [this.id]}),
                    ])
                    this.clean = manufacturer
                    this.$nextTick(() => {
                        this.name = manufacturer.name
                        this.local_models = models
                        this.$refs.form.reset()
                    })
                } catch (err) {
                    if (err.response !== null && err.response.status === 404) {
                        this.$back()
                        this.ADD_FEEDBACK("Manufacturer not found")
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
                const manufacturer = await this.api_action({action: api.update_manufacturer, params: [id, name]})
                this.update_cache([CacheTypes.Manufacturer])
                this.clean = manufacturer
                this.edit = false
                this.$nextTick(() => {
                    this.$refs.form.reset()
                })
                this.ADD_FEEDBACK("Manufacturer updated")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} already exists`)
                }
            }
        },
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
                await this.api_action({action: api.delete_manufacturer, params: [id]})
                this.update_cache([CacheTypes.Manufacturer])
                this.$back()
                this.ADD_FEEDBACK("Manufacturer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Manufacturer still in use")
                }
            }
        },
        do_delete_model(manufacturer_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Model?",
                text: "Are you sure you want to delete this Model?",
                callback: this.do_delete_model_callback,
                params: [manufacturer_id, id],
            })
        },
        async do_delete_model_callback(manufacturer_id, id) {
            try {
                await this.api_action({action: api.delete_model, params: [manufacturer_id, id]})
                this.update_cache([CacheTypes.Model])
                this.local_models = await this.api_action({action: api.query_manufacturer_models, params: [this.id]}),
                this.ADD_FEEDBACK("Model deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Model still in use")
                }
            }
        },
    },
    async created() {
        this.do_read(this.id)
    },
}
</script>
