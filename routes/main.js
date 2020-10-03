const router = require('express').Router();
const faker = require('faker');
const Product = require('../models/product');

router.get('/generate-fake-data', (req, res, next) => {
    for (let i = 0; i < 90; i++) {
        let product = new Product();
        
        product.category = faker.commerce.department();
        product.name     = faker.commerce.productName();
        product.price    = faker.commerce.price();
        product.image    = 'https://via.placeholder.com/250?text=Product+Image';
        
        product.save((err) => {
            if (err) throw err;
        });
    }
    res.end();
});

router.get('/products', (req, res, next) => {
    const perPage = 9;
    const defaultStartPage = 1;
    const page = req.query.page || defaultStartPage;  // if no start page param, use default
    Product.find({})                                  // no filter set
        .skip  ((perPage-1) * page)                   // offset to initial item to send back
        .limit (perPage)                              // number of items in response
        .exec  ((error, products) => {   
            Product.count()                           // total number of items in Products collection
                .exec((err, productCount) => { 
                    if (err) return next(err)
                    const results = { listOfProducts: products, countOfAllProducts: productCount };
                    res.send(results); 
                });
        });
});
module.exports = router;
