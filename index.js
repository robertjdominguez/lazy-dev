const summarizePR = require("./modules/openAI");
const runGit = require("./modules/github");
const automateTasks = require("./modules/todoist");
const sendEmail = require("./modules/sendReport");

const main = async () => {
  //   GitHub
  const gitOutput = await runGit();
  const summaries = await summarizePR(gitOutput);
  await automateTasks(summaries);
  await sendEmail(summaries);
};

main();
