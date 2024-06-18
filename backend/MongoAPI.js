const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
var fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

const {MongoClient} = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const dbName = "PasswordManagerApp";
const client = new MongoClient(url);
const db = client.db(dbName);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/api', (req, res) => {
    res.json({ message: 'Hello there' });
});

app.get("/getCollections", async (req, res) => {
    try {
        const collections = await db.listCollections().toArray();
    
        const collectionNames = collections.map(collection => collection.name);

        res.send(collectionNames);
    } catch (error) {
        console.error("Error getting collections:", error);
        res.status(500).send("Error getting collections");
    }
});

app.get("/getCollection/:collection", async(req, res) => {
    try{
        const collectionName = req.params.collection;

        const data = await db.collection(collectionName).find().toArray();
        if(!data){
            return res.status(404).json({error: "could not retrieve item from collection."});
        }

        res.send(data);
    }catch(error){
        console.error("Error retrieving data from collection:", error);
        res.status(500).send("Error retrieving collection data");
    }
});

app.get("/getItem/:collection/:id", async(req, res) => {
    try{
        const collectionName = req.params.collection;
        const id = Number(req.params.id);

        const data = await db.collection(collectionName).findOne({ _id: id});
        if(!data){
            return res.status(404).json({error: "could not retrieve item from collection."});
        }

        res.send(data);
    }catch(error){
        console.error("Error retrieving item data from collection:", error);
        res.status(500).send("Error retrieving item data");
    }
});

app.get("/getManyItems/:collection", async(req, res) => {
    try{
        const collectionName = req.params.collection;
        const filter = req.body;

        const data = await db.collection(collectionName).find(filter).toArray();

        if(!data){
            return res.status(404).json({error: "could not retrieve many items from collection."});
        }
        res.send(data);
    }catch(err){
        console.error("Error retrieving many items from collection:", err);
        res.status(500).send("Error retrieving many items data.");
    }
});

app.post('/createCollection', async(req, res) => {
    const collectionName = req.body.collectionName;

    try{
        const result = await db.createCollection(collectionName);
        if(!result){
            return res.status(404).json({error: "collection could not be created."});
        }
        return res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error creating Collection:', err);
        res.status(500).json({error: 'Internal Server Error.'});
    }
});

app.post('/addToCollection/:collectionName', async(req, res) => {
    const collectionName = req.params.collectionName;
    const newData = req.body;
    try{
        const result = await db.collection(collectionName).insertOne(newData);
        if(!result){
            return res.status(404).json({error: "could not add to collection."});
        }
        return res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error adding to Collection:', err);
        res.status(500).json({error: 'Internal Server Error.'});
    }
});

app.post('/addManyToCollection/:collectionName', async(req, res) => {
    const collectionName = req.params.collectionName;
    const newData = req.body;
    try{
        const result = await db.collection(collectionName).insertMany(newData);
        if(!result){
            return res.status(404).json({error: "could not add many to collection."});
        }
        return res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error adding many to Collection:', err);
        res.status(500).json({error: 'Internal Server Error.'});
    }
});

app.delete("/deleteCollection/:collectionName", async(req, res) => {
    const collectionName = req.params.collectionName;
    try{
        const result = await db.collection(collectionName).drop();
        if(!result){
            return res.status(404).json({error: "collection could not be deleted."});
        }
        return res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error Deleting Collection:', err);
        res.status(500).json({error: "Internal Server Error."});
    }
});

app.delete("/deleteFromCollection/:collectionName/:id", async(req, res) => {
    const collectionName = req.params.collectionName;
    const id = Number(req.params.id);
    try{
        const result = await db.collection(collectionName).deleteOne({_id:id});
        if(!result){
            return res.status(404).json({error: "item could not be deleted from collection"});
        }
        return res.status(200).send({status: "success"});
    }catch(err){
        console.error('Error Deleting Collection:', err);
        res.status(500).json({error: "Internal Server Error."});
    }
});

app.delete("/deleteManyFromCollection/:collectionName", async(req, res) => {
    const collectionName = req.params.collectionName;
    const filter = req.body;
    try{
        const result = await db.collection(collectionName).deleteMany(filter);
        if(!result){
            return res.status(404).json({error: "could not delete many from collection."});
        }
        return res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error Deleting Many From Collection:', err);
        res.status(500).json({error:"Internal Server Error."});
    }
});

app.put("/editItemInCollection/:collectionName", async(req, res) => {
    const collectionName = req.params.collectionName;
    const data = req.body;
    const id = data._id;
    try{
        const result = await db.collection(collectionName).findOneAndUpdate(
            {_id: id},
            {$set: data},
            {returnOriginal: false}
        );
        if(!result){
            return res.status(404).json({error: "could not edit item"});
        }
        res.status(200).send({status:"success"});
    }catch(err){
        console.error('Error Editing Item in Collection:', err);
        res.status(500).json({error:"Internal Server Error."});
    }
});