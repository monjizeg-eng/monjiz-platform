import { useMemo } from "react";
import { MAX_SHOWCASE_PROJECTS } from "@/lib/showcase-constants";

type Project = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
};

interface ProjectGalleryProps {
  projects: Project[];
}

/**
 * Up to MAX_SHOWCASE_PROJECTS showcase projects, each with its own photo collage grid.
 */
export function ProjectGallery({ projects }: ProjectGalleryProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="container-mz pb-24">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Showcase</div>
      <h2 className="text-2xl sm:text-3xl font-black mb-2">Project collages</h2>
      <p className="text-muted-foreground text-sm mb-10 max-w-2xl">
        Up to {MAX_SHOWCASE_PROJECTS} highlights — each project has its own image collage.
      </p>

      <div className="space-y-20">
        {projects.map((project) => (
          <div key={project.id}>
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{project.title}</h3>
              {project.description && <p className="text-muted-foreground max-w-3xl leading-relaxed">{project.description}</p>}
            </div>

            {project.images && project.images.length > 0 && <CollageGrid images={project.images} />}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Per-project photo collage — grid adapts to image count (four tiles read as a 2×2 mosaic). */
function CollageGrid({ images }: { images: string[] }) {
  const gridClasses = useMemo(() => {
    const n = images.length;
    if (n === 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-1 sm:grid-cols-2";
    if (n === 3) return "grid-cols-1 sm:grid-cols-3";
    if (n === 4) return "grid-cols-2 gap-3"; /* 2×2 collage */
    return "grid-cols-2 md:grid-cols-3";
  }, [images.length]);

  return (
    <div className={`grid ${gridClasses} gap-2 sm:gap-3`}>
      {images.map((image, idx) => (
        <a
          key={idx}
          href={image}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square bg-secondary overflow-hidden border border-border group"
        >
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </a>
      ))}
    </div>
  );
}
