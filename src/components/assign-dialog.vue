<template>
  <v-dialog v-model="active" persistent max-width="480">
    <v-card>
      <v-card-title class="headline">Assign {{ name }}</v-card-title>
      <form novalidate v-if="active" @submit.prevent="assign(selection)">
        <v-card-text>
          <v-autocomplete
            ref="input"
            :label="name"
            :items="items"
            :item-text="attr"
            item-value="id"
            v-model="selection"
            required
          >
          </v-autocomplete>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="accent" text @click="active = false"> Cancel </v-btn>
          <v-btn
            type="submit"
            color="primary"
            text
            :loading="loading"
            :disabled="selection == null"
          >
            Assign
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
    name: "app-assign-dialog",
    props: ["name", "attr", "items", "loading"],
    data() {
        return {
            active: false,
            selection: null,
        }
    },
    computed: {
        lower() {
            return this.name.toLowerCase()
        },
    },
    watch: {
        active(val) {
            if (!val) {
                this.selection = null
            }
        },
    },
    methods: {
        activate() {
            this.active = true
            this.$nextTick(() => {
                this.$refs.input.focus()
            })
        },
        assign(selection) {
            for (const i of this.items) {
                if (i.id === selection) {
                    this.$emit("selection", i)
                    this.active = false
                    return
                }
            }
        },
    },
}
</script>
