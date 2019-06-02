const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
var moment = require('moment');
const Parking = require("../models/parking");
const User = require("../models/user");
const Carpark = require("../models/carpark");
var admin = require('firebase-admin');


//get current parking list
router.get('/', /*checkAuth,*/ (req, res, next) => {
    Parking.find()
    .select('id userid plate carparkid start time end date payment payment_success current_price')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            userlist: docs.map(doc => {
                return {
                    id: doc.id,
                    userid: doc.userid, 
                    plate: doc.plate,
                    carparkid: doc.carparkid,
                    start: doc.start,
                    time: doc.time,
                    end: doc.end,
                    date: doc.date,
                    payment: doc.payment,
                    payment_success: doc.payment_success,
                    current_price: doc.current_price,
                }
            })
        };
        if (docs.length >= 0) {
        res.status(200).json(response);
        } else {
            //not really 404, just no objects in database
            res.status(404).json({
                message: 'No entries found'
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    }) 
});

//get parking of parking id
router.get('/:parkingID', /* checkAuth, */ (req, res, next) => {
    const id = req.params.parkingID;
    Parking.findById(id) 
    .select('id userid plate carparkid start time end date payment payment_success current_price')
    .exec()
    .then(doc => {
        console.log(doc);
        if (doc) {
            var time = moment();
            res.status(200).json({
                parking: doc,
                time: time.diff(doc.start, 'seconds') + "s",
                request: {
                    type: 'GET',
                    description: 'GET PARKING',
                    url: 'http://localhost:3000/parking/'
                }
            });
        } else {
            res.status(404).json({message: 'No valid entry found with this ID.'});
        }
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err});
    });
});

