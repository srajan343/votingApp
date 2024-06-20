const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtMiddleware, generateToken} = require('./../jwt');

//signup 
router.post('/signup', async(req,res) => {
    try{
      const data = req.body // req body contain user data
  
      const newuser = new User(data);
      const response = await newuser.save();
      console.log('data saved');

      const payload = {
        id: response.id
      }
      console.log(JSON.stringify(payload));
      const token = generateToken(payload);
      console.log("Token is: ", token);
      res.status(200).json({response: response, token: token});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  
  })

  // login route
  router.post('/login', async(req,res) => {
    try{
      // Extract username and password from request body
      const{AdharCardNumber, password} = req.body;

       // Find the user by username
       const user = await User.findOne({AdharCardNumber: AdharCardNumber});

      // If user does not exist or password does not match, return error
      if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({error: 'Invalid username or password' });
      }

      //generate token
      const payload = {
        id : user.id,
      }
      const token = generateToken(payload);

        // return token as response
      res.json({token})

    }catch(err){
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });

    }
  });

  // Profile route
router.get('/profile', jwtMiddleware, async (req, res) => {
  try{
      const userData = req.user;
      const userId = userData.id;
      const user = await User.findById(userId);
      res.status(200).json({user});
  }catch(err){
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

    //for updation of password we use put
  router.put('/profile/password', jwtMiddleware, async(req,res) => {
      try{
        const userId = req.user.id; // Extract the id from the token 
        const {currentPassword, newPassword} = req.body;

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
          return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
      }

       // Find the user by userID
       const user = await User.findById(userId);

       // If user does not exist or password does not match, return error
       if (!user || !(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ error: 'Invalid current password' });
    }
    // update the user's password 
          user.password = newPassword;
          await user.save();
          console.log('password updated');
          res.status(200).json({ message: 'Password updated successfully' });

      }catch(err){
          console.log(err);
          res.status(500).json({error : 'internal server error'});
      }
    })

    module.exports = router;