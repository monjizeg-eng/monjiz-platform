import { useState } from "react";
import { deleteFreelancer, updateFreelancer } from "@/integrations/data/vercel-api-client";
import { toast } from "sonner";
import { FreelancerEditModal } from "./FreelancerEditModal";

type Freelancer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  specialty: string;
  status: string;
  created_at: string;
  bio: string | null;
  portfolio: string | null;
  linkedin: string | null;
  behance: string | null;
  github: string | null;
  profile_image: string | null;
  portfolio_images: string[] | null;
};

interface FreelancerManagementTableProps {
  freelancers: Freelancer[];
  filter: "pending" | "active" | "banned" | "all";
  setFilter: (filter: "pending" | "active" | "banned" | "all") => void;
  onUpdate: () => void;
}

export function FreelancerManagementTable({
  freelancers,
  filter,
  setFilter,
  onUpdate,
}: FreelancerManagementTableProps) {
  const [editingFreelancer, setEditingFreelancer] = useState<Freelancer | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the freelancer profile and cannot be undone.")) {
      return;
    }

    setDeleting(id);
    try {
      await deleteFreelancer(id);
      toast.success("Freelancer deleted successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete freelancer");
    } finally {
      setDeleting(null);
    }
  };

  const handleBan = async (id: string) => {
    if (!confirm("Ban this freelancer? They will be hidden from the marketplace.")) {
      return;
    }

    try {
      await updateFreelancer(id, { status: "banned" });
      toast.success("Freelancer banned successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to ban freelancer");
    }
  };

  const visible = freelancers.filter((f) => (filter === "all" ? true : f.status === filter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "banned":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "active", "banned", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm border font-medium transition ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({freelancers.filter((x) => (f === "all" ? true : x.status === f)).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
          No freelancers in this view.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-border">
            <thead className="bg-secondary">
              <tr>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Specialty</th>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="border-b border-border px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((freelancer) => (
                <tr key={freelancer.id} className="border-b border-border hover:bg-secondary/50 transition">
                  <td className="px-4 py-3 text-sm font-medium">{freelancer.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{freelancer.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{freelancer.specialty}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(freelancer.status)}`}>
                      {freelancer.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(freelancer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFreelancer(freelancer)}
                        className="px-3 py-1 text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition"
                      >
                        Edit
                      </button>
                      {freelancer.status !== "banned" && (
                        <button
                          onClick={() => handleBan(freelancer.id)}
                          className="px-3 py-1 text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20 transition"
                        >
                          Ban
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(freelancer.id)}
                        disabled={deleting === freelancer.id}
                        className="px-3 py-1 text-xs bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        {deleting === freelancer.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingFreelancer && (
        <FreelancerEditModal
          freelancer={editingFreelancer}
          onClose={() => setEditingFreelancer(null)}
          onSave={onUpdate}
        />
      )}
    </>
  );
}
