module.exports = funct => { //func is what we pass in
    return (req,res,next) => { //this returns new function that has func executed and catches any errors and passes them to next!
        funct(req,res,next).catch(next);
    }
}
