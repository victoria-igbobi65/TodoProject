const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");

const task = JSON.parse(
  fs.readFileSync(path.join(__dirname, "tasks.json"), "utf8")
);
const app = express();

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
app.use(bodyParser.json());

let user = "";

function getusers() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, "users.json"), (err, data) => {
      if (err) {
        reject("An error occured!");
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/login.html"));
});

app.post("/login", async (req, res) => {
  const users = await getusers();
  const foundUser = users.find((user) => {
    return user.email === req.body.email;
  });
  if (!foundUser) {
    res.sendFile(path.join(__dirname, "./public/registration.html"));
  } else {
    const passwordMatch =
      foundUser.password === req.body.password &&
      foundUser.username === req.body.username;
    if (!passwordMatch) {
      res.status(400).send("Inavlid Password or username");
    } else {
      user = req.body.email;
      const mytask = task[req.body.email];
      res.render("todo", { userTask: mytask });
    }
  }
});

app.post("/register", async (req, res) => {
  //const user = req.body
  const users = await getusers();
  const foundUser = users.find((user) => {
    return user.email === req.body.email;
  });
  if (foundUser) {
    res.sendFile(path.join(__dirname, "./public/login.html"));
  } else {
    users.push(req.body);
    fs.writeFile(
      path.join(__dirname, "users.json"),
      JSON.stringify(users),
      (err) => {
        if (err) {
          res.send("An error occured!");
        }
      }
    );
    task[req.body.email] = [];
    fs.writeFile(
      path.join(__dirname, "tasks.json"),
      JSON.stringify(task),
      (err) => {
        if (err) {
          console.log(err);
        } else {
          user = req.body.email;
          res.render("todo", { userTask: task[req.body.email] });
        }
      }
    );
  }
});

app.post("/addTask", (req, res) => {
  let userTask = task[user];
  userTask.push(req.body.newTask);
  fs.writeFile(
    path.join(__dirname, "tasks.json"),
    JSON.stringify(task),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("todo ", { userTask: task[user] });
      }
    }
  );
});

app.listen(5000, () => {
  console.log("Server is on!");
});
