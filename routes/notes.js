const express = require('express');
const router = express.Router();
const fetchuser = require('../MiddleWare/fetchuser.js');
const Notes = require('../models/Notes.js');
const User = require('../models/User.js');
const { body, validationResult } = require('express-validator');


//ROUTE:1
// get all the Notes using GET: '/api/notes/fetchallnotes'.LOGIN REQUIRED

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({
            $or: [
                { user: req.user.id },
                { collaborators: req.user.id }
            ]
        });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error"); // this message is typed because data are sending to the user which is are deliver by the server
    }
})

//ROUTE:2
// Add a new Note using POST: '/api/notes/addnote'.LOGIN REQUIRED

router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid name').isLength({ min: 3 }),
    body('description', 'description must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        console.log(req.body);
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error"); // this message is typed because data are sending to the user which is are deliver by the server
    }
})

//ROUTE:3
// update the existing Note using PUT: '/api/notes/updatenote'.LOGIN REQUIRED

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    console.log("rb", req.body);
    const { title, description, tag } = req.body;
    try {

        // create a newNote object
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

        // find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id &&
            !note.collaborators.includes(req.user.id)) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal server error"); // it give error when mongodb will go down
    }
})

//ROUTE:4
// delete the existing Note using DELETE: '/api/notes/deletenote'.LOGIN REQUIRED

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        // find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        //Allow deletion if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal server error"); // it give error when mongodb will go down
    }
})

//    POST /api/notes/share/:id
//    Share a note with another user
router.post('/share/:id', fetchuser, async (req, res) => {
  try {
    const { email } = req.body;

    // Find the collaborator user
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the note
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Only owner can share
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not allowed" });
    }

    // Add collaborator if not already added
    if (!note.collaborators.includes(userToShare._id)) {
      note.collaborators.push(userToShare._id);
      await note.save();
    }

    res.json({ message: "Note shared successfully", note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;