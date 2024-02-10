const app = require("../app");
const request = require("supertest");
const { User } = require("../models");
const { sequelize } = require("../models");
const { SignToken } = require("../helpers/jwt");
const Scrap = require("../mongo-models/scrap");
const Job = require("../mongo-models/job");
const Bookmark = require("../mongo-models/bookmark");
const { queryInterface } = sequelize;
const { run, client, getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");
const Todo = require("../mongo-models/todo");
// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: "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",
// });
// const openai = new OpenAIApi();
// jest.mock('openai', () => ({
//   Configuration: jest.fn(),
//   OpenAIApi: jest.fn(() => ({
//     createCompletion:jest.fn()
//   })),
// }));
const openai = require('../config/openai')

const mockJobs = [
  {
    url: "https://glints.com/id/opportunities/jobs/marketing/e1a5948a-8430-4e77-8cb6-dd62179eeb1b?utm_referrer=explore",
    logo: "https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/14fb8b18b232b7133eb000b054ed52f9.jpg",
    jobTitle: "Marketing",
    companyName: "PT Jasa Boga Raya",
    companyLocation: "Babakan Madang, Kab. Bogor, Jawa Barat, Indonesia",
    salary: "IDR2.000.000 - 4.000.000",
  },
  {
    url: "https://glints.com/id/opportunities/jobs/marketing/e1a5948a-8430-4e77-8cb6-dd62179eeb1b?utm_referrer=explore",
    logo: "https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/14fb8b18b232b7133eb000b054ed52f9.jpg",
    jobTitle: "Marketing",
    companyName: "PT Jasa Boga Raya",
    companyLocation: "Babakan Madang, Kab. Bogor, Jawa Barat, Indonesia",
    salary: "IDR2.000.000 - 4.000.000",
  },
];

const mockDetail = {
  jobDesc: [
    "-\tDesign and create enticing 2D assets and motion graphics for KRIYA video contents.",
    "Create and deliver 2D animation and motion graphics in various media including social media, web and mobile.",
    "High level knowledge of Adobe Creative applications (Premiere Pro, After Effect, Photoshop, Illustrator).",
    "Collaborate with art and creative teams to understand content, project scope and objectives.",
    "Research and analyze best design techniques and solutions to create motion graphics.",
    "Assists in designing and creating storyboards.",
    "Participate in brainstorming session to share new design perspectives and ideas.",
    "Ensure compliance with company guidelines, deadlines, and design standards. \n\n",
  ],
  minimumSkills: [
    "Skills",
    "Graphic Design",
    "Adobe Illustrator",
    "Adobe After Effects",
    "Adobe Premiere Pro",
    "2D Animation",
    "Adobe Photoshop",
  ],
};
const mockErrMsg = { message: `Internal server error` };

const mockKalibrrJob = {
  url: "https://www.kalibrr.com/c/finaccel/jobs/158920/sr-ios-engineer",
  logo: "https://rec-data.kalibrr.com/logos/GL5U7AHLWUVEDQ7DPLLK-59db02a3.png",
  jobTitle: "Sr. iOS Engineer",
  companyName: "FinAccel",
  companyLocation: "South Jakarta, Indonesia",
  salary: "",
};
const mockGlintsJob = {
  url: "https://glints.com/id/opportunities/jobs/2d-animator/998ebe62-e632-410e-9474-c27377c57553?utm_referrer=explore",
  logo: "https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/67770578ad593d03c6bcc7c693666db9.png",
  jobTitle: "2D Animator",
  companyName: "Kriya People",
  companyLocation: "Tanah Abang, Jakarta Pusat, DKI Jakarta, Indonesia",
  salary: "IDR7.000.000",
};
const mockKarirJob = {
  url: "https://karir.com/opportunities/1385506",
  logo: "https://karir-production.nos.jkt-1.neo.id/logos/47/8790347/N5dc6590cd2575.jpg",
  jobTitle: "Web Developer - Full Stack | HIS, KiosK, Web Portal",
  companyName: "PT Terakorp Indonesia",
  companyLocation: "head office - Bandung",
  salary: "IDR 3.500.000 - 4.100.000",
};

let validToken;
const tester = {
  username: "tester",
  email: "tester@mail.com",
  password: "test123",
};

let deletedId = null;

beforeAll(async () => {
  try {
    await run("testDB");
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
    const res = await User.create(tester);
    const job = await Job.create({ ...mockGlintsJob, ...mockDetail });
    const bookmark = await Bookmark.create({UserId: res.id, jobId: new ObjectId(job._id), customTitle: job.jobTitle })
    const todo = await Todo.bulkInsert([{bookmarkId: bookmark._id, status: "false"}])
    deletedId = todo.insertedIds[0]
    console.log(deletedId)
    validToken = SignToken({ id: res.id });
  } catch (error) {
    console.log(error);
  }
}, 20000);

beforeEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  try {
    // await getDb().dropDatabase("testDB")
    await client.close();
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (error) {
    console.log(error);
  }
});


