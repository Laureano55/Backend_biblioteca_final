# Talleres - Backend (Biblioteca)

Proyecto de backend para una biblioteca — API REST con autenticación, permisos, y reservas.

Modelos usados: `User`, `Book`, `Reservation`.

Variables de entorno
Crear un archivo `.env` en la raíz con las variables indicadas en `.env.example`:

- `JWT_SECRET` (obligatorio)
- `MONGO_URI` (opcional en tests; requerido en producción)
- `PORT` (opcional)

## Instalación

**En carpeta raíz**

```powershell
npm install
```

**Ejecutar en desarrollo**:

```powershell
npm run dev
```

**Tests**:

```powershell
npm test
```


## Endpoints

**Auth**
- **POST /auth/register**: Registrar usuario
	- Auth: none
	- Body JSON: `{ "nombre": string, "correo": string, "contraseña": string, "permisos"?: string[] }`
	- Respuestas: `201` usuario creado, `400` correo ya registrado

- **POST /auth/login**: Obtener JWT
	- Auth: none
	- Body JSON: `{ "correo": string, "contraseña": string }`
	- Respuestas: `200` `{ token, user }`, `400` credenciales inválidas

**Usuarios**
- **GET /usuarios/me**: Perfil
	- Auth: `Authorization: Bearer <token>`
	- Respuestas: `200` usuario (sin `contraseña`), `401` no autenticado, `404` inhabilitado/no encontrado

- **PUT /usuarios/:id**: Actualizar usuario
	- Auth: `Authorization: Bearer <token>`
	- Permisos: owner (mismo `id`) o `modifyUsers`
	- Body JSON: `{ "nombre"?: string, "correo"?: string, "permisos"?: string[] }`
	- Respuestas: `200` `{ updated }`, `403` sin permiso

- **DELETE /usuarios/:id**: Soft delete
	- Auth: `Authorization: Bearer <token>`
	- Permisos: owner o `disableUsers`
	- Respuestas: `200` `{ user: { enabled: false } }`, `403` sin permiso

**Libros**
- **POST /libros**: Crear libro
	- Auth: `Authorization: Bearer <token>`
	- Permisos: `createBooks` o `modifyBooks`
	- Body JSON: `{ "nombre": string, "autor": string, "fechaPublicacion": string, "genero": string, "editorial": string }`
	- Respuestas: `201` `{ libro }`, `403` sin permiso

- **GET /libros/:id**: Obtener libro por ID
	- Auth: none
	- Respuestas: `200` libro (info completa), `404` no encontrado/inhabilitado

- **GET /libros**: Listado (solo `nombre`) con filtros y paginación
	- Auth: none
	- Query params: `genero`, `fechaPublicacion`, `editorial`, `autor`, `nombre` (busca parcial), `disponibilidad` (`true|false`), `page`, `limit`
	- Respuesta: `200` `{ libros: [{ nombre }], paginacion: { paginaActual, librosPorPagina, paginaMaxima } }`

- **PUT /libros/:id**: Actualizar libro
	- Auth: `Authorization: Bearer <token>`
	- Permisos: `modifyBooks`
	- Body: campos del libro a actualizar
	- Respuestas: `200` `{ updated }`, `404` no encontrado, `403` sin permiso

- **DELETE /libros/:id**: Soft delete
	- Auth: `Authorization: Bearer <token>`
	- Permisos: `disableBooks`
	- Respuestas: `200` `{ updated: { enabled: false } }`, `403` sin permiso

**Reservas**
- **POST /libros/:id/reservar**: Reservar libro
	- Auth: `Authorization: Bearer <token>`
	- Body: none
	- Validaciones: libro debe existir y `enabled === true`; `disponibilidad === true`
	- Efecto: crea `Reservation` y marca `book.disponibilidad = false`
	- Respuestas: `201` `{ reserva }`, `404` libro no encontrado, `400` libro no disponible

- **POST /reservas/:id/entregar**: Entregar reserva (marcar deliveredAt)
	- Auth: `Authorization: Bearer <token>`
	- Permisos: owner de la reserva o `modifyBooks`
	- Body: none
	- Efecto: marca `deliveredAt` y `book.disponibilidad = true`
	- Respuestas: `200` `{ reserva }`, `403` sin permiso, `400` ya entregada

- **GET /usuarios/:id/reservas**: Historial de un usuario
	- Auth: `Authorization: Bearer <token>`
	- Notas: devuelve reservas populated con `book` (`nombre autor fechaPublicacion editorial`); devuelve `404` si usuario inhabilitado/no existe

- **GET /libros/:id/reservas**: Historial de un libro
	- Auth: `Authorization: Bearer <token>`
	- Notas: devuelve reservas populated con `user` (`nombre correo`); devuelve `404` si libro inhabilitado/no existe

**Encabezados y formato**
- `Content-Type: application/json` para requests con body.
- `Authorization: Bearer <token>` para endpoints protegidos.

## Autor
Laureano Lafaurie