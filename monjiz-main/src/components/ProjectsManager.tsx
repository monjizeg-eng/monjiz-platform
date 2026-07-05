import { useState } from "react";
import { insertProject, updateProject, deleteProject } from "@/integrations/data/vercel-api-client";
import { supabase } from "@/integrations/supabase-client";
import { toast } from "sonner";
import { MAX_IMAGES_PER_PROJECT_COLLAGE, MAX_SHOWCASE_PROJECTS } from "@/lib/showcase-constants";

type Project = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  freelancer_id: string;
  created_at: string;
};

interface ProjectsManagerProps {
  freelancerId: string;
  projects: Project[];
  onProjectsUpdate: (projects: Project[]) => void;
}

export function ProjectsManager({ freelancerId, projects, onProjectsUpdate }: ProjectsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    images: [] as File[],
  });

  const resetForm = () => {
    setForm({ title: "", description: "", images: [] });
    setEditing(null);
  };

  const uploadImage = async (file: File, projectId: string): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${freelancerId}/project-${projectId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("freelancer-media").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("freelancer-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (form.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    if (!editing && projects.length >= MAX_SHOWCASE_PROJECTS) {
      toast.error(`You can have at most ${MAX_SHOWCASE_PROJECTS} showcase projects — each with its own photo collage.`);
      return;
    }

    setLoading(true);
    try {
      const projectId = editing || crypto.randomUUID();
      const imageUrls: string[] = [];

      for (const file of form.images) {
        const url = await uploadImage(file, projectId);
        imageUrls.push(url);
      }

      if (editing) {
        // Update existing project
        await updateProject(editing, {
          title: form.title,
          description: form.description || null,
          images: imageUrls,
        });
        toast.success("Project updated!");
      } else {
        // Create new project
        const data = await insertProject({
          freelancer_id: freelancerId,
          title: form.title,
          description: form.description || null,
          images: imageUrls,
        });
        onProjectsUpdate([...projects, data as Project]);
        toast.success("Project created!");
      }

      resetForm();
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project? This action cannot be undone.")) return;

    try {
      await deleteProject(projectId);
      onProjectsUpdate(projects.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Showcase projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Up to {MAX_SHOWCASE_PROJECTS} projects — each is its own photo collage on your public profile ({projects.length}/{MAX_SHOWCASE_PROJECTS}).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          disabled={!showForm && projects.length >= MAX_SHOWCASE_PROJECTS}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {showForm ? "Cancel" : "+ Add project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Title *</label>
            <input
              type="text"
              className="mz-input"
              placeholder="e.g., E-commerce Website Redesign"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="mz-input min-h-24"
              placeholder="Describe your project, the challenge, and the solution..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Images *</label>
            <div className="border-2 border-dashed border-border p-6 rounded-lg text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > MAX_IMAGES_PER_PROJECT_COLLAGE) {
                    toast.error(`Maximum ${MAX_IMAGES_PER_PROJECT_COLLAGE} images per project collage`);
                    return;
                  }
                  setForm({ ...form, images: files });
                }}
                className="hidden"
                id="project-images"
              />
              <label htmlFor="project-images" className="cursor-pointer">
                <div className="text-sm text-muted-foreground">
                  {form.images.length > 0 ? (
                    <span>{form.images.length} image(s) selected</span>
                  ) : (
                    <>
                      <div className="mb-2">Click to upload or drag and drop</div>
                      <div className="text-xs">PNG, JPG, GIF up to 10MB each (max 10 images)</div>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </button>
            <button disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? "Saving…" : "Save Project"}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground">
          No projects yet. Create your first project to showcase your work!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="border border-border bg-card overflow-hidden">
              <div className="aspect-video bg-secondary overflow-hidden">
                {project.images && project.images.length > 0 ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No images
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const proj = projects.find((p) => p.id === project.id);
                      if (proj) {
                        setForm({
                          title: proj.title,
                          description: proj.description || "",
                          images: [],
                        });
                        setEditing(project.id);
                        setShowForm(true);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-border hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex-1 px-3 py-2 text-xs border border-border hover:bg-red-500/10 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
