const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Frage = require('../models/frage');

router.get('/',(req, res, next) => {
    Frage.find()
    .select('name _id antwort1 antwort2 antwort3 antwort4')
    .exec()
    .then(docs => {
        const response ={
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    antwort1: doc.antwort1,
                    antwort2: doc.antwort2,
                    antwort3: doc.antwort3,
                    antwort4: doc.antwort4,
                    _id: doc._id,
                    request:{
                        type: 'GET',
                        url:'http://localhost:3000/fragen/' + doc._id
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

router.post('/',(req, res, next) => {
    const frage = new Frage({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        antwort1: req.body.antwort1,
        antwort2: req.body.antwort2,
        antwort3: req.body.antwort3,
        antwort4: req.body.antwort4,
    });
    frage.save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message: 'Frage erstellt',
            erstellteFrage : {
                name: result.name,
                antwort1: result.antwort1,
                antwort2: result.antwort2,
                antwort3: result.antwort3,
                antwort4: result.antwort4,
                _id: result._id,
                request: {
                    type:'GET',
                    url: 'http://localhost:3000/fragen/' + result._id
                }
            }
        });    
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        
        })
    });
});

router.get('/:fragenId', (req, res, next) => {
    const id = req.params.fragenId;
    Frage.findById(id)
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

router.delete('/:productId', (req, res, next) => {
const id = req.params.productId;  
    Product.remove({ _id: id })
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
