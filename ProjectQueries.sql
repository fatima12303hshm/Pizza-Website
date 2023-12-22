
Create database PizzaProject;
use PizzaProject;
CREATE TABLE User (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phoneNb VARCHAR(255) NOT NULL,
  isAdmin INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);
INSERT INTO User (name, email, password, phoneNb, isAdmin)
VALUES ('Reem Husseiny', 'reem@example.com', 'password123', '79126521',0);
INSERT INTO User (name, email, password, phoneNb, isAdmin)
VALUES ('Fatima Hashem', 'fatima@example.com', 'password123', '71559927',1);
INSERT INTO User (name, email, password, phoneNb, isAdmin)
VALUES ('Tala Safa', 'tala@example.com', 'password123', '79126521',0);
INSERT INTO User (name, email, password, phoneNb, isAdmin)
VALUES ('Abed Mostafa', 'abed@example.com', 'password123', '79126521',0);


INSERT INTO User (name, email, password, phoneNb, isAdmin)
VALUES ('Hadi Sabra', 'hadi@example.com', 'password123', '79126521',0);

Update USer set isAdmin = 1 where id= 1;

CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL
);
INSERT INTO images (filename, path) VALUES
('pizza-1.jpg', '../images/pizza-1.jpg'),
('pizza-2.jpg', '../images/pizza-2.jpg'),
('pizza-3.jpg', '../images/pizza-3.jpg'),
('pizza-4.jpg', '../images/pizza-4.jpg');

CREATE TABLE pizza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_id INT,
    qty int,
    FOREIGN KEY (image_id) REFERENCES images(id)
);

delete from images where id<=14;




INSERT INTO pizza (name, price, image_id, qty) VALUES
('Margherita', 8.99, 15, 5),
('Pepperoni', 10.99, 16, 12),
('Vegetarian', 9.99, 17, 12);

delete from cart where ElementId<4 ;


create table cart( ElementId INT AUTO_INCREMENT PRIMARY KEY, pizza_id int, qty int , total_price decimal, user_id int,
    FOREIGN KEY (pizza_id) REFERENCES pizza(id),
	FOREIGN KEY (user_id) REFERENCES user(id));


create table orders(id INT AUTO_INCREMENT PRIMARY KEY, cartId int, 
	FOREIGN KEY (cartId) REFERENCES cart(ElementId));
    
drop table msgs;

create table msgs (id INT AUTO_INCREMENT PRIMARY KEY, name varchar(255), email varchar(255), message varchar(255));
 
select * from msgs;

select * from pizza
