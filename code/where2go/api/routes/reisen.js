const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Reise = require('../models/reise');

router.get('/',(req, res, next) => {
    Reise.find()
    .select('name _id aktivitaet erholung kultur preis')
    .exec()
    .then(docs => {
        const response ={
            count: docs.length,
            reisen: docs.map(doc =>{
                return{
                    name: doc.name,
                    aktivitaet: doc.aktivitaet,
                    erholung: doc.erholung,
                    kultur: doc.kultur,
                    preis: doc.preis,
                    _id: doc._id,
                    request:{
                        type: 'GET',
                        url:'http://localhost:3000/reisen/' + doc._id
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
    const reise = new Reise({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        aktivitaet: req.body.aktivitaet,
        erholung: req.body.erholung,
        kultur: req.body.kultur,
        preis: req.preis
    });
    reise.save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message: 'Reise erstellt',
            erstellteFrage : {
                name: result.name,
                aktivitaet: result.aktivitaet,
                erholung: result.erholung,
                kultur: result.kultur,
                preis: result.preis,
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

router.get('/:reisenId', (req, res, next) => {
    const id = req.params.fragenId;
    Reise.findById(id)
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

});*/

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
});

module.exports = router;
