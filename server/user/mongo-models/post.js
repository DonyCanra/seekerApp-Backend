const { getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");

class Post {
  static postCollection() {
    return getDb().collection("posts");
  }

  static async findAll() {
    const postCollection = this.postCollection();
    return await postCollection.find().toArray();
  }

  static async findByPk(postId) {
    const postCollection = this.postCollection();
    return await postCollection
      .find({
        _id: new ObjectId(postId),
      })
      .toArray();
  }

  static async create({ title, username, profileImg, todos, description, BookmarkId, UserId }) {
    try {
      const postCollection = this.postCollection();
      const newPost = await postCollection.insertOne({
        title,
        username,
        profileImg,
        description,
        BookmarkId,
        todos,
        UserId,
        cloneCounter: 0,
      });
      return postCollection.findOne({
        _id: new ObjectId(newPost.insertedId),
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(postId, counter) {
    try {
      const postCollection = this.postCollection();
      console.log(postId,counter)
      const newCounter = counter + 1
      const updatedPost = await postCollection.updateOne(
        {
          _id: new ObjectId(postId),
        },
        {
          $set:{cloneCounter: newCounter,}
        }
      );
      return await postCollection.find({ _id: new ObjectId(postId) });
    } catch (error) {
      throw(error)
    }
  }

  static async destroy(postId) {
    try {
      const postCollection = this.postCollection();
      return await postCollection.deleteOne({
        _id: new ObjectId(postId),
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Post;
