import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../services/groupService";
import { getAllGroupThemes } from "../services/groups";
import { getGenres } from "../services/tmdb";
import GenreSelector from "../components/GenreSelector";
import "../styles/CreateGroupPage.css"; // <-- add this line

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [themes, setThemes] = useState([]);
  const [themeId, setThemeId] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }));
        setGenres(normalized);
      })
      .catch(console.error);

    getAllGroupThemes()
      .then((data) => setThemes(data.themes || []))
      .catch(console.error);
  }, []);

  const toggleGenre = (gid) => {
    const idStr = String(gid);
    setSelectedGenres((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      visibility,
      theme_id: themeId ? Number(themeId) : null,
      tags: selectedGenres.map((id) => Number(id)),
    };

    try {
      setSubmitting(true);
      const created = await createGroup(payload);
      const newId = created?.id || created?.group?.id;
      if (!newId) throw new Error("Create response missing group id");
      navigate(`/groups/${newId}`);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const msg =
        status === 401
          ? "You must be logged in to create a group."
          : data?.error || data?.message || err?.message || "Failed to create group.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="group-form-container">
        <h2 className="form-title">Create a New Group</h2>

        <form onSubmit={handleSubmit}>
          <label>Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name..."
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your group..."
          />

          <label>Theme</label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
          >
            <option value="">-- Select Theme --</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <label>Genres</label>
          <div className="genre-box">
            <GenreSelector
              genres={genres}
              selectedGenres={selectedGenres}
              onToggle={toggleGenre}
            />
          </div>

          <label>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
