const Bookmark = require("../mongo-models/bookmark")
const authorizationBookmark = async (req, res, next) => {
  try {
    const [bookmark] = await Bookmark.findByPk(req.body.bookmarkId)
    if (!bookmark) {
        throw {name: "CustomError", status: 404, message: "Bookmark not found"}
    }
    if(bookmark.UserId !== req.user.id){
        throw {name: "CustomError", status: 403, message: "You are not allowed"}
    }
    if (bookmark.isPost === true) {
      throw {
        name: "CustomError",
        status: 405,
        message: "Bookmark already been posted before",
      };
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authorizationBookmark;
