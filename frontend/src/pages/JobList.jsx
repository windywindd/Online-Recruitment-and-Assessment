import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JobList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [sortOption, setSortOption] = useState('date'); // ✅ added sorting option

  useEffect(() => {
    const fetchJobs = async (sort = 'date') => {
      try {
        const { data } = await axiosInstance.get(`/api/jobs?sort=${sort}`);
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs(sortOption);
  }, [sortOption]);

  const handleApply = async (jobId) => {
    if (user.role !== 'employee') return;
    setLoadingJobId(jobId);
    try {
      await axiosInstance.post(
        `/api/jobs/${jobId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setJobs(jobs.map(job =>
        job._id === jobId
          ? { ...job, applications: [...(job.applications || []), { applicant: { _id: user.id, name: user.name, email: user.email } }] }
          : job
      ));
      alert('Applied successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to apply.');
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (user.role !== 'employer') return;
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setLoadingJobId(jobId);
    try {
      await axiosInstance.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
      alert('Job deleted successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete job.');
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setEditingTitle(job.title);
    setEditingDescription(job.description);
  };

  const handleSaveEdit = async (jobId) => {
    try {
      await axiosInstance.put(
        `/api/jobs/${jobId}`,
        { title: editingTitle, description: editingDescription },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setJobs(jobs.map(job =>
        job._id === jobId ? { ...job, title: editingTitle, description: editingDescription } : job
      ));
      setEditingJobId(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update job.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-100 p-4 rounded">
      <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>

      {/* Sorting Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Sort by:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="date">Date</option>
          <option value="role">Role</option>
        </select>
      </div>

      {jobs.length === 0 && <p>No jobs available</p>}

      <ul>
        {jobs.map((job) => {
          const alreadyApplied =
            user.role === 'employee' &&
            job.applications?.some((app) => app.applicant?._id === user.id);

          return (
            <li key={job._id} className="border p-4 mb-4 rounded shadow bg-white">
              {editingJobId === job._id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    className="w-full mb-2 p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(job._id)}
                      className="bg-green-600 text-white p-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingJobId(null)}
                      className="bg-gray-400 text-white p-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p>{job.description}</p>
                  <p>Type: {job.type || 'Full-Time'}</p> {/* ✅ show job type */}
                  <small>Posted by: {job.employer?.name || 'Unknown'}</small>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    {/* Employee apply */}
                    {user.role === 'employee' && (
                      <>
                        <button
                          onClick={() => handleApply(job._id)}
                          disabled={loadingJobId === job._id || alreadyApplied}
                          className={`p-2 rounded ${
                            alreadyApplied ? 'bg-gray-400' : 'bg-green-600 text-white'
                          }`}
                        >
                          {alreadyApplied
                            ? 'Already Applied'
                            : loadingJobId === job._id
                            ? 'Applying...'
                            : 'Apply'}
                        </button>
                        {alreadyApplied && (
                          <button
                            onClick={() => navigate(`/my-interviews`)}
                            className="bg-purple-600 text-white p-2 rounded"
                          >
                            View Interview Details
                          </button>
                        )}
                      </>
                    )}

                    {/* Employer actions */}
                    {user.role === 'employer' && job.employer?._id === user.id && (
                      <>
                        <button
                          onClick={() => handleDelete(job._id)}
                          disabled={loadingJobId === job._id}
                          className="bg-red-600 text-white p-2 rounded"
                        >
                          {loadingJobId === job._id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => handleEditClick(job)}
                          className="bg-yellow-500 text-white p-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/jobs/${job._id}/applicants`)}
                          className="bg-blue-500 text-white p-2 rounded"
                        >
                          View Applicants
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default JobList;
