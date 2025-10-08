import { useEffect, useState } from "react";
import { getUserGroupsAPI } from "../services/groupService";

export function useUserGroups(userId) {
  const [userGroups, setUserGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUserGroups([]);
      setGroupsLoading(false);
      return;
    }

    setGroupsLoading(true);
    setGroupsError(null);

    getUserGroupsAPI(userId)
      .then((groups) => {
        const safeGroups = Array.isArray(groups) ? groups : [];
        setUserGroups(safeGroups);
        setGroupsLoading(false);
        console.log("✅ Fetched user groups:", safeGroups);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch user groups:", err);
        setUserGroups([]);
        setGroupsError(err);
        setGroupsLoading(false);
      });
  }, [userId]);

  return { userGroups, groupsLoading, groupsError, setUserGroups };
}
