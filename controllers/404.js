exports.error = (req, res, next) => {
    let logged=null;
    if(req.get('Cookie')){
        logged=req.session.logged;
    }
  res.status(404).render("404", { pageTitle: "Error:404", path: "",logged:logged });
};
