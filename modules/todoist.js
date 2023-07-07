require("dotenv").config();

const { TodoistApi } = require("@doist/todoist-api-typescript");

const api = new TodoistApi(process.env.TODOIST_API_KEY);

const addTask = async (task, id) => {
  const newTask = await api.addTask({
    content: task,
    projectId: `${id}`,
    dueString: "today",
  });
};

// get the correct project
const getWorkProject = async () => {
  const projects = await api.getProjects();
  const workProject = projects.find((p) => p.name === process.env.TODOIST_PROJECT);
  return workProject;
};

const automateTasks = async (summaries) => {
  const workProject = await getWorkProject();
  const bulletedText = summaries.forEach(async (summary) => {
    const regex = /^[-*](.+)$/gm;
    const matches = summary.content.match(regex);
    const tasks = matches;
    if (tasks && tasks.length > 0) {
      const title = summary.title.replace(/^##/, "");
      console.log(`📋 Adding ${tasks.length} tasks for PR ${title} to Todoist...`);
      const newTask = await api.addTask({
        content: title,
        projectId: `${workProject.id}`,
      });
      tasks.forEach(async (text) => {
        text = text.replace(/^[-*]/, "");
        await api.addTask({
          content: text,
          projectId: `${workProject.id}`,
          parentId: `${newTask.id}`,
        });
      });
    }
  });
};

module.exports = automateTasks;
