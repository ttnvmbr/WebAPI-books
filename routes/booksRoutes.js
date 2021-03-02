let express = require('express')
let Book = require('../models/bookModel')
let routes = function () {

    let booksRouter = express.Router();

    //CORS headers voor collectie
    booksRouter.use('/books/', function (req, res, next){
        res.header("Access-Control-Allow-Origin","*")
        res.header("Access-Control-Allow-Headers","Origin, Content-Type, Accept")
        res.header('Access-Control-Allow-Methods', 'POST, HEAD, GET, OPTIONS, DELETE, PUT');
        next()
    });


    booksRouter.use('/books/', function (req, res, next){
        console.log("middleware voor collectie")
        let acceptType = req.get("Accept")
        console.log("Accept: " + acceptType)

        if((acceptType == "application/json") || (req.method == "OPTIONS")){
            console.log("next")
            next()
        } else {
            res.status(400).send();
        }
    });

    
    booksRouter.route('/books')

        .post(function (req, res) {
            if (req.body.title == null || req.body.author == null || req.body.body == null) {
                return res.status(400).json({
                    Error: 'Please fill in all fields'
                });
            }
            let book = new Book(req.body);
            book.save(function (err) {
                res.status(201).send(book);
            });
        })

        .get(function (req, res) {
            let limit = 0;
            let page;
        
            function getLimit(limit) {
                if (limit !== undefined) {
                    return parseInt(limit)
                } else {
                    return 9999999;
                }
            }
            limit = getLimit(req.query.limit);
        
            function getPage(page) {
                if (page !== undefined) {
                    return parseInt(page);
                } else {
                    return 1
                }
            }
            page = getPage(req.query.start);
        
            Book.paginate({}, {limit: limit, page: page})
                .then(result => {
                    const response = {
                        items: result.docs.map(doc => {
                            return {
                                _id: doc._id,
                                title: doc.title,
                                author: doc.author,
                                body: doc.body,
                                _links: {
                                    self: {
                                        href:"http://" + req.headers.host + "/api/books/" + doc._id
                                    },
                                    collection: {
                                        href: "http://" + req.headers.host + "/api/books"
                                    }
                                }
                            }
                        }),
                        _links: {
                            self: {
                                href: "http://" + req.headers.host + "/api/books"
                            }
                        },
                        pagination: {
                            currentPage: result.page,
                            currentItems: result.docs.length,
                            totalPages: result.pages,
                            totalItems: result.total,
                            _links: {
                                first: {
                                    page: 1,
                                    href: "http://" + req.headers.host + "/api/books/" + '?limit=' + limit + '&start=1'
                                },
                                last: {
                                    page: result.pages,
                                    href: "http://" + req.headers.host + "/api/books/" + '?limit=' + limit + '&start=' + result.pages
                                },
                                previous: {
                                    page: (result.page - 1),
                                    href: "http://" + req.headers.host + "/api/books/" + '?limit=' + limit + '&start=' + (result.page - 1)
                                },
                                next: {
                                    page: (result.page + 1),
                                    href: "http://" + req.headers.host + "/api/books/" + '?limit=' + limit + '&start=' + (result.page + 1)
                                }
                            }
                        }
                    };
                    res.status(200).json(response);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        Error: err
                    })
                })
        })

        .options(function(req, res){
            console.log("allow")
            res.header("Allow","POST,GET,OPTIONS").send()
        });

        booksRouter.get('/books/:bookId', async (req, res) => {
            try{
                const book = await Book.findById(req.params.bookId)
                let bookItem = book.toJSON();
                        bookItem._links = 
                        {
                            "self" : { "href" : "http://" + req.headers.host + "/api/books/" + bookItem._id},
                            "collection" : { "href" : "http://" + req.headers.host + "/api/books"}
                        }
                        res.json(bookItem);
            } catch (err){
                console.log(err);
                res.status(404).send("Not found");
            }
        });

        booksRouter.delete('/books/:bookId', function(req, res) {
            let id = req.params.bookId
            Book.remove({_id: id})
                .exec()
                .then(result => {
                    res.status(204).json({})
                    console.log("book deleted")
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        Error: err
                    })
                })
        });

        booksRouter.route('/books/:bookId')
        .options(function(req, res){
            console.log("allow Details")
            res.header("Allow","PUT,GET,OPTIONS,DELETE").send()
            res.header('Access-Control-Allow-Methods', 'POST, HEAD, GET, OPTIONS');
        });

        booksRouter.put('/books/:bookId', (req, res) => {
            const id = req.params.bookId;
            Book.update({_id: id}, {
                "title": req.body.title,
                "author": req.body.author,
                "body": req.body.body,
                "_id": id,
            }, {runValidators: true})
                .exec()
                .then(result => {
                    res.status(200)
                    res.json({
                        "_id": id,
                        "title": req.body.title,
                        "author": req.body.author,
                        "body": req.body.body,
                        "_links": {
                            "self": {
                                href:"http://" + req.headers.host + "/api/books/" + id
                            },
                            "collection":"http://" + req.headers.host + "/api/books"
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({Error: err});
                })
        });
    return booksRouter;
};

module.exports = routes;