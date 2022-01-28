const app = require('./app');
const bodyParser = require('body-parser')
const cors = require('cors')

const PORT = 4000;

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


    app.get('/manageProduct', (req, res) => {
        var allProduct = productCollection.find().toArray((err, document) => {
            res.send(document);
            // console.log(document);
        });

    })

    app.post('/addProduct', (req, res) => {

        const product = req.body;
        console.log(product);
        console.log("Product added successfully");
        productCollection.insertOne(product)
            .then(result => {
                console.log(result);
            })
    })

    app.delete('/delete/:id', (req, res) => {
        productCollection.deleteOne({
            _id: req.params.id
        })
            .then(result => {
                console.log(result);
            })
        // console.log(req.params.id)
    })


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