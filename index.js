import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getList() {
  const result = await db.query("SELECT * FROM list ORDER BY id ASC");
  return result.rows;
}

async function addItem(item) {
  const result = await db.query("INSERT INTO list (title) VALUES ($1)",[item]);
  return result;
}

async function updateItem(id,title) {
  const result = await db.query("UPDATE list SET title=$1 WHERE id=$2",
    [title,id]
  );
  return result;
}

async function deleteItem(id) {
  const result = await db.query("DELETE FROM list WHERE id=$1",
    [id]
  );
  return result;
}

app.get("/", async (req, res) => {
  items = await getList();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  try {
    const result = await addItem(req.body.newItem);
    // console.log(result);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.post("/edit", async (req, res) => {
  try {
    const result = await updateItem(req.body.updatedItemId,req.body.updatedItemTitle);
    // console.log(result);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const result = await deleteItem(req.body.deleteItemId);
    // console.log(result);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
