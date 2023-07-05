require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generateText = (pr) => {
  if (pr.comments.length === 0) {
    return "";
  } else {
    return `## ${pr.title}\n\n${pr.comments.join("\n")}`;
  }
};

const prompts = [
  {
    role: "reviewer",
    prompt:
      "I expect two components in this analysis: first, provide me a paragraph-format summary based on the comments. This summary should be general, in third-person, and not go into technical detail. The summary should be no longer than three sentences. Second, I expect you to provide me a bulleted list of action items I need to take which relate to documentation or docs changes. These must bullets, not numbers. This last piece is critical, as it will help me prioritize my work: ",
  },
  {
    role: "author",
    prompt:
      "I opened this PR. I already have context on what it's about. I expect two components in this analysis: first, provide me a paragraph-format summary based on the comments. This summary should be general, in third-person, and not go into technical detail. The summary should be no longer than three sentences. Second, I expect you to provide me a bulleted list of action items I need to take. These must bullets, not numbers. This last piece is critical, as it will help me prioritize my work: ",
  },
  {
    role: "buddy",
    prompt:
      "Another member of my team is the reviewer of this PR. I don't need to take any action, but I'd like a paragraph-format summary of what's been discussed so I can be informed and help if needed. I don't want any suggestions for how to reply: ",
  },
];

const getPrompt = (role) => {
  const chatGPTRole = prompts.find((prompt) => prompt.role === role);
  return chatGPTRole.prompt;
};

const summarizePR = async (prList) => {
  let summaries = [];
  for (const pr of prList) {
    if (pr.comments.length === 0) {
      console.log(`❌ Skipping ${pr.title}`);
      continue;
    }
    let text = generateText(pr);
    // remove the ## title
    text = generateText(pr).replace(/##.*/g, "");
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `${getPrompt(pr.role)}${text}`,
        },
      ],
    });
    summaries.push({
      title: pr.title,
      content: chatCompletion.data.choices[0].message.content,
      url: pr.url,
      role: pr.role,
    });
    console.log(`✅ Summarized ${pr.title}`);
  }
  return summaries;
};

module.exports = summarizePR;
