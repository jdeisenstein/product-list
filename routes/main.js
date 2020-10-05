const router        = require('express').Router();
const faker         = require('faker');
const Product       = require('../models/product');
const itemsPerPage  = 9;
const totalPages    = 10;
const defaultPage   = 1;
let sortOrder       = { price: 1 };
let filterCategory  = {};

router.get('/generate-fake-data', (req, res, next) => {
    for (let i = 0; i < totalPages * itemsPerPage; i++) {
        
        let product      = new Product();
        product.category = faker.commerce.department();
        product.name     = faker.commerce.productName();
        product.price    = faker.commerce.price();
        product.image    = 'https://via.placeholder.com/250?text=Product+Image';
        
        product.save((err) => { if (err) throw err });
    }
    res.end();
});

router.get('/products', (req, res, next) => {

    const page          = req.query.page || defaultPage;  // last page specified is the default
    const categoryValue = req.query.category;             // last category specified is the default
    const searchValue   = req.query.search;               // if name not specified, omit from search
    const sortValue     = req.query.sort;                 // last sort specified is the default

    // Add Validity and Edge condition check
    filterCategory = categoryValue ? { category: categoryValue } : {}
    sortOrder      = sortValue ? { price: sortValue } : { _id: 1 }

    console.log(`page: ${page}  category: ${categoryValue}  search: ${searchValue}  sort: ${sortValue}`);
    console.log("sort object = ", sortOrder)
    console.log("filter object = ", filterCategory)

    Product
        .find (filterCategory)
        .sort (sortOrder)
        .skip (itemsPerPage * page - itemsPerPage).limit(itemsPerPage)
        .exec ((error, products) => {   
            Product
                .count () 
                .exec ((err, productCount) => { 
                    if (err) return next(err)
                    const results = { listOfProducts: products, countOfAllProducts: productCount };
                    res.send(results); 
                });
        });
});
module.exports = router;
