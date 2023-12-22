const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');


const port = 1337;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    const maxInactiveTime = 20 * 60 * 1000; 
    if (req.session.loggedin) {
        const currentTime = new Date().getTime();
        const lastActivityTime = req.session.lastActivityTime || currentTime;

        if (currentTime - lastActivityTime > maxInactiveTime) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
                res.redirect('/login');
            });
        } else {
            req.session.lastActivityTime = currentTime;
            next();
        }
    } else {
        next();
    }
});


app.use(express.static(__dirname));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'oracle',
    database: 'pizzaproject',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the database');
});

db.query(
    'CREATE TABLE IF NOT EXISTS User (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, phoneNb VARCHAR(255) NOT NULL, isAdmin INT NOT NULL DEFAULT 0, PRIMARY KEY (id))',
    (err) => {
        if (err) {
            console.error('Error creating the User table: ' + err);
        }
    }
);



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+ '/index.html'));
});


/*
Register Page
*/



app.post('/signup', (req, res) => {
    const { name, email, password, phoneNb } = req.body;
    const newUser = { name, email, password, phoneNb };

    db.query('SELECT * FROM User WHERE email = ?', [email], (err, result) => {
        if (err) {
            console.error('Error checking for existing email: ' + err);
            res.status(500).send('Error signing up');
        } else if (result.length > 0) {
            res.send('Email already exists. Please choose a different one.');
        } else {
            db.query('INSERT INTO User SET ?', newUser, (err, result) => {
                if (err) {

                    console.error('Error inserting data: ' + err);
                    res.status(500).send('Error signing up');
                } else {
                    const transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: 'mreliesaab@gmail.com',
                                            pass: 'srcw eovd awrv vliq'
                                        }
                                    });

                                    const mailoptions = {
                                        from: 'pizza',
                                        to: email,
                                        subject: `Welcome to our pizza shop!`,
                                        text: `Dear ${name}`,
 
                    

                                        html: `<b>Dear ${name},
 
                     Welcome To Pizza Shop. Don't miss the chance to get yours!
 
                     Hurry up and place your order.
 
                     Best regards,
                     </b>`
                                    };

                                    transporter.sendMail(mailoptions, (error, info) => {
                                        if (error) {
                                            return console.error('error sending email:', error);
                                        }
                                        console.log('message sent: %s', info.messageId);
                                    });
                    res.sendFile(path.join(__dirname, 'index.html'));
                }
            });
        }
    });
});

/* 
Login Page
*/
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/login.html'));
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

  

    db.query('SELECT * FROM User WHERE email = ? AND password = ?', [email, password], (err, result) => {
        if (err) {
            console.error('Error checking for existing email:', err);
            res.status(500).json({ message: 'Error logging in' });
        } else if (result.length > 0) {
            req.session.loggedin = true;
            req.session.username = email;
            const userId = parseInt(result[0].id);

            if (result[0].isAdmin == 0) {
                req.session.userId = userId;


                console.log(result[0].isAdmin);

                res.sendFile(__dirname + '/index.html');

            }
            else {
                req.session.userId = userId;


                console.log(req.session.userId)

                res.sendFile(__dirname + '/AdminPanel.html');
            }


        } else {
            res.json({ message: 'Invalid email or password' });
        }
    });
});



/*

Update Profile, Delete Account

*/


app.post('/update', async (req, res) => {
    const { name, email, phone, newPassword } = req.body;
    const userId = req.session.userId;

    const updateFields = [];
    if (name) updateFields.push(`name = '${name}'`);
    if (email) updateFields.push(`email = '${email}'`);
    if (phone) updateFields.push(`phoneNb = '${phone}'`);

    if (newPassword) {
        const enteredPassword = req.body.oldPassword;

        try {
            if (!userId) {
                return res.redirect('/login');
            }

            await validateOldPassword(userId, enteredPassword);
            console.log('Old password is correct');
            updateFields.push(`password = '${newPassword}'`);
        } catch (error) {
            console.error('Error validating old password:', error);
            return res.status(400).send('Invalid old password');
        }
    }

    if (updateFields.length > 0) {
        const updateQuery = `UPDATE User SET ${updateFields.join(', ')} WHERE id = ?`;

        db.query(updateQuery, [userId], (err) => {
            if (err) {
                console.error('Error updating user data:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.sendFile(__dirname + '/index.html');
            }
        });
    } else {
        res.send('No fields to update');
    }
});


async function validateOldPassword(userId, enteredPassword) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM User WHERE id = ? AND password = ?', [userId, enteredPassword], (err, result) => {
            if (err) {
                console.error('Error checking for existing user:', err);
                reject('Error validating password');
            } else if (result.length > 0) {
                resolve();
            } else {
                reject('Invalid password');
            }
        });
    });
}

app.post('/delete', (req, res) => {
    const userIdToDelete = req.session.userId;

    const deleteQuery = 'DELETE FROM user WHERE id = ?';
    db.query(deleteQuery, [userIdToDelete], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('An error occurred while processing your request.');
        } else {

            res.sendFile(__dirname + '/index.html');
        }
    });
});


