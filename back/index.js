import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());



app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));



app.use(cookieParser());




const StudentsSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const studentModel = mongoose.model("studentsDetails", StudentsSchema);

mongoose.connect("mongodb://localhost:27017/School", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/registration', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new studentModel({ name, email, password: hashedPassword });

    const user = await newUser.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await studentModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Wrong Password" });
    }

    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1m' }); // Set expiration to 1 minute
    const refreshToken = jwt.sign({ userId: user._id }, 'Refresh-secretKey', { expiresIn: '1d' });// Set expiration to 1 day

      // Set tokens as HTTP-only cookies
      res.cookie('token', token, { httpOnly: true, sameSite: 'Strict',maxAge:30 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 86400000 });
  
      res.json({ success: true, token,Login:true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  })

  


app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});





const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import cookieParser from "cookie-parser";
// import https from "https";
// import fs from "fs";

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(cookieParser());

// const StudentsSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
// });

// const studentModel = mongoose.model("studentsDetails", StudentsSchema);

// mongoose.connect("mongodb://localhost:27017/School", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Load SSL certificate and private key
// const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
// const certificate = fs.readFileSync('path/to/certificate.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

// const httpsServer = https.createServer(credentials, app);

// app.post('/registration', async (req, res) => {
//   // ... (unchanged)
// });

// app.post('/login', async (req, res) => {
//   // ... (unchanged)
// });

// httpsServer.listen(4000, () => {
//   console.log("Server is running on port 4000 (HTTPS)");
// });
