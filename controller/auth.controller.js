const authSignup = (req, res) =>{
    console.log(req.body);
    
    return res.send(req.body);
} 
export default authSignup;