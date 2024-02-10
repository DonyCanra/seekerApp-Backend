const puppeteer = require("puppeteer");

/* istanbul ignore next */
class Scrap {
  static async launchPuppeteer(url, callback) {
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: "./dataBrowser",
    });
    try {
      const page = await browser.newPage();
      await page.goto(url);
      let urls = await page.evaluate(callback);
      return urls;
    } catch (e) {
      console.log(e);
    } finally {
      browser.close();
    }
  }

  static async glintsUrl(query) {
    try {
      const url = `https://glints.com/id/opportunities/jobs/explore?keyword=${query}&country=ID&locationName=All+Cities%2FProvinces`;
      let urls = await this.launchPuppeteer(url, () => {
        let results = [];
        let items = document.querySelectorAll("div.compact_job_card > div");
        items.forEach((item) => {
          results.push({
            url: "https://glints.com" + item.children[0].getAttribute("href"),
            logo: item.children[1].children[0].children[0].children[0].src,
            jobTitle:
              item.children[1].children[0].children[1].children[0].innerText,
            companyName:
              item.children[1].children[0].children[1].children[1].innerText,
            companyLocation: item.children[1].children[1].children[0].innerText,
            salary: item.children[1].children[1].children[1].innerText,
          });
        });
        return results;
      });

      return urls;
    } catch (e) {
      throw e;
    }
  }
  static async glintsDetail(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          userDataDir: "./dataBrowser",
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("main");
        let detail = await page.evaluate(() => {
          return {
            minimumSkills: document
              .getElementsByClassName("kGxrri")[0]
              .innerText.split("\n"),
            jobDesc: document
              .getElementsByClassName("public-DraftEditor-content")[0]
              .innerText.split("\n-\t"),
          };
        });
        browser.close();
        return resolve(detail);
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async kalibrrUrl(query) {
    try {
      const url = `https://kalibrr.com/id-ID/job-board/te/${query}/si/monthly/co/Indonesia/1`;
      let urls = await this.launchPuppeteer(url, () => {
        let results = [];
        let items = document.querySelectorAll("div.css-1b4vug6");
        if (!items) {
          return [];
        }
        items.forEach((item) => {
          const jobDesc = item.children[3].innerText.split("\n");
          results.push({
            url:
              "https://www.kalibrr.com" +
              item.children[1].children[0].children[0].getAttribute("href"),
            logo: item.children[0].children[0].children[0].src,
            jobTitle: item.children[1].innerText,
            companyName: jobDesc[0],
            companyLocation: jobDesc[1],
            salary: jobDesc[3],
          });
        });
        return results;
      });
      return urls;
    } catch (e) {
      throw e;
    }
  }

  static async kalibrrDetail(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          userDataDir: "./dataBrowser",
        });
        const page = await browser.newPage();
        await page.goto(url);
        let detail = await page.evaluate(() => {
          const jobDesc = document
            .getElementsByClassName("k-mb-4 css-q0v7oq")[0]
            .innerText.split("\n")
            .slice(1);
          const minimumSkills = document
            .getElementsByClassName("k-mb-4 css-q0v7oq")[1]
            .innerText.split("\n");
          return {
            jobDesc,
            minimumSkills,
          };
        });
        browser.close();
        return resolve(detail);
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async karirUrl(query) {
    try {
      const url = `https://karir.com/search?q=${query}&sort_order=urgent_job&job_function_ids=&industry_ids=&degree_ids=&major_ids=&location_ids=&location_id=&location=&salary_lower=0&salary_upper=100000000&page=0&grid=list`;
      let urls = await this.launchPuppeteer(url, () => {
        let results = [];
        let items = document.querySelectorAll("li.opportunity");
        if (items.length === 0) {
          return results;
        }
        items.forEach((item) => {
          results.push({
            url: item.children[0].children[2].children[0].href,
            logo: item.children[0].children[0].children[0].src,
            jobTitle: item.children[0].children[1].children[0]?.innerText,
            companyName: item.children[0].children[1].children[1]?.innerText,
            companyLocation:
              item.children[0].children[1].children[3].children[1]?.innerText,
            salary:
              item.children[0].children[1].children[3].children[2]?.innerText,
          });
        });
        return results;
      });
      return urls;
    } catch (e) {
      return reject(e);
    }
  }

  static async karirDetail(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          userDataDir: "./dataBrowser",
        });
        const page = await browser.newPage();
        await page.goto(url);
        let urls = await page.evaluate(() => {
          return {
            minimumSkills: document
              .getElementsByClassName("b-matte__content")[0]
              .innerText.split("\n"),
            jobDesc: document
              .getElementsByClassName("b-matte__content")[1]
              .innerText.split("\n"),
          };
        });
        browser.close();
        return resolve(urls);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = Scrap;
