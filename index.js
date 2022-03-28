const app = require('./app');
const bodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectID;

const PORT = 4000;
// const PORT = process.env.PORT;

// Local Storage
const { LocalStorage } = require('node-localstorage')
localStorage = new LocalStorage('./scratch')


// Dot ENV
require('dotenv').config();


// MongoDB
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pkxrx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors());




client.connect(err => {
    const productCollection = client.db("freshValley").collection("products");
    const productCartCollection = client.db("freshValley").collection("cart");
    const productOrderCollection = client.db("freshValley").collection("orders");

    console.log("Database Connected Successfully......");


    // Read API
    app.get('/manageProduct', (req, res) => {
        var allProduct = productCollection.find().toArray((err, document) => {
            res.send(document);
            // console.log(document);
        });

    })


    // Find Product by ID PAI
    // app.get('/manageProduct/:id', (req, res) => {

    //     const p_id = { _id:ObjectId(req.params.id) };

    //     productCollection.find(p_id).toArray(function (err, result) {
    //         if (err) throw err;
    //         res.send(result);
    //         console.log(result);
    //     });

    // });


    // Post API
    app.post('/addProduct', (req, res) => {

        const productInfo = req.body;

        console.log(productInfo);
        console.log("Product added successfully");
        productCollection.insertOne(productInfo)
            .then(result => {
                console.log(result);
            })
    })


    // Delete API
    app.delete('/delete/:id', (req, res) => {
        const p_id = { _id:ObjectId(req.params.id) };

        productCollection.deleteOne(p_id, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        })
    })

    // Get product by ID================================================
    app.get('/editProduct/:id', (req, res) => {

        const p_id = { _id:ObjectId(req.params.id) };
        

        productCollection.find(p_id).toArray(function (err, result) {
            if (err) throw err;
            res.send(result);
        });

    });

    // Update API================================================
    app.put('/editProduct/:id', (req, res) => {


        const {name, weight, price, imgURL} = req.body;

        const myQuery = { _id:ObjectId(req.params.id) };
        const myNewValues = {$set: {name: name, weight: weight, price: price, imgURL: imgURL}}

        console.log(myQuery);
        console.log(myNewValues);

        productCollection.updateOne(myQuery, myNewValues, (err, result)=>{
            if (err) {
                console.log(err);
            }else {
                console.log(result);
            }
        })
    });



    // Add to Cart
    app.post('/checkout', (req, res) => {
        const addedCartProduct = req.body.cart;

        console.log("addedCartProduct: ", addedCartProduct);

        const insertCart = () => {
            productCartCollection.insertOne(addedCartProduct)
                .then(result => {
                    console.log(result);
                });
        }
        {
            addedCartProduct && orderInfo.email ? insertCart() : console.log("Cart data not found. Please Login")
        }

    })


    app.get('/checkout', (req, res) => {
        productCartCollection.find().toArray((err, documents) => {
            res.send(documents);
        });
    })


    app.post('/orderPlacing', (req, res) => {
        const orderInfo = req.body.order;
        const addedCartProduct = req.body.cart;

        console.log("orderInfo: ", orderInfo);


        const insertOrder = () => {
            productOrderCollection.insertOne(orderInfo)
                .then(result => {
                    console.log(result);
                })
        }

        {
            addedCartProduct && orderInfo.email ? insertOrder() : console.log("Order data not found. Please Login")
        }

    })

    app.delete('/orderPlacing', (req, res) => {
        productCartCollection.deleteMany()
            .then(
                () => {
                    res.status(200).json({
                        message: 'Deleted!'
                    })
                        .catch(
                            (error) => {
                                res.status(400).json({
                                    error: error
                                });
                            }
                        );
                })
    });

    app.get('/orders', (req, res) => {
        productOrderCollection.find().toArray((err, documents) => {
            res.send(documents);
        });
    })
})



app.get('/', (req, res) => {
    res.send("<h1>Hello Node JS</h1>");
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT || PORT}`);
})