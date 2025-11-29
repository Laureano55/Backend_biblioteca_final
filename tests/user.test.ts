import request from "supertest";
import app from "../src/app";

const unique = Date.now();

async function registerAndLogin(nombre: string, correo: string, contraseña = "123456", permisos?: string[]) {
  const reg = await request(app).post("/auth/register").send({ nombre, correo, contraseña, permisos });
  const login = await request(app).post("/auth/login").send({ correo, contraseña });
  return { reg, login, token: login.body.token, id: reg.body.user._id };
}

describe("User Controller Tests", () => {
  let owner: any;
  let other: any;
  let admin: any;

  beforeAll(async () => {
    owner = await registerAndLogin("Owner", `owner+${unique}@test.com`);
    other = await registerAndLogin("Other", `other+${unique}@test.com`);
    admin = await registerAndLogin("Admin", `admin+${unique}@test.com`, "123456", ["modifyUsers", "disableUsers"]);
  });

  it("GET /usuarios/me returns profile without contraseña", async () => {
    const res = await request(app).get("/usuarios/me").set("Authorization", `Bearer ${owner.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).not.toHaveProperty("contraseña");
  });

  it("Owner can update their profile", async () => {
    const res = await request(app)
      .put(`/usuarios/${owner.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ nombre: "OwnerNew" });

    expect(res.status).toBe(200);
    expect(res.body.updated.nombre).toBe("OwnerNew");
  });

  it("Other user without permission cannot update another user", async () => {
    const res = await request(app)
      .put(`/usuarios/${owner.id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ nombre: "Hacker" });

    expect(res.status).toBe(403);
  });

  it("Admin with modifyUsers can update other users", async () => {
    const res = await request(app)
      .put(`/usuarios/${other.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ nombre: "OtherByAdmin" });

    expect(res.status).toBe(200);
    expect(res.body.updated.nombre).toBe("OtherByAdmin");
  });

  it("Admin with disableUsers can soft-delete another user", async () => {
    const res = await request(app)
      .delete(`/usuarios/${other.id}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.enabled).toBe(false);
  });

  it("Owner can soft-delete themselves", async () => {
    const res = await request(app)
      .delete(`/usuarios/${owner.id}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.enabled).toBe(false);
  });

  it("GET /usuarios/me for disabled user returns 404", async () => {
    const res = await request(app).get("/usuarios/me").set("Authorization", `Bearer ${owner.token}`);
    expect(res.status).toBe(404);
  });

  it("User without permission cannot soft-delete another user", async () => {
    // create a fresh user to attempt deletion
    const victim = await registerAndLogin("Victim", `victim+${unique}@test.com`);
    const attacker = await registerAndLogin("Attacker", `attacker+${unique}@test.com`);

    const res = await request(app)
      .delete(`/usuarios/${victim.id}`)
      .set("Authorization", `Bearer ${attacker.token}`);

    expect(res.status).toBe(403);
  });
});
