import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/jobs/${jobId}/applicants`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setApplicants(data);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId, user.token]);

  const handleScheduleInterview = async (applicantId) => {
    try {
        const payload = {
        ...formData[applicantId],
        status: "interview", // ✅ force status change
        };

        await axiosInstance.put(
        `/api/jobs/${jobId}/applicants/${applicantId}/interview`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // ✅ update local state so UI shows immediately
        setApplicants((prev) =>
        prev.map((app) =>
            app.applicant._id === applicantId
            ? { ...app, status: "interview", ...payload }
            : app
        )
        );

        alert("Interview scheduled!");
    } catch (error) {
        console.error(error);
        alert("Failed to schedule interview.");
    }
    };


  if (loading) return <p>Loading applicants...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded">
      <h2 className="text-2xl font-bold mb-4">Applicants</h2>
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <ul>
          {applicants.map((app) => (
            <li key={app.applicant._id} className="border p-4 mb-4 rounded bg-white">
              <p>
                <strong>{app.applicant.name}</strong> ({app.applicant.email})
              </p>
              <p>Status: {app.status}</p>

              {/* Schedule Interview */}
              {app.status !== "interview" && (
                <div className="mt-3 space-y-2">
                  <input
                    type="datetime-local"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [app.applicant._id]: {
                          ...prev[app.applicant._id],
                          interviewDate: e.target.value,
                        },
                      }))
                    }
                    className="border p-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [app.applicant._id]: {
                          ...prev[app.applicant._id],
                          interviewLocation: e.target.value,
                        },
                      }))
                    }
                    className="border p-2 w-full"
                  />
                  <textarea
                    placeholder="Description"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [app.applicant._id]: {
                          ...prev[app.applicant._id],
                          interviewDescription: e.target.value,
                        },
                      }))
                    }
                    className="border p-2 w-full"
                  />
                  <button
                    onClick={() => handleScheduleInterview(app.applicant._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Schedule Interview
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicantsPage;
