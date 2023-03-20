<template>
  <v-col>
    <v-row align-content="center" justify="center">
      <v-skeleton-loader
        type="article, actions"
        v-if="_loading_skel"
        width="100%"
        max-width="600px"
      ></v-skeleton-loader>
      <v-card width="100%" max-width="600px" v-else>
        <v-card-title primary-title>
          <div class="headline">
            <template v-if="id && edit">Edit Location</template>
            <template v-else-if="id">Location</template>
            <template v-else>Create Location</template>
          </div>
          <v-spacer></v-spacer>
          <v-tooltip bottom v-if="id && !edit">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="edit = true">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit Location</span>
          </v-tooltip>
        </v-card-title>

        <validation-observer ref="form" v-slot="{ pristine }">
          <form
            novalidate
            @submit.prevent="
              id
                ? do_update(building_id, id, building.id, name)
                : do_create(building.id, name)
            "
          >
            <v-card-text>
              <validation-provider
                name="building"
                rules="required"
                mode="passive"
                v-slot="{ errors }"
              >
                <v-autocomplete
                  label="Building"
                  :items="building_cache"
                  item-text="name"
                  item-value="id"
                  v-model="building_id_local"
                  :error-messages="errors"
                  :readonly="(id && !edit) || (!id && !!building_id)"
                  required
                >
                  <template v-slot:append-outer v-if="building">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          text
                          icon
                          v-on="on"
                          :to="{
                            name: 'update-building',
                            params: { id: building.id },
                          }"
                          exact
                        >
                          <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                      </template>
                      <span>View Building</span>
                    </v-tooltip>
                  </template>
                </v-autocomplete>
              </validation-provider>

              <validation-provider
                name="name"
                rules="required"
                mode="passive"
                v-slot="{ errors }"
              >
                <v-text-field
                  ref="name"
                  label="Name"
                  v-model="name"
                  autofocus
                  :error-messages="errors"
                  :readonly="id && !edit"
                  required
                >
                </v-text-field>
              </validation-provider>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :color="id ? 'primary' : 'accent'"
                v-if="!id || !edit"
                text
                @click="$back()"
              >
                Back
              </v-btn>
              <v-btn color="accent" v-if="id && edit" text @click="cancel">
                Cancel
              </v-btn>
              <v-btn
                color="accent"
                v-if="id && edit"
                text
                @click="do_delete(building_id, id)"
              >
                Delete
              </v-btn>
              <v-btn
                color="accent"
                v-if="!id"
                text
                @click="do_create(building.id, name, true)"
                :loading="_loading"
                :disabled="building_id_local == null || name === ''"
              >
                Create &amp; Edit
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                v-if="!id || edit"
                text
                :loading="_loading"
                :disabled="pristine || building_id_local == null || name === ''"
              >
                <template v-if="id">Update</template>
                <template v-else>Create</template>
              </v-btn>
            </v-card-actions>
          </form>
        </validation-observer>
      </v-card>
    </v-row>

    <v-row
      v-if="id"
      align-content="center"
      justify="center"
      style="margin-top: 20px"
    >
      <app-list
        name="Printer"
        :headers="printer_headers"
        :items="printers"
        sort-by="search_name"
        :create-route="{
          name: 'create-location-printer',
          params: { building_id, location_id: id },
        }"
        :update-route="{
          name: 'update-printer',
          params: { building_id, location_id: id },
        }"
        show-delete
        @delete="do_delete_printer(building_id, id, $event.id)"
        :loading="printers_loading"
      >
      </app-list>
    </v-row>

    <v-row
      v-if="id"
      align-content="center"
      justify="center"
      style="margin-top: 20px"
    >
      <app-list
        name="User"
        :headers="user_headers"
        :items="users"
        sort-by="search_name"
        :show-assign="assignable_users.length > 0"
        @assign="$refs.assign_user.activate()"
        :update-route="{ name: 'read-user', params: {} }"
        show-unassign
        @unassign="do_unassign_user(building_id, id, $event.id)"
        :loading="users_loading"
      >
      </app-list>
    </v-row>

    <v-row
      v-if="id"
      align-content="center"
      justify="center"
      style="margin-top: 20px"
    >
      <app-list
        name="Group"
        :headers="group_headers"
        :items="groups"
        sort-by="search_name"
        :show-assign="assignable_groups.length > 0"
        @assign="$refs.assign_group.activate()"
        :update-route="{ name: 'read-group', params: {} }"
        show-unassign
        @unassign="do_unassign_group(building_id, id, $event.id)"
        :loading="groups_loading"
      >
      </app-list>
    </v-row>

    <app-assign-dialog
      ref="assign_user"
      name="User"
      attr="search_name"
      :items="assignable_users"
      @selection="do_assign_user(building_id, id, $event.id)"
      :loading="users_loading"
    >
    </app-assign-dialog>

    <app-assign-dialog
      ref="assign_group"
      name="Group"
      attr="search_name"
      :items="assignable_groups"
      @selection="do_assign_group(building_id, id, $event.id)"
      :loading="groups_loading"
    >
    </app-assign-dialog>
  </v-col>
