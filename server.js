require('dotenv').config();  // Load environment variables
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const WebSocket = require("ws");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

// ✅ Define PORT before using it
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://AbhayCodeSphere:Abhay9305755915@cluster0.v65hw.mongodb.net/CodeSphereDataBase?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  console.log(err ? 'Error in DB connection: ' + err : 'MongoDB Connection Succeeded.');
});

const db = mongoose.connection;

// ✅ Session Setup
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db })
}));

// ✅ Middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);

// ✅ Error Handling
app.use((req, res, next) => {
  next(new Error('File Not Found', { status: 404 }));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message);
});

// ✅ Start Server
const server = app.listen(PORT, () => {
  console.log('Server is started on http://127.0.0.1:' + PORT);
});

// ✅ WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const { language, code, userInput } = JSON.parse(message); // ✅ Include userInput
        runCode(ws, language, code, userInput);
    });
});

const runCode = (ws, language, code, userInput = "") => {
  const fileExt = { "python": ".py", "javascript": ".js", "cpp": ".cpp", "java": ".java" };
  const filename = `temp${fileExt[language]}`;
  const filePath = path.join(__dirname, filename);
  const inputPath = path.join(__dirname, "input.txt");

  fs.writeFileSync(filePath, code);
  fs.writeFileSync(inputPath, userInput); // ✅ Write user input to input.txt

  let command;
  
  switch (language) {
      case "python":
          command = `python ${filePath} < ${inputPath}`;
          break;

      case "javascript":
          command = `node ${filePath} < ${inputPath}`;
          break;

      case "cpp":
          command = `g++ ${filePath} -o temp.exe && temp.exe < ${inputPath}`;
          break;

      case "java":
          // ✅ Extract the class name dynamically from the Java code
          const classNameMatch = code.match(/class (\w+)/);
          if (!classNameMatch) {
              ws.send("Error: Java class name not found.");
              return;
          }
          const className = classNameMatch[1];
          command = `javac ${filePath} && java ${className} < ${inputPath}`;
          break;

      default:
          ws.send("Unsupported language");
          return;
  }

  exec(command, (error, stdout, stderr) => {
      if (error) {
          ws.send(`Error: ${stderr}`);
      } else {
          ws.send(stdout);
      }

      // Cleanup
      fs.unlinkSync(filePath);
      fs.unlinkSync(inputPath);
      if (language === "cpp") fs.unlinkSync(path.join(__dirname, "temp.exe"));
  });
};

console.log("WebSocket Server is running!");
