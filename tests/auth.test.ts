import request from "supertest";
import app from "../src/app";

describe("Auth Tests", () => {
  it("Debe registrar un usuario", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        nombre: "Juan",
        correo: "juan@test.com",
        contraseña: "123456"
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("_id");
  });

  it("Debe permitir login y devolver un token", async () => {
    await request(app).post("/auth/register").send({
      nombre: "Carlos",
      correo: "carlos@test.com",
      contraseña: "123456"
    });

    const res = await request(app).post("/auth/login").send({
      correo: "carlos@test.com",
      contraseña: "123456"
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Login inválido devuelve 400", async () => {
    await request(app).post("/auth/register").send({
      nombre: "Invalid",
      correo: "invalid@test.com",
      contraseña: "correct"
    });

    const res = await request(app).post("/auth/login").send({
      correo: "invalid@test.com",
      contraseña: "wrong"
    });

    expect(res.status).toBe(400);
  });
});
