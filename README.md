# Pokédex Web

Aplicación web para gestionar una Pokédex con operaciones CRUD completas.

## Descripción

Sistema de gestión de Pokémon desarrollado con Node.js y Express que permite visualizar, buscar, crear, editar y eliminar Pokémon. Incluye una interfaz web interactiva con búsqueda avanzada, filtros por tipo y paginación.

## Características

- Visualización de Pokémon con tarjetas informativas
- Búsqueda por nombre, número o tipo
- Filtros y paginación configurable (12, 21, 51 o todos)
- Formulario para agregar/editar Pokémon
- Modal con detalles completos de cada Pokémon
- API REST para operaciones CRUD
- Validación de nombres únicos
- Sistema de caché para optimizar rendimiento

## Tecnologías

- Node.js
- Express 5.2.1
- JavaScript vanilla (frontend)
- HTML5 y CSS3

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## API Endpoints

- `GET /api/pokemon` - Obtener todos los Pokémon
- `GET /api/pokemon/:id` - Obtener un Pokémon específico
- `POST /api/pokemon` - Crear nuevo Pokémon
- `PUT /api/pokemon/:id` - Actualizar Pokémon
- `DELETE /api/pokemon/:id` - Eliminar Pokémon

## Estructura

```
├── public/
│   ├── index.html    # Interfaz principal
│   ├── app.js        # Lógica del cliente
│   └── style.css     # Estilos
├── server.js         # Servidor Express y API
├── pokedex.json      # Base de datos JSON
└── package.json      # Dependencias
```
