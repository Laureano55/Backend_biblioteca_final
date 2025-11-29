import request from "supertest";
import app from "../src/app";

let tokenUser = "";
let tokenAdmin = "";
let userId = "";
let bookId = "";
let reservaId = "";

beforeAll(async () => {
  // crear admin
  await request(app).post("/auth/register").send({
    nombre: "Admin",
    correo: "admin@test.com",
    contraseña: "123456",
    permisos: ["modifyBooks"]
  });

  const adminLogin = await request(app).post("/auth/login").send({
    correo: "admin@test.com",
    contraseña: "123456"
  });
  tokenAdmin = adminLogin.body.token;

  // crear usuario común
  const user = await request(app).post("/auth/register").send({
    nombre: "Juan",
    correo: "juan@test.com",
    contraseña: "123456"
  });
  userId = user.body.user._id;

  const login = await request(app).post("/auth/login").send({
    correo: "juan@test.com",
    contraseña: "123456"
  });
  tokenUser = login.body.token;

  // crear libro para reservar
  const book = await request(app)
    .post("/libros")
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({
      nombre: "Libro Test",
      autor: "Autor",
      genero: "Test",
      editorial: "Editorial",
      fechaPublicacion: "2020-01-01"
    });

  bookId = book.body.libro._id;
});

describe("Reservas Test", () => {
  it("Debe permitir reservar un libro", async () => {
    const res = await request(app)
      .post(`/libros/${bookId}/reservar`)
      .set("Authorization", `Bearer ${tokenUser}`);

    expect(res.status).toBe(201);
    reservaId = res.body.reserva._id;
  });

  it("Debe permitir entregar el libro", async () => {
    const res = await request(app)
      .post(`/reservas/${reservaId}/entregar`)
      .set("Authorization", `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.reserva.deliveredAt).toBeDefined();
  });

  it("No permite reservar libro ya reservado (no disponible)", async () => {
    // crear un nuevo usuario
    await request(app).post("/auth/register").send({ nombre: "P", correo: "p@test.com", contraseña: "123456" });
    const login = await request(app).post("/auth/login").send({ correo: "p@test.com", contraseña: "123456" });
    const t = login.body.token;

    // first reservation by this new user to make book unavailable
    await request(app).post(`/libros/${bookId}/reservar`).set("Authorization", `Bearer ${t}`);

    // second reservation should fail because disponibilidad false
    const res = await request(app).post(`/libros/${bookId}/reservar`).set("Authorization", `Bearer ${t}`);
    expect(res.status).toBe(400);
  });

  it("No permite entregar reserva por usuario no propietario", async () => {
    // crear reserva por userId (if none exists create)
    const newRes = await request(app).post(`/libros/${bookId}/reservar`).set("Authorization", `Bearer ${tokenUser}`);
    const newReservaId = newRes.status === 201 ? newRes.body.reserva._id : reservaId;

    // crear atacante
    await request(app).post("/auth/register").send({ nombre: "Att", correo: "att@test.com", contraseña: "123456" });
    const attLogin = await request(app).post("/auth/login").send({ correo: "att@test.com", contraseña: "123456" });
    const attTok = attLogin.body.token;

    const res = await request(app).post(`/reservas/${newReservaId}/entregar`).set("Authorization", `Bearer ${attTok}`);
    expect(res.status).toBe(403);
  });

  it("Debe mostrar historial de reservas de un usuario", async () => {
    const res = await request(app)
      .get(`/usuarios/${userId}/reservas`)
      .set("Authorization", `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.reservas.length).toBeGreaterThanOrEqual(1);
  });

  it("Debe mostrar historial de reservas de un libro", async () => {
    const res = await request(app)
      .get(`/libros/${bookId}/reservas`)
      .set("Authorization", `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.reservas.length).toBeGreaterThanOrEqual(1);
  });
});
