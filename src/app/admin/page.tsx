import Link from "next/link";

const sections = [
  { href: "/admin/coach",    label: "Coach",    description: "Edit coach profile and bio" },
  { href: "/admin/schedule", label: "Schedule", description: "Add, edit, and remove games" },
  { href: "/admin/roster",   label: "Roster",   description: "Manage players by season" },
  { href: "/admin/leaders",  label: "Leaders",  description: "Update scoring leaderboard" },
  { href: "/admin/about",    label: "About",    description: "Edit the About Us page content" },
];

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-10">Manage Carleton Club Soccer content.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ href, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:border-carleton-blue hover:shadow-md transition-all"
          >
            <p className="font-semibold text-gray-900 group-hover:text-carleton-blue transition-colors">
              {label}
            </p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
