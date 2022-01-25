const app = require('./app');
const bodyParser = require('body-parser')
const cors = require('cors')

const PORT = 4000;

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
    const productCart = client.db("freshValley").collection("cart");
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
        const addedCartProduct = req.body;
        console.log("addedCartProduct: ",addedCartProduct);

        productCart.insertOne(addedCartProduct)
            .then(result => {
            console.log(result);
        })
    })

    app.get('/checkout', (req, res) => {
        const displayCartProduct = productCart.find().toArray((err, documents) => {
            res.send(documents);
        })
    })

    

    
});





app.get('/', (req, res) => {
    res.send("<h1>Hello Node JS</h1>");
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})