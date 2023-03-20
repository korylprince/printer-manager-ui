<template>
  <v-card width="100%" max-width="960px">
    <v-card-title primary-title>
      Dashboard
      <v-spacer></v-spacer>
      <v-btn text icon color="primary" @click="refresh">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-container fluid class="dashboard">
        <v-row>
          <v-col>
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Printer)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-printer</v-icon>Printers</v-card-title
              >
              <v-card-text>Total: {{ printer_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-printers' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col :md="4" cols="12" order="1" :order-md="1">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Building)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-domain</v-icon>Buildings</v-card-title
              >
              <v-card-text>Total: {{ building_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-buildings' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :md="4" cols="12" order="3" :order-md="2">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Manufacturer)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-cogs</v-icon
                >Manufacturers</v-card-title
              >
              <v-card-text>Total: {{ manufacturer_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-manufacturers' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :md="4" cols="12" order="5" :order-md="3">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(User)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-account</v-icon>Users</v-card-title
              >
              <v-card-text>Total: {{ user_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-users' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :md="4" cols="12" order="2" :order-md="4">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Location)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-crosshairs-gps</v-icon
                >Locations</v-card-title
              >
              <v-card-text>Total: {{ location_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-locations' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :md="4" cols="12" order="4" :order-md="5">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Model)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-settings</v-icon>Models</v-card-title
              >
              <v-card-text>Total: {{ model_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-models' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col :md="4" cols="12" order="6" :order-md="6">
            <v-skeleton-loader
              type="card"
              v-if="is_loading(Group)"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-card-title
                ><v-icon class="mr-2">mdi-account-multiple</v-icon
                >Groups</v-card-title
              >
              <v-card-text>Total: {{ group_cache.length }}</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text :to="{ name: 'list-groups' }"
                  >View</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapGetters, mapActions} from "vuex"
import {CacheTypes as ct} from "../js/store.js"
import AuthorizedMixin from "./authorized-mixin.js"
export default {
    name: "app-dashboard",
    mixins: [AuthorizedMixin],
    data() {
        return {
            ...ct,
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
    },
    methods: {
        ...mapActions(["update_cache"]),
        refresh() {
            this.update_cache([
                ct.Building,
                ct.Location,
                ct.Manufacturer,
                ct.Model,
                ct.Printer,
                ct.User,
                ct.Group,
            ])
        },
    },
}
</script>
