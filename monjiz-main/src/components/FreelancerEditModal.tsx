import { useEffect, useState } from "react";
import { localDb } from "@/integrations/data/client";
import { toast } from "sonner";
import { MAX_IMAGES_PER_PROJECT_COLLAGE, MAX_SHOWCASE_PROJECTS } from "@/lib/showcase-constants";

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

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
};

interface FreelancerEditModalProps {
  freelancer: Freelancer;
  onClose: () => void;
  onSave: () => void;
}

async function uploadPublicFile(file: File, path: string): Promise<string> {
  const { error } = await localDb.storage.from("freelancer-media").upload(path, file, { upsert: true });
  if (error) throw error;
  return localDb.storage.from("freelancer-media").getPublicUrl(path).data.publicUrl;
}

export function FreelancerEditModal({ freelancer, onClose, onSave }: FreelancerEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: freelancer.name,
    email: freelancer.email,
    whatsapp: freelancer.whatsapp,
    specialty: freelancer.specialty,
    bio: freelancer.bio || "",
    portfolio: freelancer.portfolio || "",
    linkedin: freelancer.linkedin || "",
    behance: freelancer.behance || "",
    github: freelancer.github || "",
    status: freelancer.status,
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(freelancer.profile_image ?? null);

  const [legacyGalleryFiles, setLegacyGalleryFiles] = useState<File[]>([]);

  const [showcaseProjects, setShowcaseProjects] = useState<ProjectRow[]>([]);
  const [projectPhotoFiles, setProjectPhotoFiles] = useState<Record<string, File[]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await localDb
        .from("projects")
        .select("id,title,description,images,created_at")
        .eq("freelancer_id", freelancer.id)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!cancelled) setShowcaseProjects((data ?? []) as ProjectRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [freelancer.id]);

  useEffect(() => {
    if (!profileImageFile) return;
    const url = URL.createObjectURL(profileImageFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profileImageUrl: string | null = freelancer.profile_image;
      if (profileImageFile) {
        const ext = profileImageFile.name.split(".").pop() || "jpg";
        const path = `${freelancer.id}/admin-headshot-${Date.now()}.${ext}`;
        profileImageUrl = await uploadPublicFile(profileImageFile, path);
      }

      let portfolioImagesUrl: string[] | null = freelancer.portfolio_images;
      if (legacyGalleryFiles.length > 0) {
        const urls: string[] = [];
        for (let i = 0; i < legacyGalleryFiles.length; i++) {
          const f = legacyGalleryFiles[i];
          const ext = f.name.split(".").pop() || "jpg";
          const path = `${freelancer.id}/admin-legacy-${Date.now()}-${i}.${ext}`;
          urls.push(await uploadPublicFile(f, path));
        }
        portfolioImagesUrl = urls;
      }

      for (const projectId of Object.keys(projectPhotoFiles)) {
        const files = projectPhotoFiles[projectId];
        if (!files?.length) continue;
        if (files.length > MAX_IMAGES_PER_PROJECT_COLLAGE) {
          toast.error(`Max ${MAX_IMAGES_PER_PROJECT_COLLAGE} images per project collage`);
          setLoading(false);
          return;
        }
        const urls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const ext = f.name.split(".").pop() || "jpg";
          const path = `${freelancer.id}/proj-${projectId}-${Date.now()}-${i}.${ext}`;
          urls.push(await uploadPublicFile(f, path));
        }
        const { error: puErr } = await localDb.from("projects").update({ images: urls }).eq("id", projectId);
        if (puErr) throw puErr;
      }

      const { error } = await localDb
        .from("freelancers")
        .update({
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          specialty: form.specialty,
          bio: form.bio || null,
          portfolio: form.portfolio || null,
          linkedin: form.linkedin || null,
          behance: form.behance || null,
          github: form.github || null,
          status: form.status,
          profile_image: profileImageUrl,
          portfolio_images: portfolioImagesUrl,
        })
        .eq("id", freelancer.id);

      if (error) throw error;
      toast.success("Freelancer updated successfully!");
      onSave();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update freelancer";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Edit Freelancer</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none opacity-50 hover:opacity-100">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section className="space-y-4 border border-border p-4 rounded-lg bg-secondary/20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Photos</h3>

            <div>
              <div className="block text-sm font-medium mb-2">Profile headshot</div>
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 border border-border bg-secondary overflow-hidden flex-shrink-0">
                  {profilePreview ? (
                    <img src={profilePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <label className="px-3 py-2 border border-border text-sm cursor-pointer hover:bg-secondary">
                  Replace photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="block text-sm font-medium mb-2">Legacy gallery (optional)</div>
              <p className="text-xs text-muted-foreground mb-2">
                Extra grid shown on the profile only if no showcase projects exist. Upload replaces the whole legacy set.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="text-sm"
                onChange={(e) => setLegacyGalleryFiles(Array.from(e.target.files ?? []).slice(0, 12))}
              />
              {legacyGalleryFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{legacyGalleryFiles.length} new image(s) — save to apply.</p>
              )}
            </div>

            <div>
              <div className="block text-sm font-medium mb-2">
                Showcase projects (max {MAX_SHOWCASE_PROJECTS} — each has its own collage)
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Replace all images in a project collage by choosing new files (uploaded on save).
              </p>
              {showcaseProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No showcase projects yet — freelancer can add them on the dashboard.</p>
              ) : (
                <ul className="space-y-4">
                  {showcaseProjects.map((p) => (
                    <li key={p.id} className="border border-border rounded p-3 bg-background">
                      <div className="font-medium mb-2">{p.title}</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(p.images ?? []).map((src, i) => (
                          <img key={i} src={src} alt="" className="h-14 w-14 object-cover border border-border" />
                        ))}
                      </div>
                      <label className="text-xs text-primary underline cursor-pointer">
                        Replace collage images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            setProjectPhotoFiles((prev) => ({
                              ...prev,
                              [p.id]: files.slice(0, MAX_IMAGES_PER_PROJECT_COLLAGE),
                            }));
                          }}
                        />
                      </label>
                      {projectPhotoFiles[p.id]?.length ? (
                        <span className="text-xs text-muted-foreground ml-2">
                          {projectPhotoFiles[p.id].length} new file(s) selected
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                className="mz-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                className="mz-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">WhatsApp *</label>
              <input
                type="text"
                className="mz-input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Specialty *</label>
              <select
                className="mz-input"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              >
                <option value="Graphic Design">Graphic Design</option>
                <option value="Web Development">Web Development</option>
                <option value="AI Automation">AI Automation</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="mz-input min-h-28"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Link</label>
              <input
                type="url"
                className="mz-input"
                value={form.portfolio}
                onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="mz-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input
                type="url"
                className="mz-input"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Behance</label>
              <input
                type="url"
                className="mz-input"
                value={form.behance}
                onChange={(e) => setForm({ ...form, behance: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GitHub</label>
              <input
                type="url"
                className="mz-input"
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border hover:bg-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
