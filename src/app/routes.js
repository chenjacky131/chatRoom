const passport = require('passport');
const bcrypt = require('bcryptjs');
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
};
module.exports = function(app,db){
    app.route('/')
        .get((req,res)=>{
            res.render(process.cwd()+'/views/pug/index.pug');
        });
    app.route('/register')
        .post((req,res,next)=>{
            db.collection('chatUsers').findOne({username:req.body.username},(err,user)=>{
                if(err){
                    next(err);
                }else if(user){
                    console.log('用户已存在');
                    res.redirect('/');
                }else{
                    var hash = bcrypt.hashSync(req.body.password,12);
                    db.collection('chatUsers').insertOne({username:req.body.username,password:hash},(err,doc)=>{
                        if(err){
                            res.direct('/');
                        }else{
                            next(null,doc)
                        }
                    });
                }
            });
        },
        passport.authenticate('local',{failureRedirect:'/'}),
        (req,res)=>{
            res.redirect('/profile');
        }
        );
    
    app.use((req,res,next)=>{
        res.status(404)
            .type('text')
            .send('Page Not Found');
    });
}