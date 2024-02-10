const app = require("../app");
const request = require("supertest");
const { User, Profile } = require("../models");
const { SignToken } = require("../helpers/jwt");
const { run, client, getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");
const Post = require("../mongo-models/post");

const testerPost = {
  email: "testerPost@mail.com",
  password: "test123",
  username: "testerPost",
};
const testerClone = {
  email: "testerClone@mail.com",
  password: "test123",
  username: "testerClone",
};
let postToken;
let cloneToken;

let postBookmark = "64c8bbc998946a16d609df87";
let cloneBookmark = "64c8bd907aefd65bb5d25e8c";
let noTodosBookmark = "64c8d5e6bd2948008047f872";

let postIdToBeClone = "64cb550e8e5c69e30ae7daec";

const mockGlintsJob = {
  url: "https://glints.com/id/opportunities/jobs/2d-animator/998ebe62-e632-410e-9474-c27377c57553?utm_referrer=explore",
  logo: "https://images.glints.com/unsafe/glints-dashboard.s3.amazonaws.com/company-logo/67770578ad593d03c6bcc7c693666db9.png",
  jobTitle: "2D Animator",
  companyName: "Kriya People",
  companyLocation: "Tanah Abang, Jakarta Pusat, DKI Jakarta, Indonesia",
  salary: "IDR7.000.000",
};

const mockKalibrrJob = {
  url: "https://www.kalibrr.com/c/finaccel/jobs/158920/sr-ios-engineer",
  logo: "https://rec-data.kalibrr.com/logos/GL5U7AHLWUVEDQ7DPLLK-59db02a3.png",
  jobTitle: "Sr. iOS Engineer",
  companyName: "FinAccel",
  companyLocation: "South Jakarta, Indonesia",
  salary: "",
};

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

beforeAll(async () => {
  try {
    await run("testDB");
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
    const userPost = await User.create(testerPost);
    const userClone = await User.create(testerClone);
    const profilePost = await Profile.create({ UserId: userPost.id });
    postToken = SignToken({ id: userPost.id });
    cloneToken = SignToken({ id: userClone.id });
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  try {
    getDb()
      .collection("bookmarks")
      .updateOne(
        {
          _id: new ObjectId(postBookmark),
        },
        {
          $set: {
            isPost: false,
          },
        }
      );
    getDb()
      .collection("todos")
      .deleteMany(
        {
          bookmarkId: new ObjectId(cloneBookmark),
        },
        {
          $set: {
            isPost: false,
          },
        }
      );
    await User.destroy({
      restartIdentity: true,
      truncate: true,
      cascade: true,
    });
  } catch (error) {
    console.log(error);
  } 
});

describe("TEST ENDPOINT CREATE POST BOOKMARK", () => {
  test("200 get Post Should return Object post", (done) => {
    request(app)
      .get("/posts")
      .set("access_token", postToken)
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
  test("500 get Post Should return Object post", (done) => {
    jest.spyOn(Post,"findAll").mockRejectedValue("Internal Server Error")
    request(app)
      .get("/posts")
      .set("access_token", postToken)
      .then((res) => {
        console.log(res)
        const { body, status } = res;
        expect(status).toBe(500);
        expect(body).toHaveProperty("message", "Internal server error");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
}, 10000);



describe("TEST ENDPOINT CREATE POST BOOKMARK", () => {
  test("201 Create Post Should return Object post", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        description: "New Post Description",
        bookmarkId: postBookmark,
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(201);
        expect(body).toEqual(expect.any(Object));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request Post Should return Post Title is required", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        description: "New Post Description",
        bookmarkId: postBookmark,
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Post Title is required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request Post Should return Post description is required", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        bookmarkId: postBookmark,
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Post description is required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request Post Should return Post BookmarkId is required", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        description: "New Post Description",
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "BookmarkId is required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("401 Unauthorized Post Should return Invalid Token", (done) => {
    request(app)
      .post("/posts")
      .send({
        title: "New Post Title",
        description: "New Post Description",
        bookmarkId: postBookmark,
      })
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
  test("404 Not Found Post Should return Post Bookmark not found", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        description: "New Post Description",
        bookmarkId: "64c8bbc998946a16d609df8a",
      })
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
  test("404 Not Found Post Should return Post ToDos not found in Bookmark", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        description: "New Post Description",
        bookmarkId: noTodosBookmark,
      })
      .then((res) => {
        const { body, status } = res;
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "ToDos not found in Bookmark");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("405 Method not Allowed Should return Bookmark already been posted before", (done) => {
    request(app)
      .post("/posts")
      .set("access_token", postToken)
      .send({
        title: "New Post Title",
        description: "New Post Description",
        bookmarkId: postBookmark,
      })
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
}, 10000);

describe("TEST ENDPOINT HANDLE CLONE BOOKMARK", () => {
  test("200 Success clone Todos to bookmark", (done) => {
    request(app)
      .post("/clonetodos")
      .send({
        postId: postIdToBeClone,
        toBookmarkId: cloneBookmark,
      })
      .set("access_token", cloneToken)
      .then((res) => {
        const { status, body } = res;
        expect(status).toBe(200);
        expect(body).toHaveProperty(
          "message",
          "Success add cloned ToDos to Bookmark"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  }, 10000);
  test("400 Bad Request clone Todos to bookmark", (done) => {
    request(app)
      .post("/clonetodos")
      .send({
        toBookmarkId: noTodosBookmark,
      })
      .set("access_token", cloneToken)
      .then((res) => {
        const { status, body } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "PostId is required");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("400 Bad Request clone Todos to bookmark", (done) => {
    request(app)
      .post("/clonetodos")
      .send({
        postId: postIdToBeClone,
      })
      .set("access_token", cloneToken)
      .then((res) => {
        const { status, body } = res;
        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Clone to BookmarkId is required"
        );
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
  test("404 Not Found clone Todos to bookmark", (done) => {
    request(app)
      .post("/clonetodos")
      .send({
        postId: postIdToBeClone,
        toBookmarkId: "64c8d820e90dd136b6e7604a",
      })
      .set("access_token", cloneToken)
      .then((res) => {
        const { status, body } = res;
        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Bookmark not found");
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
