const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Rank = require('../models/rank');
const Frage = require('../models/frage');
const Reise = require('../models/reise')
const Product = require('../models/product');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";



router.get('/',(req, res, next) => {
    Rank.find()
    .select('_id score')
    .exec()
    .then(docs => {
        const response ={
            count: docs.length,
            Ranks: docs.map(doc =>{
                return{
                    score: doc.score,
                    _id: doc._id,
                    request:{
                        type: 'GET',
                        url:'http://localhost:3000/ranks/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
});

router.post('/', (req, res, next) => {
    var neuerScore=20;
    Frage.findOne({name: req.body.name})
    Frage.findOne({antwort1: req.body.antwort1})
    Reise.findOne({kultur: req.body.kultur})
    .then(frage =>{
        if(!frage){
            return res.status(404).json({
                message:"Frage nicht gefunden"
            });
        }

        const rank = new Rank({
            _id: mongoose.Types.ObjectId(),
            score: req.body.score,
            name: req.body.name,
            antwort1: req.body.antwort1,
            kultur: req.body.kultur,
        });
        return rank
        .save()
        
        .then(result =>{
            neuerScore= result.neuerScore=20;
            if(neuerScore===20){
                neuerScore=neuerScore*4
            }
            console.log(result);
            res.status(201).json({
                message:'Ranking gespeichert',
                ErstelltesRanking: {
                    _id: result._id,
                    score: result.score,
                    name: result.name,
                    antwort1: result.antwort1,
                    kultur: result.kultur,
                    neuerScore: neuerScore,
                },
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/ranks/'+result._id
                }
            })
    })
    })
    .catch(err =>{
    console.log(err);
    res.status(500).json({
        error: err
        });
    });
});

router.get('/:ranksId', (req, res, next) => {
    const id = req.params.ranksId;
    rank.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);
        if(doc){
        res.status(200).json(doc);
        }else{
            res.status(404).json({
                message: 'Kein Gültiger Eintrag'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
});


/*router.patch('/:FragenId', (req, res, next) => {
    const id = req.params.productId;   
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }  
    Product.update({ _id: id}, {$set:updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });

});

router.delete('/:reiseId', (req, res, next) => {
const id = req.params.reiseId;  
    Reise.remove({ _id: id })
    .exec()
    .then(result =>{
        res.status(200).json(result);
    })
    .catch(err =>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
});*/

module.exports = router;
