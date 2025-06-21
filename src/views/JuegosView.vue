<template>
  <div class="pa-4">
    <v-container class="d-flex justify-center" style="max-width: 1440px;">
      <div class="form-wrapper w-100">
        <v-form ref="formRef">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                label="Título"
                v-model="form.titulo"
                :rules="[rules.required, rules.minLength(3), rules.maxLength(100)]"
                variant="outlined"
                density="comfortable"
                class="w-100"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Año de lanzamiento"
                v-model="form.anio_lanzamiento"
                :rules="[rules.required, rules.anioValido]"
                type="number"
                variant="outlined"
                density="comfortable"
                class="w-100"
                hint="Ingrese el año (4 dígitos)"
                persistent-hint
                min="1950"
                :max="new Date().getFullYear()"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Precio"
                v-model.number="form.precio"
                :rules="[rules.precioValido]"
                type="number"
                variant="outlined"
                density="comfortable"
                class="w-100"
                min="0"
                step="0.01"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Género"
                v-model="form.genero"
                :items="generos"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                class="w-100"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                label="Descripción"
                v-model="form.descripcion"
                :rules="[rules.maxLength(500)]"
                variant="outlined"
                density="comfortable"
                class="w-100"
                rows="3"
              />
            </v-col>
          </v-row>
        </v-form>

        <div class="d-flex justify-center ga-2 mt-4 mb-6">
          <v-btn color="primary" @click="checkFormBeforeSubmit" :loading="loading">
            {{ form.id ? 'Actualizar' : 'Guardar' }}
          </v-btn>
          <v-btn color="error" @click="resetForm" :disabled="loading">Cancelar</v-btn>
        </div>

        <ConfirmDialog
          v-model="confirmDialog"
          :title="form.id ? 'Confirmar actualización' : 'Confirmar creación'"
          :message="form.id ? '¿Desea actualizar este juego?' : '¿Desea guardar este juego?'"
          @confirm="submit"
          @cancel="confirmDialog = false"
        />
      </div>
    </v-container>

    <v-container class="mx-auto" style="max-width: 1440px;">
      <v-text-field
        v-model="search"
        label="Buscar por título"
        clearable
        density="comfortable"
        variant="outlined"
        hide-details
        class="mb-4"
        style="max-width: 500px;"
      />

      <v-data-table-server
        class="tabla-juegos elevation-1"
        v-model:page="pagination.page"
        v-model:items-per-page="pagination.itemsPerPage"
        :headers="headers"
        :items-length="filteredItems.length"
        :items="filteredItems"
        :loading="loading"
        item-value="id"
      >
        <template v-slot:item.precio="{ item }">
          {{ item.precio !== null ? `$${item.precio.toFixed(2)}` : 'No disponible' }}
        </template>
        <template v-slot:item.descripcion="{ item }">
          {{ item.descripcion || 'Sin descripción' }}
        </template>
        <template v-slot:item.acciones="{ item }">
          <div class="d-flex ga-1">
            <EditButton :item="item" @edit="editar" />
            <DeleteButton :item="item" @confirm-delete="eliminar" />
          </div>
        </template>
      </v-data-table-server>

      <v-row class="cards-juegos" dense>
        <v-col cols="12" v-for="item in filteredItems" :key="item.id">
          <v-card class="mb-3" elevation="2">
            <v-card-text>
              <div><strong>Título:</strong> {{ item.titulo }}</div>
              <div><strong>Año:</strong> {{ item.anio_lanzamiento }}</div>
              <div><strong>Género:</strong> {{ item.genero }}</div>
              <div><strong>Precio:</strong> {{ item.precio !== null ? `$${item.precio.toFixed(2)}` : 'No disponible' }}</div>
              <div><strong>Descripción:</strong> {{ item.descripcion || 'Sin descripción' }}</div>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
              <EditButton :item="item" @edit="editar" />
              <DeleteButton :item="item" @confirm-delete="eliminar" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import JuegoService from '@/services/JuegosService'
import EditButton from '@/components/buttons/EditButton.vue'
import DeleteButton from '@/components/buttons/DeleteButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const formRef = ref()
const form = ref({
  id: null as number | null,
  titulo: '',
  desarrollador: '',
  anio_lanzamiento: '',
  precio: 0,
  genero: '',
  descripcion: '',
})

