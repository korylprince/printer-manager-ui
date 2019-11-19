<template>
    <v-app>
        <v-navigation-drawer app clipped temporary v-model="drawer" v-if="display_name">
            <v-list>
                <v-list-item>
                    <v-list-item-avatar color="primary">
                        <span class="white--text">{{initials}}</span>
                    </v-list-item-avatar>
                    <v-list-item-title>{{display_name}}</v-list-item-title>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item :to="{name: 'dashboard'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-home</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-buildings'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-domain</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Buildings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-locations'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-crosshairs-gps</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Locations</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-manufacturers'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-cogs</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Manufacturers</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-models'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-settings</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Models</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-printers'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-printer</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Printers</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-users'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-account</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Users</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'list-groups'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-account-multiple</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Groups</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item :to="{name: 'sync'}" exact>
                    <v-list-item-icon>
                        <v-icon>mdi-sync</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>User/Group Sync</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>

            <template v-slot:append>
                <v-list>
                    <v-list-item @click="signout(); drawer = false">
                        <v-list-item-icon>
                            <v-icon>mdi-logout-variant</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Sign Out</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </template>
        </v-navigation-drawer>

        <v-app-bar color="primary" dark dense clipped-left app>
            <v-row align="center" justify="center">
                <v-col>
                    <v-row align="center" justify="start">
                        <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="signed_in"></v-app-bar-nav-icon>
                        <router-link class="toolbar-title" :to="{name: 'dashboard'}">
                            <v-toolbar-title v-if="$vuetify.breakpoint.xsOnly">
                                <v-icon>mdi-printer</v-icon>
                            </v-toolbar-title>
                            <v-toolbar-title v-else>Printer Manager</v-toolbar-title>
                        </router-link>
                    </v-row>
                </v-col>
                <v-col :cols="$vuetify.breakpoint.xsOnly ? 8 : 6">
                    <v-row align="center" justify="center">
                        <app-search style="max-width: 640px" v-if="signed_in"></app-search>
                    </v-row>
                </v-col>
                <v-col v-if="$vuetify.breakpoint.mdAndUp">
                </v-col>
            </v-row>
        </v-app-bar>

        <v-content>
            <v-container fluid :pa-0="$vuetify.breakpoint.xsOnly">
                <v-layout justify-center>
                    <router-view></router-view>
                </v-layout>
            </v-container>
        </v-content>

        <v-dialog :value="show_dialog" persistent max-width="480" :fullscreen="$vuetify.breakpoint.xsOnly">
            <v-card>
                <v-card-title class="headline">Error</v-card-title>
                <v-card-text>{{error}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="UPDATE_ERROR(null)">OK</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog :value="confirm_dialog" persistent max-width="320">
            <v-card v-if="confirm_dialog">
                <v-card-title class="headline">{{confirm_dialog.title}}</v-card-title>
                <v-card-text>{{confirm_dialog.text}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="accent" text @click="UPDATE_CONFIRMATION(null)">No</v-btn>
                    <v-btn color="primary" text @click="confirm_dialog.callback(...confirm_dialog.params); UPDATE_CONFIRMATION(null)">Yes</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar :value="current_feedback != null" @input="clear_feedback">
            {{ current_feedback }}
            <v-btn color="primary"
                   text
                   @click="clear_feedback">
                Close
            </v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
import {mapState, mapMutations, mapGetters, mapActions} from "vuex"
import AppSearch from "./search.vue"
export default {
    name: "my-app",
    components: {AppSearch},
    computed: {
        ...mapState(["display_name", "confirm_dialog"]),
        ...mapState({"error": "last_error"}),
        ...mapGetters(["signed_in", "initials", "current_feedback"]),
        ...mapGetters({"show_dialog_state": "show_dialog"}),
        show_dialog() {
            return this.$route.name !== "signin" && this.show_dialog_state
        },
    },
    data() {
        return {
            drawer: false,
        }
    },
    methods: {
        ...mapMutations(["UPDATE_ERROR", "UPDATE_CONFIRMATION"]),
        ...mapActions(["clear_feedback", "signout"]),
    },
}
</script>

<style lang="sass" scoped>
.toolbar-title
    color: inherit
    cursor: pointer
    text-decoration: none

    &:hover
        font-weight: bold
</style>
