<template>
  <v-autocomplete
    ref="search"
    v-model="selection"
    :search-input.sync="search"
    label="Search"
    prepend-inner-icon="mdi-magnify"
    :items="_search_items"
    item-value="id"
    item-text="search_name"
    :loading="_loading"
    single-line
    dense
    hide-details
    @change="select"
    return-object
    clearable
  >
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-title>
          Enter your query to begin searching...
        </v-list-item-title>
      </v-list-item>
    </template>
    <template v-slot:item="{ item }">
      <template v-if="item.type === CacheTypes.Building">
        <v-list-item-icon>
          <v-icon>mdi-domain</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Building</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.Location">
        <v-list-item-icon>
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Location</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.Manufacturer">
        <v-list-item-icon>
          <v-icon>mdi-cogs</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Manufacturer</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.Model">
        <v-list-item-icon>
          <v-icon>mdi-settings</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Model</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.Printer">
        <v-list-item-icon>
          <v-icon>mdi-printer</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Printer</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.User">
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>User</v-list-item-subtitle>
        </v-list-item-content>
      </template>

      <template v-if="item.type === CacheTypes.Group">
        <v-list-item-icon>
          <v-icon>mdi-account-multiple</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.search_name }}</v-list-item-title>
          <v-list-item-subtitle>Group</v-list-item-subtitle>
        </v-list-item-content>
      </template>
    </template>
  </v-autocomplete>
</template>

<script>
import {mapGetters} from "vuex"
import {CacheTypes} from "../js/store.js"
export default {
    name: "app-search",
    data() {
        return {
            CacheTypes,
            selection: null,
            search: "",
        }
    },
    computed: {
        ...mapGetters([
            "is_loading",
            "building_cache",
            "location_cache",
            "manufacturer_cache",
            "model_cache",
            "printer_cache",
            "user_cache",
            "group_cache",
        ]),
        search_items() {
            return Array.prototype.concat(
                this.building_cache,
                this.location_cache,
                this.manufacturer_cache,
                this.model_cache,
                this.printer_cache,
                this.user_cache,
                this.group_cache
            )
        },
        _search_items() {
            if (!this.search) {
                return []
            }
            return this.search_items
        },
        _loading() {
            return this.is_loading(
                CacheTypes.Building,
                CacheTypes.Location,
                CacheTypes.Manufacturer,
                CacheTypes.Model,
                CacheTypes.Printer,
                CacheTypes.User,
                CacheTypes.Group
            )
        },
    },
    methods: {
        select(item) {
            switch (item.type) {
                case CacheTypes.Building:
                    this.$router.push({
                        name: "update-building",
                        params: {id: item.id},
                    })
                    break
                case CacheTypes.Location:
                    this.$router.push({
                        name: "update-location",
                        params: {building_id: item.building_id, id: item.id},
                    })
                    break
                case CacheTypes.Manufacturer:
                    this.$router.push({
                        name: "update-manufacturer",
                        params: {id: item.id},
                    })
                    break
                case CacheTypes.Model:
                    this.$router.push({
                        name: "update-model",
                        params: {manufacturer_id: item.manufacturer_id, id: item.id},
                    })
                    break
                case CacheTypes.Printer:
                    this.$router.push({
                        name: "update-printer",
                        params: {
                            building_id: item.building_id,
                            location_id: item.location_id,
                            id: item.id,
                        },
                    })
                    break
                case CacheTypes.User:
                    this.$router.push({name: "read-user", params: {id: item.id}})
                    break
                case CacheTypes.Group:
                    this.$router.push({name: "read-group", params: {id: item.id}})
                    break
            }

            this.$nextTick(() => {
                this.selection = null
                this.$refs.search.blur()
            })
        },
    },
}
</script>
