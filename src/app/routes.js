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
            res.render(process.cwd()+'/src/views/pug/index.pug');
        });
    app.route('/login')
        .get((req,res)=>{
            res.render(process.cwd()+'/src/views/pug/login.pug');
        });
    app.route('/register')
        .get((req,res)=>{
            res.render(process.cwd()+'/src/views/pug/register.pug');
        });
    app.route('/chat')
        .get(
            ensureAuthenticated,
            (req,res)=>{        
            res.render(process.cwd()+'/src/views/pug/chat.pug',{username:req.user.username});
        });
    app.route('/logout')
        .get((req,res)=>{
            req.logout();
            res.redirect('/');
        });
    app.route('/login')
        .post(
            passport.authenticate('local',{failureRedirect:'/'}),
            (req,res)=>{
                res.redirect('/chat');
            })
    app.route('/register')
        .post((req,res,next)=>{
            db.collection('chatUsers').findOne({username:req.body.username},(err,user)=>{
                if(err){
                    next(err);
                }else if(user){
                    res.send('<script>alert("用户名已存在");location.href="/";</script>');
                }else{
                    var hash = bcrypt.hashSync(req.body.password,12);
                    db.collection('chatUsers').insertOne({username:req.body.username,password:hash},(err,doc)=>{
                        console.log(doc+'fffff');
                        if(err){
                            res.direct('/');
                        }else{
                            next(null,user)
                        }
                    });
                }
            });
        },
        passport.authenticate('local',{failureRedirect:'/'}),
        (req,res)=>{
            res.redirect('/chat');
        }
        );
    
    app.use((req,res,next)=>{
        res.status(404)
            .type('text')
            .send('Page Not Found');
    });
}