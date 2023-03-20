<template>
  <v-card width="100%" max-width="600px">
    <v-card-text align="center">
      <v-icon size="128">mdi-map-marker-question-outline</v-icon>
      <p class="display-1">Page not found</p>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" :to="{ name: 'dashboard' }" text>
        Go To Dashboard
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import AuthorizedMixin from "./authorized-mixin.js"
export default {
    name: "app-not-found",
    mixins: [AuthorizedMixin],
}
</script>
