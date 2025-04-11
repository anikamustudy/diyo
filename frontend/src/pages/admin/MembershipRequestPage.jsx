import React, { useEffect, useState } from "react";
import membershipService from "../../services/membershipService"; // Confirm this path
import statusService from "../../services/statusService";
import MembershipDataTable from "./components/MembershipDataTable";
import MembershipRequestModal from "./components/MembershipRequestModal";
import notify from "../../utils/notify";

const MembershipRequestPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [membersResponse, statusesResponse] = await Promise.all([
          membershipService.getAll(),
          statusService.getAll(),
        ]);

        if (membersResponse.success) {
          setMembers(membersResponse.data);
        } else {
          throw new Error(membersResponse.message || "Failed to fetch members");
        }

        if (statusesResponse.success) {
          setStatuses(statusesResponse.data);
        } else {
          throw new Error(
            statusesResponse.message || "Failed to fetch statuses"
          );
        }
      } catch (err) {
        const errorMessage = err.message || "Failed to fetch data";
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusUpdate = async (memberId, newStatusId, message) => {
    try {
      await membershipService.updateStatusWithMessage(userId, {
        status_id: newStatusId,
        message,
      });
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: statuses.find((s) => s.id === Number(newStatusId)),
              }
            : m
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const handleViewClick = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-3">
      <h1 className="text-xl font-bold mb-4 text-gray-900 bg-gray-100 rounded-lg shadow-lg p-3">
        Manage Membership Requests
      </h1>
      <MembershipDataTable members={members} onViewClick={handleViewClick} />
      <MembershipRequestModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={closeModal}
        statuses={statuses}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default MembershipRequestPage;