/*Adding data to cart (in the menu, when form that has add to cart button is submitted it handle this request)*/
app.post('/place_order/:p_id', (req, res) => {
    const pizza_id_param = req.params.p_id;
    let { qty } = req.body;
    qty = parseInt(qty);

    const user_id = req.session.userId;

    if (!user_id) {
        return res.redirect('/login');
    }

    console.log(user_id);

    db.query('SELECT price FROM pizza WHERE id = ? ', [pizza_id_param], (err, result) => {
        if (err) {
            console.error('Error fetching price from database: ' + err);
            res.status(500).send('Error Adding To Cart 1');
            return;
        }

        if (result.length > 0) {
            const price = result[0].price;

            const total_price = qty * price;

            const newCart = { pizza_id: pizza_id_param, qty, total_price, user_id };

            db.query('INSERT INTO Cart SET ?', newCart, (err, result) => {
                if (err) {
                    console.error('Error inserting data: ' + err);
                    res.status(500).send('Error Adding To Cart 3');
                } else {
                    res.sendFile(path.join(__dirname, 'pages', 'cart.html'));
                }
            });
        } 
        else {
            res.status(404).send('Pizza not found');
        }
    });
});

/*Retreiving Data for cart*/

app.get('/cart', (req, res) => {
    const user_id = req.session.userId;

    console.log(user_id);
    if (!user_id) {
        return res.redirect('/login');
    }

    const sql = 'SELECT cart.*, pizza.name, pizza.price, images.filename, images.path FROM cart JOIN pizza ON cart.pizza_id = pizza.id JOIN images ON pizza.image_id = images.id where cart.user_id = ?';
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching cart data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});

/*Placing an order (in the cart page, when order button is clicked (form submitted) it handle this post)*/
app.post('/buy', (req, res) => {

    const { cartId } = req.body;
    console.log(req.body); 

    db.query('INSERT INTO orders (cartId) VALUES (?)', [cartId], (err) => {
        if (err) {
            console.error('Error adding purchase to order table:', err);
            return res.status(500).json({ message: 'Error adding purchase' });
        }
        res.status(200).json({ message: 'Purchase successful' });
    });
});


/*Contact Us */


app.post('/send',  (req, res) => {
    const { name, email, message } = req.body;
    const newMsg = { name, email, message };

    db.query('INSERT INTO msgs SET ?', newMsg, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err);
            res.status(500).send('Error Sending the Message');
        } else {
            res.sendFile(__dirname + '/pages/order.html');

        }
    });
});



                                        /*  Admin Side   */
/*Retreiving Data for menu*/

app.get('/menu', (req, res) => {
    const sql = 'SELECT pizza.*, images.filename, images.path FROM pizza JOIN images ON pizza.image_id = images.id';
    db.query(sql, (err, results) => {
        if (err) throw err;

        res.json(results);
    });
});

/*Retreiving the messages  for the admin*/

app.get('/messages', (req, res) => {
    const query = 'SELECT * FROM msgs';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/getAllOrders', (req, res) => {
    const query = `
        SELECT 
            orders.id AS order_id,
            pizza.name AS pizza_name,
            user.name AS user_name,
            cart.qty,
            cart.total_price
        FROM orders
        JOIN cart ON orders.cartId = cart.ElementId
        JOIN pizza ON cart.pizza_id = pizza.id
        JOIN user ON cart.user_id = user.id`;

    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


/*Delete From Menu (in view pizzas page their is a buutton remove from menu for each pizza, 
    once clicked this reqquest will be handled) */

app.post('/deleteMenu/:PID', (req, res) => {
    const pizza_id = req.params.PID;

    const deleteOrdersQuery = 'DELETE FROM orders WHERE cartId IN (SELECT ElementId FROM cart WHERE pizza_id = ?)';
    db.query(deleteOrdersQuery, [pizza_id], (ordersErr, ordersResult) => {
        if (ordersErr) {
            console.error('Error deleting related orders:', ordersErr);
            res.status(500).send('An error occurred while processing your request.');
        } else {
            const deleteCartQuery = 'DELETE FROM cart WHERE pizza_id = ?';
            db.query(deleteCartQuery, [pizza_id], (cartErr, cartResult) => {
                if (cartErr) {
                    console.error('Error deleting related cart items:', cartErr);
                    res.status(500).send('An error occurred while processing your request.');
                } else {
                    const deleteQuery = 'DELETE FROM pizza WHERE id = ?';
                    db.query(deleteQuery, [pizza_id], (err, result) => {
                        if (err) {
                            console.error('Error deleting Pizza:', err);
                            res.status(500).send('An error occurred while processing your request.');
                        } else {
                            res.redirect('/AdminPanel.html');
                        }
                    });
                }
            });
        }
    });
});

/*Add Pizza to the Menu */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); 
    },
});

const upload = multer({ storage: storage });

/*middleware function acting as a bridge in btw different components of a software system, helping them communicate 
this occurs between add pizza request and the response to retreive the image from the device
*/

app.use('/images', express.static('images'));

app.post('/addPizza', upload.single('image'), (req, res) => {
    const imageName = req.file.filename;
    const imagepath = "../images/" + imageName;

    const newImg = { filename: imageName, path: imagepath };

    db.query('INSERT INTO images SET ?', newImg, (err, result) => {
        if (err) {
            console.error('Error inserting data into images: ' + err);
            res.status(500).send('Error uploading image');
        } else {
            const imageId = result.insertId;

            const { name, price, qty } = req.body;
            const newPizza = { name, price, image_id: imageId, qty };

            db.query('INSERT INTO pizza SET ?', newPizza, (err, result) => {
                if (err) {
                    console.error('Error inserting data into pizza: ' + err);
                    res.status(500).send('Error inserting pizza data');
                } else {
                    res.sendFile(__dirname + '/AdminPanel.html');
                }
            });
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});