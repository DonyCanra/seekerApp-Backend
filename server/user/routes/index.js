const express = require("express");
const UserController = require("../controllers/userController");
const BookmarkController = require("../controllers/bookmark");
const JobController = require("../controllers/job");
const authentication = require("../middlewares/authentication");
const PostController = require("../controllers/postController");
const TodoController = require("../controllers/todo");
const authorizationBookmark = require("../middlewares/authorization");
const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.use(authentication);

router.get("/users", UserController.findUser);
router.patch("/users", UserController.upgradeToken);
router.delete("/users/:id", UserController.deleteUser);
router.post("/users/payment-midtrans", UserController.paymentWithMidtrans);

router.get("/people", UserController.getProfile);
router.get("/people/:id", UserController.getProfileById);
router.put("/people/:id", UserController.updateProfile);

router.get("/educations", UserController.allEducation);
router.post("/educations", UserController.createEducation);
router.get("/educations/:id", UserController.getEducationById);
router.put("/educations/:id", UserController.updateEducation);
router.delete("/educations/:id", UserController.deleteEducation);

router.patch("/cv-generate", UserController.CreateCV);

router.get("/work-experience", UserController.allWorkExperience);
router.post("/work-experience", UserController.createWorkExperience);
router.get("/work-experience/:id", UserController.getWorkExperienceById);
router.put("/work-experience/:id", UserController.updateWorkExperience);
router.delete("/work-experience/:id", UserController.deleteWorkExperience);

router.post("/fetchjobskalibrr", JobController.fetchJobs);
router.post("/fetchjobsglints", JobController.fetchJobGlints);
router.post("/fetchjobskarir", JobController.fetchJobKarir);
router.get("/generatejobroles", JobController.generateRoles)
router.get("/bookmarks", BookmarkController.readBookmark);
router.post("/bookmarks", BookmarkController.createBookmark);
router.patch("/bookmarks",authorizationBookmark, BookmarkController.updateShareBookmark)
router.delete("/bookmarks", BookmarkController.deleteBookmark);
router.put("/bookmarks", BookmarkController.updateBookmark);

router.get("/posts", PostController.allPost);
router.post("/posts", PostController.createPost);
router.post("/clonetodos", PostController.handleClone);
router.delete("/posts", PostController.deletePost);

router.get("/todos/:BookmarkId", TodoController.getTodo);
router.post("/todos/:BookmarkId", TodoController.createTodo);
router.patch("/todos/:id", TodoController.updateTodo);
router.delete("/todos/:id", TodoController.deleteTodo);

module.exports = router;