const rules = {
  required: (v: any) => !!v || 'Este campo es obligatorio',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Mínimo ${min} caracteres`,
  maxLength: (max: number) => (v: string) => (v && v.length <= max) || `Máximo ${max} caracteres`,
  precioValido: (v: any) => {
    if (v === null || v === undefined) return true
    const num = Number(v)
    if (isNaN(num)) return 'Debe ser un número válido'
    if (num < 0) return 'El precio no puede ser negativo'
    return true
  },
  anioValido: (v: string) => {
    if (!v) return 'El año es requerido'
    if (isNaN(Number(v))) return 'Debe ser un número válido'
    const year = parseInt(v)
    const currentYear = new Date().getFullYear()
    if (year < 1950) return 'El año debe ser 1950 o posterior'
    if (year > currentYear) return `El año no puede ser mayor a ${currentYear}`
    return true
  }
}

const generos = ref([
  'Acción', 'Aventura', 'RPG', 'Estrategia', 'Deportes',
  'Carreras', 'Puzzle', 'Simulación', 'Terror', 'Plataformas'
])

interface JuegoItem {
  id: number
  titulo: string
  desarrollador: string
  anio_lanzamiento: number
  genero: string
  precio: number | null
  descripcion: string | null
}

const items = ref<JuegoItem[]>([])
const totalItems = ref(0)
const loading = ref(false)

const pagination = ref({ page: 1, itemsPerPage: 5 })
const headers = [
  { title: 'Título', key: 'titulo' },
  { title: 'Año', key: 'anio_lanzamiento' },
  { title: 'Género', key: 'genero' },
  { title: 'Precio', key: 'precio' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

const search = ref('')
const confirmDialog = ref(false)
const mode = ref<'create' | 'update'>('create')

const filteredItems = computed(() => {
  if (!search.value) return items.value
  return items.value.filter(item => item.titulo.toLowerCase().includes(search.value.toLowerCase()))
})

const checkFormBeforeSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) confirmDialog.value = true
}

const loadJuegos = async () => {
  loading.value = true
  try {
    const response = await JuegoService.list()
    items.value = response.map((juego: any) => ({
      id: juego.id,
      titulo: juego.titulo,
      desarrollador: juego.desarrollador || '',
      precio: juego.precio !== null ? Number(juego.precio) : null,
      anio_lanzamiento: new Date(juego.fechaLanzamiento).getFullYear(),
      genero: juego.genero,
      descripcion: juego.descripcion || 'Sin descripción'
    }))
    totalItems.value = items.value.length
  } catch (err) {
    console.error('Error cargando juegos:', err)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  confirmDialog.value = false
  loading.value = true
  try {
    const data = {
      titulo: form.value.titulo,
      desarrollador: form.value.desarrollador,
      fechaLanzamiento: `${form.value.anio_lanzamiento}-01-01`,
      precio: form.value.precio !== null ? Number(form.value.precio) : null,
      genero: form.value.genero,
      descripcion: form.value.descripcion || null
    }

    if (form.value.id) {
      await JuegoService.update(form.value.id, data)
    } else {
      await JuegoService.create(data)
    }

    resetForm()
    await loadJuegos()
  } catch (err) {
    console.error('Error al guardar:', err)
  } finally {
    loading.value = false
  }
}

const editar = (item: JuegoItem) => {
  form.value = {
    id: item.id,
    titulo: item.titulo,
    desarrollador: item.desarrollador || '',
    anio_lanzamiento: item.anio_lanzamiento.toString(),
    precio: item.precio !== null ? item.precio : 0,
    genero: item.genero,
    descripcion: item.descripcion || ''
  }
  mode.value = 'update'
}

const eliminar = async (item: { id: number }) => {
  try {
    await JuegoService.destroy(item.id)
    await loadJuegos()
  } catch (err) {
    console.error('Error al eliminar:', err)
  }
}

const resetForm = () => {
  form.value = {
    id: null,
    titulo: '',
    desarrollador: '',
    anio_lanzamiento: '',
    precio: 0,
    genero: '',
    descripcion: '',
  }
  mode.value = 'create'
}

onMounted(() => {
  loadJuegos()
})
</script>

<style scoped>
.tabla-juegos {
  display: none;
}
.cards-juegos {
  display: block;
}

@media (min-width: 768px) {
  .tabla-juegos {
    display: block;
  }
  .cards-juegos {
    display: none;
  }
}
</style>
