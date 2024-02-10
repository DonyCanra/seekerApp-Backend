const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class Generator {
  static async generateJobRecommend(profile) {
    try {
      const prompt = `Berikan rekomendasi pekerjaan untuk saya. Batasi 3 rekomendasi pekerjaan saja
      dan buat dalam format JSON. Berikut data diri saya:
      ${profile}`
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

module.exports = Generator;
