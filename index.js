
const mysql = require('mysql2');
const inquirer = require('inquirer');

const connections = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'employee_db'
  
});

connections.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
    Show();
    });

function Show() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you want to do ?',
      choices: [
        'View all Employees',
        'View all Departments',
        'View all Roles',
        'View all Employees By Departments',
        'View all Employees By Managers',
        'Add a Employee',
        'Add a Department',
        'Add a Role',
        'Remove an Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'Exit'
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case 'View all Employees':
          viewEmployee();
          break;
        case 'View all Departments':
          viewDepartment();
          break;
        case 'View all Roles':
          viewRole();
          break;
        case 'View all Employees By Departments':
          viewEmpbyDepartment();
          break;
        case 'View all Employees By Managers':
          viewEmpbyManager();
          break;
        case 'Add a Employee':
          addEmployees();
          break;
        case 'Add a Department':
          addDepartment();
          break;
        case 'Add a Role':
          addRole();
          break;
        case 'Remove an Employee':
          removeEmployee();
          break;
        case 'Update Employee Role':
          updateEmpRole();
          break;
        case 'Update Employee Manager':
          updateEmpManager();
          break;
        case 'Exit':
          connections.end();
          break;
      }
    });
}


function viewEmployee() {
  const query = 'SELECT DISTINCT first_name,last_name,role_id,manager_id FROM employee';
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}

function viewDepartment(){
  const query = 'SELECT DISTINCT name FROM department';
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });


}

function addDepartment() {
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Enter the department name:'
      }
    ])
    .then(answer => {
      const query = 'INSERT INTO department (name) VALUE (?)';
      connections.query(query, [answer.name], (err, res) => {
        if (err) throw err;
        console.log(`${answer.name} added to the database`);
        Show();
      });
    });
}
function viewRole() {
  const query = 'SELECT DISTINCT title,salary,department_id FROM role';
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}

function addRole() {
  inquirer
    .prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title:'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary:'
      },
      {
        name: 'department_id',
        type: 'input',
        message: 'Enter the department Id:'
      }
    ])
    .then(answer => {
      const query = 'INSERT INTO role (title,salary,department_id) VALUES (?,?,?)';
      connections.query(query, [answer.title, answer.salary, answer.department_id], (err, res) => {
        if (err) throw err;
        console.log(`${answer.title} ${answer.salary} ${answer.department_id} added to the database`);
        Show();
      });
    });
}
function addEmployees() {
  inquirer
    .prompt([
      {
        name: 'firstName',
        type: 'input',
        message: 'Enter the employee\'s first name:'
      },
      {
        name: 'lastName',
        type: 'input',
        message: 'Enter the employee\'s last name:'
      },
      {
        name: 'roleId',
        type: 'input',
        message: 'Enter the employee\'s role ID:'
      },
      {
        name: 'managerId',
        type: 'input',
        message: 'Enter the employee\'s manager ID (or leave blank if none):'
      }
    ])
    .then(answer => {
      const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
      connections.query(query, [answer.firstName, answer.lastName, answer.roleId, answer.managerId], (err, res) => {
        if (err) throw err;
        console.log(`${answer.firstName} ${answer.lastName} added to the database`);
        Show();
      });
    });
}

function viewEmpbyDepartment() {
  const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY department';
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}

function viewEmpbyManager() {
  const query = 'SELECT employee.id, employee.first_name, employee.last_name, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id ORDER BY manager';
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}



function removeEmployee() {
  const query = 'SELECT id, first_name, last_name FROM employee';
  connections.query(query, (err, res) => {
    if (err) throw err;
    const choices = res.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));
    inquirer
      .prompt([
        {
          name: 'employeeId',
          type: 'list',
          message: 'Which employee would you like to remove?',
          choices
        }
      ])
      .then(answer => {
        const query = 'DELETE FROM employee WHERE id = ?';
        connections.query(query, [answer.employeeId], (err, res) => {
          if (err) throw err;
          console.log('Employee removed from the database');
          Show();
        });
      });
  });
}

function updateEmpRole() {
  const query = 'SELECT id, first_name, last_name FROM employee';
  connections.query(query, (err, res) => {
    if (err) throw err;
    const employeeoptions = res.map(employee => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id
    }));
    const query = 'SELECT id, title FROM role';
    connections.query(query, (err, res) => {
      if (err) throw err;
      const roleoptions = res.map(role => ({
        name: role.title,
        value: role.id
      }));
      inquirer
        .prompt([
          {
            name: 'employeeId',
            type: 'list',
            message: 'Which employee\'s role would you like to update?',
            choices: employeeoptions
          },
          {
            name: 'roleId',
            type: 'list',
            message: 'Which role would you like to assign to the employee?',
            choices: roleoptions
          }
        ])
        .then(answer => {
          const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
          connections.query(query, [answer.roleId, answer.employeeId], (err, res) => {
            if (err) throw err;
            console.log('Employee\'s role updated in the database');
            Show();
          });
        });
    });
  });
}

function updateEmpManager() {
    const query = 'SELECT id, first_name, last_name FROM employee';
    connections.query(query, (err, res) => {
    if (err) throw err;
    const employeeoptions = res.map(employee => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
    }));
    inquirer
    .prompt([
    {
    name: 'employeeId',
    type: 'list',
    message: 'Which employees manager would you like to update?',
    choices: employeeoptions
    },
    {
    name: 'managerId',
    type: 'list',
    message: 'Which employee do you want to set as manager for the selected employee?',
    choices: employeeoptions
    }
    ])
    .then(answer => {
    const query = 'UPDATE employee SET manager_id = ? WHERE id = ?';
    connections.query(query, [answer.managerId, answer.employeeId], (err, res) => {
    if (err) throw err;
    console.log('Employees manager updated successfully');
    Show();
    });
    });
    });
    }

function viewEmpbyManager() {
  const query = `
    SELECT e1.id,e1.first_name,e1.last_name,CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employee e1 LEFT JOIN employee e2
    ON e1.manager_id = e2.id ORDER BY manager, e1.last_name, e1.first_name
  `;
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}

function viewEmpbyDepartment() {
  const query = `
    SELECT e.id,e.first_name,e.last_name,d.name AS department,r.title,r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d
    ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id
    ORDER BY department, e.last_name, e.first_name
  `;
  connections.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    Show();
  });
}

Show();

