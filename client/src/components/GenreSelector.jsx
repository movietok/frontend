function GenreSelector({ genres, selectedGenres, onToggle }) {
  const activeStyle = { 
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
    color: "#111"
  };

  const inactiveStyle = { 
    backgroundColor: "transparent",
    borderColor: "#6b7280",
    color: "#e5e7eb"
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Genres</h2>

      {/* Genres with proper spacing between items and bottom margin before buttons */}
      <div className="flex flex-wrap mb-24">
        {genres.map((genre) => {
          const active = selectedGenres.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(genre.id)}
              style={active ? activeStyle : inactiveStyle}
              className="px-3 py-1.5 rounded-full border text-sm transition hover:border-gray-400 m-[2.5px]"
            >
              {genre.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GenreSelector;
