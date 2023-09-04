const Complaint = require("./complaint.model");
const fs = require("fs");
const User = require("../user/user.model");
const Host = require("../host/host.model");

//complaint list
exports.complaintList = async (req, res, next) => {
  try {
    await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("user_id host_id")
      .exec((error, user) => {
        if (error)
          return res
            .status(200)
            .send({ status: false, error: "Internal server error" });
        else return res.status(200).json({ status: true, user });
      });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//store complaint
exports.storeComplaint = async (req, res, next) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! Invalid Details" });

    if (!req.body.user_id && !req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! id is required" });
    if (!req.body.title)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! title is required" });
    if (!req.body.message)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! message is required" });
    if (!req.body.contact)
      return res
        .status(200)
        .json({ status: false, message: "Oops ! contact is required" });

    if (req.body.user_id) {
      const user = await User.findById(req.body.user_id);

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! user not found" });
      }
    }
    if (req.body.host_id) {
      const host = await Host.findById(req.body.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! host not found" });
      }
    }

    const complaint = new Complaint();
    complaint.user_id = req.body.user_id ? req.body.user_id : null;
    complaint.host_id = req.body.host_id ? req.body.host_id : null;
    complaint.title = req.body.title;
    complaint.message = req.body.message;
    complaint.contact = req.body.contact;
    complaint.image = req.files.image ? req.files.image[0].path : "null";
    complaint.image1 = req.files.image1 ? req.files.image1[0].path : "null";
    complaint.image2 = req.files.image2 ? req.files.image2[0].path : "null";
    complaint.date = new Date().toISOString().slice(0, 10);

    const randomChars = "0123456789";
    let randomId = "";
    for (let i = 0; i < 4; i++) {
      randomId += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }

    complaint.id = randomId;
    await complaint.save((error, complaint) => {
      if (error) {
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      } else
        return res.status(200).json({
          status: true,
          message: "Complaint Add Successfully",
          complaint,
        });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(200)
      .json({ status: false, error: error.message || "server error" });
  }
};

//view ticket (show user complaint list of particular user)
exports.viewComplaint = async (req, res, next) => {
  try {
    if (req.query.user_id) {
      const user = await User.findById(req.query.user_id);

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! user not found" });
      }

      const viewTicket = await Complaint.find({
        user_id: req.query.user_id,
      }).sort({ createdAt: -1 });
      if (!viewTicket)
        return res
          .status(200)
          .json({ status: false, message: "Oops ! something went wrong" });

      return res
        .status(200)
        .json({ status: true, message: "success", viewTicket });
    }
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Oops ! host not found" });
      }

      const viewTicket = await Complaint.find({ host_id: req.query.host_id });
      if (!viewTicket)
        return res
          .status(200)
          .json({ status: false, message: "Oops ! something went wrong" });

      return res
        .status(200)
        .json({ status: true, message: "success", viewTicket });
    }
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//complaint open or not
exports.openComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.complaint_id);

    if (!complaint) {
      return res.status(200).send({
        status: false,
        message: "Oops ! complaint does not exist",
      });
    }

    complaint.isOpen = !complaint.isOpen;
    await complaint.save((error, complaint) => {
      if (error) {
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      } else
        return res.status(200).json({
          status: true,
          message: "Complaint Add Successfully",
          complaint,
        });
    });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//pending complain
exports.pendingComplain = async (req, res, next) => {
  try {
    let complain = [];
    let query;
    if (req.query.type === "user") {
      query = { host_id: null };
    } else if (req.query.type === "host") {
      query = { user_id: null };
    }

    if (
      req.query.type !== "all" &&
      (req.query.start !== "all" || req.query.end !== "all")
    ) {
      complain = await Complaint.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
              query,
              { isOpen: false },
            ],
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      await Complaint.populate(complain, { path: "user_id host_id" });
    } else if (
      req.query.type !== "all" &&
      (req.query.start === "all" || req.query.end === "all")
    ) {
      complain = await Complaint.find({
        $and: [{ isOpen: false }, query],
      })
        .sort({ createdAt: -1 })
        .populate("user_id host_id");
    } else if (
      req.query.type === "all" &&
      (req.query.start !== "all" || req.query.end !== "all")
    ) {
      complain = await Complaint.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
              { isOpen: false },
            ],
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
      await Complaint.populate(complain, { path: "user_id host_id" });
    } else {
      complain = await Complaint.find()
        .where({ isOpen: false })
        .sort({ createdAt: -1 })
        .populate("user_id host_id");

      if (!complain) {
        throw new Error();
      }
    }
    return res.status(200).json({ status: true, message: "success", complain });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//solved complain
exports.solvedComplain = async (req, res, next) => {
  try {
    let complain = [];
    let query;
    if (req.query.type === "user") {
      query = { host_id: null };
    } else if (req.query.type === "host") {
      query = { user_id: null };
    }
    if (
      req.query.type !== "all" &&
      (req.query.start !== "all" || req.query.end !== "all")
    ) {
      complain = await Complaint.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
              { isOpen: true },
              query,
            ],
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
      ]);

      await Complaint.populate(complain, { path: "user_id host_id" });
    } else if (
      req.query.type !== "all" &&
      (req.query.start === "all" || req.query.end === "all")
    ) {
      complain = await Complaint.find({
        $and: [{ isOpen: true }, query],
      }).populate("user_id host_id");
    } else if (
      req.query.type === "all" &&
      (req.query.start !== "all" || req.query.end !== "all")
    ) {
      complain = await Complaint.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                dateString: {
                  $gte: req.query.start,
                  $lte: req.query.end,
                },
              },
              { isOpen: true },
            ],
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
      ]);

      await Complaint.populate(complain, { path: "user_id host_id" });
    } else {
      complain = await Complaint.find()
        .where({ isOpen: true })
        .sort({ updatedAt: -1 })
        .populate("user_id host_id");

      if (!complain) {
        throw new Error();
      }
    }
    return res.status(200).json({ status: true, message: "success", complain });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//pending date list
exports.pendingDateList = async (req, res, next) => {
  try {
    const date = await Complaint.aggregate([
      { $match: { isOpen: false } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },

      { $sort: { _id: -1 } },
    ]);

    if (!date) {
      throw new Error();
    }

    return res.status(200).json({ status: 200, message: "Success", date });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//solved date list
exports.solvedDateList = async (req, res, next) => {
  try {
    const date = await Complaint.aggregate([
      { $match: { isOpen: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (!date) {
      throw new Error();
    }

    return res.status(200).json({ status: 200, message: "Success", date });
  } catch (error) {
    // console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
