const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} = require("../controllers/authController");

const { expect } = chai;

describe("User Controller Tests", () => {
  afterEach(() => {
    sinon.restore();
  });

  // ---------------- REGISTER ----------------
  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const req = {
        body: {
          name: "Test",
          email: "test@example.com",
          password: "password",
          role: "employee",
        },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").resolves(null);
      sinon.stub(User, "create").resolves({ id: new mongoose.Types.ObjectId(), ...req.body });
      sinon.stub(jwt, "sign").returns("fake-token");

      await registerUser(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledWithMatch({
          email: "test@example.com",
          token: "fake-token",
        })
      ).to.be.true;
    });

    it("should return 400 if user already exists", async () => {
      const req = { body: { email: "existing@example.com" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").resolves({ email: "existing@example.com" });

      await registerUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: "User already exists" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = { body: { email: "error@example.com" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").throws(new Error("DB Error"));

      await registerUser(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });

  // ---------------- LOGIN ----------------
  describe("loginUser", () => {
    it("should login successfully", async () => {
      const password = "password";
      const hashedPassword = await bcrypt.hash(password, 10);
      const req = { body: { email: "test@example.com", password } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").resolves({
        id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hashedPassword,
        role: "employee",
      });
      sinon.stub(jwt, "sign").returns("fake-token");

      await loginUser(req, res);

      expect(res.json.calledWithMatch({ email: "test@example.com", token: "fake-token" })).to.be.true;
    });

    it("should return 401 for invalid credentials", async () => {
      const req = { body: { email: "wrong@example.com", password: "password" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").resolves(null);

      await loginUser(req, res);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: "Invalid email or password" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = { body: { email: "error@example.com", password: "pass" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findOne").throws(new Error("DB Error"));

      await loginUser(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });

  // ---------------- GET PROFILE ----------------
  describe("getProfile", () => {
    it("should return user profile", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId(), role: "employee" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").resolves({
        id: req.user.id,
        name: "Test",
        email: "test@example.com",
        role: "employee",
        description: "Test description",
        address: "Test address"
      });

      await getProfile(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({
        id: req.user.id,
        name: "Test",
        email: "test@example.com",
        role: "employee",
        description: "Test description",
        address: "Test address"
      })).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").resolves(null);

      await getProfile(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "User not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").throws(new Error("DB Error"));

      await getProfile(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });

  // ---------------- UPDATE PROFILE ----------------
  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId(), role: "admin" }, 
        body: { name: "Updated", role: "employer" },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      const saveStub = sinon.stub().resolves({
        id: req.user.id,
        name: "Updated",
        email: "test@example.com",
        description: "Test description",
        address: "Test address",
        role: "employer"
      });
      sinon.stub(User, "findById").resolves({ id: req.user.id, name: "Old", save: saveStub });

      sinon.stub(jwt, "sign").returns("fake-token");

      await updateUserProfile(req, res);

      expect(res.json.calledWithMatch({ name: "Updated", role: "employer", token: "fake-token" })).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").resolves(null);

      await updateUserProfile(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "User not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").throws(new Error("DB Error"));

      await updateUserProfile(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });

  // ---------------- ADMIN: Get All Users ----------------
  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const req = {};
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "find").resolves([{ id: 1, name: "User1" }, { id: 2, name: "User2" }]);

      await getAllUsers(req, res);

      expect(res.json.calledWithMatch([{ id: 1, name: "User1" }, { id: 2, name: "User2" }])).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = {};
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "find").throws(new Error("DB Error"));

      await getAllUsers(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });

  // ---------------- ADMIN: Delete User ----------------
  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const req = { params: { id: "123" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      const removeStub = sinon.stub().resolves();

      sinon.stub(User, "findById").resolves({ remove: removeStub });

      await deleteUser(req, res);

      expect(res.json.calledWithMatch({ message: "User deleted" })).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      const req = { params: { id: "123" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").resolves(null);

      await deleteUser(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "User not found" })).to.be.true;
    });

    it("should return 500 on error", async () => {
      const req = { params: { id: "123" } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      sinon.stub(User, "findById").throws(new Error("DB Error"));

      await deleteUser(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
    });
  });
});
