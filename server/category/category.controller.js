const Category = require("./category.modal");
const fs = require("fs");

//Get Category
exports.get = async (req, res) => {
  try {
    const category = await Category.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ status: true, message: "Successful !", category });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error !" });
  }
};

//Store Category
exports.storeCategory = async (req, res) => {
  try {
    if (req.body && req.body.name) {
      const categoryName = await Category.findOne({ name: req.body.name });
      if (categoryName) {
        return res.status(200).json({ status: false, message: "Category already exists" })
      }
      const category = new Category();
      category.name = req.body.name;

      if (req.file) {
        category.image = req.file.path;
      }

      await category.save((error, category) => {
        if (error) {
          return res
            .status(200)
            .json({ status: false, error: error.message || "Server Error" });
        } else {
          return res.status(200).json({
            status: true,
            message: "Category Inserted Successfully ✔",
            category,
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error !" });
  }
};

//Update Category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.query.category_id);

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: "Category Does Not Exists !!" });
    }

    if (req.body && req.body.name) {
      if (req.file) {
        if (fs.existsSync(category.image)) {
          fs.unlinkSync(category.image);
        }
        category.image = req.file.path;
      }
      category.name = req.body.name;

      await category.save((error, category) => {
        if (error) {
          return res
            .status(500)
            .json({ status: false, error: error.message || "Server Error" });
        } else {
          return res.status(200).json({
            status: true,
            message: "Category Updated Successfully ✔",
            category,
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error !" });
  }
};

//Delete Data
exports.destroyCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.query.category_id);

    if (!category) {
      return res
        .status(200)
        .json({ status: false, message: "Category Does Not Exists ❌" });
    }

    if (fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }

    await category.deleteOne();
    return res
      .status(200)
      .json({ status: true, message: "Category Deleted Successfully ✔" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error !" });
  }
};
