const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Job = require('../models/jobModel');
const { applyJob } = require('../controllers/jobController');

const { expect } = chai;

describe('Job Controller - applyJob', () => {

  afterEach(() => {
    // restore stubs after every test
    sinon.restore();
  });

  it('should allow an employee to apply for a job', async () => {
    const jobId = new mongoose.Types.ObjectId();
    const employerId = new mongoose.Types.ObjectId();
    const employeeId = new mongoose.Types.ObjectId();

    const job = {
      _id: jobId,
      employer: employerId,
      applications: [],
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Job, 'findById').resolves(job);

    const req = { params: { id: jobId }, user: { role: 'employee', _id: employeeId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await applyJob(req, res);

    expect(job.applications.length).to.equal(1);
    expect(res.json.calledWith({ message: 'Applied successfully!' })).to.be.true;
  });

  it('should prevent applying twice', async () => {
    const jobId = new mongoose.Types.ObjectId();
    const employeeId = new mongoose.Types.ObjectId();

    const job = {
      _id: jobId,
      employer: new mongoose.Types.ObjectId(),
      applications: [{ applicant: employeeId }],
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Job, 'findById').resolves(job);

    const req = { params: { id: jobId }, user: { role: 'employee', _id: employeeId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await applyJob(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'You already applied for this job.' })).to.be.true;
  });

  it('should return 403 if user is not employee', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId() }, user: { role: 'employer' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await applyJob(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWith({ message: 'Only employees can apply for jobs.' })).to.be.true;
  });

  it('should return 404 if job not found', async () => {
    const jobId = new mongoose.Types.ObjectId();
    sinon.stub(Job, 'findById').resolves(null);

    const req = { params: { id: jobId }, user: { role: 'employee', _id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await applyJob(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Job not found' })).to.be.true;
  });

  it('should return 500 on DB error', async () => {
    const jobId = new mongoose.Types.ObjectId();
    sinon.stub(Job, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: jobId }, user: { role: 'employee', _id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await applyJob(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

});
