import app from "./app.js";

const PORT = process.env.PORT;

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
