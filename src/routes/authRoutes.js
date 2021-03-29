const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

///////////////////////////////////////       SIGNUP       ///////////////////////////////////////

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, "secret");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

///////////////////////////////////////       SIGNIN       ///////////////////////////////////////

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "Invalid password or email" });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "secret");
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: "Invalid password or email" });
  }
});

///////////////////////////////////////       UPDATE USER       ///////////////////////////////////////

router.patch("/user/:id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const result = await User.findByIdAndUpdate(id, updates, { new: true });
    res.send(result);
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

///////////////////////////////////////       DELETE USER       ///////////////////////////////////////

router.delete("/user/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const result = await User.findByIdAndDelete(id);
    res.send("User Deleted Successfully");
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
