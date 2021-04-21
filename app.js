var express = require('express');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);
const mongoose= require('mongoose');
const crypt = require('bcryptjs');

const UserModel = require('./Models/User');
var app = express();

const MongoURI='mongodb://localhost:27017/sessions';

mongoose.connect(MongoURI,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology:true
}).then((res) => {
  console.log("Mongodb connected");
})

const store = new mongodbSession({
  uri: MongoURI,
  collection:'mySessions'
})

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));

app.use(
  session({
  secret:'key that save the cookie',
  resave:false,
  saveUninitialized:false,
  store:store
  
}))



const isAuth=(req,res,next)=>{
      if(req.session.isAuth){
        next();
      }else{
        res.redirect('/login');
      }
}

app.get('/', function (req, res) {
  console.log(req.session);
  console.log(req.session.id);
    res.render("landing");
});

app.get('/login',(req,res)=>{
  res.render("login");

});

app.post('/login',async(req,res)=>{
  const {email, password } =req.body;

  const user= await UserModel.findOne({ email });
  if(!user){
    return res.redirect('/login');
  }
  const isMAtch = await crypt.compare(password,user.password);
  if(!isMAtch){
    return res.redirect('/login');
  }
  
  req.session.isAuth=true;
  return res.redirect('/dashboard');

  
});

app.get('/register',(req,res)=>{
  res.render("register");

});

app.post('/register',async(req,res)=>{
  const {username,email, password } =req.body;

  let user= await UserModel.findOne({email});
  if(user){
    return res.redirect('/register');
  }
  console.log("new entry"+ username+email+password);
  const hashedpass= await crypt.hash(password,12);
  user = new UserModel({
    username,
    email,
    password:hashedpass
  })

  await user.save();
  res.redirect('/login');

});

app.get('/dashboard',isAuth,(req,res)=>{
  res.render("dashboard");

});

app.post('/logout',(req,res)=>{
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect("/");
  })
}) 


// app.get('/', function (req, res) {
//   req.session.isAuth =true;
//   console.log(req.session);
//   console.log(req.session.id);
//   res.send('Hello World!!!!!');
// });
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



