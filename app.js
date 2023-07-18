const express = require("express");
const bodyparser = require("body-parser");
// const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

 
// var items = ["Apple","Banana","Orange"];
// var workItems = [];
 
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/TodolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name:"Apple"
});
const item2 = new Item({
    name:"Banana"
});
const item3 = new Item({
    name:"orange"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items:[itemsSchema]
})

const List =  mongoose.model("List", listSchema);


app.get("/", function(req, res){
// let day = date();

Item.find({}).then(function(foundItems){

    if(foundItems.length === 0){
        Item.insertMany(defaultItems).then(function(){
            console.log("Successfully added all items in DB");
        }).catch(function(err){
            console.log(err);
        });
    }else{
        res.render("list", {listTitle:"Today", newListItems: foundItems });
    };
}).catch(function(err){
    console.log(err);
})
});

app.get("/:customListName", function(req, res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
        const list = new List({
            name:customListName,
            items: defaultItems
           })
           list.save();
           res.redirect("/" + customListName);
        
    }else{
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items });
        
    }

})


  
});



app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
   

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


    // if(req.body.list === "Work List"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item);
    //     res.redirect("/");
    // }
      
});

app.post("/delete", function(req, res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){

    Item.findByIdAndRemove({_id:checkedItemId}).then(function(){
        console.log("successfully removed checked item from DB");
     }).catch(function(err){
        console.log(err);
     });
    res.redirect("/");

   }else{
List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
    res.redirect("/" + listName);
})

   }
})

// app.get("/work", function(req, res){
//     res.render("list", {listTitle:"Work List", newListItems:workItems})
// });

// app.post("/work", function(req, res){
//     let item = req.body.newItem;
//     newItem.push(item);
//     res.redirect("/work");
// });

app.listen(3000, function(){
    console.log("server started on port 3000");
});

