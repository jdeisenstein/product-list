const router        = require('express').Router();
const faker         = require('faker');
const Product       = require('../models/product');
const itemsPerPage  = 9;
const totalPages    = 10;
const defaultPage   = 1;
let sortOrder       = {};
let categoryFilter  = {};

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

router.get('/products', async (req, res, next) => {
    try {
        const page          = req.query.page || defaultPage; 
        const categoryValue = req.query.category;
        const searchValue   = req.query.search;
        const sortValue     = req.query.sort;
        
        // convert API sort argument into .sort() argument or abort on bad value

        if (sortValue) {
            switch (sortValue) {
                case 'ASC':
                    sortOrder = { price: 1 };
                    break
                case 'DESC':
                    sortOrder = { price: -1 };
                    break
                default:
                    res.send({ statusCode: 500, errorMsg: 'invalid sort argument' });
                    return
            }
        } else {
            sortOrder = {};
        }

        categoryValue ? categoryFilter = { category: categoryValue } : categoryFilter = {};

        products = []
        productCount = await Product.countDocuments(categoryFilter)
        if (productCount && productCount > 0) {

            products = await Product.find(categoryFilter)
                .sort(sortOrder)
                .skip(itemsPerPage * page - itemsPerPage)
                .limit(itemsPerPage)
        }
        res.send({ productList: products, productCount: productCount })
        
    } catch (error) {
        res.send (error);
    }
});
module.exports = router;
