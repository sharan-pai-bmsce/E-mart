// Rather than adding this functionality in controllers which makes the code quite untidy, We can introduce as a middleware. in the routes where it is needed. This makes the code more cleaner

exports.isAuth = (req,res,next)=>{
    if(!req.session.logged){
        return res.redirect('/login');
    }
    next();
}