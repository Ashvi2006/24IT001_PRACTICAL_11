const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const NodeCache = require('node-cache');
const eventEmitter = require('../event');

const auth = require('../middleware/auth');
const { taskValidationRules, validate } = require('../middleware/validate');

// In-Memory Cache
const taskCache = new NodeCache({
  stdTTL: 60
});

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    // Check cache
    const cachedTasks = taskCache.get('allTasks');

    if (cachedTasks) {
      console.log('Cache HIT - Returning tasks from memory');
      return res.json(cachedTasks);
    }

    console.log('Cache MISS - Fetching tasks from MongoDB');

    const tasks = await Task.find().sort({ createdAt: -1 });

    // Store tasks in cache
    taskCache.set('allTasks', tasks);

    console.log('Tasks stored in cache');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: 'Server error fetching tasks',
      error: error.message
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', taskValidationRules, validate, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const task = new Task({
      title,
      description,
      priority
    });

    const savedTask = await task.save();

    // Invalidate cache
    taskCache.del('allTasks');

    console.log('Cache invalidated after CREATE');

    // Emit event
    eventEmitter.emit('task-created', savedTask);

    console.log('Event emitted: task-created');

    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Server error creating task',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', taskValidationRules, validate, async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      completed
    } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        priority,
        completed
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Invalidate cache
    taskCache.del('allTasks');

    console.log('Cache invalidated after UPDATE');

    // Emit event
    eventEmitter.emit('task-updated', task);

    console.log('Event emitted: task-updated');

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Server error updating task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Invalidate cache
    taskCache.del('allTasks');

    console.log('Cache invalidated after DELETE');

    // Emit event
    eventEmitter.emit('task-deleted', task);

    console.log('Event emitted: task-deleted');

    res.json({
      message: 'Task deleted successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error deleting task',
      error: error.message
    });
  }
});

module.exports = router;



