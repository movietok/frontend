import { useEffect, useMemo, useState, useRef } from "react";
import { updateGroup } from "../../services/groupService";
import { getAllGroupThemes } from "../../services/groups";
import { getGenres } from "../../services/tmdb";
import GenreSelector from "../GenreSelector";
import OnsitePopup from "../Popups/OnsitePopup";
import "../../styles/EditGroupModal.css";

export default function EditGroupModal({ group, onClose, onSave }) {
  useEffect(() => {
    console.log("🟣 EditGroupModal mounted");
    console.log("group prop in modal:", group);
  }, []);

  // === Base fields ===
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [visibility, setVisibility] = useState(group.visibility || "public");
  const [posterUrl, setPosterUrl] = useState(group.poster_url || ""); // NEW

  // === Themes ===
  const [themes, setThemes] = useState([]);
  const [themeId, setThemeId] = useState(
    group.theme_id == null ? "" : String(group.theme_id)
  );

  // === Genres ===
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const groupId = useMemo(
    () => group?.id || group?.gID || group?.group?.id,
    [group]
  );

  // === Popup management ===
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // === Load genres and themes ===
  useEffect(() => {
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }));
        setGenres(normalized);

        if (Array.isArray(group.tags) && group.tags.length) {
          setSelectedGenres(group.tags.map((n) => String(n)));
        } else if (Array.isArray(group.genre_tags) && group.genre_tags.length) {
          const byName = new Map(
            normalized.map((g) => [g.name.toLowerCase(), String(g.id)])
          );
          const mapped = group.genre_tags
            .map((name) => byName.get(String(name).toLowerCase()))
            .filter(Boolean);
          setSelectedGenres(mapped);
        } else {
          setSelectedGenres([]);
        }
      })
      .catch(console.error);

    getAllGroupThemes()
      .then((data) => setThemes(data.themes || []))
      .catch(console.error);
  }, [group]);

  const toggleGenre = (gid) => {
    const idStr = String(gid);
    setSelectedGenres((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
    );
  };

  // === Submit handler ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updates = {};
    const safeTrim = (s) => (typeof s === "string" ? s.trim() : s);

    // name
    const newName = safeTrim(name);
    const oldName = safeTrim(group.name ?? "");
    if (newName && newName !== oldName) updates.name = newName;

    // description
    const newDesc = description ?? "";
    const oldDesc = group.description ?? "";
    if (newDesc !== oldDesc) updates.description = newDesc;

    // visibility
    if (visibility && visibility !== group.visibility) {
      updates.visibility = visibility;
    }

    // theme_id
    const oldTheme = group.theme_id == null ? null : Number(group.theme_id);
    const newTheme =
      themeId === ""
        ? null
        : Number.isNaN(Number(themeId))
        ? oldTheme
        : Number(themeId);
    if (newTheme !== oldTheme) updates.theme_id = newTheme;

    // poster_url (NEW)
    const newPoster = safeTrim(posterUrl);
    const oldPoster = safeTrim(group.poster_url ?? "");
    if (newPoster !== oldPoster) updates.poster_url = newPoster;

    // tags
    const numericTags = selectedGenres
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0);
    const currentTags =
      Array.isArray(group.tags) && group.tags.length
        ? group.tags.map((n) => Number(n)).filter(Number.isInteger)
        : [];
    const eqSets = (a, b) => {
      if (a.length !== b.length) return false;
      const A = new Set(a);
      for (const v of b) if (!A.has(v)) return false;
      return true;
    };
    if (!eqSets(numericTags, currentTags)) updates.tags = numericTags;

    // Nothing changed?
    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      const updated = await updateGroup(groupId, updates);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setPopupMessage("Group updated successfully!");
      setPopupType("success");
      setShowPopup(true);

      onSave?.(updated?.group ?? updated);
      onClose();

      timeoutRef.current = setTimeout(() => {
        setShowPopup(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update group.";
      setPopupMessage(msg);
      setPopupType("error");
      setShowPopup(true);
    }
  };

  // === JSX ===
  return (
    <div className="edit-group-overlay">
      <div className="edit-group-modal">
        <h3>Edit Group</h3>

        <form onSubmit={handleSubmit}>
          {/* === Group Name === */}
          <div>
            <label>Group Name</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              required
            />
          </div>

          {/* === Description === */}
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Group description"
            />
          </div>

          {/* === Group Image URL === */}
          <div>
            <label>Group Image URL</label>
            <input
              type="url"
              name="poster_url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {posterUrl && (
              <div className="image-preview">
                <img
                  src={posterUrl}
                  alt="Group preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginTop: "8px",
                    border: "1px solid #555",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/120x120?text=Invalid+URL";
                  }}
                />
              </div>
            )}
          </div>

          {/* === Theme === */}
          <div>
            <label>Theme</label>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
            >
              <option value="">-- No theme --</option>
              {themes.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* === Genres === */}
          <div>
            <GenreSelector
              genres={genres}
              selectedGenres={selectedGenres}
              onToggle={toggleGenre}
              showTitle={false}
              compact={true}
            />
          </div>

          {/* === Visibility === */}
          <div className="visibility-field">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* === Actions === */}
          <div className="edit-group-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* === Popup === */}
      {showPopup && (
        <OnsitePopup
          message={popupMessage}
          type={popupType}
          onConfirm={() => setShowPopup(false)}
          confirmText="OK"
        />
      )}
    </div>
  );
}
