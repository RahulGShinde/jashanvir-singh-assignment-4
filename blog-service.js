var fs = require("fs");
var exports = (module.exports = {});
var posts = [];
var categories = [];
exports.initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/categories.json", "utf8", (error, data) => {
      try {
        categories = JSON.parse(data);
        resolve("File is open");
      } catch (error) {
        reject("Unable to open File!");
      }
    });
    fs.readFile("./data/posts.json", "utf8", (error, data) => {
      try {
        posts = JSON.parse(data);
        resolve("File is open");
      } catch (error) {
        reject("Unable to open File!");
      }
    });
  });
};
exports.getAllPosts = () => {
  return new Promise((resolve, reject) => {
    if (posts.length == 0) {
      reject("Nothing is returned");
    } else {
      resolve(posts);
    }
  });
};
exports.getPublishedPosts = () => {
  let kp = [];
  return new Promise((resolve, reject) => {
    if (posts.length == 0) {
      var er = "Nothing in File";
      reject("nothing");
    } else {
      for (let k = 0; k < posts.length; k++) {
        if (posts[k].published == true) {
          kp.push(posts[k]);
        }
      }
      if (kp == 0) {
        er = "Sorry! no post yet";
      } else {
        resolve(kp);
      }
    }
  });
};
exports.getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length == 0) {
      reject("Nothing is returned");
    } else {
      resolve(categories);
    }
  });
};
exports.addPost = function (postData) {
  if (!postData.published) {
    postData.published = false;
  } else {
    postData.published = true;
  }
  postData.id = posts.length + 1;
  let curDate = new Date()
  postData.postDate = curDate.toISOString().split('T')[0]
  posts.push(postData);
  return new Promise((resolve, reject) => {
    resolve(posts);
    if (posts.length == 0) {
      reject("no results returned");
    }
  });
};
exports.getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    let pc = posts.filter((posts) => posts.category == category);
    if (pc.length == 0) {
      reject("no results returned");
    } else {
      resolve(pc);
    }
  });
};
exports.getPostsByMinDate = (minDate) => {
  return new Promise((resolve, reject) => {
    let pdt = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDate)
    );
    if (new Date(somePostObj.postDate) >= new Date(minDateStr)) {
      console.log("The postDate value is greater than minDateStr");
    } else {
      reject("no results returned");
    }
  });
};
exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
    let pid = posts.filter((posts) => posts.id == id);
    if (pid.length == 0) {
      reject("no results returned");
    } else {
      resolve(pid);
    }
  });
};

exports.getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    let pc = posts.filter((post) => post.published == true && post.category == category);
    if (pc.length == 0) {
      reject("no results returned");
    } else {
      resolve(pc);
    }
  });
}