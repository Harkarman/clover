const express = require("express");
const app = express();
const port = 8000;

//set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

//user express router
app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server ${err}`);
  }
  console.log(`Server is running at port ${port}`);
});
