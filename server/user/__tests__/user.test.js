const { User, Profile, Education, WorkExperience } = require("../models");
const { hashPassword } = require("../helpers/bcrypt");
const { describe, test, expect } = require("@jest/globals");
const request = require("supertest");
const models = require("../models");
const app = require("../app");
const openai = require('../config/openai')

async function bulkInsertUsers() {
  await User.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await Profile.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await Education.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await WorkExperience.destroy({
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });

  await User.bulkCreate([
    {
      username: "users",
      email: "users@gmail.com",
      password: hashPassword("123"),
    },
    {
      username: "users1",
      email: "users1@gmail.com",
      password: hashPassword("123"),
    },
  ]);
  await Profile.bulkCreate([
    {
      fullName: "none",
      aboutMe: "none",
      sayName: "none",
      birthDate: "none",
      gender: "none",
      phoneNumber: "none",
      domisili: "none",
      photoUrl: "none",
      CV: "none",
      UserId: 2,
    },
  ]);
  await Education.bulkCreate([
    {
      educationalLevel: "none",
      College: "none",
      Major: "none",
      startEducation: "none",
      graduatedEducation: "none",
      ProfileId: 1,
    },
  ]);
  await WorkExperience.bulkCreate([
    {
      company: "none",
      position: "none",
      type: "none",
      startWork: "none",
      stopWork: "none",
      ProfileId: 1,
    },
  ]);
}
let access_token = "";

beforeAll(async function () {
  await bulkInsertUsers();
  const response = await request(app).post("/login").send({ username: "users1", email: "users1@gmail.com", password: "123" });
  access_token = response.body.access_token;
});

beforeEach(() => {
  jest.restoreAllMocks();
});

afterAll(async function () {
  await models.sequelize.close();
});

