const express= require('express');
const bodyParser= require('body-parser');
//const date= require(__dirname+ '/date.js');
const app= express();
const mongoose= require('mongoose');
const _= require('lodash');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true});
const listSchema= new mongoose.Schema({
	title: {type: String, required: true, maxlength: 50},
	content:{type: String, required: true, maxlength: 100}});
const Card= mongoose.model("Card", listSchema);
const i1=new Card({title: "Sample title of max 50 words", content: "Sample content of max 100 words"});
const defaultItem=[i1];

const customListSchema= new mongoose.Schema({
	name: String,
	items: [listSchema]
});
const List= mongoose.model("List", customListSchema);
const defaultListName=["All About Today"];

app.get("/about", (req,res)=>{
	res.render("about");
});

app.get("/", (req, res)=>{
	Card.find({}, (err, foundCard)=>{
		if(foundCard.length === 0){
			Card.insertMany(defaultItem, (err)=>{
			if(err){
				console.log(err);
			}
			else{
				console.log("Inserted Successfully");
			}
});
			res.redirect("/");
		}else{
			res.render("list", {listTitle: "All About Today", collectData: foundCard, d: defaultListName});
		}
});
});	


app.post("/", (req, res)=>{
	const titleName=req.body.title, contentName=req.body.content;
	const listName=req.body.list;
	const i= new Card({title: titleName, content: contentName});
	if(listName=== "All about today"){
		i.save();
		res.redirect("/");
	}
	else{
		List.findOne({name: listName}, (err, foundList)=>{
			foundList.items.push(i);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
		
});

app.post("/delete", (req, res)=>{
	const l= req.body.listName;
	const id= req.body.del;
	if(l === "All about today"){
		Card.findByIdAndRemove(id, (err)=>{
		if(err){
			console.log(err);
		}
		else{
			console.log("Successfully deleted");
			res.redirect("/");
		}
	});
}else{
	List.findOneAndUpdate({name: l}, {$pull: {items: {_id: id}}}, (err, updatedList)=>{
		if(!err){
			res.redirect("/" + l);
		}
	});
}
});

app.post("/add", (req,res)=>{
	const name=req.body.customTopic;
	res.redirect("/" + name);
});

app.get("/:customListName", (req, res)=>{
	const customListName= _.capitalize(req.params.customListName);
	List.findOne({name: customListName}, (err, foundList)=>{
		if(!err){
			if(!foundList){
				const list= new List({name: customListName, items: defaultItem});
				list.save();
				defaultListName.push(customListName);	
				res.redirect("/"+ customListName);
			}else{
				res.render("list", {listTitle: foundList.name, collectData: foundList.items, d: defaultListName});
		}
	}
});
	
		
	

});


app.listen(3000);
