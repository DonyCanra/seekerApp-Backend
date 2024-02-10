const Bookmark = require("../mongo-models/bookmark");
const Job = require("../mongo-models/job");
const Scrap = require("../mongo-models/scrap");

class BookmarkController {
  static async createBookmark(req, res, next) {
    try {
      const { id: UserId } = req.user;
      // console.log(UserId, "ini User Id")
      const { url, logo, jobTitle, companyName, companyLocation, salary, workExperience } = req.body;
      let detail;
      if (url.includes("kalibrr")) {
        // console.log("kalibrr")
        detail = await Scrap.kalibrrDetail(url);
      }
      if (url.includes("karir")) {
        // console.log("karir")
        detail = await Scrap.karirDetail(url);
      }
      if (url.includes("glints")) {
        // console.log("glints")
        detail = await Scrap.glintsDetail(url);
      }
      // console.log(detail)
      const jobDetail = await Job.create({
        url,
        logo,
        jobTitle,
        companyName,
        companyLocation,
        salary,
        workExperience,
        jobDesc: detail.jobDesc,
        minimumSkills: detail.minimumSkills,
      });
      const jobId = jobDetail._id;
      const job = await Job.findByPk(jobId);
      const bookmark = await Bookmark.create({
        UserId,
        jobId,
        customTitle: job.jobTitle,
      });
      res.status(201).json(bookmark);
    } catch (error) {
      next(error);
    }
  }

  static async updateBookmark(req, res, next) {
    try {
      const { bookmarkId, customTitle } = req.body;
      if (!bookmarkId) {
        throw {
          name: "CustomError",
          status: 400,
          message: "BookmarkId required",
        };
      }
      if (!customTitle) {
        throw {
          name: "CustomError",
          status: 400,
          message: "Custom Bookmark Title required",
        };
      }
      const [bookmark] = await Bookmark.findByPk(bookmarkId);
      if (!bookmark) {
        throw {
          name: "CustomError",
          status: 404,
          message: "Bookmark not found",
        };
      }
      // console.log(bookmark)
      const newBookmark = await Bookmark.update({ bookmarkId, customTitle });
      // console.log(newBookmark)
      if (!newBookmark) {
        throw {
          name: "CustomError",
          status: 405,
          message: "Failed update Bookmark Title",
        };
      }
      res.status(200).json({ message: "Success update bookmark title" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBookmark(req, res, next) {
    try {
      const { bookmarkId } = req.body;
      if (!bookmarkId) {
        throw {
          name: "CustomError",
          status: 400,
          message: "Bookmark Id is required",
        };
      }
      const bookmark = await Bookmark.findByPk(bookmarkId);
      console.log(bookmark)
      if (bookmark.length === 0) {
        throw {
          name: "CustomError",
          status: 404,
          message: "Bookmark not found",
        };
      }
      await Bookmark.destroy(bookmarkId);
      res.status(200).json({ message: "Success delete bookmark" });
    } catch (error) {
      next(error);
    }
  }

  static async readBookmark(req, res, next) {
    try {
      const { id: UserId } = req.user;
      const bookmarks = await Bookmark.findAll(UserId);
      res.status(200).json(bookmarks);
    } catch (error) {
      next(error);
    }
  }

  static async updateShareBookmark(req,res,next){
    try {
      const { bookmarkId } = req.body;
      const bookmark = await Bookmark.patch(bookmarkId)
      res.status(200).json(bookmark)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = BookmarkController;
