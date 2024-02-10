const { checkPassword } = require("../helpers/bcrypt");
const { SignToken } = require("../helpers/jwt");
const { User, Profile, Education, WorkExperience } = require("../models");
const midtransClient = require("midtrans-client");
const nodemailer = require("nodemailer");
const openai = require("../config/openai");
const ImageKit = require("imagekit");
var MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();
const pdf = require("html-pdf");
const fs = require("fs");

const imagekit = new ImageKit({
  publicKey: "public_xGgQNRtEKGfzExm4/foBvEv/Fvg=",
  privateKey: "private_XrOu3Mf6b8JYujUYCXGuUZeZwkw=",
  urlEndpoint: "https://ik.imagekit.io/uzlygq8o2",
});

// 170,188-189,202-203,246-247,268-269,294-295,309-310,335-336,354-355,376-377,402-403,417-418,443-444,462-463

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const newUser = await User.create({ username, email, password });

      await Profile.create({
        UserId: newUser.id,
      });

      res.status(201).json({ message: `Register Success` });
    } catch (err) {
      next(err);
    }
  }
  static async login(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!password)
        return res.status(400).json({ message: `password is required` });

      if (username) {
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(400).json({ message: `Invalid User` });
        const isPassword = checkPassword(password, user.password);
        if (!isPassword)
          return res.status(400).json({ message: `Invalid Password` });

        res.status(200).json({ access_token: SignToken({ id: user.id }) });
      } else if (email) {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: `Invalid User` });

        const isPassword = checkPassword(password, user.password);
        if (!isPassword)
          return res.status(400).json({ message: `Invalid Password` });

        res.status(200).json({ access_token: SignToken({ id: user.id }) });
      } else {
        return res.status(400).json({ message: `username/email is required` });
      }
    } catch (err) {
      next(err);
    }
  }

  //Authentication

  //Users`
  static async findUser(req, res, next) {
    try {
      const data = await User.findOne({
        where: { id: req.user.id },
        include: {
          model: Profile,
          include: [Education, WorkExperience],
        },
      });

      if (!data) throw { name: "NotFound" };

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async upgradeToken(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: `Token is required` });

      const user = await User.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (!user) throw { name: "NotFound" };

      await User.increment({ token: token }, { where: { id: user.id } });

      res.status(200).json({ message: `Add token success` });
    } catch (err) {
      next(err);
    }
  }

  static async paymentWithMidtrans(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: `Token is required` });

      let price = 0;

      if (token == 30) {
        price = 25000;
      } else if (token == 20) {
        price = 18000;
      } else if (token == 10) {
        price = 9000;
      } else {
        price = token * 1000;
      }

      const user = await User.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (!user) throw { name: NotFound };

      // Create Snap API instance
      let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: Math.floor(100000 * Math.random() + 800000),
          gross_amount: price,
        },
        credit_card: {
          secure: true,
        },
        transactions_details: {
          email: user.email,
        },
      };

      const midtransToken = await snap.createTransaction(parameter);
      // console.log(midtransToken, "<<<");
      // const transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   user: "smtp.gmail.com",
      //   port: 465,
      //   secure: true,
      //   auth: {
      //     user: "official.seeker.helper@gmail.com",
      //     pass: "rtmyxknfwhfxymso",
      //   },
      // });

      // const mailOptions = {
      //   from: "official.seeker.helper@gmail.com",
      //   to: `${user.email}`,
      //   subject: "Purchase Success",
      //   text: "Thank you for your purchase, more token has been added to your account",
      // };

      // transporter.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //     console.log(error + ">>>>>>>>>>>>>>>>>>>>>>>>");
      //   } else {
      //     console.log("Email sent: " + info.response + "!!!!!!!!!!!!!!!!");
      //     // do something useful
      //   }
      // });

      res.status(200).json(midtransToken);
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      console.log(id)

      const user = await User.findByPk(+id);
      if (!user) throw { name: "NotFound" }; //

      await User.destroy({
        where: { id },
        cascade: true,
      });

      res.status(200).json({ message: `User has been deleted` });
    } catch (err) {
      next(err); //
    }
  }

  // Data Person
  static async getProfile(req, res, next) {
    try {
      const data = await Profile.findAll({
        include: [User],
      });

      res.status(200).json(data);
    } catch (err) {
      next(err); //
    }
  }

  static async getProfileById(req, res, next) {
    try {
      const data = await Profile.findOne({
        where: { id: req.params.id },
        include: [Education, WorkExperience],
      });

      if (!data) throw { name: "NotFound" };

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
  static async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const {
        fullName,
        aboutMe,
        sayName,
        birthDate,
        gender,
        phoneNumber,
        domisili,
        photoUrl,
      } = req.body;

      const findData = await Profile.findByPk(+id);
      if (!findData) throw { name: "NotFound" };

      await Profile.update(
        {
          fullName,
          aboutMe,
          sayName,
          birthDate,
          gender,
          phoneNumber,
          domisili,
          photoUrl,
        },
        { where: { id } }
      );

      res.status(200).json({ message: `Data has been updated` });
    } catch (err) {
      next(err); //
    }
  }

  // Education
  static async allEducation(req, res, next) {
    try {
      const profile = await Profile.findOne({
        where: {
          UserId: req.user.id,
        },
      });

      const data = await Education.findAll({
        where: {
          ProfileId: profile.id,
        },
      });

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async createEducation(req, res, next) {
    const {
      educationalLevel,
      College,
      Major,
      startEducation,
      graduatedEducation,
    } = req.body;

    try {
      const profile = await Profile.findOne({
        where: {
          UserId: req.user.id,
        },
      });

      await Education.create({
        educationalLevel,
        College,
        Major,
        startEducation,
        graduatedEducation,
        ProfileId: profile.id,
      });

      res.status(201).json({ message: `create education success` });
    } catch (err) {
      next(err); //
    }
  }

  static async getEducationById(req, res, next) {
    try {
      const data = await Education.findOne({
        where: { id: req.params.id },
      });

      if (!data) throw { name: "NotFound" };

      res.status(200).json(data);
    } catch (err) {
      next(err); //
    }
  }

  static async updateEducation(req, res, next) {
    try {
      const { id } = req.params;
      const {
        educationalLevel,
        College,
        Major,
        startEducation,
        graduatedEducation,
      } = req.body;

      const findData = await Education.findByPk(+id);
      if (!findData) throw { name: "NotFound" };

      await Education.update(
        {
          educationalLevel,
          College,
          Major,
          startEducation,
          graduatedEducation,
        },
        { where: { id } }
      );

      res.status(200).json({ message: `Data has been updated` });
    } catch (err) {
      next(err);
    }
  }

  static async deleteEducation(req, res, next) {
    try {
      const { id } = req.params;

      const education = await Education.findByPk(+id);
      if (!education) throw { name: "NotFound" };

      await Education.destroy({
        where: { id },
        cascade: true,
      });

      res.status(200).json({ message: `Education has been deleted` });
    } catch (err) {
      next(err); //
    }
  }

  // Work Experience
  static async allWorkExperience(req, res, next) {
    try {
      const profile = await Profile.findOne({
        where: {
          UserId: req.user.id,
        },
      });

      const data = await WorkExperience.findAll({
        where: {
          ProfileId: profile.id,
        },
      });

      res.status(200).json(data);
    } catch (err) {
      next(err); //
    }
  }

  static async createWorkExperience(req, res, next) {
    try {
      const { company, position, type, startWork, stopWork } = req.body;
      console.log(req.user.id);
      const profile = await Profile.findOne({
        where: {
          UserId: req.user.id,
        },
      });
      // console.log (profile)
      await WorkExperience.create({
        company,
        position,
        type,
        startWork,
        stopWork,
        ProfileId: profile.id,
      });

      res.status(201).json({ message: `create Work Experience success` });
    } catch (err) {
      next(err); //
    }
  }

  static async getWorkExperienceById(req, res, next) {
    try {
      const data = await WorkExperience.findOne({
        where: { id: req.params.id },
      });

      if (!data) throw { name: "NotFound" };

      res.status(200).json(data);
    } catch (err) {
      next(err); //
    }
  }

  static async updateWorkExperience(req, res, next) {
    try {
      const { id } = req.params;
      const { company, position, type, startWork, stopWork } = req.body;

      const findData = await WorkExperience.findByPk(+id);
      if (!findData) throw { name: "NotFound" };

      await WorkExperience.update(
        {
          company,
          position,
          type,
          startWork,
          stopWork,
        },
        { where: { id } }
      );

      res.status(200).json({ message: `Data has been updated` });
    } catch (err) {
      next(err); //
    }
  }

  static async deleteWorkExperience(req, res, next) {
    try {
      const { id } = req.params;

      const work = await WorkExperience.findByPk(+id);
      if (!work) throw { name: "NotFound" };

      await WorkExperience.destroy({
        where: { id },
        cascade: true,
      });

      res.status(200).json({ message: `Work Experience has been deleted` });
    } catch (err) {
      next(err);
      //
    }
  }

  static async CreateCV(req, res, next) {
    try {

      const dataProfile = await Profile.findOne({
        where: { UserId: req.user.id },
      });

      if (!dataProfile) throw { name: "NotFound" };

      const dataUser = await User.findOne({
        where: { id: req.user.id },
      });

      if (!dataUser) throw { name: "NotFound" };

      const dataExperience = await WorkExperience.findAll({
        where: { ProfileId: dataProfile.id },
      });

      if (!dataExperience) throw { name: "NotFound" };

      const dataEducation = await Education.findAll({
        where: { ProfileId: dataProfile.id },
      });

      if (!dataEducation) throw { name: "NotFound" };

      const pastWork = dataExperience.map((el) => {
        return `my work experiences, i was working at ${el.company} from years ${el.startWork} untill ${el.stopWork}, my role was ${el.position} and i was a ${el.type} worker`;
      });

      const eduBackground = dataEducation.map((el) => {
        return `my education background, i was graduate from ${el.College} from years ${el.startEducation} untill ${el.graduatedEducation}, my major was ${el.Major} and my degree is ${el.educationalLevel}`;
      });

      console.log(pastWork, "<<<<<past work");
      console.log(eduBackground, "<<<<<edu");

      const prompt = `Please create an ATS-friendly CV in markdown template with this data. 
      My name: name - ${dataProfile.fullName},
      Gender - ${dataProfile.gender},
      Phone number - ${dataProfile.phoneNumber},
      Email - ${dataUser.email},
      About me - ${dataProfile.aboutMe}.
      
      My work experiences:
      - I have worked at ${pastWork.toString()}.
      
      Education background:
      - I graduated from ${eduBackground.toString()}.
      
      Please add any additional information that you think is needed.
      
      Work Experience Description:
      - Add a description of my work experience here.
      
      Major Description:
      - Add a description about my major here.
      
      Skills:
      - Add SKILL section based on the "About Me" information.
      
      Summary:
      - Add a summary section based on the "About Me" information.
      
      Please provide the CV format so I can easily copy it. My data type was an array of objects, please make sure you read it one by one.
      `;
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 1000,
      });

      console.log(prompt);

      const dataCV = response.data.choices[0].text;

      let file = md.render(dataCV);

      console.log(
        file,
        "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,,"
      );
      let options = { format: "A4" };
      let html = `<div style="font-family:sans-serif; margin:10mm"> ${file} <style> h2{border-bottom: 1px solid black} </style></div>`;

      pdf
        .create(html, options)
        .toFile(
          `./CVGenerated${req.user.id}.pdf`,
          async function (err, resultpdf) {
            if (err) return console.log(err);
            const fileData = fs.readFileSync(resultpdf.filename);
            console.log(resultpdf);
            let result = await imagekit.upload({
              file: fileData,
              fileName: `CVGenerated${req.user.id}.pdf`,
            });

            await Profile.update(
              {
                CV: result.url,
              },
              { where: { id: req.user.id } }
            );

            res.status(200).json({ message: `Success added data` });
          }
        );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