describe("Users", function () {
  describe("Register Test", function () {
    test("Status (201)", async function () {
      const response = await request(app).post("/register").send({ username: "test", email: "test@gmail.com", password: "123" });
      expect(response.status).toEqual(201);
    });
    test("Status (400) ", async function () {
      const response = await request(app).post("/register").send({ email: "test1@gmail.com", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Username is required");
    });
    test("Status (400) ", async function () {
      const response = await request(app).post("/register").send({ username: "test1", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Email is required");
    });
    test("Status (400) ", async function () {
      const response = await request(app).post("/register").send({ username: "test1", email: "test1@gmail.com" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Password is required");
    });
    test("Status (400) ", async function () {
      const response = await request(app).post("/register").send({ username: "", email: "test1@gmail.com", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Username is required");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/register").send({ username: "test1", email: "", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Email is required");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/register").send({ username: "test1", email: "test1@gmail.com", password: "" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Password is required");
    });
    test("Status (401) ", async function () {
      const response = await request(app).post("/register").send({ username: "test", email: "test1@gmail.com", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Username must be unique");
    });
    test("Status (401) ", async function () {
      const response = await request(app).post("/register").send({ username: "test1", email: "test@gmail.com", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Email must be unique");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/register").send({ username: "test1", email: "test", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Format is wrong");
    });
  });

  describe("Login Test", function () {
    test("Status (200)", async function () {
      const response = await request(app).post("/login").send({ username: "users1", email: "users1@gmail.com", password: "123" });
      expect(response.status).toEqual(200);
    });
    test("Status (200)", async function () {
      const response = await request(app).post("/login").send({ username: "users1", password: "123" });
      expect(response.status).toEqual(200);
    });
    test("Status (200)", async function () {
      const response = await request(app).post("/login").send({ email: "users1@gmail.com", password: "123" });
      expect(response.status).toEqual(200);
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/login").send({ username: "users10", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid User");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/login").send({ username: "users1", password: "1234" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid Password");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/login").send({ email: "users1@mail.com", password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid User");
    });
    test("Status (400)", async function () {
      const response = await request(app).post("/login").send({ email: "users1@gmail.com", password: "1234" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Invalid Password");
    });

    test("Status (400)", async function () {
      const response = await request(app).post("/login").send({ password: "123" });
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("username/email is required");
    });
  });

  describe("Users test", function () {
    // GET USER
    test("GET /users success with access token", async function () {
      const response = await request(app).get("/users").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body).toHaveProperty("username");
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("password");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("Profile");
    });
    test("GET /users/ fail because without access token", async function () {
      const response = await request(app).get("/users");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /users/ fail because invalid access token", async function () {
      const response = await request(app)
        .get("/users")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(User,"findAll").mockRejectedValue("Internal Server Error")
      request(app)
      .get("/users")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    // POST USER
    test("post /midtrans with req user id", async function () {
      const response = await request(app).post("/users/payment-midtrans").send({ token: 10 }).set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
    });
    test("post /midtrans with req user id", async function () {
      const response = await request(app).post("/users/payment-midtrans").send({ token: 10 });
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("post /midtrans with req user id invalid access token", async function () {
      const response = await request(app)
        .post("/users/payment-midtrans")
        .send({ token: 10 })
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("post /payment-midtrans fail because no token", async function () {
      const response = await request(app).post("/users/payment-midtrans").set("access_token", access_token);
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Token is required");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(User,"findOne").mockRejectedValue("Internal Server Error")
      request(app)
      .post("/users/payment-midtrans")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    //PATCH USER
    test("patch /users with req user id", async function () {
      const response = await request(app).patch("/users").send({ token: 10 }).set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Add token success");
    });
    test("patch /users with req user id", async function () {
      const response = await request(app).patch("/users").send({ token: 10 });
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("patch /users with req user id invalid access token", async function () {
      const response = await request(app)
        .patch("/users")
        .send({ token: 10 })
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("patch /users with req user id", async function () {
      const response = await request(app).patch("/users").set("access_token", access_token);
      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual("Token is required");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(User,"findOne").mockRejectedValue("Internal Server Error")
      request(app)
      .patch("/users")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });

    //DELETE USER
    test("delete /users with id", async function () {
      const response = await request(app).delete("/users/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("User has been deleted");
    });
    test("delete /users with id", async function () {
      const response = await request(app).delete("/users/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("delete /users with id invalid access token", async function () {
      const response = await request(app)
        .delete("/users/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("delete /users with invalid id", async function () {
      const response = await request(app).delete("/users/1000").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(User,"findByPk").mockRejectedValue("Internal Server Error")
      request(app)
      .delete("/users/1")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe("Main Entity test", function () {
    // GET PROFILE
    test("GET /people success with access token", async function () {
      const response = await request(app).get("/people").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body[0]).toHaveProperty("fullName");
      expect(response.body[0]).toHaveProperty("aboutMe");
      expect(response.body[0]).toHaveProperty("sayName");
      expect(response.body[0]).toHaveProperty("birthDate");
      expect(response.body[0]).toHaveProperty("gender");
      expect(response.body[0]).toHaveProperty("phoneNumber");
      expect(response.body[0]).toHaveProperty("domisili");
      expect(response.body[0]).toHaveProperty("photoUrl");
      expect(response.body[0]).toHaveProperty("CV");
      expect(response.body[0]).toHaveProperty("UserId");
    });

    test("GET /people/ without access token ", async function () {
      const response = await request(app).get("/people");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /people/ invalid access token ", async function () {
      const response = await request(app)
        .get("/people")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    //GET PROFILE ID
    test("GET /people success by id params with access token", async function () {
      const response = await request(app).get("/people/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      // console.log(response.body);
      expect(typeof response.body).toEqual("object");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("fullName");
      expect(response.body).toHaveProperty("aboutMe");
      expect(response.body).toHaveProperty("sayName");
      expect(response.body).toHaveProperty("birthDate");
      expect(response.body).toHaveProperty("gender");
      expect(response.body).toHaveProperty("phoneNumber");
      expect(response.body).toHaveProperty("domisili");
      expect(response.body).toHaveProperty("photoUrl");
      expect(response.body).toHaveProperty("CV");
      expect(response.body).toHaveProperty("UserId");
    });

    test("GET /people/ fail id params invalid ", async function () {
      const response = await request(app).get("/people/1000").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("GET /people/ fail id params invalid without access token ", async function () {
      const response = await request(app).get("/people/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /people/ fail id params invalid access token ", async function () {
      const response = await request(app)
        .get("/people/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    //PUT PROFILE
    test("put /people with id", async function () {
      const response = await request(app).put("/people/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Data has been updated");
    });
    test("put /people with invalid id", async function () {
      const response = await request(app).put("/people/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("put /people with id", async function () {
      const response = await request(app).put("/people/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("put /people with id invalid access token", async function () {
      const response = await request(app)
        .put("/people/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(Profile,"findByPk").mockRejectedValue("Internal Server Error")
      request(app)
      .put("/people/1")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe("education test", function () {
    // GET EDUCATION
    test("GET /educations showlist", async function () {
      const response = await request(app).get("/educations").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("educationalLevel");
      expect(response.body[0]).toHaveProperty("College");
      expect(response.body[0]).toHaveProperty("Major");
      expect(response.body[0]).toHaveProperty("startEducation");
      expect(response.body[0]).toHaveProperty("graduatedEducation");
      expect(response.body[0]).toHaveProperty("ProfileId");
    });
    test("GET /educations fail showlist because without access token", async function () {
      const response = await request(app).get("/educations");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /educations fail showlist because invalid access token", async function () {
      const response = await request(app)
        .get("/educations")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // GET EDUCATIONS ID
    test("GET /educations showlist by id", async function () {
      const response = await request(app).get("/educations/1").set("access_token", access_token);

      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("educationalLevel");
      expect(response.body).toHaveProperty("College");
      expect(response.body).toHaveProperty("Major");
      expect(response.body).toHaveProperty("startEducation");
      expect(response.body).toHaveProperty("graduatedEducation");
      expect(response.body).toHaveProperty("ProfileId");
    });

    test("GET /educations fail because invalid id", async function () {
      const response = await request(app).get("/educations/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("GET /educations fail because without access token", async function () {
      const response = await request(app).get("/educations/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /educations fail because invalid access token", async function () {
      const response = await request(app)
        .get("/educations")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // POST EDUCATIONS
    test("post /educations with req user id", async function () {
      const response = await request(app).post("/educations").set("access_token", access_token);
      expect(response.status).toEqual(201);
      expect(typeof response.body).toEqual("object");
    });
    test("post /educations fail create because no access token", async function () {
      const response = await request(app).post("/educations");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("post /educations fail create because invalid access token", async function () {
      const response = await request(app)
        .post("/educations")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // PUT EDUCATIONS
    test("put /educations with id", async function () {
      const response = await request(app).put("/educations/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Data has been updated");
    });
    test("put /educations with invalid id", async function () {
      const response = await request(app).put("/educations/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("put /educations with id without acceess token", async function () {
      const response = await request(app).put("/educations/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("put /educations with id invalid acceess token", async function () {
      const response = await request(app)
        .put("/educations/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // DELETE EDUCATIONS
    test("delete /educations with req user id", async function () {
      const response = await request(app).delete("/educations/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Education has been deleted");
    });
    test("delete /educations with invalid id", async function () {
      const response = await request(app).delete("/educations/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("delete /educations with req user id without access token", async function () {
      const response = await request(app).delete("/educations/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("delete /educations with req user id invalid access token", async function () {
      const response = await request(app)
        .delete("/educations/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("500 PATCH Internal server error", (done) => {
      jest.spyOn(Education,"findAll").mockRejectedValue("Internal Server Error")
      request(app)
      .get("/educations/1")
      .set("access_token", access_token)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
    });
  });

  describe("work-experience test", function () {
    // GET WORK-EXPERIENCE
    test("GET /work-experience showlist", async function () {
      const response = await request(app).get("/work-experience").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("company");
      expect(response.body[0]).toHaveProperty("position");
      expect(response.body[0]).toHaveProperty("type");
      expect(response.body[0]).toHaveProperty("startWork");
      expect(response.body[0]).toHaveProperty("stopWork");
      expect(response.body[0]).toHaveProperty("ProfileId");
    });
    test("GET /work-experience fail  because invalid access token", async function () {
      const response = await request(app)
        .get("/work-experience")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /work-experience fail  because without access token", async function () {
      const response = await request(app).get("/work-experience");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // GET WORK-EXPERIENCE ID
    test("GET /work-experience showlist by id", async function () {
      const response = await request(app).get("/work-experience/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("company");
      expect(response.body).toHaveProperty("position");
      expect(response.body).toHaveProperty("type");
      expect(response.body).toHaveProperty("startWork");
      expect(response.body).toHaveProperty("stopWork");
      expect(response.body).toHaveProperty("ProfileId");
    });
    test("GET /work-experience fail  because invalid token", async function () {
      const response = await request(app).get("/work-experience/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("GET /work-experience fail  because invalid access token", async function () {
      const response = await request(app)
        .get("/work-experience/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("GET /work-experience fail  because without access token", async function () {
      const response = await request(app).get("/work-experience/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // POST WORK EXPERIENCE
    test("post /work-experience with req user id", async function () {
      const response = await request(app).post("/work-experience").set("access_token", access_token);
      expect(response.status).toEqual(201);
      expect(typeof response.body).toEqual("object");
    });

    test("post /work-experience fail create because no access token", async function () {
      const response = await request(app).post("/work-experience");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("post /work-experience fail create because invalid access token", async function () {
      const response = await request(app)
        .post("/work-experience")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // PUT EXPERIENCE
    test("put /work-experience with id", async function () {
      const response = await request(app).put("/work-experience/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Data has been updated");
    });
    test("put /work-experience with id", async function () {
      const response = await request(app).put("/work-experience/100").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("put /work-experience with id without access token", async function () {
      const response = await request(app).put("/work-experience/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("put /work-experience with id invalid access token", async function () {
      const response = await request(app)
        .put("/work-experience/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });

    // DELETE WORK EXPERIENCE
    test("delete /work-experience with req user id", async function () {
      const response = await request(app).delete("/work-experience/1").set("access_token", access_token);
      expect(response.status).toEqual(200);
      expect(typeof response.body).toEqual("object");
      expect(response.body.message).toEqual("Work Experience has been deleted");
    });
    test("delete /work-experience with req user id", async function () {
      const response = await request(app).delete("/work-experience/1").set("access_token", access_token);
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual("Not found");
    });
    test("delete /work-experience with req user id without access token", async function () {
      const response = await request(app).delete("/work-experience/1");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
    test("delete /work-experience with req user id invalid access token", async function () {
      const response = await request(app)
        .delete("/work-experience/1")
        .set("access_token", access_token + "xxx");
      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual("Invalid Token");
    });
  });
  test("500 PATCH Internal server error", (done) => {
    jest.spyOn(WorkExperience,"findAll").mockRejectedValue("Internal Server Error")
    request(app)
    .get("/work-experience/1")
    .set("access_token", access_token)
    .then((res) => {
      const { body, status } = res;
      expect(status).toBe(500);
      expect(body).toHaveProperty("message", "Internal server error");
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});

describe ("TEST ENDPOINT / PACTH", () => {
  test("200 Success POST to database todos", (done) => {
    jest.spyOn(openai, 'createCompletion').mockResolvedValue({data:{choices:[{text:`
    <h2>Doni Canra Rofika</h2>
    <p><strong>Gender:</strong> Male | <strong>Phone number:</strong> 082224034729 | <strong>Email:</strong> donycanra@gmail.com</p>
    <h3>About Me</h3>
    `}]}});
    // console.log(openai, "<<<<<<<<<<<<<<<<<<<<,,")
    // openai.createCompletion.mockResolvedValue({data:{choices:[{text:`[
    //   {"task":"go to a boot camp"},
    //   {"task":"make a cv"}
    // ]`}]}} );
    request(app) // ambil dari aapp
    .patch("/cv-generate") // methood yang digunakan
    .set("access_token", access_token)
    .then((res) => {
      const { body, status } = res;
      expect(status).toBe(200);
      expect(body).toHaveProperty("message", "Success added data");
      done();
    })
    .catch((err) => {
      done(err);
    });
  }, 30000);
  test("500 PATCH Internal server error", (done) => {
    jest.spyOn(Profile,"findOne").mockRejectedValue("Internal Server Error")
    request(app)
    .patch("/cv-generate")
    .set("access_token", access_token)
    .then((res) => {
      const { body, status } = res;
      expect(status).toBe(500);
      expect(body).toHaveProperty("message", "Internal server error");
      done();
    })
    .catch((err) => {
      done(err);
    });
  });
});