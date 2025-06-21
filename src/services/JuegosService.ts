const API_URL = "http://localhost:3333/juegos"

interface Juego {
  id?: number
  titulo: string
  genero: string
  fechaLanzamiento: string
  descripcion?: string
  desarrollador?: string
}

export default class JuegoService {
  static async list() {
    try {
      const response = await fetch(`${API_URL}`)
      if (!response.ok) throw new Error('Error al obtener juegos')
      return await response.json()
    } catch (error) {
      console.error('Error en JuegoService.list:', error)
      throw error
    }
  }

  static async create(data: Omit<Juego, 'id'>) {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Error al crear juego')
      return await response.json()
    } catch (error) {
      console.error('Error en JuegoService.create:', error)
      throw error
    }
  }

  static async update(id: number, data: Partial<Juego>) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Error al actualizar juego')
      return await response.json()
    } catch (error) {
      console.error('Error en JuegoService.update:', error)
      throw error
    }
  }

  static async destroy(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error('Error al eliminar juego')
      return response.status === 200
    } catch (error) {
      console.error('Error en JuegoService.destroy:', error)
      throw error
    }
  }

  static async getPaginated({ page = 1, itemsPerPage = 10, search = {} as { titulo?: string } }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      })

      if (search.titulo) params.append('titulo', search.titulo)

      const response = await fetch(`${API_URL}?${params.toString()}`)
      if (!response.ok) throw new Error('Error al obtener juegos paginados')

      const result = await response.json()
      return {
        items: result,
        total: result.length
      }
    } catch (error) {
      console.error('Error en JuegoService.getPaginated:', error)
      throw error
    }
  }
}
