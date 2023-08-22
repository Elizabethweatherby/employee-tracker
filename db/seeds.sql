INSERT INTO department (department_name)
VALUES
    ('Maintenance'),
    ('Janitorial'),
    ('Teaching Staff'),
    ('Office Staff'),
    ('Athletics'),
    ('Kitchen Staff');

INSERT INTO employee_role (title, salary, department_id)
VALUES
  ('Math Teacher', '50000', 3),
  ('Principle', '150000', 4),
  ('Cook, 25000, 6'),
  ('Secretary', '48000', 4),
  ('Handyman', '45000', 1),
  ('Basketball Coach', '40000', 5),
  ('History Teacher, 58000, 3'),
  ('Janitor', '20000', 2),
  ('Science Teacher, 55000, 3'),
  ('Football Coach', '65000', 5),
  ('Vice Principle, 100000, 4');
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Steven', 'Adams', 7, 2),
  ('Janice', 'Keller', 3, 11),
  ('Jerry', 'Black', 5, 11),
  ('Juan', 'Palacios', 10, 11),
  ('Robert', 'Brown', 1, 2),
  ('Kenneth', 'Golding', 6, 2),
  ('Susan', 'Foster', 9, 2),
  ('Barry', 'Kessler', 11, 2),
  ('James', 'Voss', 2, NULL),
  ('Sally', 'Rogers', 8, 11),
  ('Ashley', 'Taylor', 4, 2);