<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="$emit('cancel')">Cancelar</v-btn>
        <v-btn color="primary" @click="$emit('confirm')">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  title: String,
  message: String
})

defineEmits(['update:modelValue', 'confirm', 'cancel'])
</script>
