const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class Search {
  static async RecomendationJobAi(profile) {
    try {
      if (!profile) {
        throw new Error("Input your profile");
      }
      const prompt = `
      show list title job, show only 3 in JSON stringify format. Here is the data:
  ${profile}
  `;
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 1000,
      });
      const completion = response.data.choices[0].text;
      const jobsByAi = JSON.parse(completion);
      return jobsByAi;
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Search;
