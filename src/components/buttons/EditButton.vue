<template>
  <v-btn color="primary" size="small" icon @click="$emit('edit', item)">
    <v-icon>mdi-pencil</v-icon>
    <v-tooltip activator="parent" location="top">Editar</v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])
</script>
