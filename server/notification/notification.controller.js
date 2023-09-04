const { serverPath, serverKey } = require("../../config");
const Host = require("../host/host.model");
const shuffle = require("../../util/shuffle");

const FCM = require("fcm-node");

const fcm = new FCM(serverKey);

let sended = true;
//send notification
exports.send = async (req, res) => {
  try {
    const image = await Host.find({ isDisable: false })
      .sort({ createdAt: 1 })
      .populate("language");

    const mainArr = await image.map((obj) => ({
      ...obj._doc,
      isLike: false,
    }));
    const data = mainArr.slice(0, 1);
    await shuffle(data);

    // console.log(data[0]);

    sended = false;
    const topic = "/topics/CHUMI";
    const message = {
      to: topic,
      notification: {
        body: req.body.description,
        title: req.body.title,
        image: serverPath + req.file.path,
      },
      data: { host: data[0] },
    };

    if (sended === false) {
      sended = true;

      await fcm.send(message, async (err, response) => {
        if (err) {
          sended = false;
          // console.log(err);
        } else {
          sended = false;
          res.status(200).json({
            status: 200,
            message: "Successfully sent message",
            data: true,
          });
          // console.log("Successfully sent with response: ", response);
        }
      });
    }
  } catch (error) {
    // console.log("Error sending message:", error);
  }
};
