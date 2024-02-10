const Todo = require("../mongo-models/todo");
const Bookmark = require("../mongo-models/bookmark");
const { User, Profile, Education, WorkExperience } = require("../models");
const { ObjectId } = require("mongodb");
const openai = require('../config/openai')

class TodoController {
  static async getTodo(req, res, next) {
    try {
      const { BookmarkId } = req.params;

      const todos = await Todo.findAll(BookmarkId);
      if(todos.length === 0){
        return res.status(404).json({message: "todos not found"})
      }
      console.log(todos)
      res.status(200).json(todos);
    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  static async createTodo(req, res, next) {
    try {
      // const { BookmarkId } = req.params;
      // const bookmark = await Bookmark.findByPk(BookmarkId);
      // console.log(bookmark);
      // const job = {
      //   jobTitle: "Backend Dev",
      //   minimumReq:
      //     "1 tahun pengalaman, dapat menggunakan node js, rest api, express, mongodb, sequelize",
      //   location: "Jakarta",
      //   companyName: "PT. Putus Asa",
      // };

      const { BookmarkId } = req.params;

      
      console.log(BookmarkId)
      const data = await Bookmark.findByPk(BookmarkId);
      
      if(data.length === 0){
        res.status(404).json({message: "bookmark not found"})
      }
      
      const prompt = `
      saya adalah pencari kerja, dan belum mendapatkan pekerjaan, buatkan 10 todo list dalam bahasa Indonesia, agar bisa diterima kerja sebagai ${data[0].Job[0].jobTitle} di perusahaan ${data[0].Job[0].companyName} dengan deskripsi lowongan sebagai berikut:
      Minimum skills
        ${data[0].Job[0].minimumSkills}
      Buat dengan format array of object dengan contoh sebagai berikut:
[ { "task": "todo list 1"}, { "task": "todo list 2} ]
      `;
      console.log(prompt, "<<<")
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 3000,
      });
      
      console.log(response, '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{')
      const completion = response.data.choices[0].text;
      console.log(completion+ "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
      let todosdata = JSON.parse(completion);
      
      todosdata = todosdata.map((el) => {
        el.status = false
        el.bookmarkId = new ObjectId(BookmarkId)
        return el
      })

      const user = await User.findOne({
        where: {
          id: req.user.id,
        },
      });

      const edit = await User.update(
        {
          token : user.token - 1
        },
        { where: { id: req.user.id } }
      );

      const todos = await Todo.bulkInsert(todosdata);
      res.status(201).json({message:"Success added data", todosdata});
    } catch (error) {
      console.log(error)
      next(error);
    }
  }
  
  static async deleteTodo(req, res, next) {
    try {
      const { id } = req.params;
      const todos = await Todo.destroyOne(id);
      console.log(todos, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
      if(todos.deletedCount === 0) {
        res.status(404).json({message : "todo not found"});
      }
      res.status(200).json({message : "todo has been deleted"});
    } catch (error) {
      console.log(error, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,")
      next(error);
    }
  }

    static async updateTodo(req, res, next) {
      try {
        const { id } = req.params;
        
        const get = Todo.findOne(id)
        let send;

        if(get.status === true){
          send = false
        } else {
          send = true
        }

        const todos = await Todo.patch(id ,send);
        console.log(todos)
        if(todos.matchedCount === 0) {
          res.status(404).json({message : "todo not found"});
        }
        res.status(200).json({message : "todo has been updated"});
      } catch (error) {
        next(error);
      }
    }  
}

module.exports = TodoController;
