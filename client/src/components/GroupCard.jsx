import { Link } from "react-router-dom";
import "../styles/GroupCard.css";

function GroupCard({ group }) {
  return (
    <Link to={`/groups/${group.id}`} className="group-card-link">
      <div className="group-card bg-gray-800 text-white rounded shadow-md overflow-hidden hover:shadow-lg transition">
        {group.poster_url ? (
          <img
            src={group.poster_url}
            alt={group.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="p-3">
          <h3 className="font-bold text-lg">{group.name}</h3>
          <p className="text-sm text-gray-300 line-clamp-3">
            {group.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Owner: {group.owner_name}
          </p>
          <p className="text-xs text-gray-400">
            Members: {group.member_count}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default GroupCard;
