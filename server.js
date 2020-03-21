var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "company_db"
});
connection.connect(function (err) {
  if (err) throw err;
  start();
});
function start() {
  inquirer
    .prompt({
      name: "company",
      type: "list",
      message: "What would you like to do?",
      choices:
        [
          "Add department",
          "Add role",
          "Add employee",
          "View department",
          "View role",
          "View employee",
          "Update employee information"
        ]
    })
    .then(function (answer) {
      if (answer.company === "Add department") {
        addDepartment();
      }
      else if (answer.company === "Add role") {
        addRole();
      } else if (answer.company === "Add employee") {
        addEmployee();
      }
      else if (answer.company === "View department") {
        viewDepartment();
      }
      else if (answer.company === "View role") {
        viewRole();
      }
      else if (answer.company === "View employee") {
        viewEmployee();
      }
      else if (answer.company === "Update employee information") {
        updateEmployee();
      }
    });
}
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What is the department you would like to add?"
      }
    ])
    .then(function (answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.department,
        },
        function (err) {
          if (err) throw err;
          console.log("Your department was created successfully!");
          start();
        }
      );
    });
}
function addEmployee() {
  let roles = []
  let employees = []
  connection.query('select * from role', function (err, res) {
    res.forEach((item) => {
      roles.push({ name: item.name, value: item.id })
    });
    connection.query('select * from employee', function (err, res) {
      res.forEach((item) => {
        employees.push({ name: `${item.first_name} ${item.last_name}`, value: item.id })
      });
      employees.push({ name: 'none', value: null })
      inquirer
        .prompt([
          {
            name: "employeeFirstName",
            type: "input",
            message: "What is the first name of the employee you would like to add?"
          },
          {
            name: "employeeLastName",
            type: "input",
            message: "What is the last name of the employee you would like to add?"
          },
          {
            name: "employeeRoleId",
            type: "list",
            message: "What is the role of this employee?",
            choices: roles
          },
          {
            name: "employeeManagerId",
            type: "list",
            message: "What is the manager of this employee?",
            choices: employees
          }
        ])
        .then(function (answer) {
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.employeeFirstName,
              last_name: answer.employeeLastName,
              role_id: answer.employeeRoleId,
              manager_id: answer.employeeManagerId,
            },
            function (err) {
              if (err) throw err;
              console.log("Your employee was added successfully!");
              start()
            }
          );
        });
    })
  })
}
function addRole() {
  let departments = []
  connection.query("select * from department", function (err, res) {
    res.forEach((item) => {
      departments.push({ name: item.name, value: item.id })
    });
    inquirer
      .prompt([
        {
          name: "roleTitle",
          type: "input",
          message: "What title would you like to add?"
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this role?"
        },
        {
          name: "departmentId",
          type: "list",
          message: "What is the department of this role?",
          choices: departments
        }
      ])
      .then(function (answer) {
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: answer.roleTitle,
            salary: answer.salary,
            department_id: answer.departmentId,
          },
          function (err) {
            if (err) throw err;
            console.log("Your role was added successfully!");
            start();
          }
        );
      });
  })
}
function viewDepartment() {
  var query = "SELECT * FROM department";
  connection.query(query, function (err, res) {
    if (err) throw err;
    res.forEach((item) => {
      console.log("Department id: " + item.id + " | Department name: " + item.name)
    });
    start();
  });
};
function viewRole() {
  var query = "SELECT * FROM role";
  connection.query(query, function (err, res) {
    if (err) throw err;
    res.forEach((item) => {
      console.log("Role id: " + item.id + " | Role title: " + item.title + " | Salary: " + item.salary + " | Role department ID: " + item.department_id)
    });
    start();
  });
};
function viewEmployee() {
  var query = "SELECT * FROM employee";
  connection.query(query, function (err, res) {
    if (err) throw err;
    res.forEach((item) => {
      console.log("Employee id: " + item.id + " | Employee name: " + item.first_name, item.last_name + " | Role ID: " + item.role_id + " | Employee manager ID: " + item.manager_id)
    });
    start();
  });
};
function updateEmployee() {
  var query = "SELECT * FROM employee";
  var employeeList = []
  var roleList = []
  connection.query(query, function (err, res) {
    if (err) throw err;
    res.forEach((item) => {employeeList.push({name: `${item.first_name} ${item.last_name}`, value: item.id})});
    connection.query("SELECT * FROM role", function (err, res) {
      res.forEach((item) => {roleList.push({name: item.title, value: item.id})});
      inquirer.prompt([
        {
          name: 'employee',
          type: "list",
          message: "Which employee would you like to update?",
          choices: employeeList
        },
        {
          name: 'role',
          type: 'list',
          message: 'New role for employeee:',
          choices: roleList
        }
      ]).then((ans) => {
        connection.query(`UPDATE employee SET role_id = ${ans.role} WHERE id = ${ans.employee}`,(err, res) => {
          if (err) throw err;
          console.log("success!");
          start()
        })
      })
    })
  })
}
