import request from "supertest";
import app from "../src/app";

let token = "";

beforeAll(async () => {
  const reg = await request(app).post("/auth/register").send({
    nombre: "Admin",
    correo: "admin@test.com",
    contraseña: "123456",
    permisos: ["createBooks", "modifyBooks", "disableBooks"]
  });

  const login = await request(app).post("/auth/login").send({
    correo: "admin@test.com",
    contraseña: "123456"
  });

  token = login.body.token;
});

describe("Book CRUD Tests", () => {
  let bookId = "";

  it("Debe crear un libro", async () => {
    const res = await request(app)
      .post("/libros")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "El Quijote",
        autor: "Cervantes",
        genero: "Novela",
        editorial: "Planeta",
        fechaPublicacion: "1605-01-01"
      });

    expect(res.status).toBe(201);
    expect(res.body.libro._id).toBeDefined();

    bookId = res.body.libro._id;
  });

  it("Debe obtener un libro por ID", async () => {
    const res = await request(app).get(`/libros/${bookId}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe("El Quijote");
  });

  it("Debe actualizar un libro", async () => {
    const res = await request(app)
      .put(`/libros/${bookId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ editorial: "Penguin" });

    expect(res.status).toBe(200);
    expect(res.body.updated.editorial).toBe("Penguin");
  });

  it("Debe hacer soft delete de un libro", async () => {
    const res = await request(app)
      .delete(`/libros/${bookId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.updated.enabled).toBe(false);
  });

  it("Crear libro sin permiso debe devolver 403", async () => {
    // crear usuario sin permisos
    await request(app).post("/auth/register").send({
      nombre: "NoPerm",
      correo: "noperm@test.com",
      contraseña: "123456"
    });

    const login = await request(app).post("/auth/login").send({
      correo: "noperm@test.com",
      contraseña: "123456"
    });

    const res = await request(app)
      .post("/libros")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ nombre: "NoPermBook", autor: "X", genero: "Y", editorial: "Z", fechaPublicacion: "2000-01-01" });

    expect(res.status).toBe(403);
  });

  it("Obtener libro inexistente devuelve 404", async () => {
    const res = await request(app).get(`/libros/000000000000000000000000`);
    expect(res.status).toBe(404);
  });

  it("Actualizar libro sin permiso devuelve 403", async () => {
    // crear otro usuario sin permisos
    await request(app).post("/auth/register").send({
      nombre: "Updater",
      correo: "updater@test.com",
      contraseña: "123456"
    });

    const login = await request(app).post("/auth/login").send({
      correo: "updater@test.com",
      contraseña: "123456"
    });

    const res = await request(app)
      .put(`/libros/${bookId}`)
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ editorial: "Nope" });

    expect(res.status).toBe(403);
  });

  it("Eliminar libro sin permiso devuelve 403", async () => {
    const login = await request(app).post("/auth/login").send({
      correo: "updater@test.com",
      contraseña: "123456"
    });

    const res = await request(app)
      .delete(`/libros/${bookId}`)
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
  });
});
