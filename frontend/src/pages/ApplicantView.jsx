import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const ApplicantView = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const { data } = await axiosInstance.get("/api/jobs/my-interviews", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "employee") fetchInterviews();
  }, [user]);

  if (loading) return <p>Loading interviews...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded">
      <h2 className="text-2xl font-bold mb-4">My Scheduled Interviews</h2>
      {interviews.length === 0 ? (
        <p>No interviews scheduled yet.</p>
      ) : (
        <ul>
          {interviews.map((interview, index) => (
            <li key={index} className="border p-4 mb-4 rounded bg-white">
              <h3 className="font-semibold text-lg">
                {interview.jobTitle || "Untitled Job"}
              </h3>
              <p>
                <strong>Employer:</strong>{" "}
                {interview.employer || "Unknown"} (
                {interview.employerEmail || "No email"})
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {interview.interviewDate
                  ? new Date(interview.interviewDate).toLocaleString()
                  : "TBA"}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {interview.interviewLocation || "TBA"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {interview.interviewDescription || "TBA"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicantView;
