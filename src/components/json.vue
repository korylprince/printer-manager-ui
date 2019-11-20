<template>
    <div ref="editor" :style="{width: '100%'}"></div>
</template>

<script>
import Ace from "ace-builds/src-min-noconflict/ace"
import Worker from "file-loader!ace-builds/src-noconflict/worker-json.js"
Ace.config.setModuleUrl("ace/mode/json_worker", Worker)
import Mode from "ace-builds/src-noconflict/mode-json"
import Theme from "ace-builds/src-noconflict/theme-chrome"
export default {
    name: "app-json",
    props: {
        value: [Object, String],
        readonly: Boolean,
    },
    data() {
        return {
            init: 0,
            editor: null,
            local: "",
            error: false,
        }
    },
    watch: {
        value(val) {
            const local = JSON.stringify(val)
            if (this.local !== local) {
                this.local = local
                this.init += 1
                this.editor.setValue(JSON.stringify(val, null, 4), 1)
            }
        },
        readonly(val) {
            this.editor.setReadOnly(this.readonly)
        },
        error(val) {
            this.$emit("error", val)
        },
    },
    methods: {
        change() {
            if (this.init > 0) {
                this.init -= 1
                return
            }
            const val = this.editor.getValue()
            try {
                this.local = JSON.stringify(JSON.parse(val))
                const parsed = JSON.parse(val)
                this.$emit("input", parsed)
                this.error = false
            } catch {
                this.error = true
            }
        },
        checkAnnotations() {
            const annotations = this.editor.session.getAnnotations()
            for (const ann of annotations) {
                if (ann.type === "error") {
                    this.error = true
                    return
                }
            }
            this.error = false
        },
    },
    beforeDestroy: function() {
        this.editor.destroy()
        this.editor.container.remove()
    },
    mounted() {
        this.editor = Ace.edit(this.$refs.editor)
        this.editor.session.setMode(new (Mode.Mode)())
        this.editor.setTheme(Theme)
        this.editor.setShowPrintMargin(false)
        this.editor.setShowFoldWidgets(false)
        this.editor.setReadOnly(this.readonly)
        this.editor.setOptions({maxLines: 15})
        this.local = JSON.stringify(this.value)
        this.init += 1
        this.editor.setValue(JSON.stringify(this.value, null, 4), 1)
        this.editor.on("change", this.change)
        this.editor.session.on("changeAnnotation", this.checkAnnotations)
    },
}
</script>
