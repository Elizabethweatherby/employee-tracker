const inquirer = require("inquirer");
const connection = require("mysql2");
connection.connect
begin();

function begin() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                "View Employees by Manager",
                "View Employees by Department",
                "View budget of a department",
                "Exit",
            ],
        })
        .then((answer) => {
            const actionFunctions = {
                "View all departments": viewAllDepartments,
                "View all roles": viewAllRoles,
                "View all employees": viewAllEmployees,
                "Add a department": addDepartment,
                "Add a role": addRole,
                "Add an employee": addEmployee,
                "Update an employee role": updateEmployeeRole,
                "View Employees by Manager": viewEmployeesByManager,
                "View Employees by Department": viewEmployeesByDepartment,
                "View budget of a department": viewBudgetOfDepartment,
                "Exit": () => {
                    connection.end();
                    console.log("Goodbye!");
                }
            };

            const selectedAction = actionFunctions[answer.action];
            if (selectedAction) {
                selectedAction();
            }
        });
}

function viewAllDepartments() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin();
    });
}

function viewAllRoles() {
    const query = `SELECT roles.title, roles.id, departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin();
    });
}

function viewAllEmployees() {
    const query =
        `SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin();
    });
}

function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "What do you want to call the new department:",
        })
        .then((answer) => {
            console.log(answer.name);
            const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database!`);

                begin();
                console.log(answer.name);
            });
        });
}

function addRole() {
    const query = `SELECT * FROM departments`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "What is the role's title:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "What is the new roles salary:",
                },
                {
                    type: "list",
                    name: "department",
                    message: "What department is the new role:",
                    choices: res.map(
                        (department) => department.department_name
                    ),
                },
            ])
            .then((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );
                const query = `INSERT INTO roles SET ?`;
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        department_id: department,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Added ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
                        );

                        begin();
                    }
                );
            });
    });
}

function addEmployee() {
    connection.query(`SELECT id, title FROM roles`, (error, results) => {
        if (error) {
            console.error(error);
            return;
        }

        const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        connection.query(
            `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`,
            (error, results) => {
                if (error) {
                    console.error(error);
                    return;
                }

                const managers = results.map(({ id, name }) => ({
                    name,
                    value: id,
                }));

                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Employee's first name:",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Employee's last name:",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Employee role:",
                            choices: roles,
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Employee manager:",
                            choices: [
                                { name: "None", value: null },
                                ...managers,
                            ],
                        },
                    ])
                    .then((answers) => {
                        const sql =
                            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                        const values = [
                            answers.firstName,
                            answers.lastName,
                            answers.roleId,
                            answers.managerId,
                        ];
                        connection.query(sql, values, (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }

                            console.log("Added employee successfully");
                            begin();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        );
    });
}

function updateEmployeeRole() {
    const queryEmployees =
        `SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id`;
    const queryRoles = "SELECT * FROM roles";
    connection.query(queryEmployees, (err, resEmployees) => {
        if (err) throw err;
        connection.query(queryRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Which employee do you want to update:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "Select a new role:",
                        choices: resRoles.map((role) => role.title),
                    },
                ])
                .then((answers) => {
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                    );
                    const role = resRoles.find(
                        (role) => role.title === answers.role
                    );
                    const query =
                        `UPDATE employee SET role_id = ? WHERE id = ?`;
                    connection.query(
                        query,
                        [role.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`
                            );

                            begin();
                        }
                    );
                });
        });
    });
}

function viewEmployeesByManager() {
    const query =
        `SELECT 
        e.id, 
        e.first_name, 
        e.last_name, 
        r.title, 
        d.department_name, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM 
        employee e
        INNER JOIN roles r ON e.role_id = r.id
        INNER JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY 
        manager_name, 
        e.last_name, 
        e.first_name`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        const employeesByManager = res.reduce((acc, cur) => {
            const managerName = cur.manager_name;
            if (acc[managerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});
        console.log("Employees by manager:");
        for (const managerName in employeesByManager) {
            console.log(`\n${managerName}:`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                console.log(
                    `  ${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`
                );
            });
        }
        begin();
    });
}

function viewEmployeesByDepartment() {
    const query =
        `SELECT departments.department_name, employee.first_name, employee.last_name FROM employee INNER JOIN roles
        ON employee.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY departments.department_name ASC`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nEmployees by department:");
        console.table(res);
        begin();
    });
}

function viewBudgetOfDepartment() {
    const query = "SELECT * FROM departments";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department) => ({
            name: department.department_name,
            value: department.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message:
                    "Which department do you want the total salary for?",
                choices: departmentChoices,
            })
            .then((answer) => {
                const query =
                    `SELECT departments.department_name AS department,
                SUM(roles.salary) AS total_salary
                FROM departments
                INNER JOIN roles ON departments.id = roles.department_id
                INNER JOIN employee ON roles.id = employee.role_id
                WHERE departments.id = ?
                GROUP BY departments.id;`;
                connection.query(query, [answer.departmentId], (err, res) => {
                    if (err) throw err;
                    const totalSalary = res[0].total_salary;
                    console.log(
                        `The total salary for this department is $${totalSalary}`
                    );
                    begin();
                });
            });
    });
}

process.on("exit", () => {
    connection.end();
});