</template>

<script>
import {mapMutations, mapGetters, mapActions} from "vuex"
import api from "../js/api.js"
import {CacheTypes} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
import BackMixin from "./back-mixin.js"
import AppList from "./list.vue"
import AppAssignDialog from "./assign-dialog.vue"
export default {
    name: "app-location",
    mixins: [AuthorizedMixin, BackMixin],
    components: {AppList, AppAssignDialog},
    props: ["building_id", "id"],
    data() {
        return {
            clean: null,
            edit: false,
            building_id_local: null,
            name: "",
            printer_headers: [
                {text: "Hostname", value: "search_name"},
                {text: "Model", value: "model_search_name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
            local_printers: [],
            user_headers: [
                {text: "Name", value: "search_name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
            local_users: [],
            group_headers: [
                {text: "Name", value: "search_name"},
                {text: "Actions", value: "actions", sortable: false, align: "end"},
            ],
            local_groups: [],
        }
    },
    computed: {
        ...mapGetters([
            "is_loading",
            "building_cache",
            "building_cache_map",
            "printer_cache_map",
            "user_cache",
            "user_cache_map",
            "group_cache",
            "group_cache_map",
        ]),
        _loading() {
            return this.is_loading(
                api.create_location,
                api.read_location,
                api.update_location,
                api.delete_location
            )
        },
        _loading_skel() {
            return this.is_loading(api.read_location)
        },
        building() {
            return this.building_cache_map[this.building_id_local]
        },
        printers() {
            const printers = []
            for (const p of this.local_printers) {
                printers.push(this.printer_cache_map[p.id])
            }
            return printers
        },
        printers_loading() {
            return this.is_loading(
                api.query_building_location_printers,
                api.delete_printer
            )
        },
        users() {
            const users = []
            for (const u of this.local_users) {
                users.push(this.user_cache_map[u.id])
            }
            return users
        },
        assignable_users() {
            const ids = new Set()
            for (const u of this.users) {
                ids.add(u.id)
            }
            const users = []
            for (const u of this.user_cache) {
                if (!ids.has(u.id)) {
                    users.push(u)
                }
            }
            return users
        },
        users_loading() {
            return this.is_loading(
                api.read_building_location_users,
                api.assign_building_location_user,
                api.unassign_building_location_user
            )
        },
        groups() {
            const groups = []
            for (const g of this.local_groups) {
                groups.push(this.group_cache_map[g.id])
            }
            return groups
        },
        assignable_groups() {
            const ids = new Set()
            for (const g of this.groups) {
                ids.add(g.id)
            }
            const groups = []
            for (const g of this.group_cache) {
                if (!ids.has(g.id)) {
                    groups.push(g)
                }
            }
            return groups
        },
        groups_loading() {
            return this.is_loading(
                api.read_building_location_groups,
                api.assign_building_location_group,
                api.unassign_building_location_group
            )
        },
    },
    watch: {
        id(newID) {
            this.do_read(this.building_id, newID)
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
                this.building_id_local = this.clean.building_id
                this.name = this.clean.name
                this.$refs.form.reset()
            })
        },
        async do_create(building_id, name, edit = false) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const location = await this.api_action({
                    action: api.create_location,
                    params: [building_id, name],
                })
                this.update_cache([CacheTypes.Location])
                if (edit) {
                    this.$router.replace({
                        name: "update-location",
                        params: {building_id, id: location.id},
                    })
                } else {
                    this.clean = location
                    this.$nextTick(() => {
                        if (!this.building_id) {
                            this.building_id_local = null
                        }
                        this.name = ""
                        this.$refs.name.focus()
                        this.$refs.form.reset()
                    })
                }
                this.ADD_FEEDBACK("Location created")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} at ${this.building.name} already exists`)
                }
            }
        },
        async do_read(building_id, id) {
            if (id != null) {
                try {
                    const [location, printers, users, groups] = await Promise.all([
                        this.api_action({
                            action: api.read_location,
                            params: [building_id, id],
                        }),
                        this.api_action({
                            action: api.query_building_location_printers,
                            params: [building_id, id],
                        }),
                        this.api_action({
                            action: api.read_building_location_users,
                            params: [building_id, id],
                        }),
                        this.api_action({
                            action: api.read_building_location_groups,
                            params: [building_id, id],
                        }),
                    ])
                    this.clean = location
                    this.$nextTick(() => {
                        this.building_id_local = location.building_id
                        this.name = location.name
                        this.local_printers = printers
                        this.local_users = users
                        this.local_groups = groups
                        this.$refs.form.reset()
                    })
                } catch (err) {
                    if (err.response !== null && err.response.status === 404) {
                        this.$back()
                        this.ADD_FEEDBACK("Location not found")
                    }
                }
            } else {
                this.$nextTick(() => {
                    this.building_id_local = building_id
                    this.name = ""
                    this.$refs.form.reset()
                })
            }
        },
        async do_update(building_id, id, building_id_new, name) {
            if (this._loading || !(await this.$refs.form.validate())) {
                return
            }

            try {
                const location = await this.api_action({
                    action: api.update_location,
                    params: [building_id, id, building_id_new, name],
                })
                this.update_cache([CacheTypes.Location])
                if (building_id !== building_id_new) {
                    this.$router.replace({
                        name: "update-location",
                        params: {building_id: building_id_new, id},
                    })
                }
                this.clean = location
                this.edit = false
                this.$nextTick(() => {
                    this.$refs.form.reset()
                })
                this.ADD_FEEDBACK("Location updated")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR(`${name} at ${this.building.name} already exists`)
                }
            }
        },
        do_delete(building_id, id) {
            this.UPDATE_CONFIRMATION({
                title: "Delete Location?",
                text: "Are you sure you want to delete this Location?",
                callback: this.do_delete_callback,
                params: [building_id, id],
            })
        },
        async do_delete_callback(building_id, id) {
            try {
                await this.api_action({
                    action: api.delete_location,
                    params: [building_id, id],
                })
                this.update_cache([CacheTypes.Location])
                this.ADD_FEEDBACK("Location deleted")
                this.$back()
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Location still in use")
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
                await this.api_action({
                    action: api.delete_printer,
                    params: [building_id, location_id, id],
                })
                this.update_cache([CacheTypes.Printer])
                this.local_printers = await this.api_action({
                    action: api.query_building_location_printers,
                    params: [building_id, location_id],
                })
                this.ADD_FEEDBACK("Printer deleted")
            } catch (err) {
                if (err.response !== null && err.response.status === 409) {
                    this.UPDATE_ERROR("Printer still in use")
                }
            }
        },
        async do_assign_user(building_id, location_id, user_id) {
            await this.api_action({
                action: api.assign_building_location_user,
                params: [building_id, location_id, user_id],
            })
            this.local_users = await this.api_action({
                action: api.read_building_location_users,
                params: [building_id, location_id],
            })
            this.ADD_FEEDBACK("User assigned")
        },
        do_unassign_user(building_id, location_id, user_id) {
            this.UPDATE_CONFIRMATION({
                title: "Unassign User?",
                text: "Are you sure you want to unassign this User?",
                callback: this.do_unassign_user_callback,
                params: [building_id, location_id, user_id],
            })
        },
        async do_unassign_user_callback(building_id, location_id, user_id) {
            await this.api_action({
                action: api.unassign_building_location_user,
                params: [building_id, location_id, user_id],
            })
            this.local_users = await this.api_action({
                action: api.read_building_location_users,
                params: [building_id, location_id],
            })
            this.ADD_FEEDBACK("User unassigned")
        },
        async do_assign_group(building_id, location_id, group_id) {
            await this.api_action({
                action: api.assign_building_location_group,
                params: [building_id, location_id, group_id],
            })
            this.local_groups = await this.api_action({
                action: api.read_building_location_groups,
                params: [building_id, location_id],
            })
            this.ADD_FEEDBACK("Group assigned")
        },
        do_unassign_group(building_id, location_id, group_id) {
            this.UPDATE_CONFIRMATION({
                title: "Unassign Group?",
                text: "Are you sure you want to unassign this Group?",
                callback: this.do_unassign_group_callback,
                params: [building_id, location_id, group_id],
            })
        },
        async do_unassign_group_callback(building_id, location_id, group_id) {
            await this.api_action({
                action: api.unassign_building_location_group,
                params: [building_id, location_id, group_id],
            })
            this.local_groups = await this.api_action({
                action: api.read_building_location_groups,
                params: [building_id, location_id],
            })
            this.ADD_FEEDBACK("Group unassigned")
        },
    },
    created() {
        this.do_read(this.building_id, this.id)
    },
}
</script>
