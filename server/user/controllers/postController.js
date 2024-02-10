const Post = require("../mongo-models/post");
const Bookmark = require("../mongo-models/bookmark");
const TodoList = require("../mongo-models/todo");
const { User, Profile } = require("../models");
const { ObjectId } = require("mongodb");

class PostController {
  static async allPost(req, res, next) {
    try {
      const { id: UserId } = req.user;
      const posts = await Post.findAll(UserId);
      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  }

  static async createPost(req, res, next) {
    try {
      const { id: UserId } = req.user;

      const { title, description, bookmarkId } = req.body;
      if (!title) {
        throw {
          name: "CustomError",
          status: 400,
          message: "Post Title is required",
        };
      }
      if (!description) {
        throw {
          name: "CustomError",
          status: 400,
          message: "Post description is required",
        };
      }
      if (!bookmarkId) {
        throw {
          name: "CustomError",
          status: 400,
          message: "BookmarkId is required",
        };
      }
      const [bookmark] = await Bookmark.findByPk(bookmarkId);
      if (!bookmark)
        throw {
          name: "CustomError",
          status: 404,
          message: "Bookmark not found",
        };

      const todos = await TodoList.findAll(bookmarkId);
      if (todos.length === 0) {
        throw {
          name: "CustomError",
          status: 404,
          message: "ToDos not found in Bookmark",
        };
      }
      const user = await Profile.findOne({
        where: {
          UserId,
        },
        include: [User],
      });
      const checkPost = await Bookmark.patch(bookmarkId);
      console.log(checkPost)
      const post = await Post.create({
        title,
        username: user.User.username,
        profileImg: user.photoUrl,
        description,
        BookmarkId: bookmarkId,
        todos: todos,
        UserId,
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  static async handleClone(req, res, next) {
    try {
      const { postId, toBookmarkId } = req.body;
      if (!postId) {
        throw {
          name: "CustomError",
          status: 400,
          message: "PostId is required",
        };
      }
      if (!toBookmarkId) {
        throw {
          name: "CustomError",
          status: 400,
          message: "Clone to BookmarkId is required",
        };
      }
      const [post] = await Post.findByPk(postId);
      // console.log(post)
      if (!post) {
        throw { name: "CustomError", status: 404, message: "Post not found" };
      }
      const [bookmark] = await Bookmark.findByPk(toBookmarkId);
      if (!bookmark) {
        throw {
          name: "CustomError",
          status: 404,
          message: "Bookmark not found",
        };
      }
      let newTodos = post.todos.map((todo) => {
        todo.bookmarkId = new ObjectId(toBookmarkId) 
        todo.status = false
        delete todo._id
        return todo;
      });
      // console.log(newTodos)
      await TodoList.bulkInsert(newTodos);
      const updatedPost = await Post.update(postId, post.cloneCounter);
      res.status(200).json({ message: `Success add cloned ToDos to Bookmark` });
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req, res, next) {
    try {
      const { postId } = req.params;
      const post = await Post.findByPk(postId);
      if (!post) throw { name: "NotFound" };

      await Post.destroy(postId);
      res.status(200).json({ message: "Success delete post" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;
