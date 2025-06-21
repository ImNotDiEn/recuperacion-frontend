<template>
  <v-btn color="error" size="small" icon @click="$emit('confirm-delete', item)">
    <v-icon>mdi-delete</v-icon>
    <v-tooltip activator="parent" location="top">Eliminar</v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['confirm-delete'])
</script>
