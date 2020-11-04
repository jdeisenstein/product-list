const router               = require ('express').Router();
const faker                = require ('faker');
const Question             = require ('../models/schema-question.js');
const defaultItemsPerPage  = 3;
const defaultPage          = 1;
let sortOrder              = {};
let searchFilter           = {};

router.get('/make-fake-questions', (req, res, next) => {

//  These choices are used for a genre of question designed to 
//  gauge a participant's level of agreement with a statement
    const agreementChoices = [
        'Strongly Agree',
        'Agree',
        'Somewhat Agree',
        'Neither Agree nor Disagree',
        'Somewhat Disagree',
        'Disagree',
        'Strongly Disagree']
    
//  Add 100 more fake questions to the data base
    for (let i = 0; i < 100; i++) {
        
        let myQuestion = new Question();
        
        myQuestion.category = faker.commerce.department ();
        myQuestion.question = faker.commerce.productName ();

//      Questions in this category guage participant's level of agreement with a statement
        if (myQuestion.category === 'Baby') {
            for (let myIndex = 0; myIndex < 7; myIndex++) {
                myQuestion.choices.push ({ index: myIndex, choice: agreementChoices[myIndex] });
            }
        } else {
//      Otherwise, questions have 5 scripted responses
            for (let myIndex = 0; myIndex < 5; myIndex++) {
                myQuestion.choices.push ({ index: myIndex, choice: faker.commerce.productName() });
            }
        }
        myQuestion.save ((err) => { if (err) throw err });
    }
    res.end();
});

router.get('/questions', async (req, res, next) => {
    try {
        const pageValue     = req.query.page  || defaultPage; 
        const itemsValue    = req.query.items || defaultItemsPerPage;
        const categoryValue = req.query.category;
        const searchValue   = req.query.search;
        const sortValue     = req.query.sort;
        
//      Convert API sort argument into .sort() argument or abort on bad value
        if (sortValue) {
            switch (sortValue) {
                case 'ASC':
                    sortOrder = { question: 1 };
                    break
                case 'DESC':
                    sortOrder = { question: -1 };
                    break
                default:
                    res.send ({ statusCode: 500, errorMsg: 'invalid sort argument' });
                    return
            }
        } else {
            sortOrder = {};
        }

//      Convert API category and search arguments to .find() format to find a match in the 
//      category field and/or a substring match in the question field (both are case sensitive)       
        if (categoryValue) {
            if (searchValue) {
                searchFilter = { category: categoryValue, question: { $regex: searchValue, $options: "i" } }
            } else {
                searchFilter = { category: categoryValue }
            }
        } else if (searchValue) {
            searchFilter = { question: { $regex: searchValue, $options: "i" } };
        } else {
            searchFilter = {}
        }
        const itemsPerPage  = itemsValue * 1;
        const initialOffset = itemsPerPage * (pageValue - 1);

//      Count and return the questions meeting the requirements
        questions = []
        questionCount = await Question.countDocuments (searchFilter)
        if (questionCount && questionCount > 0) {

            questions = await Question.find (searchFilter)
                .sort  (sortOrder)
                .skip  (initialOffset)
                .limit (itemsPerPage)
        }
        res.send ({ questionList: questions, questionCount: questionCount })
        
    } catch (error) {
        res.send (error);
    }
});

module.exports = router;
