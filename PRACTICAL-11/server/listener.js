const taskEvents = require("./event");

console.log("✅ Listener.js loaded successfully");

taskEvents.on("task-created", async (task) => {
  const handlerStart = new Date();

  console.log("=================================");
  console.log("TASK CREATED EVENT RECEIVED");
  console.log("Task Title:", task.title);
  console.log("Assigned User:", task.assignedUser || "Not assigned");
  console.log("Handler Start:", handlerStart.toISOString());

  await new Promise((resolve) => setTimeout(resolve, 100));

  const handlerEnd = new Date();

  console.log("Notification logged successfully");
  console.log("Handler End:", handlerEnd.toISOString());
  console.log("=================================");
});