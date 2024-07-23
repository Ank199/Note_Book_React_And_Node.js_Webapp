const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

const Notes = require("../models/Notes");

// Route 1 :Get All the notes : Get "/api/notes/fetchallnotes" Login requred
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
  
});


// Route 2 : Add new notes : post "/api/notes/addnote" Login requred
router.post(
  "/addnote",  fetchuser,
  [
    body("title", "enter Valid title at least 3 char").isLength({ min: 3 }),

    body(
      "description",
      "enter valid description at least 5 charecters"
    ).isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there are errors , return Bad request and the error

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route 3: Update notes: PUT "/api/notes/updatenote/:id" Login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // Create new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    // Check if the user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // Update the note
    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// Route 4: Delete notes: Delete "/api/notes/deletenote/:id" Login required

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    // Check if the user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // delete the note
    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({"success":'Note has been deleted'});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
  
});


module.exports = router;
