const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "Ankitisgoodb$oy";

var jwt = require("jsonwebtoken");

var fetchuser =require('../middleware/fetchuser');

// Route :1 create a user using post : "/api/auth/createuser" no-login require
router.post(
  "/createuser",
  [
    body("name", "enter Valid name at least 3 char").isLength({ min: 3 }),
    body("email", "enter valid email").isEmail(),
    body("password", "enter valid password at least 5 words").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {

    let success = false;
    //if there are errors , return Bad request and the error

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, message: "email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });

    const data = {
      user: {
        id: user.id,
      },
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
   
    console.log(authtoken);
    success = true;
    res.json({ success, authtoken });
  }
);

module.exports = router;


// Route 2 : Authenticate user using post : "/api/auth/login" No login require

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    
let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false
      return res.status(400).json({success, errors: errors.array() });
    }
    
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        success=false;
        return res.status(400).json({ success, message: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false
        return res.status(400).json({success , message: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      console.log(success,authtoken);
      res.json({ success,authtoken });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);


// Route 3: Get user details using POST: "/api/auth/getuser" - Login required
router.post(
  "/getuser",fetchuser, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

module.exports = router;
