const router = require('express').Router();
const { isValidObjectId } = require('mongoose');
const { Note } = require('../../models');
const { authMiddleware } = require('../../utils/auth');

// Require authentication for all note routes
router.use(authMiddleware);

// GET /api/notes - Get notes owned by the logged-in user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({
      message: 'Unable to retrieve notes.',
    });
  }
});

// POST /api/notes - Create a note for the logged-in user
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
      user: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({
      message: 'Unable to create note.',
    });
  }
});

// PUT /api/notes/:id - Update an owned note
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid note ID.',
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: 'No note found with this id!',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'User is not authorized to update this note.',
      });
    }

    const { title, content } = req.body;

    if (title !== undefined) {
      note.title = title;
    }

    if (content !== undefined) {
      note.content = content;
    }

    await note.save();

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({
      message: 'Unable to update note.',
    });
  }
});

// DELETE /api/notes/:id - Delete an owned note
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid note ID.',
      });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: 'No note found with this id!',
      });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'User is not authorized to delete this note.',
      });
    }

    await note.deleteOne();

    res.status(200).json({
      message: 'Note deleted!',
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to delete note.',
    });
  }
});

module.exports = router;