//get parking of user id
router.get('/user/:userid', /* checkAuth, */ (req, res, next) => {
    const userid = req.params.userid;
    Parking.findOne({userid: userid})
    .select('id userid plate carparkid start time end date payment payment_success current_price')
    .exec()
    .then(doc => {
        
        var parkingprice = 0;
        if (doc) {
            //refresh parking time
            var time = moment();
            var hours = time.diff(doc.start, 'hours');
            var minutes = time.diff(doc.start, 'minutes');
            if(minutes > 59){
                minutes = minutes - (hours * 60);
            }
            //formating time 
            var timeformat;
            if (hours < 1){
                if (minutes < 10){
                    if (minutes < 1){
                        timeformat = "Gerade eben";
                    } else if (minutes == 1) {
                        timeformat = minutes + " Minute";
                    } else if (minutes > 1){
                        timeformat = minutes + " Minuten";
                    }
                } else {
                    timeformat = minutes + " Minuten";
                }
            } else {
                if(minutes < 10){
                    timeformat = hours + "h 0" + minutes + "m";
                }
                timeformat = hours + "h " + minutes + "m";
            }
            //update time
            Parking.update( 
                {userid: userid },{ $set:{time_m: minutes, time_h: hours}},
                function (error, success) {
                    if (success) {
                        
                    } else {
                        console.log(error);
                    }
                }
            )
            Carpark.findOne({id: doc.carparkid})
            .exec()
            .then(carpark =>{

                //calculate price of time and current carpark
                if (minutes < 30 && hours == 0/* && carpark.freetime != ""*/) {
                    parkingprice = 0;
                 
                } else if (minutes < 60 && hours == 0) {
                    parkingprice = carpark.price_hour;
                  
                } else if (hours > 0) {
                    parkingprice = (1 + hours) * carpark.price_hour;
                 
                }
                Parking.update( 
                    {userid: userid },
                    { current_price: parkingprice },
                    function (error, success) {
                        if (success) {
                            
                        } else {
                            console.log(error);
                        }
                    }
                )
                //response of parking
                res.status(200).json({
                    id: doc.id,
                    userid: doc.userid, 
                    plate: doc.plate,
                    carparkid: doc.carparkid,
                    start: doc.start,
                    time: timeformat,
                    time_h: hours,
                    time_m: minutes,
                    end: doc.end,
                    date: doc.date,
                    payment: doc.payment,
                    payment_success: doc.payment_success,
                    current_price: parkingprice
                    
                });
            })
            .catch(err => { 
                console.log(err)
            }); 
            
          
        } else {
            res.status(404).json({message: 'No valid entry found with this ID.'});
        }
        
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err});
    });
});
//delete parking with id
router.delete('/:parkingID', checkAuth, (req, res, next) =>{
    const id = req.params.parkingID;
    Parking.remove({id: id })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Parking deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/parking/' + id,
                data: { name: 'String', uri: 'String' }
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({error: err});
    });
    
});
//delete all parkings
router.delete('/', checkAuth, (req, res, next) =>{
    Parking.remove({})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Parking deleted',
        });
    })
    .catch(err =>{
        console.og(err);
        res.status(500).json({error: err});
    });
});
//post new parking !! IMPORTANT !! with numberplate and carpark id
router.post('/', /*checkAuth,*/ (req, res, next) => {
    console.log(req.body);
    Parking.findOne({plate: req.body.plate})
    .exec()
    .then(parking => {
        if (parking === null){
            //var i = Interval.fromDateTimes(parking.start,DateTime.local().time);
            console.log('Parking started');
            User.findOne({plate: req.body.plate})
            .exec()
            .then(user =>{
                if (user !== null){
                    //if no parking with this plate, create new
                    const parking = new Parking({
                        id: new mongoose.Types.ObjectId(), 
                        userid: user.id,
                        plate: req.body.plate, //required
                        carparkid: req.body.carpark_id, //req.body.carparkid, //required
                        start: moment().format(),
                        time: req.body.time,
                        end: "123",// req.body.end,
                        date: moment().format(),
                        payment: "paypal", //req.body.payment,
                        payment_success:"yes",// req.body.payment_success,
                        current_price:"1"// req.body.current_price,
                    });
                    parking.save()
                    .then(result => {
                        Carpark.findOne({id: parking.carparkid})
                        .exec()
                        .then(carpark =>{
                            var payload = {
                                //send push notification to user with carpark name and city
                                notification: {
                                    title: "Neuer Parkvorgang",
                                    body: "Du parkst im Parkhaus " + carpark.name + ". Wir wünschen einen schönen Aufenthalt in " + carpark.city
                                }
                            };
                            var options = {
                                priority: "high",
                                timeToLive: 60 * 60 *24
                            };

                            console.log(user.fcm);

                            var topic = "parqchannel";
                            
                            admin.messaging().sendToTopic(topic, payload)
                            .then(function(response) {
                                console.log("Successfully sent message:", response);
                            })
                            .catch(function(error) {
                                console.log("Error sending message:", error);
                            });

                            admin.messaging().sendToDevice(user.fcm, payload, options)
                                .then(function(response) {
                                    console.log("Successfully sent message:", response);
                                }) 
                                .catch(function(error) {
                                    console.log("Error sending message:", error);
                                });
                            
                        
                            res.status(201).json({
                                message: 'Parking started successfully',
                            });
                        })
                
                        console.log(result);
                    }).catch(err => { 
                        console.log(err)
                        res.status(500).json({
                            error: err
                        });
                    }); 
                } else {
                    res.status(401).json({
                        message: 'Plate not registered',
                    });
                }
            })
        } else {
            //calculate parking time length and save it 
            var endtime = moment();
            console.log(endtime.diff(parking.start, 'seconds') + "s");
            User.update( 
                {plate: req.body.plate },
                //push ended parking in user/history
                { $push: { history: {
                    date: parking.date,
                    parking_time: endtime.diff(parking.start, 'seconds') + "s",
                    price: 2,//carpark price,
                    parkingid: parking.id,
                    carparkid: parking.carparkid,
                    carpark_name: endtime,
                    payment_method: parking.payment,
                    plate: parking.plate
                    }}
                },
                function (error, success) {
                    if (success) {
                        
                    } else {
                        console.log(error);
                    }
                }
            )
            //timeformatting for notification
            var time = moment();
            var hours = time.diff(req.body.start, 'hours');
            var minutes = time.diff(req.body.start, 'minutes');
            var timeformat;
            if (hours < 1){
                if (minutes < 10){
                    if (minutes < 1){
                        timeformat = "Gerade eben";
                    } else if (minutes == 1) {
                        timeformat = minutes + " Minute";
                    } else if (minutes > 1){
                        timeformat = minutes + " Minuten";
                    }
                } else {
                    timeformat = minutes + " Minuten";
                }
            } else {
                if(minutes < 10){
                    timeformat = hours + "h 0" + minutes + "m";
                }
                timeformat = hours + "h " + minutes + "m";
            }
            User.findOne({plate: req.body.plate})
            .exec()
            .then(user =>{
                var payload = {
                    //notification for parking end
                    notification: {
                        title: "Parkvorgang beendet",
                        body: "Du hast " + timeformat + " geparkt und es kostet dich " + parking.current_price + "€."
                    }
                };
                var options = {
                    priority: "high",
                    timeToLive: 60 * 60 *24
                };

                admin.messaging().sendToDevice(user.fcm, payload, options)
                    .then(function(response) {
                        console.log("Successfully sent message:", response);
                    })
                    .catch(function(error) {
                        console.log("Error sending message:", error);
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).json({error: err});
                });
            //remove current parking after pushing to history
            Parking.remove({id: parking.id })
            .exec()
            .then(result => {
                res.status(200).json({
                    message: 'Parking stopped successfully',
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/parking/',
                        data: { plate: 'String', carparkid: 'String' }
                    }
                });
            })
            .catch(err =>{
                console.log(err);
                res.status(500).json({error: err});
            });
        }
    })     
    .catch(err => { 
        console.log(err)
        res.status(500).json({
            error: err
        });
    }); 
    
});

//patch current parking
router.patch("/:parkingID", checkAuth, (req, res, next) =>{
    const id = req.params.parkingID;
    const propName = req.propName;
    const value = req.value;
    Parking.update({id: id }, { $set: { propName: value } })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Parking updated',
            request: {
                type: 'GET',
                description: 'GET PARKING',
                        url: 'http://localhost:3000/parking/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;