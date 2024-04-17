const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://root:root123@mycluster.smrlxxf.mongodb.net/?retryWrites=true&w=majority&appName=mycluster";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let db = null;
async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("成功連結資料庫");
        db = client.db("test");
    } catch(e){
    console.log("有錯誤",e);
    }
  }
run().catch(console.dir);

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));


app.get("/", async (req, res) => {
    try{
        const collection = db.collection("message");
        let result = await collection.find({}).sort({
            date: -1
        }).toArray();
        res.render("home.ejs" , {result});
    }catch(e){
        console.log(e);
        res.send("伺服器錯誤");
    }
    
})
app.get("/error", (req, res) => {
    const errorMsg = req.query.msg;
    res.render("error.ejs", {errorMsg});
});
app.post("/message", async (req, res) => {
    if(req.body.name === "" || req.body.message === ""){
        res.redirect("/error?msg=姓名與留言請勿為空");
        return;
    }
    const name = req.body.name;
    const message = req.body.message;
    const date = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const collection = db.collection("message");
    await collection.insertOne({
        name: name,
        message: message,
        date: date
    })
    res.redirect("/");
});
app.listen(3000, () => {
    console.log("正在聆聽localhost3000");
});