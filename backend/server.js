const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = 5001; 


app.use(cors()); 
app.use(express.json());


const courses = {}; 
const userProgress = {}; 


const authMiddleware = (req, res, next) => {
 
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== 'secret-key-123') {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid API Key" });
  }
  next();
};

app.use(authMiddleware);


app.post('/courses', (req, res) => {
  const { id, title, lessons } = req.body;

  
  if (!id || !title || !Array.isArray(lessons)) {
    return res.status(400).json({ error: "Invalid payload. Required: id, title, lessons (array)." });
  }
  if (courses[id]) {
    return res.status(409).json({ error: "Course ID already exists." });
  }

  courses[id] = { id, title, lessons };
  console.log(`[Created] Course: ${title} (${id})`);
  res.status(201).json({ message: "Course created successfully", course: courses[id] });
});


app.get('/courses/:id', (req, res) => {
  const course = courses[req.params.id];
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json(course);
});


app.post('/courses/:id/progress', (req, res) => {
  const courseId = req.params.id;
  const { userId, lessonId } = req.body;

  if (!courses[courseId]) {
    return res.status(404).json({ error: "Course not found" });
  }
  if (!userId || !lessonId) {
    return res.status(400).json({ error: "userId and lessonId are required." });
  }

  
  if (!userProgress[userId]) userProgress[userId] = {};
  if (!userProgress[userId][courseId]) userProgress[userId][courseId] = [];

  
  if (!userProgress[userId][courseId].includes(lessonId)) {
    userProgress[userId][courseId].push(lessonId);
  }

  res.json({ 
    message: "Progress updated", 
    completedLessons: userProgress[userId][courseId] 
  });
});


app.get('/courses/:id/progress/:userId', (req, res) => {
  const { id: courseId, userId } = req.params;

  if (!courses[courseId]) {
    return res.status(404).json({ error: "Course not found" });
  }

  const completed = userProgress[userId]?.[courseId] || [];
  const total = courses[courseId].lessons.length;
  
  const score = total === 0 ? 0 : Math.round((completed.length / total) * 100);

  res.json({
    courseId,
    userId,
    progressCount: `${completed.length}/${total}`,
    scorePercent: `${score}%`,
    completedLessonIds: completed
  });
});


app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
  console.log(`Auth Header required: 'x-api-key: secret-key-123'`);
});