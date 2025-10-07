import { useEffect, useState } from "react";
import { getUserGroupsAPI } from "../services/groupService";

export function useUserGroups(userId) {
  const [userGroups, setUserGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    getUserGroupsAPI(userId)
      .then((groups) => {
        setUserGroups(groups);
        setGroupsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user groups:", err);
        setGroupsError(err);
        setGroupsLoading(false);
      });
  }, [userId]);

  return { userGroups, groupsLoading, groupsError, setUserGroups };
}
