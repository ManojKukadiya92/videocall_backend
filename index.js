const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

//socket io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(cors());

const config = require("./config");

//model
// const Host = require("./server/host/host.model");

//language route
const LanguageRoute = require("./server/language/language.route");
app.use("/language", LanguageRoute);

//Host Call history route
const HostCallHistoryRoute = require("./server/hostCallHistory/hostCallHistory.route");
app.use("/", HostCallHistoryRoute);
const {
  AutoCallDisconnect,
  AutoDeleteHistory,
} = require("./server/hostCallHistory/hostCallHistory.controller");

//user route
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);
//game route
const GameRoute = require("./server/game/game.route");
app.use("/game", GameRoute);
//user route
const CategoryRoute = require("./server/category/category.route");
app.use("/category", CategoryRoute);

//host route
const HostRoute = require("./server/host/host.route");

app.use("/host", HostRoute);

//admin route
const adminRoute = require("./server/admin/admin.route");
app.use("/admin", adminRoute);

//complaint route
const ComplaintRoute = require("./server/complaint/complaint.route");
app.use("/complaint", ComplaintRoute);

//favorite route
const FavoriteRoute = require("./server/favorite/favorite.route");
app.use("/favorite", FavoriteRoute);

//setting route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//plan route
const PlanRoute = require("./server/plan/plan.route");
app.use("/plan", PlanRoute);

//history
const HistoryRoute = require("./server/history/history.route");
app.use("/", HistoryRoute);

//notification
const NotificationRoute = require("./server/notification/notification.route");
app.use("/notification", NotificationRoute);

//dashboard
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//advertisement route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
app.use("/advertisement", AdvertisementRoute);

//banner route
const BannerRoute = require("./server/banner/banner.route");
app.use("/banner", BannerRoute);

app.get("/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose.connect(`mongodb+srv://skytouchinfotech:Skytouch2k21@girlsvideo.yzwjvve.mongodb.net/LiveHunt`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", async () => {
  console.log("MONGO: successfully connected to db");
});

io.on("connect", (socket) => {
  const { globalRoom } = socket.handshake.query;
  const { loginRoom } = socket.handshake.query;
  const { hostLoginRoom } = socket.handshake.query;
  // console.log("loginRoom" + loginRoom);
  // console.log("globalRoom " + globalRoom);
  // console.log("hostLoginRoom " + hostLoginRoom);

  socket.join(globalRoom);
  socket.join(loginRoom);
  socket.join(hostLoginRoom);

  socket.on("callRequest", (data) => {
    // console.log("call request " + data);
    io.in(globalRoom).emit("callRequest", data);
  });
  socket.on("callAnswer", (data) => {
    // console.log("callAnswer " + data);
    io.in(globalRoom).emit("callAnswer", data);
  });

  socket.on("login", (user) => {
    // console.log("login user " + user);
    io.in(loginRoom).emit("login", user);
  });

  socket.on("hostLogin", (host) => {
    // console.log("Host login " + host);
    io.in(hostLoginRoom).emit("hostLogin", host);
  });
});

// server.listen(config.PORT);
// console.log("Magic happens on port " + config.PORT);

//start the server
server.listen(config.PORT, () => {
  console.log("Magic happens on port " + config.PORT);
});