describe("TEST ENDPOINT /todos GET", () => {
  test("200 Success GET from database todos", (done) => {
    request(app) // ambil dari aapp
    .get("/todos/64c8bbc998946a16d609df87") // methood yang digunakan
        .set("access_token", validToken)
        .then((res) => {
          console.log(res)
          const { body, status } = res;
          expect(status).toBe(200);
          expect(body).toEqual(expect.any(Array));
          done();
        })
        .catch((err) => {
          done(err);
        });
      });
      test("404 not found GET todos by BookmarkId", (done) => {
        request(app)
        .get("/todos/64c9d1b776c3130bd3b23609")
        .set("access_token", validToken)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(404);
          expect(body).toHaveProperty("message", "todos not found");
          done();
        })
        .catch((err) => {
          done(err);
        });
      });
      test("500 not found GET todos by BookmarkId", (done) => {
        jest.spyOn(Todo,"findAll").mockRejectedValue("Internal Server Error")
        request(app)
        .get("/todos/64c9d1b776c3130bd3b23609")
        .set("access_token", validToken)
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
    
    describe("TEST ENDPOINT /todos POST", () => {
      test("201 Success POST to database todos", (done) => {
        jest.spyOn(openai, 'createCompletion').mockResolvedValue({data:{choices:[{text:`[
          {"task":"go to a boot camp"},
          {"task":"make a cv"}
        ]`}]}});
        // console.log(openai, "<<<<<<<<<<<<<<<<<<<<,,")
        // openai.createCompletion.mockResolvedValue({data:{choices:[{text:`[
        //   {"task":"go to a boot camp"},
        //   {"task":"make a cv"}
        // ]`}]}} );
        request(app) // ambil dari aapp
        .post("/todos/64c8bbc998946a16d609df87") // methood yang digunakan
        .set("access_token", validToken)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(201);
          expect(body).toHaveProperty("message", "Success added data");
          done();
        })
        .catch((err) => {
          done(err);
        });
      }, 15000);
      test("404 Not Found bookmark to POST todos", (done) => {
        request(app)
          .post("/todos/64c8bbc998946a16d609df89")
          .set("access_token", validToken)
          .then((res) => {
            const { body, status } = res;
            expect(status).toBe(404);
            expect(body).toHaveProperty("message", "bookmark not found");
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  describe("TEST ENDPOINT /todos PUT", () => {
    test("200 Success UPDATE status in todos", (done) => {
      request(app) // ambil dari aapp
        .patch(`/todos/${deletedId}`) // methood yang digunakan
        .send({ status: true })
        .set("access_token", validToken)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(200);
          expect(body).toHaveProperty("message", "todo has been updated");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    test("401 Not Found todo id to PUT todos should return todo not found ", (done) => {
        request(app)
          .patch("/todos/64c8bbc998946a16d609df89")
          .send({ status: true })
          .set("access_token", validToken)
          .then((res) => {
            const { body, status } = res;
            expect(status).toBe(404);
            expect(body).toHaveProperty("message", "todo not found");
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  describe("TEST ENDPOINT /todos DELETE", () => {
    test("200 Success DELETE todo in todos", (done) => {
      request(app) // ambil dari aapp
        .delete(`/todos/${deletedId}`) // methood yang digunakan
        .set("access_token", validToken)
        .then((res) => {
          const { body, status } = res;
          expect(status).toBe(200);
          expect(body).toHaveProperty("message", "todo has been deleted");
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    test("401 Not Found todo id to PUT todos should return todo not found ", (done) => {
        request(app)
          .delete(`/todos/64c8bbc998946a16d609df89`)
          .set("access_token", validToken)
          .then((res) => {
            const { body, status } = res;
            expect(status).toBe(404);
            expect(body).toHaveProperty("message", "todo not found");
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });