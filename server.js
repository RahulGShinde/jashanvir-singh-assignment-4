
/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name:Jashanvir Singh    Student ID: 144522208  Date: ________________
*
*  Online (Heroku) Link: https://jashanvir-singh-assignment-4.herokuapp.com/
*
********************************************************************************/



var express = require("express");
var app = express();
var path = require("path");
var blogservice = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
const blogData = require("./blog-service");

app.set("view engine", "hbs");
app.engine(
  "hbs",
  exphbs({
    layoutsDir: __dirname + "/views/layouts",
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return '<li' +
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      }
    },
  })
);

app.use(express.static("public"));
var HTTP_PORT = process.env.PORT || 5000;
cloudinary.config({
  cloud_name: "decgowxja",
  api_key: "636678892342188",
  api_secret: "7K_ErOmAKtr7MfaMOK0gf7_aY4k",
  secure: true,
});
const upload = multer();
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.get("/", function (req, res) {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});
app.get("/posts/add", function (req, res) {
  res.render("addPost", {
    layout: "main",
    activeMenu: "addPost",
  });
});

app.get('/blog', async (req, res) => {
  let viewData = {};

  try {
    let posts = [];
    if (req.query.category) {
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blogData.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    let post = posts[0];
    viewData.posts = posts;
    viewData.post = post;
    viewData.title = post.title;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await blogData.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }
  res.render("blog", { layout: "main", data: viewData })

});

app.get('/blog/:id', async (req, res) => {
  let viewData = {};

  try {
    let posts = [];
    if (req.query.category) {
      posts = await blogData.getPublishedPostsByCategory(req.query.category);
    } else {
      posts = await blogData.getPublishedPosts();
    }
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    viewData.posts = posts;

  } catch (err) {
    console.log(err);
    viewData.message = "no results";
  }

  try {
    const curPost = await blogData.getPostById(req.params.id);
    viewData.post = curPost[0];
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await blogData.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }
  console.log(viewData);
  res.render("blog", { layout: "main", data: viewData })
});


app.get("/posts", function (req, res) {
  if (req.query.category) {
    blogservice
      .getPostsByCategory(req.query.category)
      .then((data) => {
        res.render("posts", { layout: "main", posts: data })
      })
      .catch((err) => {
        res.json(err);
      });
  } else if (req.query.minDate) {
    blogservice
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.render("posts", { posts: data })
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    blogservice
      .getAllPosts()
      .then((data) => {
        res.render("posts", { layout: "main", posts: data })
      })
      .catch((err) => {
        res.render("posts", { layout: "main", message: "no results" });
      });
  }
});
app.get("/post/:value", (req, res) => {
  console.log(app.locals.viewingCategory);
  console.log(app.locals.activeRoute);
  blogservice
    .getPostsById(req.params.value)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
});
app.get("/categories", function (req, res) {
  console.log(app.locals.viewingCategory);

  blogservice
    .getCategories()
    .then((data) => {
      res.render("categories", { layout: "main", categories: data });
    })
    .catch((err) => {
      res.render("categories", { layout: "main", message: "no results" });
    });
});
app.post(
  "/posts/add",
  upload.single("featureImage"),
  function (req, res, next) {
    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }
      upload(req).then((uploaded) => {
        processPost(uploaded.url);
      });
    } else {
      processPost("");
    }
    function processPost(imageUrl) {
      req.body.featureImage = imageUrl;
    }
    blogservice.addPost(req.body).then(() => {
      res.redirect("/posts");
    });
  }
);
app.get("*", function (req, res) {
  res.status(404).render("404", { layout: "main" });
});
blogservice
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log(err);
  });
