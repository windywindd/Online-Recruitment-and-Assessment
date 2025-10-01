import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const JobPosting = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('full-time');
  const [message, setMessage] = useState('');

  if (!user || user.role !== 'employer') {
    return (
      <h3 className="text-red-600 text-center mt-10">
        Access Denied: Only employers can post jobs.
      </h3>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { title, description, type };

      // ✅ Send Auth token and data
      const { data } = await axiosInstance.post('/api/jobs', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setMessage('Job posted successfully!');
      setTitle('');
      setDescription('');
      setType('full-time');
      console.log('Job created:', data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to post job');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4 text-center">Post a Job</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <textarea
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="internship">Internship</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Post Job
        </button>
      </form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
};

export default JobPosting;
