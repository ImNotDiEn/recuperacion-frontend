<template>
  <v-btn color="primary" size="small" icon @click="$emit('edit', item)">
    <Icon path={mdiPencil} size={1} />
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
