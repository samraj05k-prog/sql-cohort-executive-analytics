USE enterprise_retail_db;

-- Insert Mock Customers
INSERT INTO customers (customer_id, customer_name, state, signup_date) VALUES
('CUST_101', 'Alex Mercer', 'SP', '2024-01-10 10:00:00'),
('CUST_102', 'Beatriz Silva', 'RJ', '2024-01-15 12:30:00'),
('CUST_103', 'Carlos Eduardo', 'MG', '2024-02-01 09:15:00'),
('CUST_104', 'Daniela Santos', 'SP', '2024-02-18 14:20:00'),
('CUST_105', 'Enzo Gabriel', 'PR', '2024-03-05 16:45:00');

-- Insert Mock Products
INSERT INTO products (product_id, category, price) VALUES
('PROD_01', 'Electronics', 450.00),
('PROD_02', 'Furniture', 120.00),
('PROD_03', 'Audio', 85.50),
('PROD_04', 'Appliances', 310.00);

-- Insert Mock Orders
INSERT INTO orders (order_id, customer_id, order_date, status) VALUES
('ORD_1001', 'CUST_101', '2024-01-12 11:00:00', 'COMPLETED'),
('ORD_1002', 'CUST_102', '2024-01-20 15:00:00', 'COMPLETED'),
('ORD_1003', 'CUST_101', '2024-02-14 10:30:00', 'COMPLETED'),
('ORD_1004', 'CUST_103', '2024-02-05 13:00:00', 'COMPLETED'),
('ORD_1005', 'CUST_104', '2024-02-22 17:10:00', 'COMPLETED'),
('ORD_1006', 'CUST_102', '2024-03-01 11:45:00', 'COMPLETED'),
('ORD_1007', 'CUST_105', '2024-03-10 09:30:00', 'COMPLETED');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, item_price) VALUES
('ORD_1001', 'PROD_01', 1, 450.00),
('ORD_1002', 'PROD_02', 2, 120.00),
('ORD_1003', 'PROD_03', 1, 85.50),
('ORD_1004', 'PROD_04', 1, 310.00),
('ORD_1005', 'PROD_01', 1, 450.00),
('ORD_1006', 'PROD_03', 2, 85.50),
('ORD_1007', 'PROD_02', 1, 120.00);