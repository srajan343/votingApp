const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const {jwtMiddleware, generateToken} = require('./../jwt');

const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        if(user.role === 'admin'){
            return true;
        }
    }catch(err){
        return false;
    }
}

// post route to add a candidate

router.post('/', jwtMiddleware, async(req,res) => {
    try{
      if(! (await checkAdminRole(req.user.id))){
        return res.status(403).json({message: 'user is not admin'});
      }

      const data = req.body // req body contain user data
  
      const newCandidate = new Candidate(data);
      const response = await newCandidate.save();
      console.log('data saved');
      res.status(200).json({response: response});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
    }
  
  })


    //for updation of candidate details
    router.put('/:candidateID', jwtMiddleware, async (req, res)=>{
        try{
            if(!checkAdminRole(req.user.id))
                return res.status(403).json({message: 'user does not have admin role'});
            
            const candidateID = req.params.candidateID; // Extract the id from the URL parameter
            const updatedCandidateData = req.body; // Updated data for the person
    
            const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
                new: true, // Return the updated document
                runValidators: true, // Run Mongoose validation
            })
    
            if (!response) {
                return res.status(404).json({ error: 'Candidate not found' });
            }
    
            console.log('candidate data updated');
            res.status(200).json(response);
        }catch(err){
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
    })

    //delete record of candidate
    router.delete('/:candidateID', jwtMiddleware, async (req, res)=>{
        try{
            if(!checkAdminRole(req.user.id))
                return res.status(403).json({message: 'user does not have admin role'});
            
            const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        
            const response = await Candidate.findByIdAndDelete(candidateID);
    
            if (!response) {
                return res.status(404).json({ error: 'Candidate not found' });
            }
    
            console.log('candidate data deleted');
            res.status(200).json(response);
        }catch(err){
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
    })

// lets start voting
router.get('/vote/:candidateID', jwtMiddleware , async(req,res) => {
    // no admin can vote
    // user can only vote once
    candidateID = req.params.candidateID;
    userId = req.user.id;
    try{
         // Find the Candidate document with the specified candidateID
         const candidate = await Candidate.findById(candidateID);
         if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin' ){
            return res.status(403).json({ message: 'Admin cannot vote' });
        }
        if(user.isVoted){
            return res.status(403).json({ message: 'You have already voted' });
        }

         // Update the Candidate document to record the vote
         candidate.votes.push({user: userId})
         candidate.votecount++;
         await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }

});

// vote count
router.get('/vote/count', async(req,res) => {
    try{
         // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({ votecount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party : data.party,
                count: data.votecount
            }
        });
        return res.status(200).json(voteRecord);

    }catch{
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// // Get List of all candidates with only name and party fields
router.get('/' , async(req,res) => {
    try{
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party-_id');
        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;