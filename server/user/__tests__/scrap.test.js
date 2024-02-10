const app = require("../app");
const request = require("supertest");
const { User, Profile } = require("../models");
const { SignToken } = require("../helpers/jwt");
const Scrap = require("../mongo-models/scrap");
const Job = require("../mongo-models/job");
const Bookmark = require("../mongo-models/bookmark");
const { run, client, getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");

const openai = require("../config/openai");

let validToken;
let validTokenNoProfile;
let validTokenBelumDiisi;
let bookmark;
let bookmarkPatch;
const tester = {
  username: "tester",
  email: "tester@mail.com",
  password: "test123",
};
const testerNoProfile = {
  username: "tester1",
  email: "tester1@mail.com",
  password: "test123",
};

const testerBelumDiisi = {
  username: "tester2",
  email: "tester2@mail.com",
  password: "test123",
};

const mockOpenAi = {
  data: {
    warning:
      "This model version is deprecated. Migrate before January 4, 2024 to avoid disruption of service. Learn more https://platform.openai.com/docs/deprecations",

    id: "cmpl-7j041Bbvd9T6JUn0j0eZIONfSY5Iw",

    object: "text_completion",

    created: 1690959361,

    model: "text-davinci-003",

    choices: [
      {
        text:
          "\n" +
          "\n" +
          "[\n" +
          "    {\n" +
          '        "jobRoles": "Software Developer"\n' +
          "    },\n" +
          "    {\n" +
          '        "jobRoles": "Web Developer"\n' +
          "    },\n" +
          "    {\n" +
          '        "jobRoles": "Data Scientist"\n' +
          "    }\n" +
          "]",

        index: 0,

        logprobs: null,

        finish_reason: "stop",
      },
    ],

    usage: { prompt_tokens: 54, completion_tokens: 56, total_tokens: 110 },
  },
};

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

beforeAll(async () => {
  try {
    await run("testDB");
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
    const res = await User.create(tester);
    const userBelumDiisi = await User.create(testerBelumDiisi);
    const userNoProfile = await User.create(testerNoProfile);
    await Profile.create({ UserId: userBelumDiisi.id });
    const profileId = await Profile.create({ UserId: res.id });
    const profile = await Profile.update(
      { aboutMe: "Saya seorang lulusan bootcamp hactiv8" },
      {
        where: {
          id: profileId.id,
        },
      }
    );
    const job = await Job.create({ ...mockGlintsJob, ...mockDetail });
    bookmark = await Bookmark.create({
      UserId: res.id,
      jobId: new ObjectId(job._id),
      customTitle: job.jobTitle,
    });
    bookmarkPatch = await Bookmark.create({
      UserId: res.id,
      jobId: new ObjectId(job._id),
      customTitle: job.jobTitle,
    });
    validToken = SignToken({ id: res.id });
    validTokenNoProfile = SignToken({ id: userNoProfile.id });
    validTokenBelumDiisi = SignToken({ id: userBelumDiisi.id });
  } catch (error) {
    console.log(error);
  }
}, 10000);

beforeEach(() => {
  jest.restoreAllMocks();
}, 10000);

afterAll(async () => {
  try {
    await getDb().dropDatabase("testDB");
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (error) {
    console.log(error);
  }
}, 10000);

describe("/fetchjobs manual with query and 3 job portal", () => {
  test("200 Success Fetch kalibrr should return array of object", (done) => {
    // Scrap.kalibrrUrl = jest.fn().mockResolvedValue(mockJobs);
    jest.spyOn(Scrap, "launchPuppeteer").mockResolvedValue(mockJobs);
    request(app)
      .post("/fetchjobskalibrr")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Array));
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("200 Success Fetch karir should return array of object", (done) => {
    jest.spyOn(Scrap, "launchPuppeteer").mockResolvedValue(mockJobs);
    request(app)
      .post("/fetchjobskarir")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Array));
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("200 Success Fetch glints should return array of object", (done) => {
    jest.spyOn(Scrap, "launchPuppeteer").mockResolvedValue(mockJobs);
    request(app)
      .post("/fetchjobsglints")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Array));
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("401 Error Fetch glints should return message Invalid Token", (done) => {
    request(app)
      .post("/fetchjobsglints")
      .send({ query: "frontend" })
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("401 Error Fetch kalibrr should return message Invalid Token", (done) => {
    request(app)
      .post("/fetchjobskalibrr")
      .send({ query: "frontend" })
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("401 Error Fetch karir should return message Invalid Token", (done) => {
    request(app)
      .post("/fetchjobskarir")
      .send({ query: "frontend" })
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("500 Error Fetch glints should return array of object", (done) => {
    jest.spyOn(Scrap, "launchPuppeteer").mockRejectedValue(mockJobs);
    request(app)
      .post("/fetchjobsglints")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("500 Error Fetch kalibrr should return array of object", (done) => {
    jest.spyOn(Scrap, "launchPuppeteer").mockRejectedValue(mockJobs);
    request(app)
      .post("/fetchjobskalibrr")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
  test("500 Error Fetch karir should return array of object", (done) => {
    jest.spyOn(Scrap, "launchPuppeteer").mockRejectedValue(mockJobs);
    request(app)
      .post("/fetchjobskarir")
      .send({ query: "frontend" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        // console.log(body);
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((e) => {
        done(e);
      });
  });
});

describe("TEST ENDPOINT /bookmarks POST", () => {
  test("200 Success POST Glints Job Bookmarks by UserId", (done) => {
    jest.spyOn(Scrap, "glintsDetail").mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockGlintsJob)
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(201);
        expect(body).toHaveProperty("UserId", 1);
        expect(body).toHaveProperty("jobId", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("200 Success POST Kalibrr Job Bookmarks by UserId", (done) => {
    Scrap.kalibrrDetail = jest.fn().mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockKalibrrJob)
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(201);
        expect(body).toHaveProperty("UserId", 1);
        expect(body).toHaveProperty("jobId", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("200 Success POST Karir Job Bookmarks by UserId", (done) => {
    Scrap.karirDetail = jest.fn().mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockKarirJob)
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(201);
        expect(body).toHaveProperty("UserId", 1);
        expect(body).toHaveProperty("jobId", expect.any(String));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Invalid Token Detail POST Karir Job Bookmarks by UserId", (done) => {
    Scrap.karirDetail = jest.fn().mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockKarirJob)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Invalid Token Detail POST Kalibrr Job Bookmarks by UserId", (done) => {
    Scrap.kalibrrDetail = jest.fn().mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockKalibrrJob)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Invalid Token Detail POST Glints Job Bookmarks by UserId", (done) => {
    Scrap.glintsDetail = jest.fn().mockResolvedValue(mockDetail);
    request(app)
      .post("/bookmarks")
      .send(mockKarirJob)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("TEST ENDPOINT /bookmarks UPDATE", () => {
  test("200 Success UPDATE Bookmarks by UserId", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ bookmarkId: bookmark._id, customTitle: "Test Custom Baru" })
      .set("access_token", validToken)
      .then((res) => {
        console.log(res);
        const { body, status } = res;
        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Success update bookmark title");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request UPDATE Bookmarks by UserId should return BookmarkId required", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ customTitle: "Test Custom Baru" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "BookmarkId required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request UPDATE Bookmarks by UserId should return CustomTitle required", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ bookmarkId: "Test Bookmark Id" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Custom Bookmark Title required"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Unauthorized UPDATE Bookmarks by UserId should return Invalid Token", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ bookmarkId: "Test Bookmark Id" })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("404 Not Found UPDATE Bookmarks by UserId should return Bookmark Not Found", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ bookmarkId: "a23456789101", customTitle: "Test Custom Baru" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Bookmark not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("500 Internal UPDATE Bookmarks by UserId should return Failed Update", (done) => {
    request(app)
      .put("/bookmarks")
      .send({ bookmarkId: "Test Bookmark Id", customTitle: "Test Custom Baru" })
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

describe("TEST ENDPOINT /bookmarks DELETE", () => {
  test("200 Success DELETE Bookmarks by BookmarkId", (done) => {
    request(app)
      .delete("/bookmarks")
      .send({ bookmarkId: bookmark._id })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Success delete bookmark");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request DELETE Bookmarks by BookmarkId", (done) => {
    request(app)
      .delete("/bookmarks")
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Bookmark Id is required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Unauthorized DELETE Bookmarks by BookmarkId", (done) => {
    request(app)
      .delete("/bookmarks")
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("404 Not Found DELETE Bookmarks by BookmarkId", (done) => {
    request(app)
      .delete("/bookmarks")
      .send({ bookmarkId: "64c9cda9c87040fe7de026db" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        console.log(body);
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Bookmark not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe("TEST ENDPOINT /bookmarks GET", () => {
  test("200 Success GET Bookmarks by UserId", (done) => {
    request(app)
      .get("/bookmarks")
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Array));
        done();
      })
      .catch((err) => {
        console.log(err);
      });
  });
  test("401 Unauthorized GET Bookmarks by UserId", (done) => {
    request(app)
      .get("/bookmarks")
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

describe("TEST ENDPOINT /bookmarks PATCH", ()=>{
  test("200 Success PATCH Bookmarks by BookmarkId",(done)=>{
    request(app)
      .patch("/bookmarks")
      .set("access_token", validToken)
      .send({ bookmarkId: bookmarkPatch._id })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Object));
        done();
      })
      .catch((err) => {
        done(err);
      });
  })
  test("401 Unauthorized PATCH Bookmarks by BookmarkId should return Invalid Token",(done)=>{
    request(app)
      .patch("/bookmarks")
      .send({ bookmarkId: "64c8bbc998946a16d609df87" })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401)
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  })
  test("403 Forbidden PATCH Bookmarks by BookmarkId should return You are not allowed", (done) => {
    request(app)
      .patch("/bookmarks")
      .send({ bookmarkId: "64c8d923c8500cd612427c35" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(403);
        expect(body).toHaveProperty("message", "You are not allowed");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("404 Forbidden PATCH Bookmarks by BookmarkId should return Bookmark not found", (done) => {
    request(app)
      .patch("/bookmarks")
      .send({ bookmarkId: "64c8d923c8500cd612427c3a" })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Bookmark not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("405 Method Not Allowed PATCH Bookmarks by BookmarkId should return Bookmark already been posted before", (done) => {
    request(app)
      .patch("/bookmarks")
      .send({ bookmarkId: bookmarkPatch._id })
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(405);
        expect(body).toHaveProperty(
          "message",
          "Bookmark already been posted before"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
})

describe("TEST ENDPOINT /generatejobroles", () => {
  test("200 Success generatejobroles should return Object with key roles", (done) => {
    jest.spyOn(openai, "createCompletion").mockResolvedValue(mockOpenAi);
    request(app)
      .get("/generatejobroles")
      .set("access_token", validToken)
      .then((res) => {
        const { body, status } = res;
        console.log(body);
        expect(status).toBe(200);
        expect(body).toEqual(expect.any(Object));
        expect(body).toHaveProperty("roles", expect.any(Array));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request generatejobroles should return Profile Data not enough to generate Job Roles", (done) => {
    jest.spyOn(openai, "createCompletion").mockResolvedValue(mockOpenAi);
    request(app)
      .get("/generatejobroles")
      .set("access_token", validTokenBelumDiisi)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Profile Data not enough to generate Job Roles"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Unauthorized generatejobroles should return Invalid Token", (done) => {
    jest.spyOn(openai, "createCompletion").mockResolvedValue(mockOpenAi);
    request(app)
      .get("/generatejobroles")
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid Token");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("404 Not Found generatejobroles should return Profile not found", (done) => {
    request(app)
      .get("/generatejobroles")
      .set("access_token", validTokenNoProfile)
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Profile not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
