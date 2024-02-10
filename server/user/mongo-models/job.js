const { getDb } = require("../config/mongo");
const { ObjectId } = require("mongodb");

class Job {
  static jobCollection() {
    return getDb().collection("jobs");
  }

  // static async findAll() {
  //   const jobCollection = this.jobCollection();
  //   return await jobCollection.find().toArray();
  // }

  static async findByPk(jobId) {
    const jobCollection = this.jobCollection();
    return await jobCollection.findOne({
      _id: new ObjectId(jobId),
    });
  }

  static async create({
    url,
    logo,
    jobTitle,
    companyName,
    companyLocation,
    salary,
    workExperience,
    jobDesc,
    minimumSkills
  }) {
    try {
        const jobCollection =  this.jobCollection()
        const newJob = await jobCollection.insertOne({
          url,
          logo,
          jobTitle,
          companyName,
          companyLocation,
          salary,
          workExperience,
          jobDesc,
          minimumSkills,
        });
        return await jobCollection.findOne({
          _id: new ObjectId(newJob.insertedId),
        });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Job;