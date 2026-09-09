const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { getConfig } = require("../utils/config");
const { attachUser } = require("../middlewares/auth");
const { apiLimiter, webLimiter } = require("../middlewares/rateLimiter");
const { maintenanceGuard } = require("../middlewares/maintenance");
const { notFoundHandler, globalErrorHandler } = require("../middlewares/errorHandler");

const authRoutes = require("../routes/authRoutes");
const webRoutes = require("../routes/webRoutes");
const botRoutes = require("../routes/botRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const adminRoutes = require("../routes/adminRoutes");
const apiRoutes = require("../routes/apiRoutes");

function createServer() {
  const { website, security, site } = getConfig();
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "..", "views"));
  app.set("trust proxy", website.trustProxy);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(compression());
  app.use(morgan("tiny"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    session({
      secret: security.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: getConfig().database.url, collectionName: "sessions" }),
      cookie: {
        secure: security.cookieSecure,
        httpOnly: true,
        sameSite: "lax",
        maxAge: security.cookieMaxAgeDays * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(express.static(path.join(__dirname, "..", "..", "public")));

  app.use((req, res, next) => {
    res.locals.site = getConfig().site;
    next();
  });

  app.use(attachUser());
  app.use(maintenanceGuard);
  app.use(webLimiter());

  app.use("/auth", authRoutes);
  app.use("/", webRoutes);
  app.use("/", botRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/admin", adminRoutes);
  app.use("/api", apiLimiter(), apiRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = { createServer };
