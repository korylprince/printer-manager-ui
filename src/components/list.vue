<template>
    <v-card width="100%" :max-width="maxWidth">
        <v-card-title>
            {{name}}s
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                append-icon="mdi-search"
                label="Search"
                single-line dense
                clearable
                hide-details>
            </v-text-field>
            <v-spacer></v-spacer>
            <v-tooltip bottom v-if="createRoute">
                <template v-slot:activator="{on}">
                    <v-btn text icon v-on="on" :to="createRoute" exact>
                        <v-icon>mdi-plus-circle</v-icon>
                    </v-btn>
                </template>
                <span>Add {{name}}</span>
            </v-tooltip>
            <v-tooltip bottom v-if="showAssign">
                <template v-slot:activator="{on}">
                    <v-btn text icon v-on="on" @click="$emit('assign')">
                        <v-icon>mdi-plus-circle</v-icon>
                    </v-btn>
                </template>
                <span>Assign {{name}}</span>
            </v-tooltip>
        </v-card-title>
        <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            :sort-by="sortBy"
            :multi-sort="multiSort"
            :loading="loading">
            <template v-slot:item.actions="{item}" v-if="updateRoute || showDelete || showUnassign">
                <v-tooltip bottom v-if="updateRoute">
                    <template v-slot:activator="{on}">
                        <v-btn text icon v-on="on" :to="_updateRoute(item)" exact>
                            <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                    </template>
                    <span>View {{name}}</span>
                </v-tooltip>

                <v-tooltip bottom v-if="showDelete">
                    <template v-slot:activator="{on}">
                        <v-btn text icon v-on="on" @click="$emit('delete', item)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>
                    <span>Delete {{name}}</span>
                </v-tooltip>

                <v-tooltip bottom v-if="showUnassign">
                    <template v-slot:activator="{on}">
                        <v-btn text icon v-on="on" @click="$emit('unassign', item)">
                            <v-icon>mdi-minus-circle</v-icon>
                        </v-btn>
                    </template>
                    <span>Unassign {{name}}</span>
                </v-tooltip>
            </template>
            <template v-slot:no-data>
                No {{name}}s found
            </template>
            <template v-slot:no-results>
                No {{name}}s found matching search query
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
export default {
    name: "app-list",
    props: {
        name: String,
        headers: Array,
        items: Array,
        sortBy: [String, Array],
        multiSort: Boolean,
        createRoute: Object,
        showAssign: Boolean,
        updateRoute: [Object, Function],
        showDelete: Boolean,
        showUnassign: Boolean,
        loading: Boolean,
        maxWidth: {
            type: String,
            default: "600px",
        },
    },
    data() {
        return {
            search: "",
        }
    },
    methods: {
        _updateRoute(item) {
            if (!(this.updateRoute) || !item) {
                return null
            }

            if (typeof(this.updateRoute) === "function") {
                return this.updateRoute(item)
            }

            return {name: this.updateRoute.name, params: {...this.updateRoute.params, id: item.id}}
        },
    },
}
</script>
